# SSO

## Session 模式（有状态）

- 登录后：服务端生成 `sessionId`，并保存 `sessionId -> 用户信息/权限`（内存或 Redis）
- 客户端：只保存 `sessionId`（通常通过 Cookie）
- 每次请求：客户端带上 `sessionId`，服务端根据 `sessionId` 查询 Session 并鉴权

特点：

- 优点：可控性强，易做“强制下线/踢人/权限即时生效”
- 缺点：服务端要保存状态，分布式场景需要 Session 共享（如 Redis），水平扩展成本更高

## JWT 模式（无状态）

- JWT 把身份信息（或关键 claims）放在 Token 里，客户端每次请求主动携带
- 服务端通常只做：验签 + 校验过期时间 + 校验必要字段

特点：

- 优点：无状态，更适合微服务 / 分布式 / 网关统一鉴权；避免频繁查 Session（性能更稳）
- 缺点：服务端不保存登录态，Token 在过期前“天然有效”，退出登录/权限收回需要额外方案

Token 结构（概念）：

- `header.payload.signature`
- `signature = HMACSHA256(base64(header) + "." + base64(payload), secret)`（示例）

## 两种模式对比（前端视角）

前端职责基本一致：**存储登录态** + **请求时携带**（Cookie 或 Authorization Header）。

真正差异在服务端：

| 维度 | Session | JWT |
| --- | --- | --- |
| 鉴权形态 | 有状态 | 无状态 |
| 服务端依赖 | 需要 Session 存储（内存/Redis） | 主要验签与过期校验 |
| 扩展性 | 需要共享 Session | 天然适配水平扩展 |
| 下线/权限收回 | 更容易即时生效 | 需要额外机制（如黑名单/短 Token） |

## 生产常见：JWT + Redis + Refresh Token（混合方案）

生产环境通常不会采用“纯 JWT”，而是用 **JWT + Redis + Refresh Token** 形成“无状态鉴权 + 有状态控制”的混合体系：

- **Access Token（JWT，短时效）**：用于高频接口鉴权，网关可本地验签与过期校验，减少 Redis/DB 访问，适合微服务与水平扩展
- **Refresh Token（长时效）**：作为“可控层”，用于续期与主动失效；常存 Redis/DB，并绑定用户、设备、登录状态与过期时间
- **刷新流程**：Access Token 过期 → 客户端携带 Refresh Token 调用刷新接口 → 服务端校验 Refresh Token → 签发新的 Access Token（可选同时轮换 Refresh Token）
- **常见增强**：Refresh Token 轮换、JWT 黑名单、`token_version`、多端登录控制、风控策略

结论：JWT 负责高性能鉴权，Redis/DB 负责登录态与安全控制，兼顾性能与可控性。

## Access Token 过期（401）时的并发处理：单飞刷新 + 请求队列

生产环境下不建议“每个 401 都单独刷新”，并发场景会导致重复刷新、Refresh Token 轮换冲突、请求丢失与无限重试。

推荐做法：**单飞刷新 + 请求队列**。

- 第一个 401 触发 refresh，并设置 `isRefreshing = true`
- 后续 401 不再触发 refresh，而是进入等待队列
- refresh 成功后统一更新 Access Token，并对队列请求做重放（Request Replay）
- refresh 失败（Refresh Token 失效）则清理登录态并跳转登录页

## 生产级 Axios 拦截器闭环代码

```ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建实例
const instance = axios.create({ baseURL: '/api' })

let isRefreshing = false
// 队列中保存的是一个函数，接收新的 token，并 resolve 旧的 Promise
let refreshQueue: Array<(token: string) => void> = []

// 1. 请求拦截器：自动注入内存/sessionStorage中的 AccessToken
instance.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 2. 响应拦截器：处理 401 并发无感刷新
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const { config, response } = error
    // 如果不是 401，或者该请求已经重试过，则直接抛出错误
    if (!response || response.status !== 401 || config._retry) {
      return Promise.reject(error)
    }

    // 如果当前正在刷新 Token
    if (isRefreshing) {
      return new Promise((resolve) => {
        // 将原请求的 resolve 挂起，放入队列，等待刷新成功后触发
        refreshQueue.push((newToken: string) => {
          config.headers.Authorization = `Bearer ${newToken}`
          config._retry = true // 标记该请求已重试，防止死循环
          resolve(instance(config)) // 重新发起请求
        })
      })
    }

    // 第一个踩到 401 的请求，开启锁并触发刷新
    isRefreshing = true
    config._retry = true

    try {
      // 发起刷新请求，由于 RefreshToken 存在 HttpOnly Cookie 中，浏览器会自动携带
      const res = await axios.post('/api/auth/refresh')
      const { accessToken } = res.data

      // 更新客户端本地存储
      window.sessionStorage.setItem('access_token', accessToken)

      // 核心：释放队列，消费所有挂起的请求
      refreshQueue.forEach(cb => cb(accessToken))
      refreshQueue = []

      // 重放当前第一个触发刷新的请求
      config.headers.Authorization = `Bearer ${accessToken}`
      return instance(config)
    }
    catch (refreshError) {
      // RefreshToken 也过期了，或者被吊销了（并发竞争失败）
      refreshQueue = []
      // 触发登出：清空本地状态，跳转 SSO 登录页
      window.sessionStorage.removeItem('access_token')
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.href)}`
      return Promise.reject(refreshError)
    }
    finally {
      isRefreshing = false
    }
  }
)
```

## 单点登录实现

核心架构原则：授权码流 + 同源网关代理

在 2026 年现代浏览器全面禁用第三方 Cookie（Cross-site/Third-party Cookie）的背景下，传统跨域双 Token 刷新链路已瘫痪。标准生产解法为：OIDC 授权码安全中转 + BFF/网关反向代理落地同源 Cookie。

### 流程：

```txt
[浏览器]
   │
   │ 1. 携带 Code 请求同源接口: /api/auth/token (带上第一方 Cookie)
   ▼
[Nginx / BFF 网关 (crm.xxx.com)]
   │
   │ 2. Server-to-Server 凭证交换 (携带 ClientSecret + Code)
   ▼
[SSO 认证中心 (auth.xxx.com)]
```

### 第一部分：全链路核心步骤笔记
阶段一：登录与传输安全（Code 授权码）
- 拦截跳转：主应用（crm.xxx.com）检测到无 Token，重定向至认证中心：
https://auth.xxx.com/login?redirect_uri=https://crm.xxx.com/callback
- 中心记账：用户在 auth.xxx.com 登录成功，SSO 中心本地写入 sso_session（HttpOnly Cookie），用于后续跨系统静默登录。
- 高时效闪回：SSO 中心生成一次性、短寿命（通常 1 分钟）的授权码 Code，重定向回业务系统：
https://crm.xxx.com/callback?code=L9x2pQ7zW...
- 核心防线：绝对不在浏览器 URL 中暴露长期合法的 AccessToken，仅暴露单次失效的 Code。

阶段二：换取 Token 与同源落地（网关代理）
- 同源收拢请求：子系统前端拦截 URL 中的 Code，向同源网关发起异步请求：POST https://crm.xxx.com/api/auth/token（携带 code）
- 后端凭证交换：网关在后台通过 Server-to-Server（服务器间） 通信，携带子系统 ClientSecret 和 Code 找 SSO 中心换取双 Token。
- 双 Token 动静分离存储：
    - RefreshToken：网关在响应头写入 Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax。对浏览器而言属于第一方 Cookie（First-party Cookie），100% 允许写入。
    - AccessToken：通过 JSON Body 返回给前端，存入内存（sessionStorage）。

阶段三：后续静默刷新
- 无感刷新：当前端 AccessToken 过期，Axios 拦截器请求同源接口 https://crm.xxx.com/api/auth/refresh。
- 绿灯放行：浏览器会自动带上 crm.xxx.com 域名下的 RefreshToken Cookie，网关在后台转发完成续期，链条闭环。

### 第二部分：云原生静态托管（OSS）下的代理配置
由于阿里云 OSS（对象存储）是纯静态服务器，无法执行 proxy_pass 动态代理，必须采用 "Nginx / CDN 挡在 OSS 前端做动静分离统一收拢" 的物理架构。

统一 Nginx 核心配置示例

```Nginx
server {
    listen 443 ssl;
    server_name crm.xxx.com; # 前端最终访问的自定义域名

    # 1. 静态资源路由：反向代理到阿里云 OSS 内网域名
    location / {
        # 走内网 Endpoint，免公网流量费，延迟极低
        proxy_pass https://your-bucket.oss-cn-hangzhou-internal.aliyuncs.com;
        proxy_set_header Host your-bucket.oss-cn-hangzhou-internal.aliyuncs.com;

        # 核心：配合 Vue Router 的 History 模式，防止刷新出现 404
        try_files $uri $uri/ /index.html;
    }

    # 2. 接口路由：硬分流到后端的 NestJS / BFF 网关
    location /api/ {
        proxy_pass http://127.0.0.1:3000/; # 后端 NestJS 服务的内网实际端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 确保跨系统 Cookie 映射与传输稳定性
        proxy_cookie_domain auth.xxx.com crm.xxx.com;
    }
}

```

### 第三部分：核心技术辩证（面试必考题）
1. 授权码（Code）和网关代理可以用一个代替另一个吗？

Code 解决的是“传输阶段的安全问题”：隔离了浏览器前端对敏感长期令牌（AccessToken/RefreshToken）的直接接触，防御授权码中途被劫持或历史记录泄露的风险。

网关代理解决的是“持久交互阶段的跨域封杀问题”：将跨域认证转化为同源内网交换，绕过 2026 年浏览器对第三方 Cookie 的全面拦截，确保双 Token 能够成功种植并持续无感刷新。

2. 跨系统（如 OA 跳 CRM）如何实现自动静默登录？
用户访问 crm.xxx.com，前端无 Token，网关拦截并发起静默重定向至 auth.xxx.com/oauth/authorize?client_id=crm。

浏览器跳转到 auth.xxx.com 域名。由于之前在 OA 系统登录过，浏览器会自动带上 auth.xxx.com 下的 sso_session Cookie。

SSO 中心验证 sso_session 合法，无需用户再次输入密码，直接秒级生成属于 CRM 的新 Code 并闪回。

再次触发上述“阶段二”：CRM 网关通过新 Code 换取双 Token，在 crm.xxx.com 下落地第一方 Cookie，全流程用户无感知。
