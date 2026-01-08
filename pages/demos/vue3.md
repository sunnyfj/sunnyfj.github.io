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

parse

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

## SPA 的理解

SPA 是什么
- **SPA（Single Page Application）**：单页应用
- 对应概念：**MPA（Multi Page Application）**：多页应用
- 现代前端项目（Vue / React）多数采用 SPA

SPA 的工作方式（CSR）
- 构建结果：
  - 只有一个 HTML（通常只有一个挂载点 `#app`）
  - JS 执行后在浏览器生成 DOM
- 页面切换：
  - 通过 **前端路由**
  - 切换的是组件，而不是页面
- 渲染方式：
  - **客户端渲染（CSR, Client Side Rendering）**
  - DOM 在浏览器中由 JS 生成

SPA 的优缺点

优点
- 页面切换快（局部刷新）
- 用户体验好
- 前后端分离
- 服务端压力小
- 组件化，维护成本低

缺点
- **首屏加载慢 / 白屏时间长**
- **不利于 SEO**
  - 首次返回的是空 HTML
  - 内容依赖 JS 渲染

MPA 的特点（SSR）

MPA 是什么
- 每个页面都是一个完整 HTML
- 页面跳转会刷新整个页面
- 渲染方式：
  - **服务端渲染（SSR, Server Side Rendering）**
  - 服务端返回已渲染好的 HTML

优点
- 首屏加载快
- 天然支持 SEO
- 返回即有内容，无白屏

缺点
- 页面切换慢（整页刷新）
- 维护成本高
- 资源重复加载
- 服务端压力大

SPA vs MPA 对比总结

| 维度 | SPA | MPA |
|----|----|----|
| 页面数量 | 单 HTML | 多 HTML |
| 页面切换 | 局部刷新 | 整页刷新 |
| 渲染方式 | CSR | SSR |
| 用户体验 | 好 | 一般 |
| SEO | 不友好 | 友好 |
| 首屏速度 | 慢 | 快 |
| 维护成本 | 低 | 高 |

SPA 的核心问题
- SEO 无法直接实现
- 首屏白屏时间较长

SPA 的解决方案

方案一：SSG（预渲染 / 静态生成）
- **SSG（Static Site Generation）**
- 构建阶段：
  - 使用浏览器运行 SPA
  - 生成静态 HTML 文件
- 访问时：
  - 先返回静态 HTML
  - 再由 JS 接管页面

优点
- 解决 SEO
- 减少白屏时间

缺点
- 不适合动态内容
- 数据变化频繁会导致内容失真

适用场景
- 官网
- 文档站
- 静态展示型网站

方案二：SSR + CSR（主流方案）
- **首屏：SSR**
  - 服务端渲染 HTML
  - 解决首屏慢 & SEO
- **后续交互：CSR**
  - 前端路由
  - 组件切换

优点
- 结合 SPA + MPA 优势
- 体验好
- 支持 SEO
- 首屏快

技术选型
- Vue SSR 框架：**Nuxt**
- React SSR 框架：**Next**

SPA 总结（标准面试回答）

- SPA 优点：
  - 用户体验好
  - 维护成本低
  - 前后端分离
- SPA 缺点：
  - 首屏加载慢
  - 不利于 SEO
- 解决方案：
  - SSG（适合静态站）
  - SSR + CSR（主流方案）

## 为什么 Vue 需要虚拟 DOM

- 虚拟 DOM 本质是一个 **JavaScript 对象**
- 用对象来描述真实 DOM 的结构和属性
- 不是直接操作真实 DOM

虚拟 DOM 出现的原因：
- 真实 DOM 属性多、结构复杂
- 频繁操作真实 DOM 会触发重排、重绘，性能开销大
- 初学者容易写出大量低效 DOM 操作代码

虚拟 DOM 的核心价值之一：
- 把 DOM 操作转化为 **对象操作**
- 多次变更可以先在内存中完成
- 最终只把**最小差异**更新到真实 DOM
- 配合 diff 算法，减少真实 DOM 操作次数

虚拟 DOM 的第二个重要价值：
- **与平台无关**
- 不依赖浏览器 DOM API
- 可在不同环境运行：
  - 浏览器
  - Node（组件测试）
  - 小程序
  - App（Native 渲染）
- 实现跨平台能力

虚拟 DOM 的生成过程：
- 开发时编写的是 `template`
- 模板会被 **编译成 render 函数**
- 页面渲染时执行 render 函数
- render 函数返回的结果就是 **虚拟 DOM**

初次渲染流程：
- 调用 render
- 生成虚拟 DOM
- 通过 patch 过程
- 将虚拟 DOM 转换为真实 DOM
- 插入页面

更新时（diff 流程）：
- 第一次渲染生成旧虚拟 DOM（oldVNode）
- 数据变化后再次调用 render
- 生成新虚拟 DOM（newVNode）
- 新旧虚拟 DOM 进行 diff 对比
- 计算最小变更
- 只更新变化的真实 DOM

虚拟 DOM 的最终作用总结：
- 减少真实 DOM 操作
- 提升性能
- 支持 diff 算法
- 支持跨平台渲染
- 是 Vue 渲染机制的核心基础

## 那我不用虚拟 DOM 可不可以？

- **可以不用**
- 虚拟 DOM 不是必须方案

不用虚拟 DOM：
- 直接操作真实 DOM
- 或编译阶段生成精确更新代码

典型不用虚拟 DOM 的框架：
- **Svelte**
  - 编译时生成精确 DOM 操作代码
  - 运行时几乎不需要 diff
- **部分小程序框架**
  - 直接绑定原生视图层

优点：
- 抽象更少
- 理论性能更高

缺点：
- 实现复杂
- 强依赖平台
- 不利于维护和跨平台

结论：
- 虚拟 DOM 是工程上的折中方案
- 在通用性、可维护性和性能之间取得平衡

## 对 Vue 组件化的理解

- **组件化 vs 模块化**
  - 组件化：封装 UI
  - 模块化：封装业务逻辑
  - 目的都是 **复用与组合**

- **组件核心组成**
  - **模板**：渲染 UI
  - **属性（props）**：传递数据，控制组件显示
  - **事件**：向外派发行为
  - **插槽（slot）**：允许外部内容注入组件
  - **生命周期钩子**：组件额外逻辑处理

- **组件化优势**
  - 提升开发效率（高内聚、低耦合、可复用、可组合）
  - 可单独测试
  - 易于维护
  - 支持 **组件级更新**：只更新有数据变化的组件

- **渲染机制**
  - Vue 组件有渲染函数
    - Vue 2：watcher（渲染 watch）
    - Vue 3：effect（渲染 effect）
  - 数据变化时触发对应 watcher/effect，重新渲染组件

- **组件拆分策略**
  - 合理拆分组件：减少不必要的更新
  - 拆分过细：会产生过多 watcher/effect，浪费性能
  - 原则：**既不粗也不过细，合理即可**

## Vue通过数据劫持可以精准知道哪个数据变化，为什么 Vue 需要虚拟 DOM 和 Diff 算法？

- **问题背景**
  - Vue 使用响应式（数据劫持）可以精确知道哪个数据变化
  - 看似可以直接更新对应 DOM，不需要额外比较
  - 那为什么还要虚拟 DOM + Diff 算法？

- **原因分析**
  1. **单属性 watcher 太多消耗大**
     - 页面数据量大时，如果每个属性都对应一个 watcher/effect，会占用大量内存
     - 比如 100 个数据 → 100 个 watcher/effect → 页面可能变卡
  2. **组件级划分更高效**
     - Vue 采用组件级 watcher/effect
     - 数据变化只更新所属组件
     - 避免每个属性都创建 watcher，节省内存
  3. **虚拟 DOM + Diff 算法**
     - 用于组件更新时的细粒度优化
     - 对比新旧虚拟 DOM，只更新最小差异
     - 保证性能，同时简化更新逻辑

- **总结**
  - Vue 选择 **响应式 + 虚拟 DOM + Diff 算法** 是折中方案
  - 优点：
    - 减少 watcher/effect 数量
    - 组件级更新，高效
    - 更新精准，性能可控

## 对响应式数据的理解

如何实现响应式数据

数组和对象类型当值变化时如何劫持到。对象内部通过 defineReactive 方法, 使用 Object.defineProperty 将属性进行劫持 (只会劫持已经存在的属性), 数组则是通过重写数组方法来实现。多层对象是通过递归来实现劫持。Vue3 则采用 proxy

vue2处理缺陷
- 在 Vue2 的时候使用 defineProperty 来进行数据的劫持, 需要对属性进行重写添加 getter及 setter 性能差。
- 当新增属性和删除属性时无法监控变化。需要通过 delete 实现
- 数组不采用 defineProperty 来进行劫持（浪费性能, 对所有索引进行劫持会造成性能浪费）需要对数组单独进行处理。- 对于 ES6 中新产生的 Map、Set 这些数据结构不支持。

Vue2 与 Vue3 实现对比
```js
// vue2
function defineReactive(target, key, value) {
  observer(value)
  Object.defineProperty(target, key, {
    get() {
      // 依赖收集 记录对应的渲染 watcher
      return value
    },
    set(newValue) {
      // 触发对应渲染 watcher 更新
      if (value !== newValue) {
        value = newValue
        observer(newValue)
      }
    }
  })
}
function observer(data) {
  if (typeof data !== 'object') {
    return data
  }
  for (const key in data) {
    defineReactive(data, key, data[key])
  }
}
// 注意：数据的层级不要太深，因为层级比较深的话呢，一上来，需要去递归去判断一下，如果这个值呢？是个对象，我就要递归的去处理
// 每次用户取值都会触发 get 方法， 因此减少避免触发getter的次数。
const data = {
  num: 1,
}
let num = this.data.num
for (let i = 0; i < 1000; i++) {
  num++
}
this.num = num

// -------------------------
// vue3
const handler = { // 源码区分，普通对象 与 Set/Map 等数据结构  不同的处理方式
  get(target, key) {
    // 依赖收集 记录对应的渲染 effect
    // 在获取的时候判断是否是对象, 如果是对象, 则代理该对象
    if (typeof target[key] === 'object') {
      return new Proxy(target[key], handler)
    }
    return Reflect.get(target, key)
  },
  set(target, key, value) {
    // 触发对应渲染 effect 更新
    if (target[key] !== value) {
      return Reflect.set(target, key, value)
    }
    return true
  }
}
function reactive(target) {
  return new Proxy(target, handler)
}

const proxyData = reactive({
  num: 1,
  obj: {
    a: 1,
  }
})
console.log(proxyData.obj) // 才会触发再次代理，懒代理
```

## Vue 中如何检测数组变化

实现数组劫持
- 数组考虑性能原因没有用 defineProperty 来进行对数组的每一项拦截，而是选择重写数组（push、pop、shift、unshift、splice、sort、reverse）”改变原始数组的变异方法“方法。
- 数组中如果是对象类型, 则需要递归的进行劫持。

数组的缺点

- 数组的索引和长度变化是无法被劫持到的。

```js
// vue2
const newArrayProto = Object.create(Array.prototype)

const oldArrayProto = Array.prototype;

['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'].forEach((method) => {
  newArrayProto[method] = function (...args) {
    // 监控到了数组的变化
    console.log('用户调用了:', method)
    oldArrayProto[method].apply(this, ...args)
  }
})

function defineReactive(target, key, value) {
  observer(value)
  Object.defineProperty(target, key, {
    get() {
      // 依赖收集 记录对应的渲染 watcher
      return value
    },
    set(newValue) {
      // 触发对应渲染 watcher 更新
      if (value !== newValue) {
        value = newValue
        observer(newValue)
      }
    }
  })
}
function observer(data) {
  if (typeof data !== 'object') {
    return data
  }
  // 数组的情况
  if (Array.isArray(data)) {
    data.__proto__ = newArrayProto
  }
  else {
    for (const key in data) {
      defineReactive(data, key, data[key])
    }
  }
}

const data = {
  arr: [1, 2, 3],
}
observer(data)
data.arr.push(4)
console.log(data.arr)
```

vue3 中采用 proxy 来进行数组的劫持，proxy 天然支持数组的索引及长度变化检测。

## Vue 中如何进行依赖收集

Vue 2
依赖收集的流程
- 每个属性都拥有自己的dep属性，存放他所依赖的 watcher，当属性值变化时，会通知对应的 watcher 进行更新。
- 默认在初始化时会调用 render 函数，此时会触发属性依赖收集 dep.depend()
- 当属性变化时会触发 watcher 更新 dep.notify()

<img src="@/assets/vue1.png" alt="vue1" />

响应式更新的**核心流程**：
**组件渲染时执行 render → 取响应式数据 → 收集 watcher → 数据变化通知 watcher → 重新 render**

组件在 **mount** 阶段会创建一个 **渲染 watcher**。
这个 watcher 的核心职责就是：**执行组件的 render 方法**。

当 `new Watcher` 时：
- watcher 会被 **暂存到全局变量**（`Dep.target`）
- 随后立刻执行它的 `get()` 方法
- `get()` 内部会调用组件的 `render`

`render` 执行过程中：
- 模板里用到的响应式数据会被 **读取**
- 读取数据时会触发属性的 `get`

每一个响应式属性内部：
- 都有一个 **Dep 实例**
- Dep 的作用是：**收集依赖（watcher）**

当属性 `get` 被触发时：
- 如果发现全局存在 `Dep.target`
- 就把当前 watcher 收集到这个属性的 dep 中
- 同时 watcher 也会记录自己依赖了哪些 dep

👉 **关系是多对多**
- 一个属性（dep）可以被多个组件使用
- 一个组件（watcher）也依赖多个属性

当数据发生修改时：
- 触发属性的 `set`
- `set` 内部调用 `dep.notify()`
- 通知所有依赖该属性的 watcher 重新执行

watcher 被通知后：
- 重新执行 `render`
- 生成新的虚拟 DOM
- 对比差异`patch()`并更新真实 DOM

Vue 3 依赖收集
- Vue3 中通过 Map 结构将属性和 effect 映射起来
- 默认在初始化时会调用 render 函数，此时会触发属性依赖收集 track
- 当属性变化时会触发找到对应的 effect 列表 依次执行 trigger

Vue 3 的依赖收集流程在**思想层面和 Vue 2 完全一致**，只是实现方式不同。

Vue 3 中不再使用 watcher，而是使用 **effect**。
effect 的本质就是：**一段需要在数据变化时重新执行的函数**，用于驱动视图更新。

组件渲染时：
- 会创建一个 **渲染 effect（render effect）**
- effect 内部保存的是组件的 **更新函数（component update fn）**
- 该更新函数最终会调用 `render`

effect 执行时：
- 会先把当前 effect 放到一个 **全局变量**（`activeEffect`）
- 然后执行更新函数，开始组件渲染

render 执行过程中：
- 会访问响应式数据
- 触发响应式属性的 `get`

在 Vue 3 中：
- 不再通过 dep 实例收集依赖
- 而是使用 **Map 结构进行依赖映射**
  - key：对象 + 属性
  - value：对应的 effect 集合

当属性 `get` 触发时：
- 调用 `track`
- 如果当前存在 `activeEffect`
- 就把 **属性与 effect 建立映射关系**
- 完成依赖收集

当数据发生修改时：
- 触发属性的 `set`
- 调用 `trigger`
- 根据 Map 找到该属性对应的所有 effect
- 依次执行这些 effect

effect 重新执行后：
- 再次调用更新函数
- 再次执行 render
- 完成视图更新

Vue 3 的完整更新链路可以总结为：

**effect 执行 → render 取值 → track 收集 effect → set 触发 trigger → effect 重新执行**

对比结论：
- Vue 2：`Dep + Watcher`
- Vue 3：`Map + Effect`
- 实现不同，但**核心思想完全一致**

本质始终只有一句话：

**把当前正在渲染的逻辑暴露到全局，取值时建立依赖，数据变化时重新执行渲染逻辑**

## Vue.set 方法是如何实现的

Vue 2 的响应式基于 `Object.defineProperty`：
- 只能劫持**已存在的属性**
- 新增对象属性 ❌ 不响应
- 数组通过索引修改、修改 length ❌ 不响应

因此 Vue 提供了 `Vue.set` 作为补救方案。

`Vue.set(target, key, value)` 的核心流程：

1. **参数校验**
   - target 不能为空
   - 不能是原始类型（string / number 等）
   - 不能是只读对象
   👉 不合法直接 return

2. **判断是否为响应式对象**
   - 通过 `target.__ob__` 判断
   - 有 `__ob__` → 已被 Observer 观测
   - 没有 `__ob__` → 非响应式对象，直接赋值即可

3. **数组场景**
   - 如果 target 是数组，并且 key 是索引
   - 内部通过 `splice` 修改
   - 因为数组的 7 个变异方法已被重写，可触发更新
   - 👉 等价于：`arr.splice(index, 1, value)`

4. **属性已存在**
   - 如果 key 本来就在对象上
   - 直接赋值即可
   - 不需要使用 `Vue.set`

5. **禁止修改根数据**
   - 不允许通过 `vm.$data` / 根对象新增属性
   - 原因：需要重新递归劫持，性能差
   - Vue 明确不推荐这种用法

6. **新增响应式属性**
   - 使用 `defineReactive`
   - 通过 `Object.defineProperty` 将新属性变为响应式
   - 新属性会拥有自己的 dep

7. **通知更新**
   - 调用 `ob.dep.notify()`
   - 触发相关 watcher 重新渲染组件

## Vue中的 v-show 和 v-if 怎么理解

基本概念
- v-if 如果条件不成立不会渲染 所在节点的 dom 元素
- v-show 只是切换所在节点的 显示 与 隐藏

v-if 和 v-show 都用于控制元素显示，但**原理和使用场景完全不同**。

v-if 的核心特点：
- 条件不成立时，**元素不会被渲染**
- 对应的 DOM 会被移除，实际渲染的是一个**注释节点**
- 模板编译后会变成 **三元表达式**
  - 条件成立：创建真实 DOM
  - 条件不成立：创建 empty / 注释节点
- 可以 **阻断内部代码执行**
  - 条件为 false 时，内部取值、逻辑都不会执行

适合场景：
- 初始就能确定是否显示
- 显示状态切换不频繁
- 内部逻辑复杂，希望条件不满足时完全不执行

v-show 的核心特点：
- 元素 **始终会被渲染**
- 只是通过样式控制显示 / 隐藏
- 本质是切换 `display` 属性
- 不会简单使用 `display: block / none`
  - 会先保存元素原本的 display
  - 隐藏时设为 `display: none`
  - 显示时还原原始 display

实现方式：
- 模板编译后不会生成条件表达式
- 会被编译成一个运行时指令（v-show）
- 在指令的 bind / update 阶段控制 display

适合场景：
- 需要频繁切换显示状态
- 不希望反复创建和销毁 DOM

## watch & computed

Vue2 中有三种 watcher (渲染 watcher、计算属性 watcher、用户 watcher)

Vue3 中有三种 effect (渲染 effect、计算属性 effect、 用户 effect)

`computed`
- 计算属性仅当用户取值时才会执行对应的方法。
- computed属性是具备缓存的,依赖的值不发生变化,对其取值时计算属性方法不会重新执行。
- 计算属性可以简化模板中复杂表达式。
- 计算属性中不支持异步逻辑。
- computed 属性是可以在模板中使用的。

`watch`
- watch 则是监控值的变化,当值发生变化时调用对应的回调函数。经常用于监控某个值的变化,进行一些操作。(异步要注意竞态问题)
- vue3 提供了 onCleanup 函数,让用户更加方便使用也解决了清理问题。

`竞态问题`

概念：
- 多个异步操作被连续触发
- 后发起的操作可能先完成
- 旧结果覆盖新结果，导致状态错误

Vue2 中的处理方式：

- Vue2 没有内建竞态处理机制
- 常见做法：
  - 使用变量标识当前请求（如 requestId）
  - 在回调中判断是否为最新请求
  - 或手动取消请求（如 axios cancelToken）
- 竞态控制主要依赖开发者自行实现

Vue3 中的处理方式：

- watch / watchEffect 提供 onCleanup
- 每次副作用重新执行前，自动调用上一次的 cleanup
- 用于让旧的异步操作“失效”，（onCleanup 不是取消异步，而是 **防止过期异步结果生效**）

```js
const vm = new Vue({
  template: `
    <div>
        <p>fullName: {{ fullName }}</p>
    </div>
  `,
  data() {
    return {
      firstName: 'fff',
      lastName: 'jjj',
    }
  },
  computed: {
    // 每一个计算属性内部维护一个 dirty 属性，默认值为 true
    // 当计算属性依赖的响应式数据发生变化时，会将 dirty 设置为 true
    // 当计算属性被访问时，如果 dirty 为 true，会重新计算值并将 dirty 设置为 false
    // 如果 dirty 为 false，会直接返回缓存的值
    fullName() {
      return this.firstName + this.lastName
    }
  },
  watch: {
    fullName(newVal, oldVal) {
      console.log('fullName 变化了', newVal, oldVal)
    }
  },
  methods: {
    changeName() {
      // 当计算属性依赖的响应式数据发生变化时，会将 dirty 设置为 true
      this.firstName = 'fff2'
    }
  }
})
```

`computed`
- 计算属性会创建一个计算属性watcher, 这个watcher(lazy:true) 不会立刻执行
- 通过Object.defineProperty将计算属性定义到实例上
- 当用户取值时会触发getter, 拿到计算属性对应的watcher, 看dirty是否为true, 如果为true则求值
- 并且让计算属性watcher中依赖的属性收集最外层的渲染watcher, 可以做到依赖的属性变化了, 触发计算属性更新dirty并且可以触发页面更新
- 如果依赖的值没有发生变化, 则采用缓存

```js
// vue3
import { computed, reactive, watch } from 'vue'

const state = reactive({
  firstName: 'fff',
  lastName: 'jjj',
})

const fullName = computed(() => {
  // 依赖的值变化后，会通知计算属性 effect 更新 dirty，并且计算属性会触发自己收集的渲染 effect 执行
  return state.firstName + state.lastName
})

watch(fullName, (newVal, oldVal) => {
  console.log('fullName 变化了', newVal, oldVal)
})

function render() {
  // 和vue2 不同的是, 这个计算属性会收集当前组件的渲染产生的 effect
  return `
    <div>
        <p>fullName: ${fullName.value}</p>
    </div>
  `
}
```

## ref 和 reactive 区别

基本概念
-ref 和 reactive 是 Vue3 数据响应式中非常重要的两个概念。
- reactive 用于处理对象类型的数据响应式。底层采用的是 new Proxy(), (包括es6 中的 Map, Set 等数据结构)
 - 解构会丢失响应式
- ref 通常用于处理单值的响应式, ref 主要解决原始值的响应式问题。 底层采用的是 Object.defineProperty()实现。
 - 任意类型都可以使用ref 响应式处理,
 - (RefImpl 类 的 get set方法处理，实际编译之后会调用 Object.defineProperty() 方法)
 - 如果传的是对象类型, 会转为 reactive 响应式处理（toReactive 方法）
 - reactive中部分属性是ref时，取值会自动拆包 不需要.value

源码实现
[reactive](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts)
[ref](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts)

## watch & watchEffect 区别

- watchEffect 立即运行一个函数,然后被动地追踪它的依赖,当这些依赖改变时重新执行该函数。
- watch 侦测一个或多个响应式数据源并在数据源变化时调用一个回调函数。

内部都是通过 doWatch 方法实现的。 不同的是 watchEffect 没有回调函数, 只有 getter 函数。

```js
const effect = new ReactiveEffect(getter, scheduler)
effect.run()

// getter 函数
watchEffect(() => {
  app.innerHTML = state.name // 数据变化后,会调用scheduler内部会再次触发effect.run()重新运行getter
})

// 1.getter 函数 2.cb函数
watch(
  () => state.name, // 数据变化后,会调用scheduler,内部会调用cb
  (newVal, oOldval) => {}
)
```

[watch](https://github.com/vuejs/core/blob/main/packages/reactivity/src/watch.ts)

## 如何将 template 转换成 render 函数

Vue 中含有模版编译的功能, 它的主要作用是将用户编写的 template 编译为 js 中可执行的 render函数。

- 将 template 模板 parse 方法 转换成 ast 语法树 - parserHTML
- 对静态语法做静态标记 - markup diff来做优化的 静态节点跳过diff操作
- 重新生成代码 - code generate 方法 生成 render 函数

模板编译的过程
[演示编译 - 抽象语法树](https://astexplorer.net/)
- Vue3 中的模板转化, 做了更多的优化操作。Vue2 仅仅是标记了静态节点而已

[vue3 代码](https://github.com/vuejs/core/blob/main/packages/vue/src/index.ts)

## new Vue() 过程中究竟做了什么

`vue2`
- 在 new Vue 的时候 内部会进行初始化操作。
- 内部会初始化组件绑定的事件, 初始化组件的父子关系(initLifecycle) children $root
- 初始化响应式数据 data、computed、props、watch、method。 同时也初始化了 provide 和 inject 方法。内部会对数据进行劫持 对象用 defineProperty，数组采用方法重写。
- 在看一下用户是否传入了 el 属性和 template或者 render。render 的优先级更高 如果用户写的 是template 会做模板编译 (三部曲) 最终就拿到了 render 函数
- 内部挂载的时候会产生一个 watcher, 会调用 render 函数会触发依赖收集。内部还会给所有的响应式数据增加 dep属性, 让属性记录当前的 watcher (用户后续修改的时候可以触发 watcher 重新渲染)
- vue 更新的时候采用虚拟 DOM 的方式进行 diff算法更新。

Vue2：new Vue() 过程做了什么

1. 合并配置
- 合并 options（data、methods、computed、watch、生命周期等）
- 处理 mixin、extend 产生的配置

2. 初始化实例
- 初始化生命周期（$parent / $children / flags）
- 初始化事件（$on / $emit）
- 初始化渲染相关属性（$slots / $attrs）

3. 初始化响应式数据
- data → Object.defineProperty 劫持
- computed / watch 创建 watcher
- 每个组件只有一个「渲染 watcher」

4. 挂载阶段（如果传了 el）
- 调用 $mount
- 创建渲染 watcher
- 执行 render 函数
- 生成虚拟 DOM
- patch 成真实 DOM

5. 后续更新
- 数据变化 → 触发 dep.notify
- watcher 重新执行
- 重新 render + diff + patch

Vue3：createApp() 过程做了什么

1. createApp(rootComponent)
- 创建应用实例（Application）
- 不再直接创建组件实例
- 全局配置与组件实例解耦

2. app.mount(container)
- 创建根组件实例
- 创建渲染 effect（render effect）
- 执行 render 函数
- 基于 Proxy 的响应式收集依赖

3. 响应式系统
- Proxy + Reflect
- effect 代替 watcher
- 使用 Map 结构管理依赖关系

4. 更新流程
- 数据变化 → trigger
- 触发对应 effect
- 重新执行 render
- 基于虚拟 DOM + block tree 更新

核心区别总结

Vue2：
- new Vue = 应用 + 根组件
- Object.defineProperty
- watcher + dep
- 配置和实例强耦合

Vue3：
- createApp ≠ 创建组件
- Proxy 响应式
- effect + Map
- 应用实例与组件实例分离
- 更利于多应用、插件、tree-shaking

总结

Vue2 中 new Vue 会完成实例创建、响应式初始化和挂载；
Vue3 中 createApp 只创建应用上下文，真正的组件创建与渲染发生在 mount 阶段，响应式由 effect 驱动。

## Vue observable 了解

Vue.observable 是 Vue 2.6 新增的一个 API
作用：把**普通对象转换成响应式对象**

原理：
- 内部直接调用 observe
- 基于 Object.defineProperty 做数据劫持
- 返回的对象具备完整响应式能力

使用场景：
- 创建一个**全局共享的响应式对象**
- 用于简单场景的组件通信：
  - 父子组件
  - 跨级组件
  - 兄弟组件
- 类似一个“轻量版状态管理”

缺点：
- 数据是**共享的、可随意修改**
- 缺乏规范和约束
- 必须引入整个 Vue（无法单独使用响应式模块）

与 Vue3 的关系：
- Vue3 已移除 Vue.observable
- 使用 reactive() 直接创建响应式对象
- 响应式系统可独立使用（无需创建应用）vue3是基于 monorepo 架构，响应式系统是独立的模块，不依赖于应用实例。

## v-if 和 v-for 优先级对比（Vue2 vs Vue3）

核心结论
- **避免在同一元素上同时使用 v-if 和 v-for**
- 两者在 Vue2 和 Vue3 中**优先级不同，行为也不同**
- 推荐做法：**用计算属性先处理数据，再用 v-for 渲染**

Vue2 中的行为

优先级
- **v-for 优先级高于 v-if**
- 执行顺序：
  **先循环 → 再判断条件**

表现
- 即使条件不成立，也会：
  - 先遍历整个数组
  - 再为每一项判断 v-if
  - 不满足时返回**注释节点**
- 性能较差 ❌

官方建议

- 将 `v-if` **提到外层元素**

```html
<div v-if="show">
  <li v-for="item in list" :key="item.id"></li>
</div>
```

Vue3 中的行为

优先级
- v-if 优先级高于 v-for
- 编译阶段会：
 - 自动把 v-if 提升到外层（类似包一层 template）

## 生命周期对比（Vue2 vs Vue3）

生命周期本质：组件从创建 → 挂载 → 更新 → 销毁过程中，Vue 在固定时机同步调用的一组钩子函数，用来让开发者介入逻辑

`vue2`

<img src="@/assets/vue3.png" alt="vue3" />

`vue3`

<img src="@/assets/vue5.png" alt="vue5" />

## Vue 中 diff 算法原理

`Diff 概念`
vue 基于虚拟 DOM 做更新。diff 的核心就是比较两个虚拟节点的差异。Vue 的 diff 算法是平级比较，不考虑跨级比较的情况。内部采用深度递归的方式 + 双指针的方式进行比较。

`Diff 比较流程` patch 函数
- 先比较是否是相同节点 key tag
- 相同节点比较属性，并复用老节点（将老的虚拟 dom 复用给新的虚拟节点 DOM）
- 比较儿子节点, 考虑老节点和新节点儿子的情况
 - 老的没儿子，现在有儿子。直接插入新的儿子
 - 老的有儿子，新的没儿子。直接删除页面节点- 老的儿子是文本，新的儿子是文本，直接更新文本节点即可
 - 老的儿子是一个列表，新的儿子也是一个列表 updateChildren
- 优化比较：头头(尾部加入)、尾尾（头部加入）、头尾、尾头(updateChildren)
- 比对查找进行复用
 - (Vue3 中采用最长递增子序列来实现 diff 优化)。

<img src="@/assets/vue6.png" alt="vue6" />

## 说明Vue key 的作用

`key 的概念`
- key 的特殊 attribute 主要用在 Vue 的虚拟 DOM 算法，在新旧 nodes 对比时辨识 VNodes。如果不使用 key, Vue 会使用一种最大限度减少动态元素并且尽可能的尝试就地修改/复用相同类型元素的算法。
- 当 Vue 正在更新使用 v-for 渲染的元素列表时，它默认使用“就地更新”的策略。如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序，而是就地更新每个元素，并且确保它们在每个索引位置正确渲染

`key 的作用`
- Vue 在 patch 过程中通过 key 可以判断两个虚拟节点是否是相同节点。（可以复用老节点）
- 无 key 会导致更新的时候出问题 (默认是undefined  index 作为 key 由于 index 是连续的 所以会导致复用错误进行更新节点  0 > 1  0 > 0完全复用错误 走了更新逻辑)
- 尽量不要采用索引作为 key

```html
<!-- 没有key就会就地服用 value存在 有 key 就会删除 text 节点 添加 password 节点 -->
<input type="text" v-if="show" key="text" />
<input type="password" v-else key="password" />

<!-- 如果没有key || index 就会就地复用， 有key比较 会根据key 复用 未变更的节点 不会进行操作  精准找到移动变化的元素进行更新 -->
<ul>
  <li v-for="item in list" :key="item.id">{{ item }}</li>
</ul>

```

## Vue.use 作用

`use 概念`
安装 Vue.js 插件。如果插件是一个对象, 必须提供 install 方法。如果插件是一个函数, 它会被作为 install 方法。
install 方法调用时, 会将 Vue 作为参数传入,这样插件中就不在需要依赖 Vue 了。

`插件的功能`
- 添加全局指令、全局过滤器、全局组件。
- 通过全局混入来添加一些组件选项。
- 添加 Vue 实例方法, 通过把它们添加到 Vue.prototype 上实现。

```ts
Vue.use = function (plugin: Function | object) {
  // 插件缓存
  const installedPlugins
    = this._installedPlugins || (this._installedPlugins = [])
  if (installedPlugins.includes(plugin)) {
    // 如果已经有插件 直接返回
    return this
  }
  // additional parameters
  const args = toArray(arguments, 1) // 除了第一项其他的参数整合成数组
  args.unshift(this) // 将Vue 放入到数组中
  if (typeof plugin.install === 'function') {
    // 调用install方法
    plugin.install.apply(plugin, args)
  }
  else if (typeof plugin === 'function') {
    // 直接调用方法
    plugin.apply(null, args)
  }
  installedPlugins.push(plugin) // 缓存插件
  return this
}
```

## Vue.extend 作用

Vue.extend 的作用是根据用户传入的组件配置创建一个继承自 Vue 的子类构造函数，本质上是 Vue 组件系统的底层实现方式。通过它可以把一个普通的组件选项对象转成可被 new 的组件类，子类会继承 Vue 的原型能力，在实例化时同样会执行完整的初始化流程并支持响应式、生命周期和 $mount。Vue 内部所有组件（包括全局组件）本质上都会经过 Vue.extend 处理，只是开发中一般不需要手动调用。它常用于手动创建并挂载组件或解析字符串模板（需编译版 Vue，性能较差）。

在 Vue3 中该 API 被移除，改用 createApp、render、Teleport 等方式实现类似能力。

## Vue组件data 为什么必须为函数

- 根实例对象 data 可以是对象也可以是函数“单例”，不会产生数据污染情况
- 组件实例对象 data 必须为函数，目的是为了防止多个组件实例对象之间共用一个data ，产生数据污染。所以需要通过工厂函数返回全新的 data 作为组件的数据源

```js
function Vue() {}

Vue.extend = function (options) {
  function Sub() {
    // 会将data存起来
    this.data = this.constructor.options.data
  }
  Sub.options = options
  return Sub
}
let Child = Vue.extend({
  data: { name: 'xxx' },
})

// 两个组件就是两个实例，希望数据互不干扰
let child1 = new Child()
let child2 = new Child()

console.log(child1.data.name)
child1.data.name = 'fff'
console.log(child2.data.name)
```

Vue3 是从组件出发创建应用的，createApp 接收的就是一个组件，不再区分根实例和普通组件，因此 data 统一只能是函数。这样所有组件的数据模型保持一致，也避免了实例之间共享同一份数据的问题。

## 函数组件的优势（针对Vue2）

函数式组件的特性：无状态、无生命周期、无 this, 但是性能高。正常组件是一个类继承了 Vue, 函数式组件就是普通的函数, 没有 new 的过程。最终就是将返回的虚拟 DOM 变成真实 DOM替换对应的组件。

- 函数式组件不会被记录在组件的父子关系中，
- 在 Vue3 中因为所有的组件都不用 new 了, 所以在性能上没有了优势~。

## Vue 中的过滤器了解吗？过滤器的应用场景有哪些？

过滤器实质不改变原始数据，只是对数据进行加工处理后返回过滤后的数据再进行调用处理，也可以理解成纯函数。

## v-once 的使用场景

概念
v-once是 Vue 中内置指令, 只渲染元素和组件一次。随后的重新渲染, 元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。

v-once 使用场景
- 单独元素
- 外层元素
- 组件
- 列表渲染中 v-for 会把 v-once 指令作用到外层元素上

本质在首次渲染的时候rander函数会缓存 _cache 缓存对象(虚拟节点), 后续渲染会直接从缓存中取。

- 只要标记过 v-once, 后续动态数据变化不会触发组件更新
- vue3.2之后，新增 v-memo 指令, 通过依赖列表的方式控制页面渲染

```html
<!-- 我们可以告诉他 哪些数据变化了 通过列表形式给到 来控制重新渲染 -->
<div v-memo="[val1, val2]">
    <div v-for="item in list" :key="item.id">{{ item }}</div>
</div>
```

## Vue.mixin 使用场景和原理

Vue.mixin 的作用是 **复用和扩展组件逻辑**，分为两种方式：

- 全局混入：影响所有组件（常用于插件）
- 局部混入：复用某一类组件的公共逻辑

全局混入常见使用场景：
- 插件开发（如 Vue Router、Vuex）
- 通过生命周期钩子（如 beforeCreate）注入全局属性
- 例如：`this.$router`、`this.$store`

特点：
- 一次混入，所有组件生效
- 使用方便，但**影响范围大**

局部混入的作用：
- 抽离组件之间的公共逻辑
- 在组件中通过 `mixins: []` 引入
- 常用于复用 data、methods、生命周期等

Mixin 的核心原理：**选项合并（mergeOptions）**
- 全局 mixin 会合并到 Vue.options
- 组件初始化时：
  - 父选项（全局 / mixin）
  - 子选项（组件自身）
  - 通过 mergeOptions 合并

内部使用的是 **策略模式**
- 不同配置项采用不同合并策略

常见合并策略总结：

- data
  - 合并成一个新函数
  - 执行父 data + 子 data
  - 返回结果进行深度合并
  - 子优先

- methods / props / inject / computed
  - 对象合并
  - 子覆盖父（就近原则）

- 生命周期钩子（created / mounted 等）
  - 合并成数组
  - 按顺序依次执行（先父后子）

- watch
  - 合并成数组
  - 所有 watcher 都会执行

- components / directives / filters
  - 通过原型链合并
  - 子组件找不到时，可沿原型链访问父组件定义

Mixin 的问题与缺陷（常见面试点）：

- 命名冲突
  - data / methods 同名时易被覆盖
- 数据来源不清晰
  - 无法快速判断属性来自哪个 mixin
- 增加心智负担
  - 组件复杂度随 mixin 增多而上升

为什么 Vue 3 不推荐 mixin？

- Vue 3 使用 Composition API
- 通过函数方式复用逻辑（useXXX）
- 优点：
  - 无命名冲突
  - 数据来源清晰
  - 逻辑可组合、可拆分
