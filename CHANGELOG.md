# 1.2.3

**BUG FIX**

- `withDefaultPlaceholder`中将`placeholder`修改为computed, 解决后续使用`updateSchema`无法正常更新显示placeholder(响应式问题)

- 流程定义 修改accept类型 解决无法拖拽上传

**FEATURES**

- 增加`环境变量`打包配置demo -> build:antd:test
- 角色管理 勾选权限组件添加对错误用法的校验提示

**REFACTOR**

- OAuth内部逻辑重构 增加新的默认OAuth登录方式
- 重构部分setup组件为setup语法糖形式

# 1.2.2

**FEATURES**

- 代码生成支持路径方式生成
- 代码生成 支持选择表单生成类型(需要模板支持)
- 工作流 支持按钮权限

# 1.2.1

# BUG FIXES

- 客户端管理 错误的status disabled
- modal/drawer升级后zIndex(2000)会遮挡Tinymce的下拉框zIndex(1300)

# 1.2.0

**REFACTOR**

- 菜单选择组件重构为Table形式
- 字典相关功能重构 采用一个Map储存字典(之前为两个Map)
- 代码生成配置页面重构 去除步骤条

**Features**

- 对接后端工作流
- ~~通用的vxe-table排序事件(排序逻辑改为在排序事件中处理而非在api处理)~~
- getDict/getDictOptions 提取公共逻辑 减少冗余代码
- 字典新增对Number类型的支持 -> `getDictOptions('', true);`即可获取number类型的value
- 文件上传 增加上传进度条 下方上传提示
- 图片上传 增加上传进度条 下方上传提示
- oss下载进度提示

**BUG FIXES**

- 字典项为空时getDict方法无限调用接口(无奈兼容 不给字典item本来就是错误用法)
- 表格排序翻页会丢失排序参数
- 下载文件时(responseType === 'blob')需要判断下载失败(返回json而非二进制)的情况
- requestClient缺失i18n内容

**OTHERS**

- 用户管理 新增只获取一次(mounted)默认密码而非每次打开modal都获取
- `apps/web-antd/src/utils/dict.ts` `getDict`方法将于下个版本删除 使用`getDictOptions`替代
- VxeTable升级V4.10.0
- 移除`@deprecated` `apps/web-antd/src/adapter/vxe-table.ts`的`tableCheckboxEvent`方法
- 移除`由于更新方案弃用的` `apps/web-antd/src/adapter/vxe-table.ts`的`vxeSortEvent`方法
- 移除apps下的ele和naive目录

# 1.1.3

**REFACTOR**

- 重构: 判断vxe-table的复选框是否选中

**Bug Fixes**

- 节点树在编辑 & 空数组(不勾选)情况 勾选节点会造成watch延迟触发 导致会带上父节点id造成id重复
- 节点树在节点独立情况下的控制台warning: Invalid prop: type check failed for prop "value". Expected Array, got Object

**Others**

- 角色管理 优化Drawer布局
- unplugin-vue-components插件(默认未开启) 需要排除Button组件 全局已经默认导入了

**BUG FIXES**

- 操作日志详情 在description组件中json预览样式异常
- 微服务版本 区间查询和中文搜索条件一起使用 无法正确查询

# 1.1.2

**Features**

- Options转Enum工具函数

**OTHERS**

- 菜单管理 改为虚拟滚动
- 移除requestClient的一些冗余参数
- 主动退出登录(右上角个人选项)不需要带跳转地址

**BUG FIXES**

- 语言 漏加Content-Language请求头
- 用户管理/岗位管理 左边部门树错误emit导致会调用两次列表api

# 1.1.1

**REFACTOR**

- 使用VxeTable重构OAuth账号绑定列表(替代antdv的Table)
- commonDownloadExcel方法 支持处理区间选择器字段导出excel

**BUG FIXES**

- 修复在Modal/Drawer中使用VxeTable时, 第二次打开表单参数依旧为第一次提交的参数

**OTHERS**

- 废弃downloadExcel方法 统一使用commonDownloadExcel方法

# 1.1.0

**FEATURES**

- 支持离线图标功能(全局可在内网环境中使用)

**BUG FIXES**

- 在VxeTable固定列时, getPopupContainer会导致宽度不够, 弹出层样式异常 解决办法(将弹窗元素挂载到VXe滚动容器上)

**OTHERS**

- 代码生成 - 字段信息修改 改为minWidth 防止在高分辨率屏幕出现空白

# 1.0.0

**FEATURES**

- 用户管理 新增从参数取默认密码
- 全局表格加上id 方便进行缓存列排序的操作
- 支持菜单名称i18n
- 登录页 验证码登录
- Markdown编辑/预览组件(基于vditor)
- VxeTable搜索表单 enter提交

**BUG FIXES**

- 登录页面 关闭租户后下拉框没有正常隐藏
- 字典管理 关闭租户不应显示`同步租户字典`按钮
- 登录日志 漏掉了登录日志日期查询
- 登出相关逻辑在并发(非await)情况下重复执行的问题
- VxeTable在开启/关闭查询表单时 需要使用不同的padding
- VxeTable表格刷新 默认为reload 修改为在当前页刷新(query)
- 岗位管理 部门参数错误
- 角色管理 菜单分配 节点独立下的回显及提交问题
- 租户管理 套餐管理 回显时候`已选中节点`数量为0
- 用户管理 更新用户时打开drawer需要加载该部门下的岗位信息

**OTHERS**

- 登录页 租户选择框浮层固定高度[256px] 超过高度自动滚动
- 表单的Label默认方向改为`top` 支持\n换行
- 所有表格的搜索加上allowClear属性 支持清除
- vxe表格loading 只加载表格 不加载上面的表单

# 1.0.0-beta (2024-10-8)

**FEATURES**

- 基础功能已经开发完毕
- 工作流相关模块等待后端重构后开发
