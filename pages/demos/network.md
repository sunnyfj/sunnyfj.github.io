# network 网络分层模型和应用协议

## 分层模型

### 五层网络模型

经过不断地演化，最终形成了五层网络模型。通过分层解决复杂问题。

物理层（信号传输：光纤、电缆、无线） >
数据链路层（如何在子网中找到对方： MAC 地址（指纹 唯一） 交换机） >
网络层（如何路由： IP 地址（动态唯一） 路由器） >
传输层（如何传输： TCP、UDP） >
应用层（如何应用： HTTP、FTP、SMTP）

### 数据的传输

从 应用层开始 到 应用层结束，数据在不同层之间进行转换和封装。

### 四层、五层、七层网络模型的区别

四层：应用层、传输层、网络层、物理链路层
七层：应用层、表示层、会话层、传输层、网络层、数据链路层、物理层

最开始定义了从四层 》 标准规范7层（没有实际应用） 》借鉴了 四层与七层整合 五层网络模型的设计。

## 应用层协议

### URL

URL是一个固定格式的字符串

http://a.com:80/news/detail?id=1#t?

协议(Protocol)：http
域名(Domain)：a.com
端口(Port)：80
路径(Path)：/news/detail
查询参数(Query)：id=1
片段(hash)：t?

它表达了使用什么协议，从网络中 哪台计算机（域名） 中的 那个程序（端口） 哪个服务（路径），并注明了获取服务的具体细节（path）（查询参数、片段）

包含了一些细节：
- 当协议是http时，端口默认是80  可以省略
- 当协议是https时，端口默认是443  可以省略
- 协议、域名、路径（默认客户端会补上 / 根路径）是必须的， 其他都是可选的

### http

 超文本传输协议（HyperText Transfer Protocol）是一个广泛运用于互联网的应用层协议。

该协议规定了两个方面的内容：
- 传递消息的模式（请求-响应模式）
- 传递消息的格式（文本格式）

`传递消息的模式`
http使用了极为简单的消息传递模式，【请求-响应】模式
发起请求的称之为客户端，接收请求并完成响应的称之为服务器
【请求-响应】完成后，一次交互结束

`传递消息的格式`

请求实际发送的就是文本格式的多行字符串，响应也响应的是文本格式的多行字符串。也就是说http协议就是基于文本的协议，学习http基本90%的内容都是在字符串的格式上进行的。

请求行 Line
请求头 Header
请求体 Body

响应行 Line
响应头 Header
响应体 Body

```t
# 请求行（一个换行）  请求头多行结束需要（两个换行）  请求体
GET / HTTP/1.1(请求行)
Host: www.taobao.com(请求头)

xxxx(请求体, 可以为空)

```

base64 将文件变成可传输的文本格式，客户端转换效率问题，转换过后二进制的内容大于原始文件。传输效率问题，因此是不得已而为之的方法

直接在请求体写 二进制格式

```t
# 响应行（一个换行）  响应头多行结束需要（两个换行）  响应体
HTTP/1.1 200 OK (响应行)
Content-Type: text/html; charset=utf-8(响应头)

xxxx(响应体)
```

1** 信息，服务器收到请求，需要请求者继续执行操作
2** 成功，操作被成功接收并处理
3** 重定向，需要进一步的操作以完成请求
4** 客户端错误，请求包含语法错误或无法完成请求
5** 服务器错误，服务器在处理请求的过程中发生了错误

`301 Moved Permanently 永久重定向`
`302 Found 临时重定向`
`请求头：Location: new-url`

-----------

# 浏览器的通信能力

## 用户代理

浏览器可以代替用户完成http请求，代替用户解析响应体，因此称之为用户代理（User Agent）

### 自动发出请求的能力

- 用户在浏览器地址栏输入url，浏览器会自动发出get请求
- 用户点击了页面中的a元素(浏览器会拿到a元素的href属性，发出get请求、同时抛弃当前页面)
    `书写的地址（绝对地址和相对地址） url`
    绝对地址(不关心路径)
    //www.taobao.com/news/detail?id=1 > 浏览器会自动添加协议 http:// | https://
    /news/detail?id=1 > 浏览器会自动添加当前域名    http://www.taobao.com/news/detail?id=1
    相对地址(关心路径)
- 用户点击了表单中的submit按钮，浏览器会自动发出请求(action指定地址, 请求方式，请求体 通过表单元素列举)  payload 负荷
- 当页面解析到到 link img script audio video 等元素时，浏览器会拿到对应的地址 发出 get 请求
- 当用户点击了刷新

`重点`

一直以来，服务器和浏览器之间都有一个约定：

`当发送GET请求时，不会附带请求体`，这个约定深远的影响了后续的前后端各种应用，现在，几乎所有人都潜意识中认同了这一点。

由于前后端的程序的默认行为，逐步造成了GET与POST的各种差异：

```t
get与post的差异：
1.在协议层面只有语义的区别，其他没有区别。语义的含义不一样，get是获取资源，post是提交资源。并没有要求get请求不能附带请求体，在后面http1.1的协议中有一条警告，不建议get请求附带请求体。
2.由于目前环境下，服务器环境，浏览器环境的默认行为，因此在实际应用中，造成了一些差异：
    - 浏览器在发送get请求时，不会附带请求体
    - get请求的传递信息量有限，适合传输少量数据，post请求的传递信息是没有限制的，适合传输大量数据。
    - get请求只能传递ASCLL数据，遇到非ASCLL数据，需要进行编码（encodeURIComponent/decodeURIComponent）。post请求没有限制
    - 大部分get请求传递数据都附带在path参数中，能够分享地址完整展示页面，但同事也暴露了数据，若有敏感数据，不建议使用get请求，至少不应该放在path中（浏览器对：请求行 请求头 长度有一定的限制  协议没有）
    - post 不会保留到浏览器的历史记录中（复现请求）
    - 刷新页面时，若当前页面是通过post请求得到的，则浏览器会提示用户时候重新提交。get得到的页面则没有提示（get能看到一些信息、post看不到 浏览器则做了提示）
    - get请求是通常是幂等的，post请求通常不是幂等的。 get的请求行与请求头常规都不变，post的请求体会变化

ASCII 数据通常指：
只包含基本英文字符、数字和标点的文本
每个字符使用 7 位或 8 位二进制表示
与现代 UTF-8 编码的前 128 个字符兼容

什么是幂等性（Idempotence）:一个操作如果执行多次的结果与执行一次的结果相同，那么这个操作就是幂等的。

```
### 自动解析响应的能力

浏览器不仅能发送请求，还能针对服务器的各种响应结果做出不同的自动处理

常见的处理有：

- 识别响应码
    浏览器能自动识别响应码，当出现一些特殊的响应码时浏览器会自动完成处理，比如 301 302
- 根据响应结果做出不同的处理
    浏览器能自动分析响应头中的 Content-Type 字段，根据不同的类型，做出不同的处理，比如
        text/plain: 会原封不动的展示在页面上，
        text/html: 通常会将响应体进行页面渲染
        image/png 会将响应体解析为图片，展示在页面上
        application/octet-stream: 会将响应体解析为二进制数据，通常会提示用户下载(告诉浏览器是附件：content-disposition: attachment; filename="filename.png")
        ...

## 基本流程

*从用户输入url开始，浏览器会自动完成以下流程：（当前知识情况下）*

- 浏览器会补全url地址
- 对地址中非ASCII字符会自动完成url编码
- 请求 >
- 响应 < html文档
- 丢弃旧页面 开始解析html文档 发现link元素
- 请求 >
- 响应 < css代码
- 解析应用css样式 > 继续解析html 发现img元素 > 请求 > 响应将图片应用到布局 > 继续解析html > 发现script > 请求
- 响应 < js代码 > 执行js代码 > 继续解析html
- 直到解析完成

## ajax

`talk is cheap, show me the code.`
`code is cheap, lets talk.`

(
    浏览器本身就具备网络通信的能力，早期浏览器并没有将能力开放给js

    最早是微软在IE浏览器中把这一能力向JS开放，让JS可以在代码中实现发送请求，并不会刷新新页面，这项技术在2005年正式命名为AJAX（Asynchronous JavaScript and XML）
)

AJAX就是指在web应用程序中异步向服务器发送请求。

它的实现方式有两种：
- XMLHttpRequest
- Fetch

两者对比：

功能点| XMLHttpRequest | Fetch |
|--|--|--|
| 基本的请求能力 | 支持 | 支持 |
| 基本的获取响应能力 | 支持 | 支持 |
| 监控请求进度 | 支持 | 不支持 |
| 监控响应进度 | 支持 | 支持 |
| Service Worker中是否可用 | 不支持 | 支持 |
| 控制cookie的携带 | 不支持 | 支持 |
| 控制重定向 | 不支持 | 支持 |
| 请求取消 | 支持 | 支持 |
| 自定义referrer | 不支持 | 支持 |
| 流 | 不支持 | 支持 |
| API风格 | Event | Promise |
| 活跃度 | 停止更新 | 不断更新 |

### 其他

fetch 设计 第一次Promise等待结果是响应行，响应头，第二次Promise等待结果是响应体。

```js
fetch(url)
  .then((response) => {
    console.log(response.status) // 200
    console.log(response.statusText) // OK
    console.log(response.headers) // Headers {}
    return response.text()
  })
  .then((body) => {
    console.log(body) // <html>...</html>
  })
```

URL本质是获取资源

字符串是一种资源，它可以被获取，因此URL可以被获取  dataUrl

希望程序平易近人

`流式读取`

```js
let content = ''
const response = await fetch(url)
const reader = response.body.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) {
    break
  }
  console.log(value) // Uint8Array(1024)  二进制
  // 转换为字符串
  const text = new TextDecoder().decode(value)
  content += text
}
```
