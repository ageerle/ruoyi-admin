# Workflow Designer 详细树状架构（带注释）

## 📁 包结构树（完整目录）

```text
workflow-designer/                                    # 工作流设计器包根目录
│
├─ 📄 StandaloneWorkflowDesigner.vue                  # 🎯 核心组件：画布与主交互容器
│   │   # 功能：拖拽画布、节点连线、属性编辑、保存运行
│   │   # 依赖：Vue Flow、Naive UI、内部工具函数
│   │   # 对外：Props(workflow/wfComponents/componentIdMap/saving) + Emits(save/run/deleteNode)
│   │
├─ 📄 index.ts                                        # 📤 包入口：默认导出主组件
│   │   # 导出：StandaloneWorkflowDesigner + 所有类型定义
│   │
├─ 📄 README.md                                       # 📖 使用说明与扩展指南
│   │   # 内容：基本用法、依赖说明、新增节点/边/属性面板的详细步骤
│   │
├─ 📄 ARCHITECTURE.md                                 # 🏗️ 架构说明（文字版）
│   │   # 内容：组件职责、数据流、集成方式、设计取舍
│   │
├─ 📄 ARCHITECTURE-TREE.md                           # 🌳 架构说明（树状版）
│   │   # 内容：包结构、核心关系、事件时序、扩展点
│   │
└─ 📄 ARCHITECTURE-DETAILED-TREE.md                  # 🌲 详细树状架构（本文）
│       # 内容：完整目录结构 + 详细功能注释
│
├─ 📁 components/                                     # 🧩 可视化组件集合
│   │   # 职责：节点渲染、边渲染、通用UI组件
│   │
│   ├─ 📁 nodes/                                      # 🔘 节点组件目录
│   │   │   # 约定：<Name>Node.vue → 自动注册为 name.toLowerCase()
│   │   │   # 回退：未提供时使用 NodeShell.vue 通用外观
│   │   │
│   │   ├─ 📄 AnswerNode.vue                          # 💬 回答节点：AI对话响应
│   │   │   # 功能：显示AI回答内容，支持流式输出
│   │   │   # 配置：prompt模板、模型选择、输出格式
│   │   │
│   │   ├─ 📄 ClassifierNode.vue                      # 🏷️ 分类节点：智能分类判断
│   │   │   # 功能：根据输入内容进行多分类判断
│   │   │   # 配置：分类类别、阈值设置、目标节点映射
│   │   │
│   │   ├─ 📄 Dalle3Node.vue                          # 🎨 图像生成节点：DALL-E 3
│   │   │   # 功能：根据文本描述生成图像
│   │   │   # 配置：提示词、图像尺寸、质量等级
│   │   │
│   │   ├─ 📄 DocumentExtractorNode.vue              # 📄 文档提取节点
│   │   │   # 功能：从文档中提取结构化信息
│   │   │   # 配置：提取规则、输出格式、字段映射
│   │   │
│   │   ├─ 📄 EndNode.vue                             # 🏁 结束节点：流程终点
│   │   │   # 功能：标记工作流结束，收集最终结果
│   │   │   # 配置：结果展示格式、输出变量
│   │   │
│   │   ├─ 📄 FaqExtractorNode.vue                    # ❓ FAQ提取节点
│   │   │   # 功能：从知识库中提取相关问答对
│   │   │   # 配置：相似度阈值、返回数量、知识库选择
│   │   │
│   │   ├─ 📄 GoogleNode.vue                          # 🔍 谷歌搜索节点
│   │   │   # 功能：执行谷歌搜索并返回结果
│   │   │   # 配置：搜索关键词、国家地区、语言、结果数量
│   │   │
│   │   ├─ 📄 KeywordExtractorNode.vue                # 🔑 关键词提取节点
│   │   │   # 功能：从文本中提取关键词
│   │   │   # 配置：提取算法、关键词数量、过滤条件
│   │   │
│   │   ├─ 📄 NodeShell.vue                           # 🐚 通用节点外壳（兜底组件）
│   │   │   # 功能：当未提供专属节点组件时的通用外观
│   │   │   # 特点：显示节点标题、图标、基本样式
│   │   │
│   │   ├─ 📄 StartNode.vue                           # 🚀 开始节点：流程起点
│   │   │   # 功能：工作流入口，接收初始输入
│   │   │   # 配置：欢迎语、输入字段定义、变量初始化
│   │   │
│   │   ├─ 📄 SwitcherNode.vue                        # 🔀 条件分支节点
│   │   │   # 功能：根据条件执行不同分支
│   │   │   # 配置：条件表达式、分支映射、默认分支
│   │   │
│   │   ├─ 📄 TemplateNode.vue                        # 📝 模板节点：文本模板处理
│   │   │   # 功能：使用模板引擎处理文本内容
│   │   │   # 配置：模板内容、变量替换、输出格式
│   │   │
│   │   ├─ 📄 TestNode.vue                            # 🧪 测试节点：调试用
│   │   │   # 功能：用于测试和调试工作流
│   │   │   # 配置：测试数据、验证规则、输出格式
│   │   │
│   │   └─ 📄 TongyiwanxNode.vue                       # 🎨 通义万相节点：阿里图像生成
│   │       # 功能：使用通义万相生成图像
│   │       # 配置：提示词、图像参数、风格设置
│   │
│   ├─ 📁 edges/                                      # 🔗 边组件目录
│   │   │   # 约定：<Name>Edge.vue → 自动注册为 name.toLowerCase()
│   │   │   # 用途：定义节点间的连接线样式和行为
│   │   │
│   │   ├─ 📄 CustomEdge.vue                          # 🎨 自定义边样式1
│   │   │   # 功能：自定义连接线外观和动画效果
│   │   │   # 特点：可配置颜色、粗细、动画类型
│   │   │
│   │   ├─ 📄 CustomEdge2.vue                         # 🎨 自定义边样式2
│   │   │   # 功能：另一种自定义连接线样式
│   │   │   # 特点：不同的视觉效果和交互行为
│   │   │
│   │   └─ 📄 SpecialEdge.vue                          # ⭐ 特殊边：默认连接线
│   │       # 功能：工作流中默认使用的连接线样式
│   │       # 特点：带动画效果、支持点击删除
│   │
│   ├─ 📄 CommonNodeHeader.vue                       # 📋 通用节点头部组件
│   │   # 功能：统一的节点标题栏样式
│   │   # 特点：图标、标题、操作按钮的标准化布局
│   │
│   ├─ 📄 RunDetail.vue                              # 📊 运行详情组件
│   │   # 功能：显示工作流运行时的详细信息
│   │   # 内容：执行状态、节点输出、错误信息、性能指标
│   │
│   ├─ 📄 RuntimeNodes.vue                           # ⚡ 运行时节点组件
│   │   # 功能：实时显示工作流执行过程中的节点状态
│   │   # 特点：动态更新、状态指示、进度显示
│   │
│   ├─ 📄 SvgIcon.vue                                # 🎯 SVG图标组件
│   │   # 功能：统一的图标渲染组件
│   │   # 特点：支持Iconify图标库、可自定义颜色和大小
│   │
│   └─ 📄 WfVariableSelector.vue                     # 🔧 工作流变量选择器
│       # 功能：选择和管理工作流中的变量
│       # 特点：变量类型识别、作用域管理、引用追踪
│
├─ 📁 panels/                                        # 🎛️ 面板组件目录
│   │   # 职责：提供各种功能面板和侧边栏
│   │
│   └─ 📄 RightPanel.vue                             # 📋 右侧属性面板
│       # 功能：显示和编辑选中节点的属性
│       # 特点：自动匹配专属属性组件、支持节点重命名
│       # 回退：未找到专属面板时使用通用属性表单
│
├─ 📁 properties/                                    # ⚙️ 属性配置目录
│   │   # 职责：节点属性面板和默认值配置
│   │   # 约定：<Name>NodeProperty.vue → 自动映射到节点类型
│   │
│   ├─ 📄 AnswerNodeProperty.vue                     # 💬 回答节点属性面板
│   │   # 功能：配置AI回答的参数和选项
│   │   # 配置项：提示词、模型选择、温度、最大长度等
│   │
│   ├─ 📄 ClassifierNodeProperty.vue                 # 🏷️ 分类节点属性面板
│   │   # 功能：配置分类器的参数和类别
│   │   # 配置项：分类类别、阈值、目标节点映射等
│   │
│   ├─ 📄 KeywordExtractorNodeProperty.vue           # 🔑 关键词提取属性面板
│   │   # 功能：配置关键词提取的参数
│   │   # 配置项：提取算法、关键词数量、过滤规则等
│   │
│   ├─ 📄 StartNodeProperty.vue                      # 🚀 开始节点属性面板
│   │   # 功能：配置工作流入口的参数
│   │   # 配置项：欢迎语、输入字段、变量初始化等
│   │
│   ├─ 📄 TestNodeProperty.vue                       # 🧪 测试节点属性面板
│   │   # 功能：配置测试节点的参数
│   │   # 配置项：测试数据、验证规则、输出格式等
│   │
│   ├─ 📄 GenericNodeProperty.vue                     # 🔧 通用属性面板（兜底）
│   │   # 功能：当未提供专属属性面板时的通用表单
│   │   # 特点：动态渲染nodeConfig中的所有字段
│   │
│   └─ 📄 defaults.ts                                # 📋 默认配置集中表
│       # 功能：集中管理所有节点的默认配置
│       # 结构：propertyDefaultGetters[name] = (workflow) => config
│       # 优先级：专属面板导出 > 此表 > 空对象
│
├─ 📁 store/                                         # 🗄️ 状态管理目录
│   │   # 职责：Pinia store，可选的状态管理
│   │   # 用途：工作流列表、运行实例、跨视图状态
│   │
│   └─ 📄 index.ts                                   # 🏪 Pinia Store定义
│       # 功能：管理工作流和运行时的状态
│       # 状态：工作流列表、运行实例、组件清单、活动状态
│       # 方法：CRUD操作、运行态维护、路由跳转注入
│
├─ 📁 types/                                         # 📝 类型定义目录
│   │   # 职责：TypeScript类型定义
│   │   # 内容：工作流、节点、边、UI结构等类型
│   │
│   └─ 📄 index.d.ts                                 # 📋 核心类型定义
│       # 类型：WorkflowInfo、WorkflowNode、WorkflowEdge、WorkflowComponent
│       # 用途：提供类型安全和IDE智能提示
│
└─ 📁 utils/                                         # 🛠️ 工具函数目录
    │   # 职责：通用工具函数和业务逻辑
    │   # 内容：节点/边操作、默认值处理、图标映射等
    │
    └─ 📄 workflow-util.ts                          # 🔧 工作流工具函数
        # 功能：节点/边创建、更新、删除、默认值注入
        # 工具：图标映射、UUID生成、深拷贝、输入类型转换
        # 核心：createNewNode、createNewEdge、getDefaultNodeConfig
```

## 🔄 数据流与状态管理树

```text
数据层架构
│
├─ 📊 业务数据层（WorkflowInfo）
│   ├─ nodes: WorkflowNode[]                         # 节点数据（业务层）
│   │   ├─ uuid: string                              # 节点唯一标识
│   │   ├─ wfComponent: WorkflowComponent            # 组件信息
│   │   ├─ workflowComponentId?: number               # 后端组件ID（兼容）
│   │   ├─ nodeConfig: Record<string, any>           # 节点配置参数
│   │   ├─ inputConfig: NodeIOConfig                 # 输入配置
│   │   ├─ outputConfig: Record<string, any>        # 输出配置
│   │   └─ positionX/Y: number                       # 节点坐标
│   │
│   ├─ edges: WorkflowEdge[]                         # 边数据（业务层）
│   │   ├─ uuid: string                              # 边唯一标识
│   │   ├─ sourceNodeUuid: string                    # 源节点ID
│   │   ├─ targetNodeUuid: string                    # 目标节点ID
│   │   └─ sourceHandle?: string                     # 源连接点
│   │
│   ├─ deleteNodes: string[]                         # 待删除节点ID列表
│   └─ deleteEdges: string[]                         # 待删除边ID列表
│
├─ 🎨 UI渲染层（UIWorkflow）
│   ├─ nodes: VueFlowNode[]                          # 画布节点（UI层）
│   │   ├─ id: string                                # 对应业务层uuid
│   │   ├─ type: string                              # 节点类型（小写）
│   │   ├─ data: WorkflowNode                        # 业务数据引用
│   │   └─ position: {x, y}                          # 画布坐标
│   │
│   └─ edges: VueFlowEdge[]                          # 画布边（UI层）
│       ├─ id: string                                # 对应业务层uuid
│       ├─ source: string                            # 源节点ID
│       ├─ target: string                            # 目标节点ID
│       ├─ type: string                              # 边类型
│       └─ data: WorkflowEdge                       # 业务数据引用
│
└─ 🔄 同步机制
    ├─ 坐标同步：UI层 → 业务层（拖拽结束时）
    ├─ 数据同步：业务层 → UI层（workflow变化时）
    ├─ 删除同步：UI操作 → 业务层deleteNodes/deleteEdges
    └─ 保存同步：业务层 → 宿主应用（emit save事件）
```

## 🎯 组件注册与映射树

```text
自动注册机制
│
├─ 🔘 节点组件注册
│   ├─ 扫描路径：components/nodes/*Node.vue
│   ├─ 注册方式：import.meta.glob('./components/nodes/*Node.vue', { eager: true })
│   ├─ 键名转换：<Name>Node.vue → name.toLowerCase()
│   │   ├─ AnswerNode.vue → 'answer'
│   │   ├─ ClassifierNode.vue → 'classifier'
│   │   ├─ StartNode.vue → 'start'
│   │   └─ ...（其他节点）
│   │
│   ├─ 回退机制：未找到专属组件 → NodeShell.vue
│   └─ 使用方式：nodeTypes[componentName.toLowerCase()]
│
├─ 🔗 边组件注册
│   ├─ 扫描路径：components/edges/*Edge.vue
│   ├─ 注册方式：import.meta.glob('./components/edges/*Edge.vue', { eager: true })
│   ├─ 键名转换：<Name>Edge.vue → name.toLowerCase()
│   │   ├─ CustomEdge.vue → 'custom'
│   │   ├─ CustomEdge2.vue → 'custom2'
│   │   └─ SpecialEdge.vue → 'special'
│   │
│   └─ 使用方式：edgeTypes[edgeType]（创建边时指定type）
│
└─ ⚙️ 属性面板注册
    ├─ 扫描路径：properties/*NodeProperty.vue
    ├─ 注册方式：import.meta.glob('../properties/*NodeProperty.vue', { eager: true })
    ├─ 键名转换：<Name>NodeProperty.vue → name.toLowerCase()
    │   ├─ AnswerNodeProperty.vue → 'answer'
    │   ├─ ClassifierNodeProperty.vue → 'classifier'
    │   └─ ...（其他属性面板）
    │
    ├─ 回退机制：未找到专属面板 → GenericNodeProperty.vue
    └─ 使用方式：propertyMap[nodeType] || GenericNodeProperty
```

## 🔧 默认值配置树

```text
默认值注入机制（三级优先级）
│
├─ 🥇 第一优先级：专属属性面板导出
│   ├─ 位置：properties/<Name>NodeProperty.vue
│   ├─ 导出：export function getDefaultNodeConfig(workflow: WorkflowInfo)
│   ├─ 示例：AnswerNodeProperty.vue 中导出回答节点的默认配置
│   └─ 优势：节点专属、可访问workflow上下文
│
├─ 🥈 第二优先级：集中配置表
│   ├─ 位置：properties/defaults.ts
│   ├─ 结构：propertyDefaultGetters[name] = (workflow) => config
│   ├─ 示例：
│   │   ├─ start: (wf) => ({ prologue: '欢迎使用工作流' })
│   │   ├─ answer: (wf) => ({ prompt: '', model_name: 'gpt-3.5-turbo' })
│   │   └─ classifier: (wf) => ({ categories: [] })
│   │
│   └─ 优势：集中管理、易于维护
│
├─ 🥉 第三优先级：内置默认表（已注释，不建议使用）
│   ├─ 位置：utils/workflow-util.ts（注释部分）
│   ├─ 结构：simpleDefaults[name] = config
│   └─ 状态：已注释，保留作为参考
│
└─ 🔄 兜底机制：空对象 {}
    ├─ 触发：所有优先级都未提供配置时
    ├─ 结果：nodeConfig = {}
    └─ 影响：仍可正常渲染和保存，只是没有默认值
```

## 🎨 图标与样式映射树

```text
视觉映射系统
│
├─ 🎯 图标映射（getIconByComponentName）
│   ├─ answer → 'carbon:question-answering'          # 问答图标
│   ├─ classifier → 'carbon:type-pattern'            # 分类图标
│   ├─ start → 'carbon:play-outline'                 # 开始图标
│   ├─ end → 'carbon:closed-caption'                 # 结束图标
│   ├─ httprequest → 'carbon:http'                   # HTTP请求图标
│   ├─ dalle3 → 'solar:pallete-2-linear'             # 图像生成图标
│   └─ ...（其他节点图标）
│
├─ 🎨 颜色映射（getIconClassByComponentName）
│   ├─ answer → 'text-green-800'                     # 绿色
│   ├─ classifier → 'text-violet-900'                # 紫色
│   ├─ start → 'text-blue-900'                       # 蓝色
│   ├─ end → 'text-orange-800'                       # 橙色
│   ├─ httprequest → 'text-slate-800'                # 灰色
│   ├─ dalle3 → 'text-fuchsia-700'                   # 紫红色
│   └─ ...（其他节点颜色）
│
└─ 🔧 扩展方式
    ├─ 新增节点时在工具函数中添加映射
    ├─ 图标使用Iconify格式：'collection:icon-name'
    ├─ 颜色使用Tailwind类名：'text-color-shade'
    └─ 未配置时显示默认样式
```

## 🚀 对外集成API树

```text
宿主应用集成接口
│
├─ 📥 Props（输入）
│   ├─ workflow: WorkflowInfo                        # 工作流数据
│   │   ├─ 来源：后端API或新建
│   │   ├─ 内容：nodes、edges、deleteNodes、deleteEdges
│   │   └─ 更新：通过emit save事件持久化
│   │
│   ├─ wfComponents: WorkflowComponent[]             # 可用组件清单
│   │   ├─ 用途：决定左侧面板显示内容
│   │   ├─ 结构：{ name: string, title: string, remark?: string }
│   │   └─ 影响：自动注册节点类型
│   │
│   ├─ componentIdMap: Record<number, string>        # 组件ID映射
│   │   ├─ 用途：后端只返回workflowComponentId时的兼容
│   │   ├─ 结构：{ 1: 'Start', 2: 'Answer', ... }
│   │   └─ 回退：未映射时显示'Unknown'
│   │
│   └─ saving?: boolean                              # 保存状态
│       ├─ 用途：控制保存按钮loading/禁用状态
│       ├─ 默认：false
│       └─ 建议：宿主在保存过程中设为true
│
├─ 📤 Emits（输出）
│   ├─ save(workflow: WorkflowInfo)                  # 保存事件
│   │   ├─ 触发：用户点击保存按钮
│   │   ├─ 数据：完整的workflow对象（含坐标同步）
│   │   └─ 职责：宿主负责持久化到后端
│   │
│   ├─ run(payload: { workflow: WorkflowInfo })     # 运行事件
│   │   ├─ 触发：用户点击运行按钮
│   │   ├─ 数据：包含workflow的运行参数
│   │   └─ 职责：宿主负责触发工作流执行
│   │
│   └─ deleteNode(nodeUuid: string)                   # 节点删除事件
│       ├─ 触发：节点被删除时
│       ├─ 数据：被删除节点的UUID
│       └─ 用途：宿主可监听进行额外处理
│
└─ 🗄️ Store（可选）
    ├─ setWorkflowDesignerNavigator(fn)               # 路由注入
    │   ├─ 用途：避免直接耦合宿主路由
    │   ├─ 参数：路由跳转函数
    │   └─ 使用：store内部调用进行页面跳转
    │
    └─ useWfStore()                                   # Pinia Store
        ├─ 状态：工作流列表、运行实例、组件清单
        ├─ 方法：CRUD操作、运行态维护
        └─ 注意：主组件不强制依赖，宿主可选使用
```

## 🔄 关键交互时序树

```text
用户操作流程
│
├─ 🚀 初始化流程
│   ├─ 1. 宿主传入workflow和wfComponents
│   ├─ 2. 组件onMounted触发
│   ├─ 3. 自动扫描nodes/edges组件并注册
│   ├─ 4. 调用renderGraph()转换数据
│   ├─ 5. 校验节点/边有效性
│   ├─ 6. 写入uiWorkflow并渲染画布
│   └─ 7. 调用fitView()适应画布
│
├─ 🎯 拖拽新增节点流程
│   ├─ 1. 用户从左侧面板拖拽组件
│   ├─ 2. onPaletteDragStart设置拖拽数据
│   ├─ 3. 拖拽到画布触发onDrop
│   ├─ 4. 计算画布坐标位置
│   ├─ 5. 调用createNewNode创建节点
│   │   ├─ 生成UUID和默认配置
│   │   ├─ 推入workflow.nodes
│   │   └─ 推入uiWorkflow.nodes
│   ├─ 6. 自动选中新节点
│   └─ 7. 显示RightPanel属性面板
│
├─ 🔗 连线操作流程
│   ├─ 1. 用户拖拽节点连接点
│   ├─ 2. Vue Flow触发onConnect事件
│   ├─ 3. 调用createNewEdge创建边
│   │   ├─ 生成边UUID
│   │   ├─ 推入workflow.edges
│   │   └─ 推入uiWorkflow.edges
│   └─ 4. 画布显示连接线
│
├─ ⚙️ 属性编辑流程
│   ├─ 1. 用户点击节点选中
│   ├─ 2. onNodeClick触发
│   ├─ 3. 设置selectedWfNode
│   ├─ 4. 显示RightPanel
│   ├─ 5. 自动匹配专属属性组件
│   │   ├─ 查找properties/<Name>NodeProperty.vue
│   │   └─ 未找到则使用GenericNodeProperty
│   ├─ 6. 用户编辑nodeConfig
│   └─ 7. 实时更新workflow.nodes中的数据
│
├─ 💾 保存流程
│   ├─ 1. 用户点击保存按钮
│   ├─ 2. onSave触发
│   ├─ 3. 同步画布坐标到workflow.nodes
│   ├─ 4. 去重deleteEdges数组
│   ├─ 5. emit('save', workflow)
│   └─ 6. 宿主接收并持久化到后端
│
└─ 🗑️ 删除操作流程
    ├─ 删除节点：
    │   ├─ 1. 调用onDeleteNode
    │   ├─ 2. 从workflow.nodes中移除
    │   ├─ 3. 从uiWorkflow.nodes中移除
    │   ├─ 4. 级联删除相关边
    │   ├─ 5. 记录到deleteEdges
    │   └─ 6. emit('deleteNode', nodeUuid)
    │
    └─ 删除边：
        ├─ 1. 用户点击边
        ├─ 2. onEdgeClick触发
        ├─ 3. 从workflow.edges中移除
        ├─ 4. 从uiWorkflow.edges中移除
        └─ 5. 记录到deleteEdges
```

## 🎯 扩展开发指南树

```text
扩展开发步骤
│
├─ 🔘 新增节点类型
│   ├─ 1. 在wfComponents中添加组件定义
│   │   └─ { name: 'MyNode', title: '我的节点' }
│   │
│   ├─ 2. 可选：创建专属节点组件
│   │   ├─ 文件：components/nodes/MyNode.vue
│   │   ├─ 内容：节点外观、Handle连接点
│   │   └─ 回退：未提供则使用NodeShell
│   │
│   ├─ 3. 可选：创建专属属性面板
│   │   ├─ 文件：properties/MyNodeProperty.vue
│   │   ├─ 内容：编辑wfNode.nodeConfig
│   │   └─ 回退：未提供则使用GenericNodeProperty
│   │
│   ├─ 4. 可选：提供默认配置
│   │   ├─ 方式A：在属性面板中导出getDefaultNodeConfig
│   │   ├─ 方式B：在defaults.ts中添加映射
│   │   └─ 回退：空对象{}
│   │
│   └─ 5. 可选：添加图标和颜色映射
│       ├─ 在getIconByComponentName中添加case
│       └─ 在getIconClassByComponentName中添加case
│
├─ 🔗 新增边类型
│   ├─ 1. 创建边组件文件
│   │   └─ components/edges/MyEdge.vue
│   │
│   ├─ 2. 实现边的外观和交互
│   │   ├─ 样式：颜色、粗细、动画
│   │   └─ 交互：点击、悬停效果
│   │
│   └─ 3. 在创建边时指定type
│       └─ createNewEdge({ ..., type: 'myedge' })
│
└─ 📝 类型扩展
    ├─ 1. 在types/index.d.ts中扩展类型
    │   ├─ 新增WorkflowComponent类型
    │   └─ 定义节点nodeConfig的TypeScript接口
    │
    └─ 2. 提供类型安全的开发体验
        ├─ IDE智能提示
        ├─ 编译时类型检查
        └─ 重构时的类型安全
```

## 🏗️ 架构设计原则树

```text
设计原则与取舍
│
├─ 🎯 核心原则
│   ├─ 最小耦合：不包含鉴权、路由、接口等全局逻辑
│   ├─ 约定优先：通过文件命名约定自动注册组件
│   ├─ 分层设计：业务层与UI层分离，提高可控性
│   └─ 扩展友好：新增节点/边/面板成本最低
│
├─ 🔄 数据流设计
│   ├─ 单向数据流：workflow → uiWorkflow → 用户操作 → workflow
│   ├─ 状态同步：UI层变化实时写回业务层
│   ├─ 删除标记：通过deleteNodes/deleteEdges标记删除
│   └─ 坐标管理：以画布为准，保存时同步到业务层
│
├─ 🧩 组件设计
│   ├─ 自动注册：扫描文件系统，按约定注册组件
│   ├─ 回退机制：未提供专属组件时使用通用组件
│   ├─ 组合模式：主组件组合各种子组件
│   └─ 职责单一：每个组件只负责特定功能
│
├─ 🔧 工具函数设计
│   ├─ 纯函数：工具函数无副作用，易于测试
│   ├─ 默认值链：三级优先级的默认值注入
│   ├─ 类型安全：提供完整的TypeScript类型定义
│   └─ 错误处理：优雅处理异常情况
│
└─ 🎨 用户体验设计
    ├─ 即时反馈：操作立即反映在UI上
    ├─ 状态保持：页面刷新后状态不丢失
    ├─ 错误恢复：异常情况下能正常回退
    └─ 性能优化：避免不必要的重渲染
```
