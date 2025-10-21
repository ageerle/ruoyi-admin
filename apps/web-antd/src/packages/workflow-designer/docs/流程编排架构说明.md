### Workflow Designer（Standalone）架构说明

本包提供一个与业务最小耦合的可视化流程编排设计器，面向宿主应用以“分包”方式复用。核心目标：
- 只负责前端可视化编排（画布、节点、连线、表单属性），不包含鉴权/路由/接口等全局逻辑
- 通过 props/emits 对外暴露最小 API，宿主负责数据持久化与运行触发
- 通过“约定优于配置”的自动扫描注册，降低扩展成本（节点、边、属性面板、默认值）


## 依赖与技术栈
- Vue 3 + `<script setup>`
- Naive UI（侧栏、按钮、输入等）
- Vue Flow（画布、节点与边渲染、拖拽、连线）
- Pinia（可选：内部 store 提供运行时查看与跨视图状态）


## 目录结构（关键）
- `StandaloneWorkflowDesigner.vue`：核心画布与主交互容器
- `components/`
  - `nodes/`：具体节点组件（如 `AnswerNode.vue`、`StartNode.vue`）；`NodeShell.vue` 为通用外观兜底
  - `edges/`：边组件（如 `SpecialEdge.vue`）
  - 其他通用组件：`CommonNodeHeader.vue`、`SvgIcon.vue`、`RunDetail.vue`、`RuntimeNodes.vue` 等
- `panels/RightPanel.vue`：右侧属性面板，自动解析专属属性组件或回退为通用面板
- `properties/`：
  - `*NodeProperty.vue`：各节点专属属性面板（文件名约定映射）
  - `GenericNodeProperty.vue`：通用（动态）属性表单
  - `defaults.ts`：节点默认配置集中表（函数映射）
- `utils/workflow-util.ts`：数据模型构造、节点/边创建与更新、默认值/图标映射等工具
- `types/index.d.ts`：工作流、节点、边、UI 结构等类型定义
- `store/index.ts`：Pinia store（工作流/运行时列表与详情的辅助状态管理，路由跳转注入）
- `index.ts`：对外默认导出 `StandaloneWorkflowDesigner`


## 核心组件与职责

### StandaloneWorkflowDesigner.vue（主容器）
- 对外 Props：
  - `workflow: WorkflowInfo`：当前工作流（含 `nodes`、`edges` 等）
  - `wfComponents: WorkflowComponent[]`：可用组件清单（决定左侧面板与自动注册键）
  - `componentIdMap: Record<number, string>`：将后端 `workflowComponentId` 映射为组件名（容错兼容）
  - `saving?: boolean`：保存按钮 loading/禁用态
- 对外 Emits：
  - `save(workflow)`：保存（宿主负责持久化）
  - `run({ workflow })`：运行（宿主负责触发执行）
  - `deleteNode(nodeUuid)`：节点删除回调（便于宿主二次处理）
- 自动注册：
  - 通过 `import.meta.glob('./components/nodes/*Node.vue', { eager: true })` 扫描节点文件
  - 键名约定：`<Name>Node.vue` → `name.toLowerCase()`；若未提供具体节点组件，回退至 `NodeShell`
  - 类似方式扫描 `components/edges/*Edge.vue` 注入 `edgeTypes`
- 渲染流程：
  - `renderGraph()` 将 `workflow.nodes/edges` 解析为画布 `uiWorkflow.nodes/edges`
  - 校验节点/边有效性（缺字段/孤立边跳过），统一写入 UI 层数据
  - 支持根据 `workflowComponentId` 用 `componentIdMap` 反推组件名，兼容后端不同返回形态
  - `watch(workflow, { deep: true })` 变更时重算渲染
  - 初次 `onMounted` 渲染并 `fitView()`
- 交互与同步：
  - 拖拽组件到画布：`onPaletteDragStart` → `onDrop` → `createNewNode`
  - 连线：`onConnect` → `createNewEdge`
  - 选中节点：`onNodeClick` → 显示 `RightPanel`
  - 拖拽节点结束：写回 `positionX/Y`
  - 删除边：点击边触发删除，并维护 `deleteEdges`（用于后端同步删除）
  - 保存：`onSave()` 先将画布坐标写回，再对 `deleteEdges` 去重，最后 `emit('save')`

### RightPanel.vue（右侧属性面板）
- 自动扫描 `properties/*NodeProperty.vue`：文件名 `<Name>NodeProperty.vue` → 小写 `name` 作为键
- 根据当前选中节点的 `wfComponent.name` 映射到专属属性组件；若无则回退 `GenericNodeProperty`
- 标题区支持重命名节点标题，图标/色彩通过工具函数映射

### properties（属性配置体系）
- 专属属性面板：`<Name>NodeProperty.vue`，仅需关心并修改 `wfNode.nodeConfig`
- 默认值注入（三级优先级）：
  1) 专属属性面板中可导出 `getDefaultNodeConfig(workflow)`（最高优先级）
  2) `properties/defaults.ts` 中集中表 `propertyDefaultGetters`
  3) `utils/workflow-util.ts` 里保留了“内置简易默认表”的注释示例（不建议使用）
- 未提供时回退空对象 `{}`，仍可渲染并保存

### utils/workflow-util.ts
- 基本构造：`emptyWorkflowInfo()`、`emptyWorkflowNode()`、`createUuid()`
- 节点/边操作：
  - `createNewNode(workflow, uiWorkflow, component, position)`：
    - 初始化 `WorkflowNode`，按默认规则注入 `nodeConfig` 并推入 UI 层
  - `createNewEdge({ workflow, uiWorkflow, source, sourceHandle, target })`：
    - 创建逻辑边与 UI 边（含 `type: 'special'`、`animated: true`）
  - `updateEdgeBySourceHandle(...)` / `deleteEdgesBySourceHandle(...)`：更新/删除边并维护 UI 与 `deleteEdges`
- 图标与样式：`getIconByComponentName`、`getIconClassByComponentName`
- 其他：`deepClone`（优先 `structuredClone`，降级 JSON）

### types/index.d.ts
- 核心类型：
  - `WorkflowInfo`：包含 `nodes`、`edges`、`deleteNodes`/`deleteEdges` 等
  - `WorkflowNode`：`wfComponent | workflowComponentId` 二选一/并存，`inputConfig`/`nodeConfig`/`outputConfig`，`positionX/Y`
  - `WorkflowEdge`：`uuid`、`sourceNodeUuid`、`targetNodeUuid`、可选 `sourceHandle`
  - `WorkflowComponent`：可用组件清单项（左侧面板来源）
  - `UIWorkflow`：画布层节点/边（与业务层分离）

### store/index.ts（可选集成）
- Pinia store，用于：
  - 维护“我的/公共”工作流列表、当前激活工作流、组件清单、运行实例列表等
  - 提供根据 `uuid/id` 获取工作流、起始节点、运行时节点等的 getters
  - 提供新增/更新/删除工作流、维护运行实例、向运行节点追加输入/输出等 actions
  - 通过 `setWorkflowDesignerNavigator` 注入导航方法，避免直接耦合宿主路由
- 注意：主组件并不强依赖此 store；宿主可自由选择是否使用


## 数据流与状态
- 双层数据模型：
  - 业务/持久化层：`workflow`（由宿主传入与保存）
  - 画布/UI 层：`uiWorkflow`（仅用于渲染，提高稳定性与可控性）
- 同步策略：
  - 坐标以画布为准写回 `workflow.nodes`
  - 监听节点选择、拖拽、连线等事件，实时维护两层数据一致
  - 删除边/节点时维护 `workflow.deleteEdges/deleteNodes`，便于后端同步删除


## 与宿主应用的集成方式
- 传入：
  - `workflow`：后端读取或新建的流程数据
  - `wfComponents`：允许拖拽的组件清单（决定左侧面板 + 节点类型注册）
  - `componentIdMap`：当仅有 `workflowComponentId` 时映射到组件名
  - `saving`：保存按钮 Loading/禁用态
- 事件：
  - `save(workflow)`：宿主自行持久化（新增/更新/删除节点与边）
  - `run({ workflow })`：宿主自行触发运行
  - `deleteNode(uuid)`：可选监听，用于联动其他 UI


## 扩展点与约定
- 新增节点：
  - 在宿主传入 `wfComponents` 中追加 `{ name, title }` 即可出现在左侧
  - 可在 `components/nodes/` 新建 `<Name>Node.vue`，自动注册；未提供则回退 `NodeShell`
  - 属性面板：在 `properties/` 新建 `<Name>NodeProperty.vue` 或在 `defaults.ts` 提供默认值
- 新增边：在 `components/edges/` 新建 `<Name>Edge.vue`，自动注册并可通过 `type` 指定使用
- 图标与样式：在 `getIconByComponentName` 与 `getIconClassByComponentName` 中添加映射
- 类型扩展：在 `types/index.d.ts` 中扩展 `WorkflowComponent`、各节点 `nodeConfig` 类型
- 命名约定：
  - 节点组件：`<Name>Node.vue`；属性面板：`<Name>NodeProperty.vue`
  - 自动注册键：文件名去后缀转小写，需与 `wfComponents[i].name.toLowerCase()` 对齐


## 关键交互时序（简化）
1) 宿主传入 `workflow` 与 `wfComponents` → 主组件 `onMounted` 扫描节点/边并 `renderGraph()`
2) `renderGraph()` 校验与转换 `workflow.*` → 写入 `uiWorkflow.*` → `fitView()`
3) 拖拽左侧组件到画布：`onDrop()` → `createNewNode()` → 选中并显示 `RightPanel`
4) 连线：`onConnect()` → `createNewEdge()`；点击边可删除并维护 `deleteEdges`
5) 右侧属性面板：自动匹配 `<Name>NodeProperty.vue`，否则使用 `GenericNodeProperty`
6) 保存：`onSave()` 将坐标同步回 `workflow`、对 `deleteEdges` 去重 → `emit('save')`


## 运行态（可选能力）
- 组件：`RunDetail.vue`、`RuntimeNodes.vue`
- store 动作：记录/更新运行实例、为运行节点累积输入/输出、状态更新等
- 用途：在详情页中展示某次运行的节点轨迹与产出；不影响设计器核心功能


## 设计取舍与注意事项
- 划分 UI 层与业务层数据，避免直接在画布对象上做复杂引用变更
- 自动扫描 + 约定命名，降低新增节点/边/面板的接入复杂度
- 仅保留必要 UI 依赖；鉴权/路由/请求由宿主应用接管
- 仅允许一个 `Start` 节点（拖拽时校验）
- 保存前对 `deleteEdges` 去重，防止重复 ID
- 当后端仅返回 `workflowComponentId` 时，利用 `componentIdMap` 还原组件名，保持渲染稳定


## 快速参考（API 与文件）
- 对外组件：`StandaloneWorkflowDesigner`（默认导出）
- Props：`workflow`、`wfComponents`、`componentIdMap`、`saving`
- Emits：`save(workflow)`、`run({ workflow })`、`deleteNode(nodeUuid)`
- 新增节点/边：
  - 节点：`components/nodes/<Name>Node.vue`（可选）+ `wfComponents` 项
  - 边：`components/edges/<Name>Edge.vue`
- 属性面板与默认值：`properties/<Name>NodeProperty.vue`、`properties/defaults.ts`
- 工具与类型：`utils/workflow-util.ts`、`types/index.d.ts`
- Store（可选）：`store/index.ts`，路由注入 `setWorkflowDesignerNavigator`


