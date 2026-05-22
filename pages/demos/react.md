# react

对两大主流框架底层范式的深刻理解：Vue 的本质是响应式依赖追踪（代理模式），而 React 的本质是不可变数据的全量重新渲染（函数式编程）。

## 底层差异对比：
Vue 3 (基于 Proxy 的双向/单向绑定)： 当状态改变时，响应式系统能精确知道哪个组件的哪个属性变了。它的更新粒度是组件级别的，不需要复杂的 Fiber 架构，也能保持极高的性能。

React (纯函数式，基于不可变数据)：
React 的状态改变（如 setState），会触发整个组件函数从头到尾重新执行一遍。由于每次都全量重新执行，如果不做底层优化，页面必然卡死。为了解决这个问题，React 才演进出了大名鼎鼎的 Fiber 架构。

## 核心架构：Fiber 架构与并发模式（Concurrent Mode）
这是 React 最硬核的底层。“为什么 React 要搞 Fiber？它解决了什么痛点？”

1. 历史痛点：Stack Reconciler 导致的卡顿
在 React 16 之前，React 采用的是传统的树状递归动态比对（Stack Reconciler）。

致命缺陷： 它是同步且不可中断的。如果页面非常庞大，虚拟 DOM 树有几千个节点，React 递归比对这棵树需要消耗 50ms。

在这 50ms 内，主线程被 React 完全独占，浏览器的每一帧刷新（16.7ms）无法执行，用户的点击事件、输入框、动画全部死锁，产生肉眼可见的卡顿（掉帧）。

2. Fiber 的破局：可中断的异步时间分片（Time Slicing）
Fiber 的本质，是把原本“一气呵成”的巨大比对任务，拆分成了无数个微小的“时间片”。

链表化（解耦递归）： React 将过去树状结构的虚拟 DOM，重构成了一个单向链表结构（Fiber Tree）。每个 Fiber 节点都有 child（指向第一个子节点）、sibling（指向下一个兄弟节点）和 return（指向父节点）。由于变成了链表，React 可以随时记录当前执行到了哪一个节点。

时间分片（Time Slicing）： 在并发模式下，React 会利用浏览器空闲时间（底层的 Scheduler 调度器，模拟了类似 requestIdleCallback 的机制）。

React 每次只执行一个 Fiber 节点的比对（大约几微秒）。

执行完后，它会看一下表：“这帧的 16.7ms 用完了吗？浏览器有没有紧急的点击或输入事件？”

如果有，React 就会立刻暂停（Yield）打包计算，把主线程还给浏览器去响应用户。等浏览器忙完了，React 再通过刚才链表记录的指针，恢复（Resume）之前的比对工作。

## 底层运行闭环：双缓存机制（Double Buffering）
“React 在异步可中断的编译过程中，如果界面改了一半被暂停了，用户看到的页面不就乱套了吗？”

React 采用了和显卡图形渲染极其类似的 双缓存（Double Buffering）技术：

在内存中，同时存在两棵 Fiber 树：

current 树：代表当前正在屏幕上显示的真实 UI 结构。

workInProgress 树：代表当前正在内存中异步构建、比对的新虚拟 DOM 树。

所有的暂停、恢复、Diff 计算，全都是在内存里的 workInProgress 树上悄悄进行的（对用户完全无感）。

只有当这棵树全部比对完毕（进入 Commit 阶段）时，React 才会一气呵成地执行 DOM 变更，然后把指针指向新树：root.current = workInProgress。

## Hooks 的底层原理：为什么不能写在 if 或循环里？
这是 React Hooks 最经典的边缘 Case 题。“为什么 React 官方规定 useState 和 useEffect 必须写在组件顶层，绝对不能写在条件判断里？”

1. 底层实现：状态的单向链表
在 React 内部，一个组件函数被重新执行时，它怎么知道第 1 次调用 useState 返回的是 count，第 2 次返回的是 name？

React 并没有为每个 Hook 命名，它是靠调用顺序来识别的。

每个组件的 Fiber 节点上，挂载着一个名为 memoizedState 的单向链表。

当你写下：

JavaScript
const [count, setCount] = useState(0); // 节点 1
const [name, setName] = useState('clx'); // 节点 2
在底层链表里就是：CountState (Node 1) ──> NameState (Node 2)。

2. 崩溃原因：顺序错乱
如果在第二次渲染时，你把第一个 useState 塞进了 if(false) 里导致它没有执行。

React 的链表指针依然会按顺序往下走。它会错误地把原本属于 count 的节点 1 的状态，赋给了 name。

这会导致整条链表上的状态全部错位，数据完全发生脏读。因此，React 必须强行约束 Hooks 的调用顺序。

## React 19 的最新演进

- React Server Components (RSC - 服务端组件)： * 允许组件直接在 Node.js 服务端运行并读取数据库，只把纯粹的静态 HTML 或流式数据（Stream）传给前端。这与你熟悉的 BFF（NestJS）理念高度契合，都是为了把计算和数据聚合收拢在内网，最大化减轻前端的网络传输负担。

- React Compiler (React 19 核心革命)：
    - 过去 React 程序员最头疼的是要手动写 useMemo、useCallback 和 React.memo 来防止组件无脑重复渲染，写得极其痛苦且心智负担重。
    - React 19 引入了 React Compiler（内部代号 Forget）。这是一个底层的静态编译优化器（类似于 Vue 3 的编译时靶向更新）。它在编译期通过 AST 分析，自动识别哪些代码依赖没有变，并自动注入缓存逻辑，彻底解放了开发者手动做性能优化的心智负担。

## 面试高分防御话术实例
 “我看你的简历上主要以 Vue 和全栈基建为主，你能谈谈你对 React 架构的理解吗？”

满分自述： > “虽然我的商业项目核心栈是 Vue 3，但我对 React 的底层演进一直保持着深度研究。在我看来，这两个框架是站在了‘响应式派发’和‘函数式不可变’的两个极端。

React 的全量重新渲染特性决定了它必须在底层做极致的性能防护。这就是它为什么推翻重构 Fiber 架构的原因——通过将虚拟 DOM 树链表化，配合时间分片（Time Slicing）和双缓存机制，把不可中断的同步 Diff 变成了可暂停、可恢复的异步并发调度，从底层根除了主线程被大计算量独占导致的卡顿痛点。

同时，理解 React 比如 Hooks 的单向链表存储机制，也对我们在 Vue 3 中编写高效的 Composable（组合式函数）大有裨益。我认为到了框架演进的深水区，两者的边界正在融合，比如 React 19 推出的 React Compiler，本质上也是通过底层 AST 编译手段来达成 Vue 早就实现的自动按需更新。理解这些底层的异曲同工，能让我作为全栈或负责人时，在做团队技术选型和基建治理上拥有更开阔的视野。”
