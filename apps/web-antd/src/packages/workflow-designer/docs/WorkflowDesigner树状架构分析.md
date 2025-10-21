# Workflow Designer 树状架构分析

## 1) 包结构树

```text
workflow-designer/
├─ StandaloneWorkflowDesigner.vue        # 画布与主交互容器（核心）
├─ index.ts                              # 默认导出组件
├─ ARCHITECTURE.md                       # 架构说明（文字版）
├─ ARCHITECTURE-TREE.md                  # 架构说明（树状版，本文）
│
├─ components/                           # 可视化节点/边与通用组件
│  ├─ nodes/
│  │  ├─ AnswerNode.vue
│  │  ├─ ClassifierNode.vue
│  │  ├─ Dalle3Node.vue
│  │  ├─ DocumentExtractorNode.vue
│  │  ├─ EndNode.vue
│  │  ├─ FaqExtractorNode.vue
│  │  ├─ GoogleNode.vue
│  │  ├─ KeywordExtractorNode.vue
│  │  ├─ NodeShell.vue                   # 未提供专属节点时的通用外观
│  │  ├─ StartNode.vue
│  │  ├─ SwitcherNode.vue
│  │  ├─ TemplateNode.vue
│  │  ├─ TestNode.vue
│  │  └─ TongyiwanxNode.vue
│  ├─ edges/
│  │  ├─ CustomEdge.vue
│  │  ├─ CustomEdge2.vue
│  │  └─ SpecialEdge.vue
│  ├─ CommonNodeHeader.vue
│  ├─ RunDetail.vue
│  ├─ RuntimeNodes.vue
│  ├─ SvgIcon.vue
│  └─ WfVariableSelector.vue
│
├─ panels/
│  └─ RightPanel.vue                     # 右侧属性面板（自动解析专属面板）
│
├─ properties/                           # 节点属性面板与默认值
│  ├─ AnswerNodeProperty.vue
│  ├─ ClassifierNodeProperty.vue
│  ├─ KeywordExtractorNodeProperty.vue
│  ├─ StartNodeProperty.vue
│  ├─ TestNodeProperty.vue
│  ├─ GenericNodeProperty.vue            # 通用（动态）属性面板
│  └─ defaults.ts                        # 默认配置集中映射表
│
├─ store/
│  └─ index.ts                           # Pinia Store（可选集成）
│
├─ types/
│  └─ index.d.ts                         # Workflow/Node/Edge 等类型定义
│
└─ utils/
   └─ workflow-util.ts                   # 节点/边创建、默认值/图标映射、辅助函数
```

## 2) 核心关系树（模块依赖与数据流）

```text
StandaloneWorkflowDesigner.vue
├─ Props
│  ├─ workflow: WorkflowInfo
│  ├─ wfComponents: WorkflowComponent[]
│  ├─ componentIdMap: Record<number, string>
│  └─ saving?: boolean
├─ Emits
│  ├─ save(workflow)
│  ├─ run({ workflow })
│  └─ deleteNode(nodeUuid)
├─ 自动注册
│  ├─ nodes: import.meta.glob(components/nodes/*Node.vue) → nodeTypes
│  └─ edges: import.meta.glob(components/edges/*Edge.vue) → edgeTypes
├─ 组合
│  └─ RightPanel.vue（属性面板）
├─ 工具依赖
│  └─ utils/workflow-util.ts（createNewNode/createNewEdge/...）
└─ 数据层
   ├─ 输入：WorkflowInfo（业务层）
   ├─ 派生：UIWorkflow（画布层）
   └─ 同步：拖拽/连线/删除/保存 → 写回 WorkflowInfo

RightPanel.vue
├─ 自动匹配属性组件：properties/<Name>NodeProperty.vue（文件名 → 小写键）
└─ 回退：GenericNodeProperty.vue

properties/
├─ <Name>NodeProperty.vue（专属面板，可导出 getDefaultNodeConfig）
├─ GenericNodeProperty.vue（通用表单）
└─ defaults.ts（propertyDefaultGetters：集中默认值表）

utils/workflow-util.ts
├─ emptyWorkflowInfo / emptyWorkflowNode / createUuid
├─ createNewNode / createNewEdge / updateEdgeBySourceHandle / deleteEdgesBySourceHandle
├─ getIconByComponentName / getIconClassByComponentName
└─ 默认值决策链：专属导出 > defaults.ts > 空对象

types/index.d.ts
├─ WorkflowInfo（nodes/edges/deleteNodes/deleteEdges/...）
├─ WorkflowNode（wfComponent/workflowComponentId/inputConfig/nodeConfig/...）
├─ WorkflowEdge（uuid/sourceNodeUuid/targetNodeUuid/...）
└─ UIWorkflow（画布层 nodes/edges）

store/index.ts（可选）
├─ state：工作流列表/运行实例/组件清单/活动态等
├─ getters：按 uuid/id 查找工作流、起始节点、运行节点
└─ actions：增删改查、运行态维护、路由跳转注入 setWorkflowDesignerNavigator
```

## 3) 事件与时序树（关键交互）

```text
初始化
└─ onMounted → renderGraph → fitView

拖拽新增节点
└─ onPaletteDragStart → onDrop → createNewNode → 选中节点 → 显示 RightPanel

连线/改线/删线
├─ onConnect → createNewEdge（同步 UI 与 WorkflowInfo）
├─ updateEdgeBySourceHandle（按源 Handle 改线）
└─ onEdgeClick → 删除边（记录 deleteEdges 去重）

节点交互
├─ onNodeClick（选择并显示属性面板）
├─ onNodeDragStop（写回 positionX/Y）
└─ 删除节点 → 级联删除相关边 → 记录 deleteNodes/deleteEdges

保存/运行
├─ onSave → 同步画布坐标 → 去重 deleteEdges → emits.save(workflow)
└─ onRun  → emits.run({ workflow })
```

## 4) 扩展点树（约定优先）

```text
新增节点（Node）
├─ 宿主传入 wfComponents 追加 { name, title }
├─ 可选：components/nodes/<Name>Node.vue（自动注册），否则回退 NodeShell
└─ 属性面板：properties/<Name>NodeProperty.vue（可导出 getDefaultNodeConfig）

新增边（Edge）
└─ components/edges/<Name>Edge.vue（自动注册；通过 edgeTypes 使用）

默认值
└─ 优先级：专属面板导出 > properties/defaults.ts > {}

图标/颜色
└─ utils/workflow-util.ts：getIconByComponentName / getIconClassByComponentName

类型扩展
└─ types/index.d.ts：补充 WorkflowComponent、节点 nodeConfig 类型等
```

## 5) 对外 API（宿主集成）

- Props：`workflow`、`wfComponents`、`componentIdMap`、`saving`
- Emits：`save(workflow)`、`run({ workflow })`、`deleteNode(nodeUuid)`
- Store（可选）：`setWorkflowDesignerNavigator()` 注入路由跳转
