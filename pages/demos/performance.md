# 性能优化

## 编译阶段优化（工程构建层）
1. 依赖深度瘦身
别名替换 ： 检查 package.json。使用 date-fns 或 Day.js 彻底替换体积巨大的 Moment.js（Moment 带有大量本地化语言包，且不支持 Tree Shaking）。

外链 CDN (Externals)： 将不常变动的巨型库（如 vue、vue-router、echarts）配置为 externals，不打包进最终的 Bundle 中，而是通过 HTML 的 `<script>` 标签走 CDN 加载。

2. 现代编译器替代
转译/压缩切换： 在构建管线中，用基于 Go 语言的 ESBuild 或基于 Rust 的 SWC 替代传统的 Babel 和 Terser 进行代码压缩与转译，编译速度可提升 10~100 倍。

静态多线程： 如果使用 Webpack，引入 thread-loader 开启多进程打包；如果是 Vite，利用其基于 Rollup 的底层特性，确保预构建（Pre-bundling）充分发挥多核 CPU 性能。

3. 图像预处理与雪碧图
自动化图片压缩： 引入 vite-plugin-imagemin 或 image-minimizer-webpack-plugin，在编译时无损/有损压缩 png/jpg，并自动生成下一代 Web 格式 webp 或 avif。

SVG Sprite： 将项目内零散的 SVG 图标在编译阶段合并为一张 SVG 雪碧图，通过 `<use xlink:href="#id">` 调用

## 编译后优化（网络、传输与首屏交付）
1. 协议与连接层
全量拥抱 HTTP/2 / HTTP/3： * HTTP/2： 开启多路复用（Multiplexing），突破老旧 HTTP/1.1 同域名下 6 个并发连接的限制，不再惧自研组件拆包过多。

HTTP/3 (QUIC)： 基于 UDP，解决 HTTP/2 的 TCP 队头阻塞问题，在移动端弱网环境下抗丢包能力极强。

预解析与预连接 ： 在 HTML 头部注入标准提示符，利用浏览器空闲带宽：
```html
<link rel="dns-prefetch" href="//api.yourdomain.com">
<link rel="preconnect" href="https://cdn.yourdomain.com" crossorigin>
<link rel="preload" href="/assets/main.js" as="script">
<link rel="prefetch" href="/assets/future-page.js">
```

多域名预解析 / 预连接（常见于 CDN、埋点、监控、地图、支付等第三方）：
```html
<link rel="dns-prefetch" href="//cdn.yourdomain.com">
<link rel="dns-prefetch" href="//static.yourdomain.com">
<link rel="dns-prefetch" href="//api.yourdomain.com">
<link rel="dns-prefetch" href="//sentry.yourdomain.com">

<link rel="preconnect" href="https://cdn.yourdomain.com" crossorigin>
<link rel="preconnect" href="https://api.yourdomain.com" crossorigin>
```

连接提示符速查：
| 能力 | 适用场景 | 注意点 |
| --- | --- | --- |
| dns-prefetch | 只提前做 DNS 解析，成本低 | 适合“可能会用到”的域名；对跨域资源同样有效 |
| preconnect | 提前完成 DNS/TCP/TLS（更激进） | 只对“首屏必用”的关键域名使用；过多会抢占连接资源 |
| preload | 把资源当成高优先级提前拉取 | 需要正确的 as；否则可能被重复下载或优先级不如预期 |
| prefetch | 浏览器空闲时为“未来可能用到”的资源预取 | 适合下一跳路由/次屏资源，不要用于首屏关键资源 |

Script / Link 加载策略（首屏渲染与依赖顺序）：
```html
<script src="/assets/vendor.js" defer></script>
<script src="/assets/main.js" defer></script>

<script src="https://third-party.example.com/sdk.js" async></script>

<script type="module" src="/assets/app.mjs"></script>
<link rel="modulepreload" href="/assets/chunk-a.mjs">
```

要点：
- defer：并行下载，按文档顺序执行，等 DOM 解析完成后再执行；适合绝大多数主业务脚本
- async：并行下载，下载完立刻执行，顺序不可控；适合统计/埋点/不依赖 DOM 与主逻辑的第三方脚本
- modulepreload：为 ESM 依赖图提前拉取依赖 chunk，减少模块瀑布
- link（CSS）：CSS 默认会阻塞渲染；首屏关键 CSS 尽量小而内聚，非关键 CSS 再拆分与延后加载

2. 首屏极速交付策略
SSR / SSG / ISR： 对于面向 SEO 或极度追求首屏的项目，采用服务端渲染（SSR）或静态站点生成（SSG），让浏览器直接接收直出 HTML，将首屏不卡顿的 FCP（首次内容绘制）时间压低到毫秒级。

骨架屏注入： 在编译时直接将骨架屏的 CSS/HTML 内联写入 index.html 的 #app 根节点内。在真实的 JS 还没有加载、全栈接口还没返回前，给用户完美的视觉预期。

##  运行时优化（V8 引擎、内存与渲染层）
1. 虚拟滚动与时间分片
- 虚拟滚动： 当后端接口一次性返回 10 万条列表数据时，坚决不全量渲染 DOM。只渲染可视区域内的 20 条 DOM 节点，滚动时动态复用并替换数据，保持 DOM 节点树维持在极轻量状态。
- 时间分片： 如果必须执行高密度的 CPU 计算（如处理 5 万条数据的统计分析），使用 requestIdleCallback。将一个长任务拆解成多个 50ms 内的子任务，利用浏览器每帧渲染剩余的空闲时间去跑，防止主线程死锁卡顿。
2. 内存泄漏与垃圾回收深度治理 (Memory & GC)
- 弱引用管理 (WeakMap / WeakSet)： 当你需要为一个 DOM 节点或者临时对象建立缓存或关联映射时，使用 WeakMap。一旦该 DOM 节点被从 DOM 树中移除，WeakMap 里的引用会自动断开，允许 V8 的垃圾回收器直接将其回收，绝不留存。
- 防范闭包逃逸： 严禁在长生命周期的全局事件（如 window.resize）中引用大体积的局部变量，确保闭包上下文在使用完毕后能够及时被 GC 回收。

## 全套事件方案与交互优化
1. 高频事件防御：防抖 (Debounce) 与 节流 (Throttle)防抖 (Debounce)：
2. 现代动效引擎：requestAnimationFrame 节流 (rAF Throttle)
当节流用于控制 视觉动效/滚动渐变 时，传统的自定义时间戳（如 16ms）并不完美。

高级方案： 直接使用 requestAnimationFrame 作为节流阀。

```js
let ticking = false
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      // 🚀 完美的视觉写入操作：只在浏览器刷新前夕执行，彻底告别掉帧
      updateScrollPosition()
      ticking = false
    })
    ticking = true
  }
})
```
3. 事件委托: 利用 事件冒泡（Event Bubbling） 机制，通过 e.target 事件源，内存开销从 O(N) 变为为 O(1)
4. 滚动性能解耦
    - 底层痛点： 移动端在滑动屏幕（touchstart / touchmove）时，浏览器在滚动前必须等待你的事件回调函数执行完毕，以确认你有没有调用 e.preventDefault() 来阻止滚动。这会导致手势滑动的显著延迟感。
    - 破局： 如果你的事件里不需要阻止滚动，绑定时明确传参 { passive: true }，浏览器会立即执行事件回调函数，而不会等待滚动完成。
```js
window.addEventListener('touchmove', handleTouchMove, { passive: true })
```
