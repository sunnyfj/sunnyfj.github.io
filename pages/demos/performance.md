# 前端性能优化体系（整合版）

把性能优化当成一条“交付链路”来做：测量 → 定位 → 治理 → 守住（预算/监控）。

## 1. 先记住这 12 条（看完能复述）

- LCP 慢：先查“TTFB / 资源加载 / 主线程阻塞”三件事，别一上来就改代码细节
- CLS 高：80% 是图片/字体/异步内容插入导致，先把尺寸和占位做正确
- INP 差：本质是主线程忙（长任务/频繁布局/大量渲染），要么切片要么搬去 Worker
- TTFB 高：大概率在 CDN、缓存策略、服务端计算或上游依赖（数据库/网关）
- 首屏只保留“关键资源”：关键 CSS、首屏 JS、首屏图片（LCP 候选）
- 静态资源必须 hash + 长缓存；HTML 必须可更新（no-cache/协商）
- HTTP/2 是基本盘；连接提示符只给“首屏必用域名”，别滥用 preconnect
- Script 默认 defer；第三方 SDK 才 async；ESM 配合 modulepreload 防瀑布
- 减包优先级：删依赖 > 拆包 > 只加载必要代码 > 压缩/转译提速
- 渲染优先级：避免布局抖动（读写分离），能走合成层就走（transform/opacity）
- 大数据渲染：虚拟滚动是首选；其次分页；再考虑 Worker/OffscreenCanvas
- 最终要“守住”：性能预算 + 监控告警 + 回归验证，才算闭环

## 2. 核心指标（Web Vitals）与定位方向

| 指标 | 关注点 | 常见根因（按优先排查） |
| --- | --- | --- |
| TTFB | 服务端与网络响应 | CDN/缓存命中率 → 服务端耗时 → 上游依赖 |
| FCP | “有内容出现” | 关键 CSS 阻塞 → JS 阻塞渲染 → 资源排队 |
| LCP | “首屏主体出现” | LCP 资源加载（图片/字体/JS）→ 主线程长任务 → TTFB |
| CLS | “页面抖不抖” | 图片/广告/异步组件未占位 → 字体替换 → 动态插入 |
| INP | “交互响应” | 长任务 → 频繁重排/重绘 → 事件回调过重 → 大量 DOM 更新 |

定位工具建议：

- Lighthouse：看整体评分与机会点（作为入口）
- Chrome Performance：看主线程长任务、Layout Thrashing、渲染分解
- Coverage：看无用代码与过大依赖
- RUM（真实用户）：看 P75 的 LCP/INP/CLS 与分端（机型/网络）差异

## 3. 按“交付链路”做治理（不碎版）

### 3.1 网络与连接（把 TTFB 与资源排队打下来）

- 协议与压缩：HTTP/2 为主，条件允许上 HTTP/3；压缩优先 Brotli（br）
- CDN：JS/CSS/图片/字体尽量 CDN 边缘缓存，减少跨地域抖动
- 连接提示符（只给关键域名）：

```html
<link rel="dns-prefetch" href="//api.xxx.com">
<link rel="preconnect" href="https://cdn.xxx.com" crossorigin>
```

连接提示符速查：
| 能力 | 适用场景 | 注意点 |
| --- | --- | --- |
| dns-prefetch | 可能会用到的域名 | 成本低，可多用，但别无脑堆 |
| preconnect | 首屏必用的关键域名 | 过多会抢连接资源；只给 1-3 个关键域名 |
| preload | 当前页面立刻需要 | as 填错会导致重复下载/优先级异常 |
| prefetch | 下一跳/次屏资源 | 不要用于首屏关键资源 |

### 3.2 缓存（让第二次打开更快、并降低 TTFB 抖动）

- 静态资源（带 hash 的 JS/CSS/图片）：`Cache-Control: max-age=31536000, immutable`
- HTML（入口文档）：`Cache-Control: no-cache`（保证能更新到最新 hash）
- 协商缓存：ETag / Last-Modified（适合不方便上 hash 的资源）
- CDN：边缘缓存 + 回源策略要稳定，避免 TTFB 抖动

可选增强：

- Service Worker：离线与回源策略（需要处理版本升级、灰度与回滚）

### 3.3 首屏交付（把“关键资源”交付对）

目标：首屏只加载必要内容，把非关键资源推迟到用户可见/可交互后。

- Script：主业务脚本默认 defer；第三方独立脚本用 async；ESM 用 modulepreload 防瀑布

```html
<script src="/assets/vendor.js" defer></script>
<script src="/assets/main.js" defer></script>

<script src="https://third-party.example.com/sdk.js" async></script>

<script type="module" src="/assets/app.mjs"></script>
<link rel="modulepreload" href="/assets/chunk-a.mjs">
```

- CSS：CSS 默认阻塞渲染，首屏关键 CSS 要小而内聚；非关键 CSS 再拆分延后
- 字体：`font-display: swap`，尽量子集化；首屏关键字体可 preload（注意 crossorigin）
- 图片：首屏 LCP 图片优先级最高，其他图片懒加载

```html
<img loading="lazy" src="a.jpg">
```

### 3.4 构建与包体（先“少发”再“快发”）

优先级顺序：

1) 删依赖/替换重依赖（比如替换大而全的日期库）
2) Tree Shaking（ESM）
3) Code Splitting（路由/业务/权限/设备）
4) 压缩与转译提速（SWC/ESBuild）
5) 图片与 SVG 编译优化（WebP/AVIF、雪碧图）

路由懒加载：

```js
const User = () => import('./User.vue')
```

### 3.5 渲染与交互（减少卡顿与抖动）

浏览器渲染流水线：

```txt
JS → Style → Layout → Paint → Composite
```

关键结论：

- 只改 transform/opacity 通常走合成层（更稳）
- Layout Thrashing 的本质是“读写交替”触发强制同步布局

错误示例：

```js
div.style.width = '100px'
console.log(div.offsetWidth)
```

治理手段（从强到弱）：

- 读写分离（先读后写）
- 批量写入放到 requestAnimationFrame

```js
requestAnimationFrame(() => {
  update()
})
```

- 高频事件用 rAF 节流 + passive

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

```js
window.addEventListener('touchmove', handle, { passive: true })
```

### 3.6 JS 执行与并发（把主线程从长任务里救出来）

- Long Task：单次超过 50ms 就会明显影响 INP
- 时间分片：把大任务拆成多个小任务（setTimeout/MessageChannel/requestIdleCallback）

```js
requestIdleCallback(() => {
  heavyTask()
})
```

- Web Worker：CPU 密集型任务不要放主线程（Excel/Markdown AST/大计算/图像处理）
- OffscreenCanvas：Canvas 渲染搬到 Worker

### 3.7 内存与稳定性（少泄漏、少抖动）

常见泄漏来源：
| 类型 | 典型原因 |
| --- | --- |
| 定时器 | setInterval 未清理 |
| 全局事件 | add 了没 remove |
| 闭包 | 大对象逃逸 |
| DOM 引用 | 节点移除但仍持有引用 |
| 缓存 | Map/数组无限增长 |

WeakMap / WeakSet：弱引用不阻止 GC，适合做 DOM 级缓存与关联映射。

## 4. 监控与治理（让性能不回退）

### 4.1 性能预算（Performance Budget）

- Web Vitals：LCP / INP / CLS 以 P75 达标
- Bundle：首屏 JS 总体积、关键路由 chunk 体积上限
- 长任务：Long Task 次数与总阻塞时长上限
- 告警闭环：超预算自动告警 + 责任人 + 回滚/降级策略

### 4.2 常用平台与工具

- 评分与诊断：Lighthouse、WebPageTest
- 分析与定位：Chrome Performance、Memory、Coverage
- 线上治理：RUM（真实用户监控）、Sentry/ARMS/Fundebug
