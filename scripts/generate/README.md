# 代码生成器

基于 mldong 项目的前端代码生成功能，适配 ruoyi-admin 项目的代码风格。

## 功能特性

- 🚀 支持生成完整的 CRUD 页面
- 📝 支持多种表单组件（输入框、选择器、日期选择器等）
- 🌳 支持树形结构数据
- 🔐 支持权限控制
- 📊 支持数据字典
- 💾 支持导入导出功能
- 🎨 完全符合 ruoyi-admin 代码风格

## 使用方法

### 1. 基本用法

```bash
# 生成指定表的代码
pnpm generate --tableName=sys_user

# 覆盖已存在的文件
pnpm generate --tableName=sys_user --cover

# 使用自定义数据
pnpm generate --tableName=sys_user --data='{"functionName":"用户"}'
```

### 2. 参数说明

- `--tableName`: 数据库表名（必填）
- `--cover`: 是否覆盖已存在的文件（可选，默认 false）
- `--data`: 自定义数据，JSON 格式（可选）

### 3. 配置文件

配置文件位于 `scripts/generate/config/default.json`，包含以下配置：

- `apiUrl`: 后端 API 地址
- `theme`: 主题配置
- `appId`: 应用 ID
- `appSecret`: 应用密钥
- `templates`: 模板配置列表

### 4. 模板说明

| 模板文件 | 说明 | 生成位置 |
|---------|------|----------|
| `api.art` | API 接口文件 | `apps/web-antd/src/api/{moduleName}/{businessName}/index.ts` |
| `index.art` | 列表页面 | `apps/web-antd/src/views/{moduleName}/{businessName}/index.vue` |
| `data.art` | 数据配置 | `apps/web-antd/src/views/{moduleName}/{businessName}/data.tsx` |
| `modal.art` | 表单模态框 | `apps/web-antd/src/views/{moduleName}/{businessName}/modal.vue` |
| `info-modal.art` | 详情模态框 | `apps/web-antd/src/views/{moduleName}/{businessName}/info-modal.vue` |
| `types.art` | 类型定义 | `apps/web-antd/src/api/{moduleName}/{businessName}/types.ts` |
| `route.art` | 路由配置 | `apps/web-antd/src/router/routes/{moduleName}/{businessName}.ts` |

## 生成的文件结构

```
apps/web-antd/src/
├── api/
│   └── {moduleName}/
│       └── {businessName}/
│           ├── index.ts      # API 接口
│           └── types.ts      # 类型定义
├── views/
│   └── {moduleName}/
│       └── {businessName}/
│           ├── index.vue     # 列表页面
│           ├── data.tsx      # 数据配置
│           ├── modal.vue     # 表单模态框
│           └── info-modal.vue # 详情模态框
└── router/
    └── routes/
        └── {moduleName}/
            └── {businessName}.ts # 路由配置
```

## 支持的字段类型

### HTML 类型
- `input`: 输入框
- `textarea`: 文本域
- `select`: 选择器
- `radio`: 单选按钮
- `checkbox`: 复选框
- `datetime`: 日期时间选择器
- `editor`: 富文本编辑器
- `fileUpload`: 文件上传
- `imageUpload`: 图片上传

### Java 类型
- `String`: 字符串
- `Integer`: 整数
- `Long`: 长整数
- `Double`: 双精度浮点数
- `BigDecimal`: 高精度小数
- `Date`: 日期

### 查询类型
- `EQ`: 等于
- `NE`: 不等于
- `GT`: 大于
- `GE`: 大于等于
- `LT`: 小于
- `LE`: 小于等于
- `LIKE`: 模糊查询
- `BETWEEN`: 范围查询

## 扩展配置

可以通过 `ext` 字段进行扩展配置：

```json
{
  "ext": {
    "defaultAuthTypeList": ["add", "edit", "remove", "export"],
    "statusField": "status",
    "customApiList": [
      {
        "name": "changeStatus",
        "comment": "状态变更"
      }
    ]
  }
}
```

## 注意事项

1. 确保后端 API 服务正常运行
2. 检查配置文件中的 API 地址是否正确
3. 生成前建议备份现有文件
4. 生成的代码可能需要根据实际业务进行微调

## 故障排除

### 常见问题

1. **API 请求失败**
   - 检查网络连接
   - 确认 API 地址配置正确
   - 检查 appId 和 appSecret 是否有效

2. **模板渲染错误**
   - 检查模板语法是否正确
   - 确认数据结构是否完整

3. **文件生成失败**
   - 检查目标目录是否存在
   - 确认文件权限是否足够

如有其他问题，请查看控制台输出的详细错误信息。