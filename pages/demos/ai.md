# AI 提效

## 核心总结：

在我的理解中，AI 落地绝对不是简单地在对话框里写几句提示词，而是要把 Prompt 像业务代码一样进行『资产化』和『工程化治理』。

我在公司主导的智能化研发体系，本质上是以项目根目录 .agents 为大本营，以动态 SOP（工作流）为剧本，以及 MCP Server （或者自己部署 mcp服务） 作为 AI 的『外接器官』，从而打通了从 UI 设计、接口契约到 CI/CD 的全链路闭环，让普通的 AI 工具变成了最懂公司业务的数字助教。

## 我们能用 Prompt & AI 做什么？

| 维度 / 时机 | 对应 .agents 载体 | AI 具体能干什么（SOP） | 带来的核心价值（ROI） |
| --- | --- | --- | --- |
| 1. 规范感知 | rules/（如 vue3-rules.md） | 约束 AI 的编码下限，注入公司业务潜规则（如严禁解构 Vue 3 props、必须使用自研 ossUploadV2 组件）。 | 消灭低级 Bug：AI 产出的代码更贴合团队 ESLint、Oxlint 规范与技术栈习惯。 |
| 2. 上下文注入 | context/（如 api-routes.json） | 利用 Node.js AST（抽象语法树）脚本动态扫描前端与 BFF 路由，生成项目“活字典”注入给 AI。 | AI 准确感知全量 API 与 TypeScript Interface，减少人工维护与重复解释成本。无需人工喂 Swagger 文档。 |
| 3. 跨平台协同 | mcp-servers/（Model Context Protocol） | 赋予 AI 跨平台执行能力：自动拉取 Apifox 最新契约、读取 Figma Token、或直接在 GitLab 提 MR 并 @ 负责人。 | 打破信息孤岛：开发者在 IDE 内通过自然语言完成跨系统协作，减少沟通摩擦（如 40%）。 |
| 4. 复杂场景执行 | workflows/（Dynamic Workflows，如 code-review.md） | 固化复杂、跨步骤剧本：新需求动工、增量代码 AI Code Review、自动化 Vitest 单测生成/运行/修复、线上 Bug 根因分析。 | 缩短交付周期：本地自动化质量防线可拦截更多隐患（如 90%），MR 交付周期缩短（如 30%）。 |

## 深度技术详解（如何硬核落地？）

1. 动态 Prompt 技术（Dynamic Prompting & Few-Shot 注入）
- 面试表达： “静态的 Prompt 很容易遇到大模型的注意力瓶颈或幻觉。我的做法是『让脚本去写 Prompt』。
- 细节落地： 比如在自动化单测生成工作流中，我用 Node.js 脚本在运行时动态分析目标文件的依赖。通过 AST 自动从项目中捞取写得最完美的、通过了 100% 单测的真实文件作为 Example（Few-Shot）塞进上下文。这样 AI 依葫芦画瓢写出的代码，风格与项目线上代码极为接近。”

2. 完美的解耦架构：NestJS BFF 承载 MCP Server
- 面试表达： “很多人误以为在 BFF 层开发 MCP 功能需要让 BFF 频繁去调大模型，这在架构上是臃肿的。我坚持的架构原则是：IDE 承载推理与大模型计算，BFF 承载工程能力与基础设施供给。”

- 细节落地： “我利用官方的 TypeScript SDK，在 NestJS 中通过 Stdio/SSE 双通道模式 暴露了一系列高 ROI 的 Tools（如 get_api_definition、validate_code_ast）。当开发者在 Cursor 中输入意图时，Cursor 作为客户端（Client）去调用大模型，大模型识别出需要查接口后，给我的 NestJS 发送标准的 JSON-RPC 请求。BFF 只需要跑纯 Node.js 代码把数据查出来返回即可，零 Token 成本 打通了内网基础设施。”

3. 工艺品级的治理：Prompt 资产化与开源工具评测
- 面试表达： “当团队里的 Prompt 越来越复杂时，必须要像对待核心代码一样对待它。我们推行了 Prompt as Code（提示词即代码）。”

- 细节落地： “我把所有的结构化 Prompt 塞进 .agents 目录并纳入 Git 版本控制。同时，我引入了开源评测框架 Promptfoo。在 GitLab CI/CD 流程中建立了『Prompt 单元测试防线』。任何人修改了代码规范提示词，CI 会在预设的 10 个故意写了 Bug 的前端测试集上跑矩阵测试，如果新 Prompt 的 Bug 检出率下降，直接降级拦截，确保 AI 资产的稳定迭代。”

## 工作业绩与 ROI 话术（用数据收尾）

- 从“工具人”到“机制建立者”： “我不仅自己使用 AI，更帮团队建立了一套低门槛、可复制的智能化提效机制。新员工入职只要拉下代码，IDE 就会自动加载 .cursorrules，瞬间让普通 AI 拥有我们组资深架构师的经验。”

- 量化数据产出： “落地这套体系后，团队的 AI 代码生成采纳率显著提升；核心业务的 MR 平均交付周期缩短了 30%；像 Vue 3 响应式丢失、组件销毁时未清除定时器导致的内存泄漏等高频线上隐患，在本地 Code Review 阶段被全自动拦截。”

## 其他

MCP： Model Context Protocol   “模型上下文协议” （AI 的 USB 接口标准、 AI 的插件协议）

MCP 本质上是 AI Tooling 的标准化协议，通过统一 Client 与 Tool Server 的通信模型，使 AI 能够稳定接入工程系统、数据库、文件系统、CLI 与企业平台能力，是未来 AI Agent 生态的重要基础设施。

AI（Agent）
↓
MCP 协议
↓
各种工具（Tool Server）

RPC: Remote Procedure Call（远程过程调用）

RPC 协议规范是“远程函数调用规则”，用于让程序像调用本地函数一样调用远程服务。

## .agents 目录结构概览
当你在使用 Cursor, Trae, Claude Code, GitHub Copilot Workspace 等现代 AI IDE 或 CLI 工具时，它们都具备强大的本地文件检索（RAG）和 Tool-use（工具调用）能力。AI 会自动扫描、读取并理解这个目录下的内容。

.agents 目录结构概览

```txt
my-frontend-project/
├── .agents/
│   ├── rules/                 # 1. 规范与潜规则（让 AI 编码符合团队标准）
│   │   ├── vue3-rules.md
│   │   ├── ts-patterns.md
│   │   └── oss-upload.md      # 特定的复杂业务组件/API 规范
│   ├── context/               # 2. 架构上下文（让 AI 拒绝瞎猜，秒懂项目）
│   │   ├── architecture.md    # 项目架构与 BFF 关系
│   │   └── api-routes.json    # 动态生成的 API 路由映射表
│   ├── skills/                # 3. 自动化脚本与 Tools（让 AI 拥有执行力）
│   │   ├── api-sync.js        # AST 自动扫描与路由同步工具
│   │   ├── component-gen.js   # AI 专用的组件脚手架生成器
│   │   └── migrate-options.js # 自动化重构重度逻辑的脚本
│   └── workflows/             # 4. 复杂任务 SOP（让 AI 扮演特定角色）
│       ├── code-review.md     # AI Code Review 思考模型
│       └── write-test.md      # 单测编写标准与 Mock 规范
```

自动读取 .agents目录下的所有文件
主动感知（需要桥梁）: .cursorrules 配置文件  cursor  trae等能支持  或者  .clauderc

```txt
# 强制 AI 行为指南
你当前处于一个高级前端项目中。在进行任何代码生成、修改、重构或解释时，你必须：
1. 严格优先遵守 `.agents/rules/` 目录下的所有编码规范和业务潜规则。
2. 如果需要了解项目架构或 API 接口，优先读取 `.agents/context/` 中的文档。
3. 如果需要生成模版或同步数据，可以使用终端运行 `.agents/skills/` 下的脚本。
```

package.json
```txt
"ai_config": {
    "agent_brain_path": "./.agents",
    "description": "All prompt instructions, coding rules, and agent tools are centralized in .agents directory."
  },
```

从“调教 AI”到“治理 AI”

简单的流程来看看前后端是如何配合一个 Agent 工作的：

```txt
[前端 UI] --(输入:"帮我审批昨天的差旅报销")--> [后端 Gateway]
                                                  |
                                            [Agent 编排层 (LangGraph)]
                                                  |  (1. 询问大脑该怎么做)
                                            [大模型 (LLM)]
                                                  |  (2. 返回:需要调用查询接口)
                                            [后端业务代码 (Tool Call)]
                                                  |  (3. 去 DB 查到了报销单)
                                            [大模型 (LLM)]
                                                  |  (4. 返回:计算符合规则，需要人工确认)
[前端 UI] <--(SSE 推送: 弹出确认按钮)----------- [后端 Gateway]
[前端 UI] --(用户点击: "同意")-----------------> [后端 Gateway] --> 完成后续自动化
```

SSE 是 Server-Sent Events（服务器发送事件） 的缩写

简单来说，它是一种让服务器向浏览器“单向推送”实时数据的技术。
