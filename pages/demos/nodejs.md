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
