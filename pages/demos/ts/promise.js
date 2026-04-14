const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REFECTED'

// 用 x 的值解析处理 来决定 promise2 是成功还是失败  相当于下一个then 的 resolve | reject 函数
function resolvePromise(x, promise2, resolve, reject) {
  // 如果 x 是 promise2 本身，说明是自己在等自己的完成，本身一开始是PENDING，既不成功，也不会失败。不会有任何状态
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }

  // promise 实例要么是对象 要么是函数
  if (((typeof x === 'object') && x !== null) || (typeof x === 'function')) {
    // 共用 Promise 时，防止 then 方法被多次调用，导致状态改变多次，called 来判断是否被调用了，阻止
    let called = false

    try {
      const then = x.then // 看是否有 then 方法，如果有，调用 then 方法 如果是多层嵌套，需要递归调用 resolvePromise
      if (typeof then === 'function') {
        then.call(x, (y) => {
          if (called) {
            return
          }
          called = true

          resolvePromise(y, promise2, resolve, reject)
        }, (r) => {
          if (called) {
            return
          }
          called = true

          reject(r)
        })
      }
      else {
        resolve(x) // 如果 then 方法不是函数，直接 resolve
      }
    }
    catch (e) {
      if (called) {
        return
      }
      called = true

      reject(e)
    }
  }
  else {
    // 如果 x 是普通值，直接 resolve
    resolve(x)
  }
}

export class Promise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined

    // resolve | reject 是发布 then是订阅
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const reject = (reason) => {
      // 只有 PEDDING 才能改变状态
      if (this.status !== PENDING) {
        return
      }

      this.value = reason
      this.status = REJECTED

      // 调用所有订阅的回调函数
      this.onRejectedCallbacks.forEach(cb => cb())
    }

    const resolve = (value) => {
      // 为了满足 ECMAScript 功能，如果 value 是 Promise 实例，则解析
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }

      // 只有 PEDDING 才能改变状态
      if (this.status !== PENDING) {
        return
      }

      this.value = value
      this.status = FULFILLED

      // 调用所有订阅的回调函数
      this.onFulfilledCallbacks.forEach(cb => cb())
    }

    try {
      executor(resolve, reject)
    }
    catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    // 处理 onFulfilled，onRejected 是可选参数，处理默认函数，透传到下一个 then 方法参数
    // 如果 onFulfilled 不是函数，直接返回 value
    if (typeof onFulfilled !== 'function') {
      onFulfilled = value => value
    }
    // 如果 onRejected 不是函数，直接返回 reason
    if (typeof onRejected !== 'function') {
      onRejected = (reason) => {
        throw reason
      }
    }

    const promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // executor 是立即执行的 以下代码拿不到 promise2，不能在初始化之前使用，因此需要在 nextTick 中执行，node中使用 nextTick, 浏览器中使用 setTimeout 或 MutationObserver
        process.nextTick(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(x, promise2, resolve, reject)
          }
          catch (e) {
            reject(e)
          }
        })
      }

      if (this.status === REJECTED) {
        process.nextTick(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(x, promise2, resolve, reject)
          }
          catch (e) {
            reject(e)
          }
        })
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          process.nextTick(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(x, promise2, resolve, reject)
            }
            catch (e) {
              reject(e)
            }
          })
        })
        this.onRejectedCallbacks.push(() => {
          process.nextTick(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(x, promise2, resolve, reject)
            }
            catch (e) {
              reject(e)
            }
          })
        })
      }
    })

    return promise2
  }

  // ECMAScript
  catch(errFn) {
    return this.then(null, errFn) // 针对失败做处理，成功跳过
  }
}

// ----- 以上是 Promise A+ 规范的实现 -------

// 实现一个 Promise 延迟对象 例如： Q.defer  处理 new Promise((resolve, reject) => {}) 嵌套问题
Promise.deferred = function () {
  const deferred = {}
  const promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  deferred.promise = promise
  return deferred
}

// 是 ECMAScript 新增的方法，用于将普通值转换为 Promise 实例，因为 Promise .then是异步的
// 例如：Promise.resolve(123) // Promise.resolve(value)
// 特点：Promise.resolve 会产生一个新的 Promise 实例。如果传入的是 Promise 实例，可以解析 promise 具备等待效果
// 基于 Promise 原型实现中的 resolve 方法 如果拿到的是 Promise 实例，会解析 Promise 实例，否则直接 resolve
Promise.resolve = function (value) {
  return new Promise((resolve, _reject) => {
    resolve(value)
  })
}

// ECMAScript
// reject 只要调用就直接失败，不会解析 Promise 实例
Promise.reject = function (reason) {
  return new Promise((_resolve, reject) => {
    reject(reason)
  })
}

// ECMAScript
// Promise.all 是并行执行所有 Promise 实例，返回一个新的 Promise 实例，只有所有 Promise 实例都成功，才会成功，否则失败
Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    // 转成数组（处理可迭代对象，如 Set/字符串）
    const promiseArr = Array.from(promises)

    // 处理空数组
    if (promiseArr.length === 0) {
      resolve([])
      return
    }

    let idx = 0
    const results = []
    promiseArr.forEach((promise, index) => {
      Promise.resolve(promise).then((value) => {
        results[index] = value
        idx++
        if (idx === promiseArr.length) {
          resolve(results)
        }
      }, (reason) => {
        reject(reason)
      })
    })
  })
}

// ECMAScript
// Promise.race 核心特点：谁先完成（无论成功 / 失败），就以谁的结果为准。 案例：超时处理。
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    // 转成数组（处理可迭代对象，如 Set/字符串）
    const promiseArr = Array.from(promises)

    // 空集合：直接返回，不 resolve 也不 reject   卡住了
    if (promiseArr.length === 0) {
      return
    }

    for (const item of promiseArr) {
      Promise.resolve(item).then(resolve, reject)
    }
  })
}

// ECMAScript
// Promise.finally 是 finally 语句的 Promise 实现，无论 Promise 实例是成功还是失败，都会执行 finally 语句
// 实例方法
Promise.prototype.finally = function (callback) {
  return this.then((val) => {
    // 这里如果返回的还是 Promise 实例，会解析 Promise 实例，会有等待效果
    return Promise.resolve(callback()).then(() => val)
  }, (reason) => {
    return Promise.resolve(callback()).then(() => {
      throw reason
    })
  })
}

// node.js 新增的方法，用于将普通函数转换为 Promise 实例
// const { promisify } = require('util')
export function promisify(fn) {
  // ...args 拿到 fn 的数组参数
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, ...data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  }
}
