<script setup lang="ts">
import { ref } from 'vue'
import { Input, Select, InputNumber, Button, Switch } from 'ant-design-vue'
const { TextArea } = Input
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'
import WfVariableSelector from '../components/WfVariableSelector.vue'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any

// HTTP 方法选项
const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  // { label: 'PUT', value: 'PUT' },
  // { label: 'DELETE', value: 'DELETE' },
  // { label: 'PATCH', value: 'PATCH' },
  // { label: 'HEAD', value: 'HEAD' },
  // { label: 'OPTIONS', value: 'OPTIONS' },
]

// Content-Type 选项
const contentTypeOptions = [
  { label: 'application/json', value: 'application/json' },
  { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
  { label: 'multipart/form-data', value: 'multipart/form-data' },
  { label: 'text/plain', value: 'text/plain' },
  { label: 'text/xml', value: 'text/xml' },
  { label: 'text/html', value: 'text/html' },
]

// 确保必要字段存在
if (!nodeConfig.method) nodeConfig.method = 'GET'
if (!nodeConfig.url) nodeConfig.url = ''
if (!nodeConfig.content_type) nodeConfig.content_type = 'application/json'
if (!Array.isArray(nodeConfig.headers)) nodeConfig.headers = [{ name: 'Accept', value: '*/*' }]
if (!Array.isArray(nodeConfig.params)) nodeConfig.params = []
if (nodeConfig.timeout === undefined) nodeConfig.timeout = 10
if (nodeConfig.retry_times === undefined) nodeConfig.retry_times = 0
if (nodeConfig.clear_html === undefined) nodeConfig.clear_html = false
if (!nodeConfig.text_body) nodeConfig.text_body = ''
if (!nodeConfig.json_body) nodeConfig.json_body = {}
if (!Array.isArray(nodeConfig.form_data_body)) nodeConfig.form_data_body = []
if (!Array.isArray(nodeConfig.form_urlencoded_body)) nodeConfig.form_urlencoded_body = []

// 添加/删除 Header
function addHeader() {
  nodeConfig.headers.push({ name: '', value: '' })
}

function removeHeader(index: number) {
  nodeConfig.headers.splice(index, 1)
}

// 添加/删除 Query 参数
function addParam() {
  nodeConfig.params.push({ name: '', value: '' })
}

function removeParam(index: number) {
  nodeConfig.params.splice(index, 1)
}

// JSON Body 辅助函数
// 只有当 json_body 不是空对象时才显示内容，否则显示空字符串以展示 placeholder
const isEmptyObject = (obj: any) => {
  return obj && typeof obj === 'object' && Object.keys(obj).length === 0
}

const jsonBodyStr = ref(
  isEmptyObject(nodeConfig.json_body) ? '' : JSON.stringify(nodeConfig.json_body, null, 2)
)

function updateJsonBody(val: string) {
  jsonBodyStr.value = val
  try {
    nodeConfig.json_body = JSON.parse(val)
  } catch (e) {
    // 忽略解析错误，保持原值
  }
}

// 添加/删除 Form Data
function addFormData() {
  nodeConfig.form_data_body.push({ name: '', value: '' })
}

function removeFormData(index: number) {
  nodeConfig.form_data_body.splice(index, 1)
}

// 添加/删除 Form URL Encoded
function addFormUrlEncoded() {
  nodeConfig.form_urlencoded_body.push({ name: '', value: '' })
}

function removeFormUrlEncoded(index: number) {
  nodeConfig.form_urlencoded_body.splice(index, 1)
}

// JSON Body 占位符示例
const jsonBodyPlaceholder = `{
  "json_body": {
    "userName": "{var_01.name}",
    "userEmail": "{var_01.email}",
    "userAge": "{var_01.age}"
  }
}`
</script>

<template>
  <div class="flex flex-col w-full px-2 space-y-4">
    <!-- 变量选择器：引用上游节点输出 -->
    <WfVariableSelector :workflow="workflow" :wf-node="wfNode" :exclude-nodes="[wfNode.uuid]" />
    
    <div class="text-base font-bold">HTTP 请求配置</div>

    <!-- 请求方法 -->
    <div>
      <div class="text-sm mb-1 font-medium">请求方法</div>
      <Select v-model:value="nodeConfig.method" :options="methodOptions" class="w-full" />
    </div>

    <!-- 请求 URL -->
    <div>
      <div class="text-sm mb-1 font-medium">请求 URL <span class="text-red-500">*</span></div>
      <Input 
        v-model:value="nodeConfig.url" 
        placeholder="https://api.example.com/endpoint" 
        :allow-clear="true"
      />
      <div class="text-xs text-gray-500 mt-1">支持 HTTP 和 HTTPS 协议</div>
    </div>

    <!-- Query 参数 -->
    <div>
      <div class="text-sm mb-1 font-medium flex items-center justify-between">
        <span>Query 参数</span>
        <Button size="small" type="dashed" @click="addParam">
          <PlusOutlined /> 添加
        </Button>
      </div>
      <div v-if="nodeConfig.params.length === 0" class="text-xs text-gray-400">暂无参数</div>
      <div v-for="(param, idx) in nodeConfig.params" :key="idx" class="flex gap-2 mb-2">
        <Input v-model:value="param.name" placeholder="参数名" class="flex-1" />
        <Input v-model:value="param.value" placeholder="参数值" class="flex-1" />
        <Button size="small" danger @click="removeParam(idx)">
          <DeleteOutlined />
        </Button>
      </div>
    </div>

    <!-- Headers -->
    <div>
      <div class="text-sm mb-1 font-medium flex items-center justify-between">
        <span>请求头 (Headers)</span>
        <Button size="small" type="dashed" @click="addHeader">
          <PlusOutlined /> 添加
        </Button>
      </div>
      <div v-for="(header, idx) in nodeConfig.headers" :key="idx" class="flex gap-2 mb-2">
        <Input v-model:value="header.name" placeholder="Header 名称" class="flex-1" />
        <Input v-model:value="header.value" placeholder="Header 值" class="flex-1" />
        <Button size="small" danger @click="removeHeader(idx)">
          <DeleteOutlined />
        </Button>
      </div>
    </div>

    <!-- Content-Type 选择 -->
    <div v-if="['POST', 'PUT', 'PATCH'].includes(nodeConfig.method)">
      <div class="text-sm mb-1 font-medium">Content-Type</div>
      <Select v-model:value="nodeConfig.content_type" :options="contentTypeOptions" class="w-full" />
    </div>

    <!-- 请求体 - JSON -->
    <div v-if="['POST', 'PUT', 'PATCH'].includes(nodeConfig.method) && nodeConfig.content_type === 'application/json'">
      <div class="text-sm mb-1 font-medium">请求体 (JSON)</div>
      <TextArea 
        :value="jsonBodyStr" 
        @update:value="updateJsonBody"
        :autoSize="{ minRows: 4, maxRows: 12 }" 
        :placeholder="jsonBodyPlaceholder"
      />
    </div>

    <!-- 请求体 - Form URL Encoded -->
    <div v-if="['POST', 'PUT', 'PATCH'].includes(nodeConfig.method) && nodeConfig.content_type === 'application/x-www-form-urlencoded'">
      <div class="text-sm mb-1 font-medium flex items-center justify-between">
        <span>请求体 (Form URL Encoded)</span>
        <Button size="small" type="dashed" @click="addFormUrlEncoded">
          <PlusOutlined /> 添加
        </Button>
      </div>
      <div v-if="nodeConfig.form_urlencoded_body.length === 0" class="text-xs text-gray-400">暂无表单字段</div>
      <div v-for="(field, idx) in nodeConfig.form_urlencoded_body" :key="idx" class="flex gap-2 mb-2">
        <Input v-model:value="field.name" placeholder="字段名" class="flex-1" />
        <Input v-model:value="field.value" placeholder="字段值" class="flex-1" />
        <Button size="small" danger @click="removeFormUrlEncoded(idx)">
          <DeleteOutlined />
        </Button>
      </div>
    </div>

    <!-- 请求体 - Form Data -->
    <div v-if="['POST', 'PUT', 'PATCH'].includes(nodeConfig.method) && nodeConfig.content_type === 'multipart/form-data'">
      <div class="text-sm mb-1 font-medium flex items-center justify-between">
        <span>请求体 (Form Data)</span>
        <Button size="small" type="dashed" @click="addFormData">
          <PlusOutlined /> 添加
        </Button>
      </div>
      <div v-if="nodeConfig.form_data_body.length === 0" class="text-xs text-gray-400">暂无表单字段</div>
      <div v-for="(field, idx) in nodeConfig.form_data_body" :key="idx" class="flex gap-2 mb-2">
        <Input v-model:value="field.name" placeholder="字段名" class="flex-1" />
        <Input v-model:value="field.value" placeholder="字段值" class="flex-1" />
        <Button size="small" danger @click="removeFormData(idx)">
          <DeleteOutlined />
        </Button>
      </div>
    </div>

    <!-- 请求体 - Text/Plain or XML/HTML -->
    <div v-if="['POST', 'PUT', 'PATCH'].includes(nodeConfig.method) && ['text/plain', 'text/xml', 'text/html'].includes(nodeConfig.content_type)">
      <div class="text-sm mb-1 font-medium">请求体 (文本)</div>
      <TextArea 
        v-model:value="nodeConfig.text_body"
        :autoSize="{ minRows: 4, maxRows: 12 }" 
        :placeholder="nodeConfig.content_type === 'text/xml' ? '<root>\n  <item>value</item>\n</root>' : '输入文本内容'"
      />
    </div>

    <!-- 超时设置 -->
    <div>
      <div class="text-sm mb-1 font-medium">超时时间 (秒)</div>
      <InputNumber v-model:value="nodeConfig.timeout" :min="1" :max="300" class="w-full" />
    </div>

    <!-- 重试次数 -->
    <div>
      <div class="text-sm mb-1 font-medium">重试次数</div>
      <InputNumber v-model:value="nodeConfig.retry_times" :min="0" :max="10" class="w-full" />
    </div>

    <!-- 清除 HTML -->
    <div>
      <div class="text-sm mb-1 font-medium">清除 HTML 标签</div>
      <Switch v-model:checked="nodeConfig.clear_html" />
      <div class="text-xs text-gray-500 mt-1">开启后会自动清除响应中的 HTML 标签</div>
    </div>
  </div>
</template>
