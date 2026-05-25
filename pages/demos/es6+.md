# es6+ 新增特性

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
