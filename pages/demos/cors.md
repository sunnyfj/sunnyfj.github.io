# CORS 同源策略及解决方案

## 同源策略及跨域问题

`同源策略`是一套浏览器的`安全机制`，当一个`源`的文档和脚本，与另一个`源`的资源进行通信时，同源策略就会对这个通信做出不同程度的限制。

简单来说，同源策略对 `同源资源 放行`， 对 `异源资源 限制`。

因此造成的开发问题，称之为 `跨域（异源）问题`。

### 同源与异源

`源`(origin) = 协议 + 域名 + 端口

两个URL地址完全相同，才是`同源`，否则就是`异源`。

### 跨域出现的场景

- `网络通信`
    a元素的跳转、加载css/js/image、`ajax`等
- JS API
    window.open、winodw.parent、iframe.contentWindow等
- 存储
    webstorage/ IndexedDB 等

对于不同的跨域场景，以及场景中不同的跨域方式，同源策略都有不同的限制。

### 网络中的跨域 (网络通信 中的 ajax)

当浏览器运行页面后，会发出很多请求  这时候就会区分` 同源 与 异源` 请求。

### 浏览器是如何限制异源请求

浏览器出于多方面考量，制定了非常繁杂的规则，来限制异源请求， 但总体的原则非常简单：

- 对标签发出的跨域请求轻微限制
- 对 AJAX 发出的跨域请求`严厉限制`

浏览器(xhr/fetch) 发出的跨域请求 > 服务接受并响应 > 浏览器(使用CORS规则)校验是否通过 > 浏览器交付数据或引发错误

## 解决方案

### CORS

CORS（Cross-Origin Resource Sharing）是最正统的跨域解决方案，同时也是浏览器推荐的解决方案。

CORS是一套规则，用于帮助浏览器判断是否校验通过

CORS的基本理念是：

- 只要服务器明确表示允许，则校验`通过`
- 服务器明确拒绝或没有表示，则校验不通过

所以，CORS的实现，就是在服务器端，根据请求的来源，判断是否允许跨域访问。

### 请求分类

CORS将请求分为两类：

- 简单请求 (simple request)
- 预检请求 (preflight request)

对不同种类的请求它的规则有所区别

所以要理解CORS，首先要理解他是如何划分请求的

#### 简单请求

简单来说，只要全部满足以下条件，就属于简单请求：

- 请求方法是 GET、POST、HEAD 之一
- 请求头字段满足CORS安全规范（W3C说明...）
    浏览器默认自带的头部字段都是满足安全规范的，只要开发者不改动和新增头部，就不会打破此条规则
- 如果有 `Content-Type` 头部字段，它的值只能是 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain（默认）` 之一

#### 对简单请求的验证

浏览器会自动设置
Origin: https://www.taobao.com
Referer: https://www.taobao.com/news/detail?id=1

服务器告诉浏览器让不让过(访问控制)：

Access-Control-Allow-Origin（访问控制允许来源）: https://www.taobao.com

or

Access-Control-Allow-Origin: *

建议不写 * ，而是写具体的来源，原因？

具体：
服务器可以根据请求的来源 Origin，设置响应头 Access-Control-Allow-Origin: 具体的来源
当然服务器可以根据 Origin 做一些白名单的判断，只允许某些来源的跨域请求。

#### 预检请求

只要不是简单请求，就属于预检请求。

##### 对预检请求的验证

- 发送预检请求
    浏览器会先发送一个 OPTIONS 请求，询问服务器是否允许跨域访问。 没有请求体, 只有请求头
    Origin: https://www.taobao.com
    Access-Control-Request-Method: POST
    Access-Control-Request-Headers: Content-Type, xxx, yyy
    服务器至少返回以下响应头：
    Access-Control-Allow-Origin: https://www.taobao.com
    Access-Control-Allow-Methods: POST
    Access-Control-Allow-Headers: Content-Type, xxx, yyy
    Access-Control-Max-Age: 86400 （缓存时间 一天）
- 预检通过，发送真实的请求（和简单请求一致）

`细节1` 关于cookie
默认情况下，Ajax的跨域请求是不会附带cookie的。这样一来，某些需要权限的操作，就无法完成。

如果需要附带cookie，通过配置：

```js
// xhr 配置
xhr.withCredentials = true

// fetch 配置
fetch(url, {
  credentials: 'include'
})
```

而服务器响应时，需要明确告知客户端：服务器允许这样的凭据

告知方式 在响应头中添加：
`Access-Control-Allow-Credentials: true`

对于一个附带身份凭证的请求，若服务器没有明确告知，浏览器仍然视为跨域被拒绝

另外要特别注意的是：对于附带身份凭证的请求，服务器不得设置`Access-Control-Allow-Origin` 值为 `*`，必须指定具体的来源。 这就是不推荐使用*的原因

`细节2` 关于跨域获取响应头

在跨域访问时，JS只能拿到一些最基本的响应头，比如：Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma。

如果想获取其他响应头，就必须在服务器端，设置 Access-Control-Expose-Headers 字段，设置响应头白名单。

例如：
```t
Access-Control-Expose-Headers: X-My-Custom-Header, X-Another-Custom-Header
```

### JSONP

早期，没有CORS方案，通过 JSONP 实现跨域访问。

不使用 XHR / fetch 方式

```js
function request(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const cbName = `__callback__${Math.random().toString(36).substring(2)}${Date.now()}`
    window[cbName] = (resp) => {
      resolve(resp)
      script.remove()
      delete window[cbName]
    }
    script.src = `${url}?callback=${cbName}`
    document.body.appendChild(script)
  })
}

// 服务器响应
// __callback__xxxxyyyy(resp)
```

虽然可以实现跨域访问，但是它有一些局限性：

- 只支持 GET 请求（script标签）
- 容易产生安全隐患
    恶意攻击者可以利用 callback=恶意函数的方式实现 XSS 攻击
- 容易被非法站点恶意调用

因此，除非某些特殊的原因，否则不建议使用 JSONP

### 代理

CORS和JSONP均要求服务器是 ”自己人“

## 如何选择

最重要的是，`要保持生产环境和开发环境一致`

不管用哪一种方案，都需要保证开发过程和生产环境的跨域方案是一致的。
