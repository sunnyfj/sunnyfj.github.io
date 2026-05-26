# es6+ 新增特性

## es6所有api?????

## 算法 bfs dfs 递归 一些排序算法

## Map 和 WeakMap
连环追问：
Map 和普通对象（Object）在底层哈希冲突处理和键名类型上有什么区别？

WeakMap 的“弱引用”到底在 V8 引擎层面是怎么工作的？它在前端工程中有哪些不可替代的场景？

💡 核心答分点：
普通 Object vs Map： 普通对象的键名只能是字符串或 Symbol，如果传入对象会被强行调用 toString() 转换为 "[object Object]"。而 Map 支持任意类型作为键名（包括对象、函数、甚至是另一个 Map），其底层通过哈希表结合链表（或红黑树变体）来实现键值的精准映射。

WeakMap 的强弱之分： * Map 对它的键（Key）是强引用。这意味着只要 Map 实例还在，即使作为 Key 的那个对象在外部被赋值为 null，V8 引擎的垃圾回收器（Garbage Collector）也绝不会回收该对象所占用的内存，从而容易导致内存泄漏。

WeakMap 的键只能是对象，且对该对象是弱引用。一旦这个对象在外部没有其他强引用指向它了，V8 在下一次执行 GC 时，会直接无视 WeakMap 的引用，将该对象和它在 WeakMap 中对应的 Value 一并回收。

工程落地场景（高分谈资）： 1. Vue 3 响应式系统底层： reactive 的底层依赖追踪图（targetMap）就是用的 WeakMap。把目标对象当做 Key，一旦组件销毁、目标对象不再被使用，整个依赖图自动被内存回收。
2. DOM 节点关联缓存： 当你需要给某个真实 DOM 节点挂载一些私有业务数据时，用 WeakMap 以 DOM 节点为 Key。当 DOM 被 remove() 掉后，缓存数据无感自动销毁。

## Set 和 WeakSet

1. Set（强引用、可遍历的唯一集合）特性： 类似数组，但成员的值都是唯一的。内部使用“SameValueZero”算法判断，认为 NaN 相等，但不同内存地址的对象（如 {} 和 {}）不相等。

核心优势： 查找速度极快。set.has(value) 的底层是哈希表，时间复杂度是 $O(1)$，远快于数组的 includes（$O(N)$）。

方法与遍历： 支持 size 属性，支持 forEach、for...of 遍历，原生支持交集、并集、差集等集合运算。

内存影响： 强引用。只要 Set 实例还在，存入其中的对象就绝对不会被垃圾回收（GC），哪怕外部已经把该对象设为了 null。🚀

2. WeakSet（弱引用、不可遍历的对象集合）特性： 成员只能是对象（以及特定的 Symbol），不能是数字、字符串等基础类型

核心优势： 弱引用。它不计入 V8 引擎的垃圾回收引用计数。一旦存入的对象在外部没有其他强引用了，GC 会自动把该对象从内存和 WeakSet 中一起清理掉。

代价与限制： 完全不可遍历。没有 size 属性，没有 keys()/values()，不能用 forEach 或 for...of。你只能用 add()、delete() 和 has()。

典型用途： 专门用来临时存放对象。比如做循环引用检测、或者存放特定的类实例做私有警卫，核心目的就是防止内存泄漏。

## Proxy 与 Reflect 的元编程（Meta-programming）联合闭环

- 为什么必须配合 Reflect： 为了确保上下文 this 指向的正确性与安全性。
    - 如果目标对象内部有 getter，且该 getter 依赖于 this。若你在 Proxy 的 get 拦截器里直接使用 target[key] 返回，此时 this 会指向原始的 target，从而绕过了代理拦截，导致依赖收集失效。
    - 必须写成 Reflect.get(target, key, receiver)，第三个参数 receiver 会强制将内部 getter 的 this 绑定为当前的 Proxy 代理对象。
- 底层升级的工程本质： * Object.defineProperty 是侵入性修改。它必须全量递归遍历对象的所有属性，强行修改其属性描述符（Descriptor），对大对象非常耗费初始化内存和 CPU。
 - Proxy 是非侵入性的行为劫持。它是在 V8 的对象外层包装了一层虚拟的“行为审查层”，属于 O(1) 的懒拦截。只有当你真正去访问或修改某个深层属性时，才会动态触发拦截，在内存和初始化速度上展现出了降维打击的优势。

## 迭代器协议（Iterator）

什么是可迭代对象（Iterable）？如何让一个普通的 JavaScript 自定义对象支持 for...of 循环？

可迭代协议的底层： 一个对象如果想要支持 for...of 循环或解构赋值，它必须在底层实现 [Symbol.iterator] 方法。该方法必须返回一个包含 next() 函数的对象。每次迭代，调用 next() 都会返回 { value: any, done: boolean }。

## TS 和 JS 的区别总结

 1. 核心本质：运行期动态 vs 编译期治理
JavaScript： 动态弱类型。类型在运行期动态决定，允许隐式类型转换（如 1 + '1' = '11'）。低级错误只能在生产环境运行时被动暴露。

TypeScript： 静态强类型（渐进式结构化类型）。类型检查死卡在编译期。打包时，通过类型擦除将所有类型抹去，线上跑的依然是纯 JS，不改变任何运行时行为。

 2. 运行期幕后：TS 对 V8 引擎的间接加速
虽然线上都是纯 JS，但 TS 约束的代码能完美迎合 V8 引擎的 JIT（即时编译）优化机制：

稳定隐藏类（Hidden Class）： TS 强约束了对象形状（Shape）。全团队写出的对象形状高度一致，V8 引擎在底层就能极速复用隐藏类进行内存查找。

避免“去优化”： TS 锁死了变量类型。避免了 V8 编译器因为遭遇“类型突变”而被迫推翻机器码重来的卡顿（Deoptimization）。

 3. 工程化 ROI（投入产出比）
JS 的痛点： 适合小项目快速交付。但在大型协作中，接口字段一改，全项目靠肉眼对齐，极易引发线上崩溃。

TS 的收益： 达成“输入即提示，重构即校验”。通过泛型与类型契约，配合 CI/CD 流程中的 tsc --noEmit 强行卡死代码质量下限，重构成本近乎归零。

4. 总结来说，JavaScript 是自由与动态的，它追求的是快速交付和运行时的极低门槛；

而 TypeScript 是秩序与契约，它是一套在编译期对研发质量进行兜底的治理工具。

它在编译期通过类型擦除实现工程上的安全约束，在运行期通过维持对象形状的稳定性去迎合 V8 引擎隐藏类的 JIT 优化机制。在现代化大型协作项目中，拥抱 TS 已经不是为了时髦，而是为了给软件系统的重构和长期演进提供底座级别的状态确定性。

## 闭包

1. 闭包的本质：携带上下文的“内存幽灵”
标准定义： 一个函数有权访问另一个函数作用域中的变量，这个结合体就叫闭包。

内存底层： 正常情况下，一个函数执行完毕后，它的调用栈（Call Stack）和执行上下文会被直接弹出并销毁。但如果该函数内部的子函数被外部引用（例如被 return 出去），V8 引擎通过逃逸分析，发现内部变量未来还会被调用，就会强行将这些变量从栈内存中复制到堆内存（Heap）中，作为一个名为 Closure 的对象永久保存。只要子函数不被销毁，这个堆内存中的 Closure 对象就永远不会被垃圾回收（GC）。

2. V8 引擎对闭包的极致优化

按需捕获： V8 在编译期会对内部函数进行静态扫描。只有真正被内部函数使用的变量，才会被塞进 Closure 对象里。那些没被用到的父级变量，执行完后依然会被正常回收。

3. 工程化利弊与内存防御

正向收益（何时必须用）：
数据私有化与模块化： 封装高阶组件、自研 SDK（如防抖节流、自增 ID 生成器）时，利用闭包创建外部无法直接修改的私有变量，只暴露特定的操作方法。

状态柯里化（Currying）： 固化部分通用参数，动态生成新的业务函数。

负向包袱（如何防泄漏）：
隐式内存泄漏： 闭包最怕间接强引用。如果闭包函数被挂载到了全局变量（window）、定时器（setInterval）或者 DOM 事件监听器上，它所捕获的整个堆内存垃圾回收器将永远无法释放。

唯一治理手段： 在确认不再使用闭包时，必须手动切断引用，将其赋值为 null（例如 fn = null），主动触发 V8 的垃圾回收。

## 栈（Stack）和堆（Heap）

结构与特性的本质区别：

栈内存（Stack）：
- 特点： 后进先出（LIFO） 的连续内存区域。由系统自动分配和释放。
- 存什么： 存放函数的执行上下文（Execution Context）、基本数据类型（Number, String, Boolean, Null, Undefined, Symbol, BigInt）以及引用类型的内存地址指针。
- 性能： 极快。入栈和出栈只需要移动 CPU 的栈顶指针，操作耗时是固定的 $O(1)$。

堆内存（Heap）：
- 特点： 很大且无序的树状/链表式内存区域。由开发者分配或引擎的垃圾回收器（GC）动态管理。
- 存什么： 存放引用数据类型（Object, Array, Function, 以及闭包中逃逸的变量）。
- 性能： 较慢。分配时需要寻找足够大的连续空闲内存块（V8 会区分新生代和老生代）；读取时需要先从栈里拿到指针，再通过指针去堆里寻址。

内存泄漏与 GC 压力：
- 栈内存的生命周期： 天生安全。函数执行完，对应的栈帧（Stack Frame）自动弹出销毁，内存瞬间清空。
- 堆内存的垃圾回收压力： * 堆内存是 JavaScript 性能瓶颈和内存泄漏的唯一源头。
    - 留在堆里的垃圾对象如果过多，会频繁触发 V8 的垃圾回收。而老生代的 Full GC 包含 Mark-Sweep（标记清除） 和 Mark-Compact（标记整理），这些操作会触发 STW（Stop-The-World），导致主线程代码执行暂停，直观表现就是前端页面卡顿或后端 Node.js 接口响应超时（RT）飙升。

## 原型链

原型链（Prototype Chain）的本质
 - 表面现象： 当访问一个对象的属性时，如果对象自身没有，JS 引擎就会去它的 __proto__（即构造函数的 prototype）里找，一层层往上，直到 Object.prototype.__proto__（值为 null），这条查找链路就是原型链。
 - V8 底层真相： * 原型链的本质是 V8 引擎的一种兜底属性查找机制。
    - 为了优化性能，V8 并不是每次都去动态爬链。它利用隐藏类（Hidden Class）和内联缓存（Inline Cache）。如果一个对象在原型链上频繁命中某个属性，V8 会把这个属性的偏移量直接缓存到当前对象的隐藏类中。

⚠️ 性能毒药： 如果你动态修改了原型对象（例如 Object.setPrototypeOf），会直接导致全量隐藏类失效（Invalidate），触发 V8 的大规模去优化，性能暴跌。

总结：对象通过 __proto__ 指针串联起来的属性查找隐式链条，到 null 为止。

## 继承

组合寄生继承（ES5 时代的终极解法）
它是 ES6 之前最完美的继承方式，解决了“原型属性污染”和“父类构造函数被调用两次”的 Bug：

```ts
function Parent(name) {
  this.name = name
  this.colors = ['red'] // 实例属性，不共享
}
function Child(name, age) {
  Parent.call(this, name) // 1. 借用构造函数：继承实例属性
  this.age = age
}
// 2. 寄生式：只复制父类的原型，切断与父类构造函数的直接联系
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child // 修复构造函数指向
```

ES6 Class 的本质：不是新语言，而是严格的语法糖
现代工程全部拥抱 class SubClass extends ParentClass。

底层机制： class 底层依旧是基于原型链的寄生组合继承。但它由 V8 引擎在底层做了原生强约束：

类的内部方法默认是不可枚举（non-enumerable）的（符合面向对象规范）。

必须在 constructor 中先调用 super() 才能使用 this。因为 ES6 的继承机制是先由父类创建出 this 的实例对象，再由子类的构造函数去修饰这个 this（ES5 则是先创建子类的 this，再把父类属性挂上去）。

总结：
- 从 ES5 的“属性借用+原型寄生”演进为 ES6 具备严格 V8 约束的 Class 语法糖。
- 架构师共识： 彻底理解原型链是为了防范 V8 性能陷阱；在现代业务开发中，坚决推行“多用组合，少用继承”的架构规约

## CSS 隐藏元素

- display: none; 不占用空间 不响应点击 触发 Reflow（重排）
- visibility: hidden; 占用空间 不响应点击 触发 Repaint （重绘）
- opacity: 0; 占用空间 响应点击  触发 Composite（复合图层操作）
- pointer-events: none; 不响应点击  直接穿透事件 空白层
- 绝对定位 + 负边距（position: absolute; left: -9999px;）
- 剪裁区域（clip-path: circle(0);）
- 尺寸设为 0 + 超出隐藏（width: 0; height: 0; overflow: hidden;）

## 元素居中
- display: flex; justify-content: center;  align-items: center;
- display: grid; place-items: center;
- Absolute 绝对定位 + Transform
- line-height: 40px; 高度为 40px，垂直居中
- 水平居中：margin: 0 auto;

## 动画

1. CSS 动画的两大核心（Transitions vs Keyframes）
Transition（过渡）： 适合触发式、只有“起始状态”和“结束状态”两帧的简单动画（如鼠标悬停 :hover 改变颜色）。

Keyframes（关键帧动画）： 适合循环、复杂、多阶段的动画。通过 @keyframes 编排 0% 到 100% 的精细控制。

🚀 性能大杀器：如何写出 60fps 的流畅 CSS 动画？
避开毒药： 坚决不用 top/left/width/height 做动画，因为它们会频繁触发 V8 的 Reflow（重排）和 Repaint（重绘），导致 CPU 占满、动画卡顿顿挫。

拥抱 GPU： 必须且只使用 transform（位移/缩放/旋转）和 opacity（透明度）。这两个属性会直接跳过重排与重绘，在独立的复合图层（Composite）上由 GPU 硬件加速渲染，丝滑流畅。

2. JS 动画：复杂交互与时间轴控制
当动画涉及到复杂的数学计算、物理引擎、或者需要根据用户的动态输入（如拖拽、跟随鼠标）来改变时，CSS 就无能为力了，必须借助 JS。

⚠️ 时代眼泪：不要再用 setTimeout / setInterval
传统的定时器极易导致丢帧（Frame Dropping）。因为它们的执行时机与浏览器的刷新频率（通常是 60Hz，即 16.7ms 一帧）不同步，会导致“动画积压”或在不该渲染时渲染，产生肉眼可见的抖动。

✅ 终极解法：requestAnimationFrame (rAF)
机制： 由浏览器内核来掌控全局节奏。浏览器准备刷新的那一刹那，才会调用 rAF 里的回调函数。

优势： 自动与屏幕刷新率完美同步；当页面处于后台标签页或被最小化时，rAF 会自动暂停，极大节省 CPU 内存和电量。

📦 3. 面试一句话秒答（核心决策）
CSS 动画： 适合轻量、UI 纯视觉反馈。优先用 transform，性能好、不占主线程、能走 GPU 硬件加速。

JS 动画： 适合强交互、带逻辑控制。死卡 requestAnimationFrame，确保动画在浏览器刷新时精准执行，防丢帧。

GSAP 的本质是一个基于 requestAnimationFrame 统一时间流的、经过极致读写分离优化的、高频数字补间（Tween）状态机。它不生产动画，它只是完美利用了 GPU 加速和精准的时间差计算，做到了比 CSS 更可控、比普通 JS 更高效的“数字魔术”。

## bfc

BFC 就是一个“绝对隔离的密闭容器”。容器里面的子元素无论怎么排版，绝对不会在边缘和外边距（Margin）上影响到外面的元素。

给父元素设置以下任一属性，即可开启 BFC 隔离墙：

- display: flow-root; （现代标准，最推荐，无副作用）
- overflow: hidden; （最常用）
- display: flex; 或 grid; （子元素自动形成 BFC）

## 兼容性

“处理 CSS 兼容性，我的核心策略是**‘构建层交由 PostCSS+Autoprefixer 自动化补全前缀，代码层坚持渐进增强设计’**。通过 .browserslistrc 死卡团队的浏览器兼容边界，利用 CSS 原生的 @supports 特性查询和属性覆盖规则，让新浏览器享受极致性能（如 GPU 加速的 Grid/Transform），让老浏览器平滑降级安全交付。”

##  em rem vw

- em 当前元素的 font-size（若当前没设，则继承父级）嵌套地狱。连续嵌套时尺寸会按乘法指数级放大/缩小。 (text-indent: 2em;)
- rem **根元素（<html>）**的 font-size一旦滥用，用户在系统层放大字体时，整个网页布局可能会乱。
- vw 浏览器视口宽度的 1%遇到大屏（如 2K/4K 屏幕）时，不加限制元素会变得无限巨大。

clamp(): 自适应布局 （最小值，视口宽度，最大值） （单位：px）
- 例如：font-size: clamp(10px, 5vw, 50px);

当视口宽度小于 5vw 时，元素值最小为 10px；当视口宽度大于 5vw 且小于 50vw 时，元素值为视口宽度的 5%；当视口宽度大于 50vw 时，元素值为 50px。

老写法：
```css
/* 老写法：一堆断点，代码臃肿，字号变化是“阶梯式”跳跃的 */
.title { font-size: 16px; }
@media (min-width: 768px) { .title { font-size: 24px; } }
@media (min-width: 1200px) { .title { font-size: 40px; } }
```

clamp() 就是一个 CSS 原生的安全边界锁。

现在最新使用都是 postcss.config.js 配置文件，通过 postcss-px-to-viewport 插件，将 px 转换为 vw。 结合：在全局或核心容器上通过 max-width 或 clamp() 把最大最小宽度死锁，防止移动端页面在 PC 浏览器或大屏 Pad 上无限变大导致视觉灾难。

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
      minPixelValue: 1,
      mediaQuery: false,
    },
  },
}
```
