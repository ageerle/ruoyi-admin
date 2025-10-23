# 知识图谱前端模块

## 📁 目录结构

```
web/apps/web-antd/src/
├── api/operator/graph/              # 图谱API接口层
│   ├── index.ts                     # API接口定义
│   └── model.d.ts                   # TypeScript类型定义
│
├── views/operator/
│   ├── graphInstance/               # 图谱实例管理
│   │   ├── index.vue                # 实例列表页
│   │   ├── graph-instance-modal.vue # 创建/编辑弹窗
│   │   ├── data.ts                  # 表格和表单配置
│   │   └── README.md                # 本文档
│   │
│   ├── graphVisualization/          # 图谱可视化
│   │   ├── index.vue                # 可视化主页
│   │   └── components/
│   │       └── GraphCanvas.vue      # 图谱画布组件
│   │
│   └── graphRAG/                    # 图谱检索测试
│       └── index.vue                # 检索测试页
│
└── locales/langs/zh-CN/
    └── menu.json                    # 菜单国际化配置
```

## 🚀 功能模块

### 1. 图谱实例管理 (`graphInstance/`)

**功能描述**: 管理知识图谱实例的完整生命周期

**核心功能**:
- ✅ 图谱实例列表展示（VxeGrid表格）
- ✅ 创建/编辑图谱实例（Modal表单）
- ✅ 图谱构建和重建
- ✅ 构建进度实时监控（轮询状态）
- ✅ 批量删除
- ✅ 数据导出

**关键组件**:
- `index.vue`: 主列表页，包含表格、搜索、操作按钮
- `graph-instance-modal.vue`: 弹窗表单，支持创建和编辑
- `data.ts`: 表格列配置、查询Schema、表单Schema

**API接口**:
- `graphInstanceList()` - 获取实例列表
- `graphInstanceAdd()` - 创建实例
- `graphInstanceUpdate()` - 更新实例
- `graphInstanceRemove()` - 删除实例
- `graphInstanceBuild()` - 构建图谱
- `graphInstanceRebuild()` - 重建图谱
- `graphInstanceStatus()` - 获取构建状态

**状态说明**:
- `NOT_BUILT` - 未构建（灰色标签）
- `BUILDING` - 构建中（蓝色标签 + 进度条）
- `COMPLETED` - 已完成（绿色标签）
- `FAILED` - 失败（红色标签）

### 2. 图谱可视化 (`graphVisualization/`)

**功能描述**: 交互式知识图谱可视化展示

**核心功能**:
- ✅ 图谱渲染（基于@antv/g6）
- ✅ 多种布局算法（力导向、层次、环形、辐射）
- ✅ 实体搜索和高亮
- ✅ 节点/边点击查看详情
- ✅ 图谱统计信息展示
- ✅ 实体类型图例
- ✅ 导出图片功能

**关键组件**:
- `index.vue`: 主页面，包含工具栏和画布
- `components/GraphCanvas.vue`: G6图谱画布组件

**技术方案**:
- 使用 `@antv/g6` 图可视化引擎
- 支持动态布局切换
- 节点颜色根据实体类型映射
- 支持拖拽、缩放、平移等交互

**实体类型颜色映射**:
```typescript
PERSON: '#5B8FF9'        // 人物 - 蓝色
ORGANIZATION: '#5AD8A6'  // 组织 - 绿色
LOCATION: '#5D7092'      // 地点 - 灰蓝
EVENT: '#F6BD16'         // 事件 - 橙色
CONCEPT: '#E86452'       // 概念 - 红色
PRODUCT: '#6DC8EC'       // 产品 - 青色
TECHNOLOGY: '#945FB9'    // 技术 - 紫色
```

### 3. 图谱检索测试 (`graphRAG/`)

**功能描述**: 测试图谱的实体抽取、文本入库和检索功能

**核心功能**:
- ✅ 实体抽取测试（从文本中提取实体和关系）
- ✅ 文本入库测试（将文本入库到图谱）
- ✅ 图谱检索测试（基于查询检索图谱）
- ✅ 支持选择LLM模型
- ✅ 结果可视化展示

**API接口**:
- `graphExtractEntities()` - 实体抽取
- `graphIngestText()` - 文本入库
- `graphRetrieve()` - 图谱检索

## 📦 依赖安装

### 必需依赖

```bash
cd web
pnpm add @antv/g6 -F @vben/web-antd
```

### 可选依赖

如果需要更高级的图谱功能：

```bash
# 3D图谱展示
pnpm add echarts-gl -F @vben/web-antd

# 复杂图算法
pnpm add d3 -F @vben/web-antd
```

## 🔧 配置说明

### 1. 路由配置

需要在后端系统中配置菜单权限（通过系统管理 -> 菜单管理）：

```
运营管理
  ├── 知识库管理
  └── 图谱管理
      ├── 图谱实例      (/operator/graphInstance)
      ├── 图谱可视化    (/operator/graphVisualization)
      └── 图谱检索测试  (/operator/graphRAG)
```

### 2. 权限代码

```typescript
// 图谱实例管理
'operator:graph:list'    // 查看列表
'operator:graph:add'     // 新建
'operator:graph:edit'    // 编辑
'operator:graph:remove'  // 删除
'operator:graph:build'   // 构建
'operator:graph:rebuild' // 重建
'operator:graph:export'  // 导出

// 图谱可视化
'operator:graph:view'    // 查看图谱

// 图谱检索
'operator:graph:extract' // 实体抽取
'operator:graph:ingest'  // 文本入库
'operator:graph:retrieve'// 图谱检索
```

### 3. 国际化配置

已在 `locales/langs/zh-CN/menu.json` 中添加：

```json
{
  "graph": {
    "root": "图谱管理",
    "instance": "图谱实例",
    "visualization": "图谱可视化",
    "rag": "图谱检索测试"
  }
}
```

## 🎨 UI组件使用

### Vben Admin组件

- `Page` - 页面容器
- `VbenForm` - 表单组件
- `useVbenModal` - 弹窗Hook
- `useVbenVxeGrid` - 表格Hook

### Ant Design Vue组件

- `Card` - 卡片容器
- `Table` / `VxeGrid` - 表格
- `Form` - 表单
- `Modal` / `Drawer` - 弹窗/抽屉
- `Button` - 按钮
- `Input` / `Select` - 输入组件
- `Tag` - 标签
- `Progress` - 进度条
- `Spin` - 加载状态

## 🔌 API接口说明

### 图谱实例管理

```typescript
// 获取列表
graphInstanceList(params?: any): Promise<any>

// 创建实例
graphInstanceAdd(data: Partial<GraphInstance>): Promise<any>

// 更新实例
graphInstanceUpdate(data: Partial<GraphInstance>): Promise<any>

// 删除实例
graphInstanceRemove(id: string | string[]): Promise<any>

// 获取详情
graphInstanceInfo(id: string): Promise<GraphInstance>

// 构建图谱
graphInstanceBuild(id: string): Promise<any>

// 重建图谱
graphInstanceRebuild(id: string): Promise<any>

// 获取构建状态
graphInstanceStatus(id: string): Promise<GraphBuildTask>
```

### 图谱查询

```typescript
// 获取图谱数据
graphQueryByKnowledge(knowledgeId: string, limit?: number): Promise<GraphData>

// 搜索实体
graphSearchEntity(params: SearchParams): Promise<GraphNode[]>

// 获取邻居节点
graphGetNeighbors(params: NeighborQueryParams): Promise<GraphData>

// 查找路径
graphFindPath(params: PathQueryParams): Promise<GraphPath[]>

// 获取统计信息
graphGetStats(knowledgeId: string): Promise<GraphStats>
```

### 图谱RAG

```typescript
// 实体抽取
graphExtractEntities(data: ExtractParams): Promise<ExtractionResult>

// 文本入库
graphIngestText(data: IngestParams): Promise<ExtractionResult>

// 图谱检索
graphRetrieve(data: RetrieveParams): Promise<GraphRetrievalResult>
```

## 🐛 常见问题

### 1. G6初始化失败

**问题**: 控制台报错 `Cannot find module '@antv/g6'`

**解决方案**:
```bash
cd web
pnpm add @antv/g6 -F @vben/web-antd
```

### 2. 图谱渲染空白

**问题**: 图谱画布显示空白

**可能原因**:
- 数据格式不正确
- 容器尺寸为0
- 节点ID重复

**解决方案**:
- 检查 `graphData` 格式是否符合 `GraphData` 类型
- 确保容器有明确的宽高
- 确保节点ID唯一

### 3. 构建状态不更新

**问题**: 点击构建后状态不更新

**可能原因**:
- 轮询未启动
- 后端接口返回错误

**解决方案**:
- 检查 `startPollingStatus` 是否被调用
- 查看浏览器控制台网络请求
- 检查后端日志

### 4. 权限按钮不显示

**问题**: 操作按钮不显示

**可能原因**:
- 权限代码未配置
- 用户角色无权限

**解决方案**:
- 在系统管理 -> 菜单管理中配置权限
- 在系统管理 -> 角色管理中分配权限

## 📝 开发建议

### 1. 性能优化

- 大图谱（>1000节点）启用虚拟渲染
- 使用Web Worker进行布局计算
- 实现节点懒加载
- 缓存已加载的图谱数据

### 2. 用户体验

- 添加加载状态和骨架屏
- 提供友好的错误提示
- 实现操作撤销功能
- 支持快捷键操作

### 3. 代码规范

- 遵循Vue 3 Composition API规范
- 使用TypeScript类型定义
- 添加必要的注释
- 统一错误处理

## 🔗 相关文档

- [Vben Admin文档](https://doc.vben.pro/)
- [Ant Design Vue文档](https://antdv.com/)
- [G6图可视化文档](https://g6.antv.antgroup.com/)
- [Vue 3文档](https://cn.vuejs.org/)
- [TypeScript文档](https://www.typescriptlang.org/)

## 📄 License

MIT License

