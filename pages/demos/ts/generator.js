import fs from 'node:fs'
import path from 'node:path'

/**
 * generator 函数是特殊类型的函数
 * 生成器函数，用于生成序列，可以暂停执行，等待外部事件触发，再控制是否继续执行
 * 遇到 yield 关键字，会暂停
 * yield 的返回值就是下一次 next 方法的参数（第一次调用 next 方法，没有参数的概念）
 * 可以通过 throw 抛出异常，结束生成器函数的执行
 *
 * generator 原理是将一个函数拆分成多个 switch case，通过指针指向要执行的部分
 */

/**
 * 数组迭代器，生成器是用来生成迭代器
 */

// 类数组：索引，length，能遍历
let likeArray = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  // 元编程
  [Symbol.iterator]() {
    let index = 0
    return {
      next() {
        if (index >= this.length) {
          return { value: undefined, done: true }
        }
        index++
        return { value: this[index], done: false }
      },
    }
  },
  // 生成器函数实现迭代器  [Symbol.iterator]: function* () {}
  * [Symbol.iterator]() {
    let index = 0
    while (index !== this.length) {
      yield this[index++]
    }
  },
}

// 读取文件内容
function* readResult() {
  const fileName = yield fs.readFile('./fileName.txt', 'utf-8')
  const data = yield fs.readFile(path.resolve(__dirname, fileName), 'utf-8')
  return data
}

// 实际调用时  就很麻烦 嵌套回调
const iterator = readResult()
const { value, done } = iterator.next()
value.then((data) => {
  const { value, done } = iterator.next(data)
  console.log(value)
})

// co 库的实现
export function co(iterator) {
  return new Promise((resolve, reject) => { // 同步迭代 for 循环，异步迭代回调
    function next(data) {
      const { value, done } = iterator.next(data)
      if (!done) { // 如果没有完成迭代，处理成 Promise 实例
        Promise.resolve(value).then(next, reject)
      }
      else {
        resolve(value)
      }
    }
    next()
  })
}

// 实际使用通过 co 库 多层异步操作 直至完成
co(readResult()).then((data) => {
  console.log(data)
}).catch(console.error)
