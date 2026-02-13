# nodejs

mysql
mongodb
postgresql (底层可以直接使用JavaScript)

redis

消息队列
kafka

[Volta](https://volta.sh/)
Volta 是由 LinkedIn 开发的一款跨平台的 Node.js 版本管理工具，核心目标是解决前端 / Node.js 开发中「不同项目依赖不同 Node.js/NPM/Yarn 版本」的痛点，同时兼顾速度、稳定性和易用性。

- 自动版本切换
- 全局 / 项目版本隔离
- 跨平台一致性
- 原生支持包管理器版本管理（不仅能管理 Node 版本，还能同时管理 npm、yarn、pnpm 的版本）

node:fs
fs.stat // 获取文件信息
fs.readFile // 读取文件
fs.writeFile // 写入文件

node:path  dirname 文件夹  basename 文件名 extname 扩展名

node:os 模块

cwd 获取当前工作目录

1.怎么开启子进程
`通过子进程执行命令 spawn exec`
const { spawn, exec, execFile, fork } = require('child_process');

spawn: 数据是「流」，边执行边输出，适合大体积输出（比如日志、文件内容）
exec: 支持 |/* 等 shell 语法，会把所有输出缓存起来，执行完一次性返回；但输出超过 200KB 会报错（可通过 maxBuffer 参数调整）。

execFile: 不解析 shell 语法，避免「shell 注入攻击」（比如用户输入 ; rm -rf /），适合执行可信的可执行文件，比 exec 更安全。
fork: 只能启动 .js 文件（Node 进程），内置 IPC 通道，父子进程可双向通信，适合拆分 CPU 密集型任务（比如大数据计算），避免阻塞主进程事件循环。

`postgresql`

事务：数据库操作时，如果多个操作之间有依赖关系，那么可以放在一个事务中，这样要么全部成功，要么全部失败。(如果一个操作失败，那么事务就会回滚，之前的操作也会被取消) 语句 BEGIN; > ROLLBACK;  END; COMMIT;

## NestJS

`依赖注入（Dependency Injection，DI）`

依赖注入 = 控制反转（IoC）的一种实现（IoC 是思想，DI 是实现 IoC 的方式之一）

IoC（Inversion of Control，控制反转）：原本由程序自己控制的对象创建和依赖关系，反转交给框架来控制。

设计思想：
对象不自行创建依赖，而是由容器在运行时负责创建并注入依赖。

NestJS 中的实现
NestJS 以 Module 作为依赖作用域，在应用启动时由 DI 容器统一创建和管理 Provider，并通过构造函数完成依赖注入，从而实现控制反转与解耦。

依赖注入是一种通过容器在运行时管理对象依赖关系的机制，避免业务代码直接创建依赖，实现控制反转、降低耦合并提升系统的可维护性和可测试性。

装饰器：

核心类装饰器
@Module() // 定义模块
@Controller() // 定义控制器
@Injectable() // 声明该类可被 DI 容器管理并注入（Provider）

路由相关
@Get() / @Post() / @Put() / @Delete() / @Patch() // 声明http请求方法
@All() // 匹配所有 HTTP 方法
@Param() // 获取路由参数
@Query() // 获取查询参数
@Body() // 获取请求体参数
@Headers() // 获取请求头参数

DI 依赖注入
@Inject() 使用 token 注入依赖（接口、字符串、Symbol）
@Optional() 注入可选依赖，避免依赖不存在时报错

校验 & 转换（Pipe）
@UsePipes() 使用管道
@ValidationPipe() // 常用内置管道，结合 DTO 做参数校验

权限 & 安全
@UseGuards() 使用守卫(鉴权、权限控制)

拦截 & 异常
@UseInterceptors() 使用拦截器
@UseFilters() 使用过滤器

请求上下文
@Req 获取请求对象
@Res 获取响应对象
@Next 获取下一个中间件

作用域 & 生命周期
@Injectable({ scope: Scope.REQUEST }) // 每次请求创建一个实例
@Injectable({ scope: Scope.TRANSIENT }) // 每次调用创建一个实例

scope 用来控制 Provider 的生命周期：默认是全局单例（DEFAULT），每个请求创建一个实例（REQUEST），每次注入创建新实例（TRANSIENT）。

| 名称              | 用途        | 执行时机              | 典型应用                  |
| --------------- | --------- | ----------------- | --------------------- |
| **Middleware**  | 请求预处理     | Controller 之前     | 日志、body 解析、全局 auth 查 |
| **Pipe**        | 参数校验/转换   | Controller 接收参数前  | DTO 校验、类型换           |
| **Guard**       | 权限/访问控制   | Controller 执行前    | JWT 校验、角色权限查         |
| **Interceptor** | 拦截器/增强/包装 | Controller 方法执行前后 | 缓存、日志、响应包装、异常统处理     |
| **Filter**      | 异常处理      | Controller 抛异常时   | 捕获异常并统一响应             |

Middleware → Pipe → Guard → Controller → Interceptor(前后包) → Filter

`Custom Provider` 是定义“提供对象的方式”，不仅仅是 class，可以用工厂(支持异步)、常量或 token 来提供依赖。

`工厂函数（Factory Function）`
是一个用来创建对象的函数，每次调用都可以返回一个新对象或实例。

`Dynamic modules` 可运行时配置的模块，能根据参数生成不同 Provider 或导出不同能力，实现模块复用和灵活注入。

```ts
// 示例
@Module({})
export class DatabaseModule {
  static forRoot(options: { host: string, port: number }): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DB_OPTIONS',
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    }
  }
}
// 使用
@Module({
  imports: [
    DatabaseModule.forRoot({ host: 'localhost', port: 3306 })
  ]
})
export class AppModule {}
```

`Circular Dependency` Provider 间互相引用闭环，Nest 无法自动注入；解决方式常用 forwardRef() 或拆模块/接口注入。

```ts
@Injectable()
export class AService {
  constructor(@Inject(forwardRef(() => BService)) private bService: BService) {}
}

@Module({
  providers: [AService, BService],
})
export class AppModule {}
```

`Lazy Loading Modules`（懒加载模块）指模块在应用启动时不立即加载，而是在首次被引用或请求时才由 NestDI 容器创建和初始化，从而降低启动时间和资源消耗。

`Lifecycle Events`（生命周期事件）
NestJS 生命周期主要针对 Provider/Service 和 Module，允许在以下阶段执行逻辑：

| 生命周期接口                   | 触发时机         | 用途          |
| ------------------------ | ------------ | ----------- |
| `OnModuleInit`           | Module 初始化完成 | 初始化依赖、注册服务  |
| `OnApplicationBootstrap` | 应用启动完成       | 启动任务、异步初始化  |
| `OnModuleDestroy`        | Module 销毁时   | 清理资源、断开连接   |
| `beforeApplicationShutdown` | 应用关闭前       | 执行必要的清理操作  |
| `OnApplicationShutdown`  | 应用关闭时        | 释放全局资源、清理缓存 |

```ts
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal) // e.g. "SIGINT"
  }
}
```

`Discovery Service` 是 NestJS 提供的工具，用于在运行时扫描应用程序中的模块、Provider、Controller 和方法，实现动态发现和操作这些元素。

`Platform Agnosticism` 业务逻辑与具体通信平台无关，NestJS 通过适配器机制让相同模块、Provider、Controller 能在 HTTP、WebSocket、gRPC 等不同平台上复用，实现协议无关性。

## RxJS

RxJS 是一个基于 Observable 的响应式编程库，用来以流的方式处理异步和事件，特别擅长组合、取消和控制复杂异步逻辑。

RxJS（Reactive Extensions for JavaScript） 是一个用于 响应式编程 的库， 核心思想是：
把异步、事件、时间序列当作“数据流（Stream）”来处理

Generator 像“同步流的语法糖”，RxJS 是“异步流的工业级解决方案”。

常见处理对象：

- HTTP 请求
- 用户事件（点击、输入）
- 定时器
- WebSocket 推送
- 多个异步任务的组合

Observable（可观察对象）
表示一个异步数据流。懒执行（不订阅不执行），可以发出 0 ~ N 个值

subscribe（订阅）
是 Observable 上的一个方法，用于“触发” Observable 开始发送值，同时也可以指定如何处理这些值（next、error、complete）。数据开始流动。可以随时取消

Operator （操作符）
对流进行 加工处理
不改变原 Observable
返回 新的 Observable
```js
obs$.pipe(
  map(),
  filter(),
  tap()
)
```

RxJS 的设计模型: 数据由 生产者主动推送，消费者通过订阅来接收数据。generator 函数pull拉模式，RxJS 函数push推模式

Observable vs Promise

| 对比项 | Promise | Observable |
| ------ | ------- | ---------- |
| 返回值 | 1 个 | 0 ~ N 个 |
| 是否惰性 | 否 | 是 |
| 是否可取消 | ❌ | ✅ |
| 是否支持流式 | ❌ | ✅ |
| 组合能力 | 一般 | 很强 |

-----

## node
node是一个js运行环境，node比浏览器更加强大，因为node有能力读写文件、操作数据库等。

单线程 异步回调模型

io操作处理比较快

巨大运算量 不太适合 node 处理

解释型语言 编译型语言？

module.exports = {}

```js
// 大致的require函数实现
function require(modulePath) {
  // 1. 将modulePath转换为绝对路径: D:\repository\NodeJS\源码\myModule.js
  // 2. 判断是否该模块已有缓存
  // if(require.cache["D:\repository\NodeJS\源码\myModule.js"]){
  //   return require.cache["D:\repository\NodeJS\源码\myModule.js"].result;
  // }
  // 3. 读取文件内容
  // 4. 包裹到一个函数中
  function _temp(module, exports, require, __dirname, __filename) {
    console.log('当前模块路径:', __dirname)
    console.log('当前模块文件:', __filename)
    exports.c = 3
    module.exports = {
      a: 1,
      b: 2
    }
    this.m = 5
  }
  // 5. 创建一个模块对象
  module.exports = {}
  const exports = module.exports
  _temp.call(module.exports, module, exports, require, moddule.path, moddule.filename)
}

require.cache = {}
```

### Net

net 模块是 Node.js 提供的 TCP 层网络能力，用来直接创建和操作原始 TCP 连接。

层级关系
```
应用层
└─ HTTP / WebSocket / RPC / FTP / SMTP
传输层
└─ TCP / UDP
网络层
└─ IP
数据链路层
└─ Ethernet / Wi-Fi
物理层
└─ 网线 / 光纤 / 无线电
```

TCP(传输层)：可靠、有序、面向连接，慢一点但放心
    特点：建立连接（三次握手），可靠传输，顺序保证，流量 & 拥塞控制(网络堵了自动降速,自我保护)
    代价：握手慢，头部大，状态多，并发连接多时消耗内存
    常见应用：http/https、RPC（gRPC、Dubbo）、数据库连接、webSocket

```ts
import net from 'node:net'

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    console.log(data.toString())
  })
})
```

UDP(传输层)：不可靠、无连接，快，但要自己兜底
    特点：无连接，不保证可靠(可能丢)，极快、极轻（头部小，延迟低，适合高频小包）
    代价：要自己处理重传、顺序、丢包
    适用场景：DNS、视频直播、实时音视频、游戏同步

```ts
import dgram from 'node:dgram'

const socket = dgram.createSocket('udp4')
socket.send('hello', 3000, 'localhost')
```

`IP`网络层
IP（Internet Protocol）是网络层协议，负责为数据包提供跨网络的寻址和路由转发能力。
IP 协议负责跨网络寻址和路由转发，只管把包尽力送到目标主机，不关心是否成功。
IP = 路网
TCP = 物流系统
HTTP = 快递内容格式

IPv4：192.168.1.1
IPv6：2001:db8::1

IP 包内容：
- 源IP
- 目标IP
- TTL (Time To Live) 存活时间 默认64（防止死循环）
- 协议号（TCP=6、UDP=17）

NAT（Network Address Translation）就是“地址翻译”，用来把私网 IP / 端口转换成公网 IP / 端口。

`DNS`
域名注册商（阿里云 / 腾讯云 / GoDaddy）:把域名注册到全球 DNS 体系中
你需要在 DNS 里配置：
A 记录（IPv4）: api.example.com → 47.xx.xx.xx
AAAA 记录（IPv6）: api.example.com → 2001:db8::1
完成 域名 → 公网 IP的映射关系

IP 的核心特性

- 无连接：不建立连接，包与包之间互不相关
- 不可靠：不保证送达、不重传、不确认
- 尽力而为：只负责把包“尽量”送到目标
- 基于地址寻址：通过 IP 地址定位目标主机
- 支持路由转发：数据包可经过多个网络节点转发
- 支持分片与重组：处理不同网络的最大传输单元（MTU）

```less
           【公网】
              |
        ┌── 防火墙 ──┐   ← 能不能进
        |             |
      NAT / SLB     （拒绝）
        |
   ┌─ 交换机 ─┐       ← 往哪走
   |           |
 服务A       服务B
```

```
运维人员
   ↓
堡垒机   ← 谁在干活
   ↓
内网服务器
```

`socket`
- socket 是一个特殊的文件描述符，用来表示一个 TCP 或 UDP 连接的端点(向网卡输送的端口 或 从网卡接收的端口)。
- 在node中表现为一个双工流对象
- 通过向流写入内容发送数据
- 通过监听流的内容读取数据

### http模块

http模块建立在net模块之上，所以http模块也可以理解为net模块的封装，不需要直接操作socket。

http.request(): 创建一个 HTTP 请求实例
http.createServer(): 创建一个 HTTP 服务器实例

客户端： 请求：clientRequest 对象, 响应：IncomingMessage 对象
服务器： 请求：IncomingMessage 对象，响应：ServerResponse 对象

server: http.server Class 对象

静态资源服务器：
```ts
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404
      res.end('Not Found')
      return
    }
    res.end(data)
  })
}).listen(3000)
```

### https模块

https能保证数据在传输过程中的安全性，不能被窃取和篡改。获取的也是加密后的内容。

对称加密：加密和解密使用相同的密钥（密钥只有一个）(常用算法：DES、3DES、AES、Blowfish等)
非对称加密：密钥对（公钥和私钥）加密和解密使用不同的密钥（公钥加密，私钥解密）（常用算法：RSA、Elgamal、Rabin、D-H、ECC等）

对称加密与非对称加密的区别同时使用：

对称加密速度快，适合数据传输，但密钥分发困难；
非对称加密解决了密钥分发问题，但性能较差；
因此在实际系统中，通常先用非对称加密安全地交换对称密钥，再使用对称加密进行数据通信，比如 HTTPS。

证书颁发机构 CA（Certificate Authority, CA）：验证网站域名的合法性，颁发证书 (机构的私钥是唯一的，用于签署证书，公钥是公开的)

第一次访问之后先验证证书是否合法，合法后再使用对称加密进行通信。
浏览器会缓存证书，下次访问时，会直接使用缓存的证书，而不需要再次验证。

[流程](node1.png)

http: 建立在 tcp/ip 层之上的
https: 建立在 tcp/ip 层之上，再加一层 ssl 加密传输协议

- 服务器有：公钥 + 私钥
- 客户端只有：服务器公钥
- 客户端生成对称密钥（Session Key）
- 客户端用「服务器公钥」加密 Session Key
- 只有服务器能用「服务器私钥」解开

### node 生命周期 （事件循环）

[流程](node2.png)

### http

Node 的 http 模块提供了创建 HTTP 服务器和客户端的底层能力。

- tcp封装：net 模块（TCP HTTP 是构建在 TCP 之上的。
- 流式处理
- 事件驱动：基于事件循环的异步模型，处理高并发请求
- keep-alive 连接复用：减少握手次数，提高效率

版本演进时间线

```
HTTP/1.0  (1996)
HTTP/1.1  (1997)  ← 用了20多年
HTTP/2    (2015)
HTTP/3    (2022)
```

核心能力对比

| 特性   | HTTP/1.0 | HTTP/1.1 | HTTP/2 | HTTP/3    |
| ---- | -------- | -------- | ------ | --------- |
| 长连接  | ❌        | ✅        | ✅      | ✅         |
| 多路复用 | ❌        | ❌        | ✅      | ✅         |
| 协议格式 | 文本       | 文本       | 二进制    | 二进制       |
| 头部压缩 | ❌        | ❌        | ✅      | ✅         |
| 基于   | TCP      | TCP      | TCP    | QUIC(UDP) |
| 队头阻塞 | 严重       | 严重       | TCP层仍有 | 基本解决      |
| 性能   | 低        | 中        | 高      | 更高        |

每个版本解决了什么问题

`http1.0` 每个请求都需要建立新的连接，请求完成后立即关闭连接，导致性能低下。

`http1.1` 引入了长连接(Keep-Alive)和管道化，减少了握手次数，提高了效率。但仍然存在队头阻塞问题(在应用层阻塞)。问题：串行执行，对头阻塞，浏览器限制连接数(6个)。

`http2` 引入了二进制分帧、多路复用、头部压缩等机制，解决了队头阻塞问题，提高了性能。问题：仍然是基于 TCP 协议，如果丢包会导致整个连接阻塞。

`http3` 基于 QUIC（基于 UDP） 协议，解决了 TCP 队头阻塞问题，握手慢，丢包卡顿。优势：连接更快，更稳定，移动网络更友好。

```
HTTP/3  ← 应用层
   ↓
QUIC  ← 传输层（用户实现的传输层）
   ↓
UDP  ← 传输层
   ↓
IP  ← 网络层
```

```
http  ← 应用层
   ↓
TCP  ← 传输层
   ↓
IP  ← 网络层
```

`UDP`: UDP（User Datagram Protocol）是一个无连接、不可靠、快速的传输层协议。（适合实时）
    特点：
    - 无连接：不需要握手过程，直接发送数据。
    - 不可靠：不保证数据的可靠传输，可能会丢失或重复。不会重传。
    - 面向报文：发多少就是多少。不会拆包或粘包、重组流。
    - 速度快：因为没有握手过程，没有重传机制，没有阻塞控制。

`QUIC`: 是一种基于 UDP 实现的可靠传输协议，用来替代 TCP。
    特点：
    - 可靠传输：丢包重传，顺序保证。
    - 拥塞控制：根据网络情况动态调整发送速率，避免拥塞。
    - 多路复用：多个流互不干扰，丢一个流不影响其他流。(一条连接里，同时传多条独立数据流)
    - 内置TLS: 默认是加密的，不需要额外的https握手。

`https`: HTTPS = 先用 TCP 建连接，再用 TLS 建立加密信道，最后才传 HTTP 数据。
