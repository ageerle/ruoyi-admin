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
- 在宿主页面（如 `src/views/workflow/index.vue`）把 `{ name, title }` 追加到传入的 `wfComponents` 列表，即可出现在左侧面板并参与拖拽：
  - 例如：`{ name: 'MyNode', title: '我的节点' }`
- 默认配置两种方式（有优先级）：
  - 方式 A（优先级最高）：在 `properties/YourNodeProperty.vue` 中导出
    - `export function getDefaultNodeConfig(workflow) { return {/* 默认配置 */} }`
    - 示例：`properties/TestNodeProperty.vue`
  - 方式 B（集中维护）：在 `properties/defaults.ts` 中配置
    - `export const propertyDefaultGetters = { yournode: (workflow) => ({ /* 默认配置 */ }) }`
  - 兜底：若 A/B 都未提供，回退为空对象 `{}`。
- 在 `components/nodes/` 下创建 `MyNode.vue`（可选）。无需手动注册，系统会自动扫描注册：
  - 文件名 `MyNode.vue` 会被转换成 `mynode` 键名并注入 `nodeTypes`。
  - 如果没有提供该文件，会自动回退到通用外观 `NodeShell`。

2) 专属属性面板（可选）
- 在 `packages/workflow-designer/properties/` 下新增 `YourNodeProperty.vue`，只需编辑 `wfNode.nodeConfig` 相关字段。
- 无需修改任何分支或注册代码：系统会自动扫描 `*NodeProperty.vue` 并按文件名映射到节点类型：
  - 例如：`HttpRequestNodeProperty.vue` → 键名 `httprequest`，当节点 `name === 'HttpRequest'` 时会自动渲染。
- 若未提供专属面板，自动回退为 `GenericNodeProperty.vue`，按 `nodeConfig` 动态渲染表单。

3) 连接点（Handle）与连线
- 连接点应在各自的节点组件中渲染：
  - `<Handle type="target" :position="Position.Left" />`
  - `<Handle type="source" :position="Position.Right" />`
  - 示例可参考 `components/nodes/AnswerNode.vue`。

### 新增一种边（Edge）
- 在 `components/edges/` 下新增边组件（参考 `SpecialEdge.vue`）。无需手动注册：
  - 文件名 `MyEdge.vue` 会被转换成 `myedge` 键名并注入 `edgeTypes`。
- 创建/更新/删除边：
  - `createNewEdge` / `updateEdgeBySourceHandle` / `deleteEdgesBySourceHandle` 可复用，按需调用。

### 节点中调用后端的规范建议
- 子包不直接发起请求；把一切 I/O 通过“宿主注入”的方式提供：
  - 方案 A（推荐）：在宿主上给组件传 `services`/`adapters`（对象），节点面板中通过 `inject('services')` 使用。
  - 方案 B：通过 `props` 传入回调（如 `onUpload`, `onFetchModels`），属性面板调用这些回调获取数据或提交。
- 返回的数据写入到 `wfNode.nodeConfig`，保持与后端字段一一对应，便于持久化时 `@save` 一次提交。
- 任何需要鉴权的细节放在宿主实现，不在子包中出现 `token/用户信息` 等逻辑。

### 命名与约定
- 节点 `name` 使用帕斯卡命名（如 `HttpRequest`），自动注册时将文件 `HttpRequestNode.vue` 转为小写键 `httprequest`。
- 属性面板文件命名：`<Name>NodeProperty.vue`（如 `HttpRequestNodeProperty.vue`）。
- `nodeConfig` 字段应尽量与后端模型字段一致；默认值在 `createNewNode` 中集中维护，便于落盘/回显。
- 不在子包中引入项目自有 Store/权限/路由等全局耦合内容；如需共享状态，请通过 `props / provide/inject` 注入。

### 拖拽面板说明
- 左侧面板通过宿主传入的 `wfComponents` 渲染，拖拽开始事件集中在 `onPaletteDragStart` 方法内：
  - 通过 `event.dataTransfer.setData('application/vueflow', component.name)` 传递节点类型。
  - 放置（drop）逻辑集中在 `onDrop` 方法中，最终由 `createNewNode` 完成数据与画布 UI 的创建。

### 类型扩展
- 如需新增类型，请在 `types/index.d.ts` 内补充：
  - `WorkflowComponent` 新类型（必要时）
  - 对应节点 `nodeConfig` 的 TS 结构（可选，通用面板也支持任意结构）

### 测试与演示
- 打开页面 `src/views/workflow/index.vue`，此页已集成 `StandaloneWorkflowDesigner`。
- 在该文件中：
  - 将你的节点 `{ name, title }` 追加到 `wfComponents` 数组即可出现在左侧拖拽面板。
  - 在本页的 `workflow.nodes` 中按需加入一条样例节点，便于直接查看渲染与属性面板。
  - 如有自定义节点/边组件，分别放到 `packages/workflow-designer/components/nodes/*Node.vue` 与 `components/edges/*Edge.vue`，系统会自动扫描注册。


