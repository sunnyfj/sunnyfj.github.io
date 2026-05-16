import fs from 'node:fs'
import path from 'node:path'

/**
 * co + generator = async + await
 * 两个核心问题：
 * 暂停与恢复：利用 Generator 的 yield 关键字暂停执行。
 * 自动推进：当 yield 后面的 Promise 状态变为完成时，自动调用生成器的 next() 方法。
 *
 */

/**
 * 模拟 asyncToGenerator 的执行器
 */
export function _asyncToGenerator(fn) {
  return function () {
    const self = this
    const args = arguments

    return new Promise((resolve, reject) => {
      const gen = fn.apply(self, args)

      function step(key, arg) {
        let info

        try {
          info = gen[key](arg) // gen.next() / gen.throw()
        }
        catch (error) {
          reject(error)
          return
        }

        const { value, done } = info

        if (done) {
          resolve(value)
        }
        else {
          Promise.resolve(value).then(
            val => step('next', val),
            err => step('throw', err),
          )
        }
      }

      step('next')
    })
  }
}

// 读取文件内容
async function readResult() {
  const fileName = await fs.readFile('./fileName.txt', 'utf-8')
  const data = await fs.readFile(path.resolve(__dirname, fileName), 'utf-8')
  return data
}

// 调用
readResult().then((data) => {
  console.log(data)
}).catch(console.error)

// 在 JavaScript 引擎（如 V8）中，async 和 await 并不是简单的字符串替换，而是通过词法分析（Lexing）、语法解析（Parsing）以及最终的字节码生成来实现的。

// 从底层的角度看，它们的实现可以分为三个阶段：

// 1. 词法与语法定义 (The "Keyword" Magic)
// async 实际上被称为上下文相关关键字 (Contextual Keyword)。

// 在普通位置，它是一个标识符（你可以声明 let async = 1;）。

// 但当它出现在 function 关键字之前时，解析器（Parser）会识别出这是一个特殊的标志位，并为该函数分配一个内部属性：[[IsAsync]] = true。

// 2. 协程与生成器映射 (The Desugaring)
// 引擎在解析阶段会将 async 函数转换成一种类似 Generator 的内部表示。

// 当你写下 async function 时，引擎内部会执行以下操作：

// 包装：将函数体包装在一个类似于上文提到的 spawn 执行器中。

// 隐式返回：确保函数体执行的结果总是被 Promise.resolve() 包裹。

// 状态保存：await 关键字被映射为 Yield。它会暂停当前的执行上下文（Context），保存局部变量和调用栈，并将控制权交回给事件循环。
