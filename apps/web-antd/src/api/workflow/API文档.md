# 工作流管理 API 接口文档

## 1. 获取工作流详情

### 基本信息

- **接口URL**: `/workflow/get/{uuid}`
- **请求方式**: `GET`
- **接口描述**: 根据工作流UUID获取工作流的完整信息，包括节点、连线、配置等
- **权限要求**: 需要登录，只能获取自己创建的工作流或公开的工作流

### 请求参数

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uuid | String | 是 | 工作流的唯一标识符 |

#### 请求示例

```http
GET /workflow/get/workflow-1698745623456 HTTP/1.1
Host: api.example.com
Authorization: Bearer {token}
```

### 响应数据

#### 响应结构

```typescript
{
  code: number;           // 状态码，200表示成功
  msg: string;            // 响应消息
  data: {
    uuid: string;         // 工作流UUID
    title: string;        // 工作流名称
    remark: string;       // 备注说明
    isPublic: boolean;    // 是否公开
    nodes: Array<{        // 节点列表
      uuid: string;       // 节点UUID
      title: string;      // 节点名称
      workflowUuid: string;           // 所属工作流UUID
      workflowComponentId: number;    // 工作流组件ID
      wfComponent: {                  // 工作流组件信息
        name: string;                 // 组件名称（如：Start、Answer等）
        title: string;                // 组件显示名称
        remark: string;               // 组件说明
        isEnable: boolean;            // 是否启用
      };
      inputConfig: {                  // 输入配置
        user_inputs: Array<any>;      // 用户输入配置
        ref_inputs: Array<any>;       // 引用输入配置
      };
      nodeConfig: {                   // 节点配置（根据不同组件类型有不同字段）
        [key: string]: any;
      };
      outputConfig: {                 // 输出配置
        [key: string]: any;
      };
      positionX: number;              // 节点X坐标
      positionY: number;              // 节点Y坐标
    }>;
    edges: Array<{        // 连线列表
      uuid: string;       // 连线UUID
      source: string;     // 源节点UUID
      target: string;     // 目标节点UUID
      sourceHandle?: string;  // 源节点连接点ID（可选）
      targetHandle?: string;  // 目标节点连接点ID（可选）
      label?: string;         // 连线标签（可选）
    }>;
    createTime: string;   // 创建时间（ISO 8601格式）
    updateTime: string;   // 更新时间（ISO 8601格式）
    createBy: string;     // 创建人
    updateBy: string;     // 更新人
  };
}
```

#### 响应示例

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "uuid": "workflow-1698745623456",
    "title": "客服问答工作流",
    "remark": "用于处理客户常见问题",
    "isPublic": false,
    "nodes": [
      {
        "uuid": "node-start-1",
        "title": "开始",
        "workflowUuid": "workflow-1698745623456",
        "workflowComponentId": 1,
        "wfComponent": {
          "name": "Start",
          "title": "开始",
          "remark": "工作流起始节点",
          "isEnable": true
        },
        "inputConfig": {
          "user_inputs": [
            {
              "uuid": "input-1",
              "name": "question",
              "title": "用户问题",
              "type": 1,
              "required": true
            }
          ],
          "ref_inputs": []
        },
        "nodeConfig": {
          "prologue": "您好，请问有什么可以帮您？"
        },
        "outputConfig": {},
        "positionX": 100,
        "positionY": 200
      },
      {
        "uuid": "node-answer-1",
        "title": "AI回答",
        "workflowUuid": "workflow-1698745623456",
        "workflowComponentId": 3,
        "wfComponent": {
          "name": "Answer",
          "title": "回答",
          "remark": "AI生成回答",
          "isEnable": true
        },
        "inputConfig": {
          "user_inputs": [],
          "ref_inputs": [
            {
              "source": "node-start-1",
              "field": "question"
            }
          ]
        },
        "nodeConfig": {
          "model_name": "gpt-4",
          "prompt": "请根据用户问题给出专业回答：{{question}}"
        },
        "outputConfig": {},
        "positionX": 400,
        "positionY": 200
      }
    ],
    "edges": [
      {
        "uuid": "edge-1",
        "source": "node-start-1",
        "target": "node-answer-1",
        "sourceHandle": "right",
        "targetHandle": "left"
      }
    ],
    "createTime": "2024-10-30T10:30:00Z",
    "updateTime": "2024-10-30T15:45:00Z",
    "createBy": "admin",
    "updateBy": "admin"
  }
}
```

#### 错误响应

```json
{
  "code": 404,
  "msg": "工作流不存在",
  "data": null
}
```

```json
{
  "code": 403,
  "msg": "无权限访问该工作流",
  "data": null
}
```

### 注意事项

1. **权限控制**: 
   - 用户只能获取自己创建的工作流
   - 公开的工作流所有登录用户都可以获取
   
2. **数据完整性**: 
   - 返回的工作流包含完整的节点和连线信息
   - 节点配置 `nodeConfig` 根据不同组件类型会有不同的字段结构
   
3. **坐标系统**: 
   - `positionX` 和 `positionY` 是节点在画布上的位置坐标
   - 单位为像素（px）

---

## 2. 分页查询工作流列表

### 基本信息

- **接口URL**: `/workflow/page`
- **请求方式**: `POST`
- **接口描述**: 分页查询工作流列表，支持按标题搜索和类型过滤
- **权限要求**: 需要登录

### 请求参数

#### Body参数（JSON格式）

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 是 | 页码，从1开始 |
| pageSize | Integer | 是 | 每页数量，建议10-100 |
| title | String | 否 | 工作流名称，支持模糊搜索 |
| type | String | 否 | 类型筛选：空字符串或不传=全部，"my"=我的，"public"=公开 |

#### 请求示例

```http
POST /workflow/page HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer {token}

{
  "pageNum": 1,
  "pageSize": 10,
  "title": "客服",
  "type": "my"
}
```

### 响应数据

#### 响应结构

```typescript
{
  code: number;           // 状态码，200表示成功
  msg: string;            // 响应消息
  data: {
    total: number;        // 总记录数
    rows: Array<{         // 工作流列表
      uuid: string;       // 工作流UUID
      title: string;      // 工作流名称
      remark: string;     // 备注说明
      isPublic: boolean;  // 是否公开
      nodes: Array<any>;  // 节点列表（简化版，仅用于统计数量）
      edges: Array<any>;  // 连线列表（简化版）
      createTime: string; // 创建时间
      updateTime: string; // 更新时间
      createBy: string;   // 创建人
      updateBy: string;   // 更新人
    }>;
  };
}
```

#### 响应示例

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 25,
    "rows": [
      {
        "uuid": "workflow-1698745623456",
        "title": "客服问答工作流",
        "remark": "用于处理客户常见问题",
        "isPublic": false,
        "nodes": [
          { "uuid": "node-start-1" },
          { "uuid": "node-answer-1" },
          { "uuid": "node-end-1" }
        ],
        "edges": [
          { "uuid": "edge-1" },
          { "uuid": "edge-2" }
        ],
        "createTime": "2024-10-30T10:30:00Z",
        "updateTime": "2024-10-30T15:45:00Z",
        "createBy": "admin",
        "updateBy": "admin"
      },
      {
        "uuid": "workflow-1698745623457",
        "title": "客服智能路由",
        "remark": "根据问题类型自动分配",
        "isPublic": true,
        "nodes": [
          { "uuid": "node-start-2" },
          { "uuid": "node-classifier-1" },
          { "uuid": "node-switcher-1" }
        ],
        "edges": [
          { "uuid": "edge-3" }
        ],
        "createTime": "2024-10-29T14:20:00Z",
        "updateTime": "2024-10-29T14:20:00Z",
        "createBy": "admin",
        "updateBy": "admin"
      }
    ]
  }
}
```

#### 错误响应

```json
{
  "code": 400,
  "msg": "参数错误：pageNum必须大于0",
  "data": null
}
```

```json
{
  "code": 400,
  "msg": "参数错误：pageSize必须在1-100之间",
  "data": null
}
```

### 注意事项

1. **分页参数**: 
   - `pageNum` 从1开始，不是0
   - `pageSize` 建议范围 1-100，超出范围应返回400错误
   
2. **搜索功能**: 
   - `title` 参数支持模糊搜索（LIKE '%title%'）
   - 搜索不区分大小写
   
3. **类型过滤**: 
   - `type` 为空或不传：返回所有工作流（我的+公开）
   - `type="my"`：仅返回当前用户创建的工作流
   - `type="public"`：仅返回公开的工作流
   
4. **数据优化**: 
   - 列表接口中的 `nodes` 和 `edges` 为简化版，仅包含基本信息
   - 前端会根据数组长度统计节点数量，无需额外返回 `nodeCount` 字段
   
5. **排序规则**: 
   - 默认按 `updateTime` 降序排列（最新修改的在前）
   - 可根据需求添加其他排序字段

---