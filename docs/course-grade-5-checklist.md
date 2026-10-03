# Poop Diary：HAMK 项目 5 分验收清单

## 来源和使用方式

- 课程：Mobile Programming Autumn 2026，TK00ED02-3002。
- 页面：[Evaluation criteria of the Mobile Programming Project](https://learn.hamk.fi/mod/page/view.php?id=1073348)。
- 页面显示的最后修改时间：Monday, 21 September 2026, 2:12 PM。
- 核对日期：2026-10-03；已从用户当前登录的 Moodle 页面读取正文。
- 本文中的课程要求来自页面原文；实现方案和验收证据是本项目的执行建议。

项目当前优先选择 Azure；具体服务及云端业务待团队确定。团队与 Agent 的统一规则见 [PROJECT_GUIDE.md](../PROJECT_GUIDE.md)。课程原文仍保留 GCloud RESTful 或 Azure 的选择，不因项目选择而改写。

评分是累加的。目标 5 分意味着同时满足全部 Basics 和 Grade 1–5，不能只满足最后一句。完成文档或 Web 原型不等于满足要求；项目交付时，每一项都要有实际代码、运行结果或团队过程证据。最终成绩由教师评定。

## 必须满足的课程要求

| 编号 | 课程要求 | Poop Diary 的执行方式 | 验收证据 | 当前状态 |
| --- | --- | --- | --- | --- |
| B1 | 项目复杂度高于 Cross-Platform 课程示例或练习 | 六类记录及完整分叉、真实持久化、编辑删除、日记与统计形成完整产品流程 | 功能清单、手机演示、与课程示例的对照 | Web 参照保留；排便原生代码已实现，真机待验 |
| B2 | UI 美观，正确且多样地使用样式 | 统一 design tokens、公共组件、深浅主题；验证长文字、系统大字和交互反馈 | 组件预览页、手机截图、三语言/两主题检查记录 | 原生设计系统、三语与对比度测试已完成；真机/大字待验 |
| B3 | 每位成员都有自己的 React Native 编程部分 | 三位成员均承担并交付 RN 页面、组件或原生交互，不让其中一位仅负责后端或文档 | 每人的负责模块、RN commits/PR、运行演示 | 待提供团队证据 |
| B4 | 使用 server app 时，GCloud RESTful 或 Azure 部分可由一人完成，但全员理解应用 | 当前优先选择 Azure server app，所有成员能说明客户端、SQLite 与 API 的数据路径 | 云端部署、API 调用、全员讲解 | 当前项目无 server app 实现 |
| B5 | GitHub 和项目管理工具都必须使用 | GitHub 仓库；Trello 或符合要求的团队看板；任务有负责人、验收条件与 PR 链接 | 仓库链接、看板链接、真实任务及合并记录 | 本地 Git 已建立；GitHub 仓库与看板待团队提供 |
| B6 | 每个人都能解释其他成员写的代码 | 交叉检查、演示与代码讲解；理解关键模块和整套应用 | 交叉 review 记录、团队讲解清单 | 待提供团队证据 |
| G1 | 全部 Basics；SQLite 或 server 支持读取 | 实际读取 SQLite 中的记录 | 查询代码、手机上的日记列表 | SQLite 已实现，真实数据库重开测试通过；手机演示待做 |
| G2 | SQLite 或 server 支持读写；至少一个自定义组件 | SQLite 新增/读取；自建 RN Button、Choice、Slider 等公共组件 | 数据写入和重新读取、组件复用位置 | 原生公共组件及 SQLite 写入已实现；手机演示待做 |
| G3 | SQLite 或 server 支持 CRUD；有导航 | SQLite 完成同一记录的新增、读取、修改、删除；Expo Router 导航 | 同一条记录的完整 CRUD 演示、返回/Tab 行为 | 原生排便 CRUD 与导航已实现；手机验证待做 |
| G4 | SQLite **和** server app；至少一方有 CRUD；至少一个课件未覆盖的新 RN 特性 | SQLite 完整 CRUD + 实际云端 API；增加真实设备能力 | 本地数据库和云端均有运行证据；新特性的材料对照、手机演示 | SQLite 已实现；server 与新增原生能力待完成 |
| G5 | 适当注释、模块化、多个/若干课件未用过的 RN 特性 | 按 feature/domain/data/design-system 分层；关键业务规则有说明；选择多项可演示的 RN 特性 | 代码结构、关键注释、新特性对照与演示 | 模块化代码与检查已实现；新 RN 特性材料对照与真机验证待完成 |

### 不得误读的地方

- Grade 1–3 是 SQLite **或** server；Grade 4 起是 SQLite **和** server。
- Grade 4 只要求至少一方 CRUD。为清晰演示，本项目建议本地记录做 CRUD，云端选一个适量的业务资源做真实操作。
- “few or many React Native features”没有给出固定数量。下文的相机、手势、通知是项目候选，不是教师写明的“三项最低门槛”。
- 是否“课件未覆盖”必须和 Cross-Platform 课程材料逐项对照。Tab navigation 不能在未核对材料前自动算作新增特性。
- 定位、滑动、radio、checkbox 原文明确说不是必需，不需要为评分强行加入定位。
- 页面写的是 GCloud RESTful 或 Azure。选择其他云平台或只使用 BaaS，不能未经核实就认定满足同一要求。
- 相机页面、通知开关、模拟语音或模拟 AI 结果，不等于实际使用原生能力。
- 注释应解释关键规则、原因、数据迁移、权限和异常处理；不是机械地给每行代码补注释。

## 本项目的交付范围

### 1. Expo 原生应用和本地记录

- [ ] 用真实 Expo / React Native 工程在手机或模拟器运行。
- [ ] 六类记录沿用已经讨论好的产品流程和深度。
- [ ] SQLite 保存记录，有明确 schema 和升级迁移。
- [ ] 新增、读取、编辑、删除都操作实际 SQLite 数据。
- [ ] 新增和编辑使用同一个 Editor，编辑正确回填。
- [ ] 保存有轻反馈；失败不显示成功；重复点击不重复写入。
- [ ] 首页、Diary、Insights 使用同一份记录数据。
- [ ] 关闭并重新启动后，新增和修改仍在，删除仍生效。
- [ ] 有可运行的导航、自定义组件与明确的模块边界。

### 2. 云端 server app：必须列入交付

- [ ] 团队确定 Azure 的具体服务、云端业务与部署方案。
- [ ] 原生客户端实际调用部署后的 API；不是只在 API 工具里展示。
- [ ] 有请求、响应、持久化结果及失败处理的证据。
- [ ] 文档明确云端负责的业务、本地和云端的关系，以及哪些操作会改变云端数据。
- [ ] 全员能说明 API 的用途和数据流。

建议用范围有限的“云端备份管理”承接 server 要求，或由团队决定等价的日记业务资源。SQLite 负责日常记录，不强行在第一版实现自动多设备同步。若采用备份管理，可以创建、列出、更新和删除一个备份，并验证恢复行为。这是项目方案，不是课程规定必须有备份功能。

不要把“已建云账号”“仅有 health endpoint”“客户端没有使用的服务器”当作 server 交付完成。演示数据使用虚构记录。

### 3. 真实 RN 特性候选

| 候选 | 对产品的用途 | 需要实际完成的行为 | 是否课件未覆盖 |
| --- | --- | --- | --- |
| 真实相机 | 饮食照片记录 | 授权/拒绝、拍照、预览、重拍、照片关联记录、重启后查看 | 待对照材料 |
| Diary 滑动手势 | 快速编辑或删除 | 手势操作与纵向滚动不冲突；保留明确按钮和删除撤销 | 待对照材料；原文列为可用的非必需能力 |
| 本地通知 | 用户选择的每日记录提醒 | 权限、安排提醒、修改时替换旧通知、关闭时取消 | 待对照材料 |
| Tab navigation | Home / Diary / Insights / Profile 切换 | 真实原生导航、选中态、返回和页面状态正常 | 待对照材料；评分原文给的例子 |

先核对课程材料，再确定最终组合，并在此表补材料出处和演示入口。真实拍照与 AI 识别是两项不同工作；可以独立完成拍照，不把固定识别结果宣称为真实 AI。

### 4. 三人贡献与相互理解

| 成员 | RN 负责部分 | RN PR/提交证据 | 交叉检查对象 | 全项目讲解 |
| --- | --- | --- | --- | --- |
| 成员 A（待填写） | 待分配 | 待填写 | 待填写 | 待验收 |
| 成员 B（待填写） | 待分配 | 待填写 | 待填写 | 待验收 |
| 成员 C（待填写） | 待分配 | 待填写 | 待填写 | 待验收 |

后端负责人也要承担实际 RN 编程部分。各自的 AI 可以帮助实现，但负责人应能解释、修改和演示自己以及其他成员的关键代码。基础工程可以由一人先搭，后续仍要满足全员 RN 贡献。

全员至少能讲解：路由如何进入记录流程；新增和编辑如何复用；保存怎样写入 SQLite；其他页面怎样更新；云端 API 如何使用；权限失败怎样处理；统计为什么不依赖显示语言。

## 项目管理与证据

推荐看板状态：待做 → 进行中 → 待检查 → 完成。每张卡包含：负责人、对应评分编号、用户可见结果、验收步骤、PR 和运行证据。

初始任务：

| 任务 | 对应要求 | 完成条件 |
| --- | --- | --- |
| GitHub 与看板 | B3、B5、B6 | 实际链接、三人权限、分工和交叉检查规则 |
| Expo 底座与设计系统 | B2、G2、G3、G5 | 路由、主题、三语言、公共组件和检查脚本运行 |
| SQLite 与排便完整样板 | G1–G4 | 新增→查看→编辑→删除→重启验证 |
| 其余五类记录 | B1、B3、G3 | 完整流程、实际持久化、同一编辑体验 |
| 云端业务/API | B4、G4 | 部署、原生端真实调用和失败处理 |
| 新 RN 特性与材料对照 | G4、G5 | 对照依据、真实设备行为、权限和异常演示 |
| 代码与团队交叉验收 | B6、G5 | 模块与注释检查、每人讲解他人模块 |
| 最终演示和提交材料 | 全部 | 下述门槛全通过，证据链接完整 |

提交前建立证据索引，记录源码位置、任务/PR、截图或视频以及演示步骤。证据按需生成，不预先把未运行的测试、未做的 review 或未提交的代码写成完成。

## 最终验收门槛

- [ ] B1–B6 和 G1–G5 每项都有证据链接和检查人。
- [ ] 真机演示：新增记录 → 返回首页 → Diary 查看 → 编辑 → 删除 → 重启验证。
- [ ] SQLite 与云端业务分别展示实际读写和持久化结果。
- [ ] 自定义组件、导航、模块化和关键注释可在代码中指出。
- [ ] 新 RN 特性有课程材料对照，并能现场操作。
- [ ] 三位成员均有 RN 贡献，均能讲解其他成员代码。
- [ ] GitHub 和项目管理工具可访问，过程记录是真实的。
- [ ] 中/英/芬、浅/深色、字体放大与重要流程已检查。
- [ ] 构建、类型检查、lint 和关键测试通过；已知问题写明。
- [ ] 最终运行版本与演示、报告、提交说明一致。

还需从对应作业页面核实最终截止时间、文件格式、演示形式与提交人数。本评分页面没有给这些信息；不能把先前“App idea”作业的规则自动套到最终项目。

## 课程原文留档

以下保留页面原文，不改写用词。

### The basics:

1. The project may not be any as easy as the examples or tasks in the Cross-Platform development course
2. The project must have beautiful UI - styles must be used correctly and versatilely. Nothing that ugly as in the examples of Cross-Platform course.
3. All of the members must have their own part in React Native Programming.
4. The GCloud RESTful OR Azure part can be done by one of the group members, but all should know and understand the app. (If you have server app)
5. Projects must be in GITHUB and projects must use some project management tool (Trello, Jira/Confluence etc.).
6. All the group members can explain the code which some other member has created.

### The grades - about

The criteria is cumulative. E.g. to get grade 5, all the previous must come true.

To get grade 1: All the requirements above comes true and the app uses SQLite or server app for reading

To get grade 2: The app uses SQLite or server app for read and write and has at least one custom component

To get grade 3: The app uses SQLite or server app for CRUD operations and has some navigation system

To get grade 4: The app uses SQLite and server app. At least either of these has CRUD operations. The app has at least one new React Native feature (e.g. usage of camera), which is not in the Cross-Platform material.

To get grade 5: The code is properly commented, the code is modular, there are few or many React Native features (e.g. tab navigation), which are not used in the Cross-Platform development course

Remember also the use of locationing, swiping, radio and checkbox buttons - not necessary, but in many cases they are usable.
