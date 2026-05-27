# 前端性能优化体系

# 一、性能优化核心指标（Web Vitals）

| 指标   | 全称                        | 含义     | 重点         |
| ---- | ------------------------- | ------ | ---------- |
| FCP  | First Contentful Paint    | 首次内容绘制 | 页面是否快速出现内容 |
| LCP  | Largest Contentful Paint  | 最大内容绘制 | 首屏主体是否快速展示 |
| CLS  | Cumulative Layout Shift   | 累积布局偏移 | 页面是否抖动     |
| INP  | Interaction to Next Paint | 交互响应延迟 | 点击是否流畅     |
| TTFB | Time To First Byte        | 首字节时间  | 服务端响应速度    |

# 二、性能优化体系分层

完整体系：

```txt
1. 网络层优化
2. 构建层优化
3. 加载层优化
4. 渲染层优化
5. JS 执行层优化
6. 内存层优化
7. 框架层优化
8. 数据层优化
9. 监控治理体系
```

# 三、网络层优化（Network）

# 1. HTTP/2 与 HTTP/3

## HTTP/1.1 问题

浏览器同域连接限制：通常最多 6 个 TCP 连接

导致：队头阻塞

## HTTP/2

核心特性：Multiplexing（多路复用）

多个请求共享一个 TCP 连接。

### 优势

* Header 压缩
* 多路复用
* 并发能力提升

## HTTP/3

核心：QUIC + UDP

解决：TCP 队头阻塞

# 2. CDN

## 边缘缓存

适合：

* JS
* CSS
* 图片
* 字体

# 3. Gzip 与 Brotli

现代 Web 推荐：Brotli（br）

压缩率：br > gzip > deflate

# 4. DNS 预解析与预连接

## dns-prefetch

仅提前做 DNS 查询。

```html
<link rel="dns-prefetch" href="//api.xxx.com">
```

适合：未来可能会访问的域名

## preconnect

提前完成：DNS + TCP + TLS

```html
<link rel="preconnect" href="https://cdn.xxx.com" crossorigin>
```

适合：首屏关键资源域名

# 5. preload 与 prefetch

## preload

当前页面立即需要 高优先级加载。

```html
<link rel="preload" href="/main.js" as="script">
```

## prefetch

未来页面可能需要 浏览器空闲时下载。

```html
<link rel="prefetch" href="/future.js">
```

# 6. Script 加载策略

## defer

```html
<script defer src="/main.js"></script>
```

特点：

* 并行下载
* DOM 解析完成后执行
* 保持执行顺序

适合主业务脚本。

## async

```html
<script async src="/sdk.js"></script>
```

特点：

* 下载完成立即执行
* 顺序不可控

适合：

* 埋点
* 广告
* 第三方 SDK

---

## modulepreload

ESM 预加载依赖。

```html
<link rel="modulepreload" href="/chunk-a.mjs">
```

减少模块瀑布。

# 四、构建层优化（Build）

# 1. Tree Shaking

核心：删除未使用代码

依赖：ESM 静态分析

# 2. Scope Hoisting

Webpack：

```txt
ModuleConcatenationPlugin
```

作用：

减少作用域包装
减少闭包开销

# 3. Code Splitting

不仅仅是“拆包”。

高级策略：按路由拆分、按业务拆分、按权限拆分、按设备拆分

## 路由懒加载

```js
const User = () => import('./User.vue')
```

# 4. Vendor Chunk 拆分

避免：一个巨大 vendor.js

推荐：react-vendor、 chart-vendor、 editor-vendor 做细粒度缓存。

# 5. 编译器替换

传统：Babel + Terser

现代：SWC（Rust）ESBuild（Go）

# 6. 图片编译优化

## 自动压缩

工具：

* vite-plugin-imagemin
* image-minimizer-webpack-plugin

## WebP / AVIF 转换

现代图片格式：

```txt
AVIF > WebP > JPG/PNG
```

# 7. SVG Sprite

将 SVG 合并为雪碧图：

```html
<use xlink:href="#icon-user"></use>
```

减少请求数。

# 五、加载层优化（Loading）

# 1. CSR / SSR / SSG / ISR

| 模式  | 特点         |
| --- | ---------- |
| CSR | 首屏慢，交互快    |
| SSR | 首屏快，服务端压力大 |
| SSG | 极致静态化      |
| ISR | 增量静态生成     |

# 2. Streaming SSR

传统 SSR：等待 HTML 全部生成

Streaming SSR：边生成边返回

React 18：renderToPipeableStream

# 3. Islands Architecture（岛屿架构）

核心思想：静态优先、局部 Hydration

代表：Astro

# 4. 骨架屏

核心：提前给用户视觉反馈

通常：直接内联到 index.html、避免白屏。

# 六、浏览器渲染机制（重点）

# 浏览器渲染流水线

```txt
JS
↓
Style
↓
Layout
↓
Paint
↓
Composite
```

---

# 1. Layout（重排）

触发：几何属性变化

例如：

* width
* height
* margin
* padding

# 2. Paint（重绘）

触发：外观变化

例如：

* color
* background

# 3. Composite（合成）

只发生图层合成。

例如：transform opacity

# 七、Layout Thrashing（布局抖动）

核心问题：读写交替

错误示例：

```js
div.style.width = '100px'
console.log(div.offsetWidth)
```

浏览器：强制同步布局，导致频繁 reflow。

# 优化方案

## 读写分离

先读，后写

## requestAnimationFrame

```js
requestAnimationFrame(() => {
  update()
})
```

在浏览器下一帧执行。

## FastDOM

统一管理：DOM Read、DOM Write

# 八、合成层优化（GPU）

# 1. transform 与 opacity

不会触发 Layout。因为：直接 GPU 合成

# 2. will-change

```css
will-change: transform;
```

告诉浏览器：该元素即将变化

## 注意

不要滥用。因为：会增加 GPU 内存消耗

# 3. CSS Containment

```css
contain: layout paint;
```

作用：隔离布局影响范围，减少重排扩散。

# 九、JS 执行层优化

# 1. Long Task（长任务）

超过：50ms，会阻塞主线程。

# 2. 时间分片

拆分长任务：

* setTimeout
* MessageChannel
* requestIdleCallback
* scheduler

# 3. requestIdleCallback

浏览器空闲时执行：

```js
requestIdleCallback(() => {
  heavyTask()
})
```

适合：低优先级任务

# 4. Web Worker

CPU 密集型任务：不要放主线程

适合：

* Excel 解析
* Markdown AST
* 大数据计算
* 图像处理

# 5. OffscreenCanvas

Canvas 放 Worker 执行。避免主线程卡死。

# 十、内存优化（Memory）

# 1. V8 垃圾回收

## 新生代 Scavenge

## 老生代 Mark-Sweep

# 2. 常见内存泄漏

| 类型     | 示例              |
| ------ | --------------- |
| 定时器    | setInterval 未清理 |
| 全局事件   | resize 未 remove |
| 闭包     | 大对象逃逸           |
| DOM 引用 | 节点已删除但仍被引用      |
| 缓存     | Map 无限增长        |

# 3. WeakMap / WeakSet

特点：弱引用不会阻止 GC

适合：DOM 缓存

# 十一、事件与交互优化

# 1. 防抖（Debounce）

核心：最后一次执行

适合：

* 搜索框
* resize

# 2. 节流（Throttle）

核心：固定时间执行一次

适合：

* scroll
* mousemove

# 3. rAF 节流（高级）

```js
let ticking = false

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      update()
      ticking = false
    })

    ticking = true
  }
})
```

优势：与浏览器刷新频率同步

# 4. passive 事件

```js
window.addEventListener(
  'touchmove',
  handle,
  { passive: true }
)
```

作用：避免浏览器等待 preventDefault。提升滚动流畅度。

# 5. 事件委托

利用：事件冒泡O(N) -> O(1)

# 十二、大数据渲染优化

# 1. 虚拟滚动

核心：DOM 数量恒定，不是：数据量恒定。

# 2. 分页 vs 虚拟列表

| 方案   | 优点   | 缺点     |
| ---- | ---- | ------ |
| 分页   | 简单   | 用户体验一般 |
| 虚拟列表 | 极致流畅 | 实现复杂   |

# 十三、框架层优化

# Vue3 优化

## Block Tree

动态节点打 PatchFlag。

减少 Diff。

## 静态提升

静态节点：只创建一次

## PatchFlag

编译阶段标记：哪些节点需要更新

# React Fiber

核心：可中断渲染

同步递归：改造成链表调度

# 十四、图片优化

# 1. 响应式图片

```html
<picture>
  <source srcset="a.avif" type="image/avif">
  <source srcset="a.webp" type="image/webp">
  <img src="a.jpg">
</picture>
```

# 2. 图片懒加载

```html
<img loading="lazy">
```

# 3. Base64

适合：小图标，避免额外请求。

# 十五、性能监控与治理

# 1. Lighthouse

分析：

* FCP
* LCP
* CLS
* TTI

# 2. Chrome Performance

分析：

* Long Task
* Layout
* Paint
* JS 执行

# 3. Performance API

```js
performance.now()
performance.mark()
performance.measure()
```

# 4. PerformanceObserver

监控：Long Task

# 5. RUM（真实用户监控）

采集：

* 白屏
* 崩溃率
* Web Vitals
* 请求耗时

# 6. 常见监控平台

* Sentry
* ARMS
* Fundebug

# 十六、移动端专项优化

# 1. 300ms 点击延迟

现代浏览器已大幅改善。

# 2. GPU 加速

```css
transform: translateZ(0);
```

触发合成层。

# 3. passive 滚动优化

移动端核心优化点。

# 十七、性能优化排查思路（高级）

真正高级回答：先定位瓶颈层级，再做针对性治理

常见排查：

```txt
网络层
↓
Bundle 体积
↓
主线程阻塞
↓
Layout Thrashing
↓
长任务
↓
内存泄漏
```

# 十八、性能分析工具

| 工具                 | 用途        |
| ------------------ | --------- |
| Lighthouse         | 综合性能评分    |
| Chrome Performance | 渲染与 JS 分析 |
| WebPageTest        | 网络性能      |
| Memory 面板          | 内存泄漏      |
| Coverage           | 检查无用代码    |
