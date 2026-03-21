# 工作流管理模块

## 📁 目录结构

```
workflow/
├── index.vue           # 工作流列表页面（主页面）
├── edit.vue            # 工作流编辑页面
├── run.vue             # 工作流运行页面
├── data.ts             # 表格列定义和查询表单配置
└── README.md           # 本文档
```

## 🎯 页面说明

### 1. 工作流列表页面 (index.vue)

**路由：** `/workflow`

**功能：**
- ✅ 展示所有工作流（我的工作流和公开工作流）
- ✅ 搜索和过滤工作流
- ✅ 新建工作流
- ✅ 编辑、运行、删除工作流
- ✅ 批量删除工作流
- ✅ 分页展示

**设计风格：** 参考系统模型页面，使用VxeGrid表格

### 2. 工作流编辑页面 (edit.vue)

**路由：** `/workflow/edit/:uuid`

**功能：**
- ✅ 加载指定工作流数据
- ✅ 可视化编辑工作流（拖拽节点、连接线等）
- ✅ 保存工作流（保存后自动返回列表页）
- ✅ 取消编辑（提示确认，返回列表页）
- ✅ 显示页面标题和返回按钮

**组件：** 使用 `WorkflowDesigner` 组件进行编辑

### 3. 工作流运行页面 (run.vue)

**路由：** `/workflow/run/:uuid`

**功能：**
- ✅ 加载工作流数据
- ✅ 运行工作流
- ✅ 展示运行结果和日志
- ✅ 支持人工反馈

**组件：** 使用 `RunDetail` 组件展示运行详情

## 🔄 业务流程

### 新建工作流

```
列表页 -> 点击"新建工作流" -> 后台创建 -> 跳转到编辑页 -> 编辑 -> 保存 -> 返回列表页
```

### 编辑工作流

```
列表页 -> 点击"编辑" -> 跳转到编辑页 -> 编辑 -> 保存 -> 返回列表页
```

### 运行工作流

```
列表页 -> 点击"运行" -> 跳转到运行页 -> 运行并展示结果
```

## 📊 数据结构

### WorkflowInfo 工作流信息

```typescript
interface WorkflowInfo {
  uuid: string;                    // 工作流唯一标识
  title: string;                   // 工作流名称
  remark?: string;                 // 备注
  isPublic: boolean;               // 是否公开
  nodes: WorkflowNode[];           // 节点列表
  edges: WorkflowEdge[];           // 连线列表
  createTime?: string;             // 创建时间
  updateTime?: string;             // 更新时间
}
```

## 🔌 API 接口

### 列表页使用的接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `workflowPage` | POST | 分页查询工作流列表 |
| `workflowAdd` | POST | 新建工作流 |
| `workflowUpdate` | POST | 更新工作流 |
| `workflowDel` | POST | 删除工作流 |

### 编辑页使用的接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `workflowGet` | GET | 获取工作流详情 |
| `workflowUpdate` | POST | 保存工作流 |
| `workflowComponents` | GET | 获取组件列表 |

### 运行页使用的接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `workflowGet` | GET | 获取工作流详情 |
| `workflowRuntimeResume` | POST | 恢复运行（人工反馈） |

## 🎨 样式风格

### 列表页
- 使用 `Page` 组件包裹
- 使用 `VxeGrid` 表格展示数据
- 使用 `ghost-button` 按钮进行操作
- 搜索表单采用响应式布局（grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4）

### 编辑页
- 使用 `Page` 组件包裹，显示标题和返回按钮
- 全屏展示工作流设计器
- 设计器高度：`calc(100vh - 120px)`

### 运行页
- 使用 `Page` 组件包裹，显示标题和返回按钮
- 居中展示运行详情
- 最大宽度：800px

## 🚀 使用示例

### 跳转到编辑页

```typescript
import { useRouter } from 'vue-router';

const router = useRouter();

// 编辑现有工作流
router.push({
  name: 'WorkflowEdit',
  params: { uuid: workflowUuid },
});
```

### 跳转到运行页

```typescript
// 运行工作流
router.push({
  name: 'WorkflowRun',
  params: { uuid: workflowUuid },
});
```

### 返回列表页

```typescript
// 从编辑页或运行页返回
router.push({ name: 'Workflow' });
```

## ⚠️ 注意事项

1. **保存自动返回：** 编辑页保存成功后会自动返回列表页
2. **取消提示：** 点击返回按钮会提示确认，防止误操作导致数据丢失
3. **加载状态：** 编辑页和运行页在加载数据时会显示loading状态
4. **错误处理：** 所有API调用都包含错误处理，失败时会显示错误消息

## 📝 TODO

- [ ] 添加工作流模板功能
- [ ] 支持工作流导入导出
- [ ] 添加工作流版本管理
- [ ] 优化运行日志展示

