# Vue 3

## 架构采用 Monorepo 项目管理

- 所有的代码都在一个仓库中管理
- 每个模块都是一个独立的包
- 项目中可以相互引用不同的模块

## 打包模式

iife 模式：立即调用函数表达式，将代码包裹在一个函数中，避免全局变量污染。

esm 模式：es模块，在浏览器中可以直接使用 import 引入。

cjs 模式：commonjs 模块，在 node 中可以直接使用 require 引入。

## reactive

reactive 创建一个响应式对象

effect 副作用函数 当响应式对象发生变化时，会自动调用副作用函数。

- Built-in objects are not observed except for `Array`, `Map`, `WeakMap`, `Set` and `WeakSet`.

effect 副作用函数

scheduler 调度器

oncleanup 清理函数

immediate 立即执行

receiver 接收者

target 目标对象

scope 作用域

detached 分离的

queue 队列

scheduler 调度器

create Renderer 创建渲染器

null

Raw

anchor

instance

expose

context

emit

retry 重试

Fail 失败

delay 延迟

Teleport 传送门

fragment 片段

renderer 渲染器

include

exclude

lru 缓存 算法 最近最少使用算法

没有key的问题？

implements

防抖：多次触发值用第一次 ？
节流：多次触发 间断执行 ？

## 最长递增子序列 vue3 源码
```ts
// 最长递增子序列 vue3 源码
// https://zh.wikipedia.org/wiki/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97

/**
 * Vue 3 中用于计算最长递增子序列的高效算法
 * 这是 Vue 3 虚拟 DOM diff 算法的核心部分
 * @param arr 输入数字数组
 * @returns 最长递增子序列的元素索引数组
 */
function getSequence(arr: number[]): number[] {
  // 路径数组：记录每个元素在最长递增子序列中的前一个元素索引
  const p = arr.slice()
  // 结果数组：存储递增子序列的索引
  const result = [0]
  // 声明循环变量
  let i, j, u, v, c
  // 数组长度
  const len = arr.length

  // 主循环：遍历数组中的每个元素
  for (i = 0; i < len; i++) {
    const arrI = arr[i]

    // Vue 3 特有的处理：跳过值为 0 的元素（可能代表未定义的节点）
    if (arrI !== 0) {
      // j：结果数组的最后一个元素索引
      j = result[result.length - 1]

      // 情况1：当前元素大于结果数组的最后一个元素
      if (arr[j] < arrI) {
        // 记录当前元素的前一个元素索引为 j
        p[i] = j
        // 将当前元素索引添加到结果数组末尾
        result.push(i)
        // 继续处理下一个元素
        continue
      }

      // 情况2：当前元素不大于结果数组的最后一个元素
      // 使用二分查找找到结果数组中第一个大于等于当前元素的位置
      u = 0 // 二分查找左边界
      v = result.length - 1 // 二分查找右边界
      while (u < v) {
        // 计算中间位置（等价于 Math.floor((u + v) / 2)）
        c = (u + v) >> 1
        // 如果中间位置的元素小于当前元素，调整左边界
        if (arr[result[c]] < arrI) {
          u = c + 1
        }
        else {
          // 否则调整右边界
          v = c
        }
      }

      // 如果当前元素小于找到的位置的元素
      if (arrI < arr[result[u]]) {
        // 如果不是第一个元素，记录当前元素的前一个元素索引
        if (u > 0) {
          p[i] = result[u - 1]
        }
        // 更新结果数组中 u 位置的索引为当前元素索引
        result[u] = i
      }
    }
  }

  // 重构最长递增子序列
  u = result.length
  v = result[u - 1] // 从结果数组的最后一个元素开始
  while (u-- > 0) {
    // 从后往前重构结果数组
    result[u] = v
    // 获取当前元素的前一个元素索引
    v = p[v]
  }

  // 返回最长递增子序列的索引数组
  return result
}
```

##

递归渲染

## vue理解

官方：Vue 是一套用于构建用户界面的渐进式框架。Vue 的核心库只关注视图层。它的渐进性体现在可以根据需求逐步增加功能，如组件系统、路由跳转、数据管理等。

`命令式与声明式的区别：`

- 命令式：关注过程，需要开发者手动操作 DOM 元素，如 JQ 时代。
- 声明式：关注结果，开发者只需要描述 state，过程 Vue 会自动处理 DOM 更新，如 React 时代。

声明式代码更加简单, 不需要关注实现, 按照要求填代码就可以 (给上原材料就出结果)

```ts
// 命令式编程
const numbers = [1, 2, 3, 4, 5]
let total = 0
for (let i = 0; i < numbers.length; i++) {
  total += numbers[i] // 关注了过程
}
console.log(total)

// 声明式编程
const total2 = numbers.reduce((memo, current) => {
  return memo + current
}, 0)
console.log(total2)
```

`MVVM 模式`

说起MVVM, 就要知道另一个那就是MVC。为什么要有这些模式呢?

<img src="@/assets/vue1.png" alt="vue1" />

目的: 职责划分、分层管理。

- 对于前端而言就是如何将数据同步到页面上，也是借鉴后端思想。

前端 MVC → MVVM 演进总结

MVC 引入前端的背景
- 前端没有传统后端的「用户请求 / 数据库查询」
- 数据 ≈ JSON，视图 ≈ HTML
- 通过 **Controller** 将数据与视图操作关联
- 典型流程：
  用户操作 → Controller → 获取数据 → 渲染视图

前端 MVC 的问题
- 代表框架：**Backbone（纯 MVC）**
- 需要配合模板引擎（如 underscore，已过时）
- 每个逻辑都需要一个 Controller
- Controller 中堆积大量逻辑：
  - DOM 操作
  - 页面渲染
  - 复杂业务处理
- 结果：
  - Controller 数量膨胀
  - 代码复杂、难维护

MVVM 出现的原因
- 目标：**简化数据到视图的映射关系**
- 思路：
  - 去掉 Controller
  - 用 **ViewModel（VM）** 代替
- 核心机制：
  - 数据绑定到 VM
  - 视图直接从 VM 取值渲染
  - 视图事件反向更新数据
- 优点：
  - 减少样板代码
  - 不再手写 Controller
  - 数据驱动视图

Vue 与 MVVM 的关系
- Vue **借鉴 MVVM 思想**，但 **不完全遵循**
- 传统 MVVM 特点：
  - 不允许直接操作视图或数据绑定关系
- Vue 的“偏离”：
  - 可通过 `ref` 直接操作 DOM / 数据
  - 提供额外 API 处理灵活场景

Vue 与 MVVM 的定位
- Vue 沿用 **VM / MVVM** 命名
- 并非严格 MVVM，只是**借鉴思想**
- 在 MVVM 基础上加入了更灵活的 API
- 核心目标：**让开发更简单**

虚拟 DOM（Virtual DOM）

什么是虚拟 DOM
- 用 **JS 对象** 描述真实 DOM 结构
- 不是真实 DOM，而是其抽象表示

为什么需要虚拟 DOM
- 早期（jQuery）：
  - 数据变化 → 拼字符串 → 整块 DOM 替换
  - 即使只改文本，也可能重建大量节点
- 问题：
  - DOM 操作频繁
  - 容易触发重绘 / 重排
  - 初学者代码混乱，性能差

虚拟 DOM 的作用
- 在用户操作与真实 DOM 之间加一层 **缓存层**
- 更新流程：
  - 生成新的虚拟 DOM
  - 与旧虚拟 DOM 做 **diff**
  - 只更新有变化的部分到真实 DOM
- 减少真实 DOM 操作频率

虚拟 DOM 的性能优势
- 虚拟 DOM 属性 **远少于真实 DOM**
- 创建 JS 对象比创建真实 DOM 成本低
- 配合 diff 算法进行最小化更新

虚拟 DOM 的额外价值
- **跨平台能力**
  - 同一套描述 → Web / 小程序 / App
- 本质是「描述 UI」，而非直接操作 DOM

模板与渲染机制

为什么不用手写虚拟 DOM
- 直接写对象描述 DOM 不直观、不友好
- JSX 可行，但有学习成本

Vue 的解决方案：模板
- 使用 **模板语法**
- 模板 → 编译 → `render` 函数
- `render` 执行 → 生成虚拟 DOM

编译时 vs 运行时
- 模板编译：
  - 性能开销大
  - **应在构建阶段完成**
- Vue 区分：
  - **编译时**：模板 → render（打包工具完成）
  - **运行时**：直接调用 render 生成虚拟 DOM
- 目的：**提升运行时性能**

Vue 的核心渲染方法
- 核心 API：`render`
- 渲染流程：
  - render → 虚拟 DOM → diff → 真实 DOM

组件化思想

组件化的价值
- 高内聚、低耦合
- 提升代码可维护性
- 提高开发效率
- 方便复用与单元测试

单向数据流
- 数据自上而下流动
- 避免数据混乱
- 保证应用状态可控

组件化更新（关键点）
- 页面由多个组件组成
- 某个组件变化：
  - **只更新该组件**
  - 不影响其他部分
- 合理拆分组件 = 性能优化

Vue 的整体特征总结

- 渐进式框架
- 声明式渲染
- 数据驱动视图
- 借鉴 MVVM 思想（非严格）
- 模板 → render → 虚拟 DOM
- 虚拟 DOM作用：
  - 减少真实 DOM 操作
  - 支持跨平台
- 支持组件化与组件级更新
- 路由 / 状态管理 / 构建工具 属于 Vue 生态
