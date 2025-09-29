# Workflow Designer (Standalone)

可移植的流程编排页面与组件集合，已去除鉴权与项目全局依赖，便于在其他项目中以“分包”方式直接复用。

## 用法

1. 在你的项目中引入并注册组件：

```vue
<template>
  <WorkflowDesigner
    :workflow="workflow"
    :wf-components="wfComponents"
    @save="handleSave"
    @run="handleRun"
  />
</template>

<script setup lang="ts">
import WorkflowDesigner from '@/packages/workflow-designer/StandaloneWorkflowDesigner.vue'
import type { Workflow } from '@/packages/workflow-designer/types'

const workflow = /* 你的工作流数据，符合 Workflow.WorkflowInfo */
const wfComponents = /* 可用组件清单，符合 Workflow.WorkflowComponent[] */

function handleSave(payload: Workflow.WorkflowInfo) {
  // 自行持久化
}

function handleRun(payload: { workflow: Workflow.WorkflowInfo }) {
  // 自行触发运行逻辑
}
</script>
```

2. 必要依赖：
- vue 3
- naive-ui（本包 UI 使用）
- @vue-flow/core 与 @vue-flow/background

3. 可选：若你已有 `SvgIcon` 组件，可替换 `components/SvgIcon.vue` 的实现。

## 说明

- 不包含鉴权、用户判断、接口请求等逻辑；对外通过 emits 暴露 `save`、`run` 事件。
- 完整样式与交互来自原工作流模块，做了最小化改造以去除外部依赖。


## 扩展指引（新增节点/边、接入后端）

### 新增一个节点（Node）
1) 最小化接入
- 新增节点类型对象（供左侧面板/外部传入）
  - 在你的宿主中把 `{ name, title }` 追加到传入的 `wfComponents` 列表即可展示在左侧。
- 在 `utils/workflow-util.ts` 的 `createNewNode` 中：
  - 为新节点的 `name` 增加一个 `case`，初始化该节点的 `nodeConfig`（仅与功能相关字段，避免耦合权限/接口）。
- 在 `StandaloneWorkflowDesigner.vue` 中：
  - 新增对应插槽：`<template #node-<lowercase(name)>="nodeProps">...</template>`。
  - 如果没有专属 UI，可直接使用通用外观 `NodeShell`：`<NodeShell :data="nodeProps.data" />`。

2) 专属属性面板（可选）
- 在 `packages/workflow-designer/properties/` 下新增 `YourNodeProperty.vue`，只编辑 `wfNode.nodeConfig` 中与功能相关的字段。
- 在 `panels/RightPanel.vue` 中按类型分支：
  - `v-else-if="wfNode.wfComponent.name === 'YourNodeName'"` 引入你的属性面板组件。
- 如无需专属面板，默认会使用 `GenericNodeProperty.vue` 根据 `nodeConfig` 自动渲染表单。

3) 连接点（Handle）与连线
- 在节点插槽内决定是否渲染输入/输出连接点：
  - `<Handle type="target" :position="Position.Left" />`
  - `<Handle type="source" :position="Position.Right" />`

### 新增一种边（Edge）
- 在 `components/edges/` 下新增边组件（参考 `SpecialEdge.vue` / `CustomEdge.vue`）。
- 在 `StandaloneWorkflowDesigner.vue` 内绑定插槽：
  - `<template #edge-<type>="edgeProps"><YourEdge v-bind="edgeProps" /></template>`
- 创建/更新/删除边用法：
  - `createNewEdge` / `updateEdgeBySourceHandle` / `deleteEdgesBySourceHandle` 已提供基础能力。

### 节点中调用后端的规范建议
- 子包不直接发起请求；把一切 I/O 通过“宿主注入”的方式提供：
  - 方案 A（推荐）：在宿主上给组件传 `services`/`adapters`（对象），节点面板中通过 `inject('services')` 使用。
  - 方案 B：通过 `props` 传入回调（如 `onUpload`, `onFetchModels`），属性面板调用这些回调获取数据或提交。
- 返回的数据写入到 `wfNode.nodeConfig`，保持与后端字段一一对应，便于持久化时 `@save` 一次提交。
- 任何需要鉴权的细节放在宿主实现，不在子包中出现 `token/用户信息` 等逻辑。

### 命名与约定
- 节点 `name` 使用帕斯卡命名（如 `HttpRequest`），插槽名使用小写：`node-httprequest`。
- 属性面板文件命名：`<Name>NodeProperty.vue`（如 `HttpRequestNodeProperty.vue`）。
- `nodeConfig` 字段应尽量与后端模型字段一致；默认值在 `createNewNode` 中集中维护，便于落盘/回显。
- 不在子包中引入项目自有 Store/权限/路由等全局耦合内容；如需共享状态，请通过 `props / provide/inject` 注入。

### 类型扩展
- 如需新增类型，请在 `types/index.d.ts` 内补充：
  - `WorkflowComponent` 新类型（必要时）
  - 对应节点 `nodeConfig` 的 TS 结构（可选，通用面板也支持任意结构）

### 测试与演示
- 可在 `src/views/demo/WorkflowDesignerDemo.vue` 中：
  - 把新节点加入 `wfComponents` 列表
  - 在 `workflow.nodes` 中手动放入一份样例 `nodeConfig`，方便直接查看渲染与属性面板


