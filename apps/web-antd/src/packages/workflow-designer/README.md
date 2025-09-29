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
- uuid
- @vue-flow/core 与 @vue-flow/background

3. 可选：若你已有 `SvgIcon` 组件，可替换 `components/SvgIcon.vue` 的实现。

## 说明

- 不包含鉴权、用户判断、接口请求等逻辑；对外通过 emits 暴露 `save`、`run` 事件。
- 完整样式与交互来自原工作流模块，做了最小化改造以去除外部依赖。


