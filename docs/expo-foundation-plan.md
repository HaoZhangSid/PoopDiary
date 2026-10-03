# Poop Diary：Expo 基础方案

日期：2026-10-03。基础工程位于 `apps/mobile`，已实现主题、三语、SQLite，以及排便、身体感觉和饮水 CRUD 样板；饮食、运动、睡眠、Insights 和 Azure 待迁移。本文仍包含后续计划。实际命令见 [mobile README](../apps/mobile/README.md)。

团队和 Agent 的日常规则统一见 [PROJECT_GUIDE.md](../PROJECT_GUIDE.md)。

## 目标

三位成员可以分别用 Codex、Claude Code 开发功能，同时保持一致的视觉、交互和数据规则。修改主题中的一个语义值，应影响所有使用该值的组件；新增和编辑复用同一表单；切换语言不改变记录的含义或统计结果。

课程交付同时遵循 [HAMK 5 分验收清单](./course-grade-5-checklist.md)。评分是累加的：最终必须同时有 SQLite 和 server app、真实的新增 RN 特性，以及全员 RN 贡献。本文的“第一阶段”仅指基础工程，不是最终课程交付。

## 推荐技术

| 用途 | 决策 |
| --- | --- |
| 应用基础 | Expo 当前稳定模板、React Native 默认架构、TypeScript strict |
| 页面导航 | Expo Router；`src/app` 只放路由、布局和参数转交 |
| 样式 | React Native StyleSheet + 类型化主题 + 自建公共组件 |
| 临时状态 | React 的 useState / useReducer，保留在所属功能中 |
| 跨页面状态 | 小型 Zustand store，保存设置、加载状态和记录缓存；数据库是持久化来源 |
| 本地记录 | expo-sqlite，经统一 repository 读写并管理 schema 迁移 |
| 云端业务 | 纳入课程交付；当前优先选择 Azure server app，具体服务待定，原生端实际调用 |
| 多语言 | i18next / react-i18next，中文、英文、芬兰语，稳定翻译 key |
| 基本验证 | ESLint、TypeScript、关键业务及存储测试、Expo 依赖检查 |

依赖按 Expo SDK 的兼容版本安装并提交 lockfile。日常产品开发以 development build 为目标，最初的纯界面验证可使用 Expo Go。保持 Expo CNG，通过 app config 和 config plugins 维护原生配置。

暂不引入通用 CRUD 框架、复杂依赖注入容器或完整离线同步系统。接入真实后端时，再确定 API 缓存和同步规则；SQLite 不会因为替换一个函数就自动获得云同步。

服务器不是可省略的远期功能。基础工程之后安排适量云端业务并部署验证，例如云端备份管理；本地记录保留完整 CRUD。当前优先云平台是 Azure，服务器业务、托管服务和云端数据库由团队确定，至少完成客户端实际使用的服务，不能只建立云账号或展示 mock。无需因此提前实现复杂自动同步。

## 目录和边界

```text
src/
  app/                         Expo Router 路由和根布局
  features/                    页面和完整业务流程
    home/
    diary/
    food/
    bowel/
    symptoms/
    water/
    exercise/
    sleep/
    insights/
    profile/
  design-system/
    tokens/                    颜色、字体、间距、圆角、动效
    components/                Button、Text、Card、Choice、Slider、Sheet、Toast
    ThemeProvider.tsx
  domain/
    records/                   六类记录的类型、code、校验、日期与单位规则
    analytics/                 与界面和语言无关的统计函数
  data/
    repositories/              统一读写接口及实现
    sqlite/                    数据库初始化、查询、迁移
    api/                       云端请求、响应校验和异常处理
  state/                       共用状态和记录缓存
  i18n/
    locales/                   en / fi / zh，按功能分 namespace
assets/
docs/
tooling/                       必要的检查脚本和 ESLint 规则
```

目录随实际代码创建，不预先生成空文件夹。每个功能仅公开自己的页面或明确接口；其他功能不能深入导入它的内部文件。

依赖约束：路由调用功能；功能调用设计系统、domain 和共用记录服务；数据层实现持久化。domain 不依赖 React、Expo、数据库或翻译库。页面不直接读写 SQLite，不自行建立第二份记录状态。

复杂记录流程在所属功能内使用有类型的步骤状态和返回逻辑；导航负责页面与弹层，流程状态负责步骤与草稿。六类记录的流程保留各自的分叉，不为了共用组件而压缩成一个通用表单。

## 设计系统：三个层次

### 1. 基础值

只在这里定义实际色值和尺寸，例如米色、棕色、玫瑰色、间距和字号。

保留原型目前的暖色方向：米色画布、奶油色卡片、深棕正文，配合饮水蓝、咖啡棕、茶色等功能色。具体色值在组件样板和对比度验证后确定。

### 2. 语义主题

页面使用“用途”，不使用原色名称。主题包含浅色、深色，系统模式选择其中一种。

```text
colors.surface.canvas / card
colors.text.primary / secondary / disabled
colors.action.primary.background / foreground / pressed
colors.border.default / selected
colors.feedback.success / warning / danger
colors.entry.food / bowel / symptom / water / exercise / sleep
colors.beverage.water / coffee / tea / juice / milk / alcohol
colors.severity.mild / moderate / severe
spacing / typography / radius / motion
```

每个有色背景同时定义文字色、边框及选中状态，防止暗色模式只换背景而忘记文字。程度色与记录分类色分别定义；不能仅靠颜色传达选中状态或程度，保留文字、图标或选中标记。

### 3. 公共组件

页面使用 `Button variant="primary"`、`Choice selected`、`Text variant="body"`，不分别重写背景、字体和按压状态。修改 Button 的统一规格，所有保存按钮同步变化。

第一批组件只覆盖实际流程：Screen、Text、Button、IconButton、Card、Choice/ChoiceGroup、Slider、Stepper、Sheet、Toast、必要的输入控件。交互组件统一处理可点击区域、加载、禁用、选中、反馈与无障碍属性。

主题示意：

```ts
// 色值只出现在主题定义中。
const lightTheme = {
  colors: {
    surface: { canvas: '#F6F1E9', card: '#FFFCF7' },
    text: { primary: '#2B1F19', secondary: '#766A5F' },
    action: {
      primary: { background: '#2B1F19', foreground: '#FFFCF7' },
    },
  },
} as const;

// 公共 Button 读取主题，功能页面不提供自定义色值。
// <Button variant="primary" onPress={save}>{t('common.save')}</Button>
```

上述只展示结构，不是完成的组件或完整主题。间距使用统一阶梯；字体使用 caption、label、body、sectionTitle、pageTitle 等命名规格。手势坐标、进度和计算所得尺寸等动态值不属于固定设计 token。

浅色和深色都符合同一个 Theme 类型；类型描述字段和用途，不把浅色的具体色值锁进类型。字体先用系统字体，正文从 16、辅助文字从 14 起步。交互区域统一至少 48 个 RN 布局单位，这是产品触控规范。系统字体缩放由平台处理，不再手动重复放大。组件集中响应减少动效设置。

配色以 WCAG 2.2 AA 为目标：普通文字对比度至少 4.5:1；大字（按 WCAG 定义）至少 3:1；识别控件及其状态所必需的图标、边界与相邻颜色至少 3:1。浅色、深色主题都核对 default、pressed、selected、error 状态的语义前景/背景色对。

## 数据先于显示文字

现有原型的 details 是宽泛 Record，保存了中文的餐次、症状、感受；部分统计通过标题摘要中的文字匹配。迁移时改为六类明确类型组成的联合类型，分别定义必要字段。

例如记录中保存 `symptomCode: 'bloating'`，界面按语言显示“腹胀”、`Bloating` 或 `Turvotus`。严重程度、餐次、饮品类型也使用稳定 code。用户填写的食物名称和备注保留原文，不拿它们当翻译 key。

预先约定 ID、事件时间与日记所属日期、时区、修改时间和 schemaVersion。水量内部统一 ml，睡眠时长内部统一分钟；界面可显示其他单位。跨午夜的睡眠明确归属日期。标题和摘要从记录生成，不另存一份容易过期的展示文字。食物关联分析使用分类信息，不依赖对中英文字串的正则判断。

## 必须执行的统一规则

1. 页面不写固定色值、独立字号、圆角或固定间距规格；使用 theme token。
2. 按钮、选项、滑块、弹层和保存反馈使用公共组件。
3. 新增和编辑共用 Editor，区别仅在初始值和保存目标。
4. 表单草稿留在功能内，汇总和图表从记录派生；不维护第二份汇总数据。
5. 数据只经过统一记录服务读写；数据库成功写入后更新共用缓存。
6. 内置标签使用稳定翻译 key；业务数据不依赖显示语言。
7. 页面和选项支持芬兰语换行与系统字体放大；不能全局禁止字体缩放或把正文裁切来掩盖问题。
8. 共享主题、公共组件和数据契约的修改需要指定成员审查。

用 ESLint 的导入限制执行模块边界，用颜色字面量和指定样式属性的检查执行 token 规则。规则对业务文件生效，主题定义、公共组件实现及有说明的动态计算有明确例外。仅有文档约定不能阻止重复样式。

AGENTS.md 和 CLAUDE.md 均指向根目录 PROJECT_GUIDE.md，再按需阅读本方案和课程清单，不复制两套规范。

## 第一阶段交付与验收

先搭底座，再做排便完整样板，随后团队按样板并行迁移其他功能。

底座交付：Expo 路由、主题切换、多语言、公共组件预览页、SQLite 初始化和记录接口、检查命令和 CI。预览页展示组件的默认、按下、选中、禁用、加载、错误状态，以及浅色/深色和长文字。

第一条完整路径：排便新增 → 保存轻反馈 → 首页/Diary 查看 → 同一表单编辑 → 删除 → 重启后检查持久化。

后续课程交付阶段还必须完成：云端业务及原生端 API 调用、课件未覆盖的真实 RN 特性、其他记录流程、GitHub 和任务看板、三位成员的 RN 贡献与交叉讲解。逐项按课程验收清单留存证据。

验收标准：

- 修改主题中的主操作色，所有主操作组件同步变化。
- 浅/深色下核对各状态的语义前景/背景色对，对比度达到上述目标；选中与程度有颜色以外的可见线索。
- 中/英/芬和浅/深色下，选项、弹层和正文均能正常阅读；字体放大时仍可操作。
- 新增、编辑复用流程，已有值正确回填，取消不覆盖已存记录。
- 保存失败不显示成功；重复点击不会写两条；重启后数据保留。
- 切换语言不改变统计结果，schema 迁移与记录读取经过验证。
- 检查能够发现功能页面的硬编码色值和违规导入。

不以搭出很多空目录或安装很多库作为基础完成标准。

## 官方依据

- WCAG 2.2 配色：[文字对比 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)、[非文本对比 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)、[颜色使用 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)。
- React Native 推荐使用框架：[Environment setup](https://reactnative.dev/docs/environment-setup)
- Expo Router：[Introduction](https://docs.expo.dev/router/introduction/)
- Expo TypeScript：[Guide](https://docs.expo.dev/guides/typescript/)
- Expo 原生工程管理：[Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/)
- Expo 本地存储：[SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- Expo 开发构建：[Introduction](https://docs.expo.dev/develop/development-builds/introduction/)
- React Native 样式：[Style](https://reactnative.dev/docs/style)
- Unistyles 3 原生与 Expo Go 限制：[Getting started](https://www.unistyl.es/v3/start/getting-started/)

本方案优先采用 React Native 原生样式能力。NativeWind、Unistyles、Tamagui 可解决特定样式需求，但都不能替代 token、共用组件和可执行约束。
