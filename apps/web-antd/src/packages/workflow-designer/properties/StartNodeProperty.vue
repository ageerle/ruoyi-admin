<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { Button, Collapse, Table, Space, Input, InputNumber, Modal, Select, Switch } from 'ant-design-vue'
import { v4 as uuidv4 } from 'uuid'
import SvgIcon from '../components/SvgIcon.vue'
import { getNameByInputType } from '../utils/workflow-util'
import type { WorkflowInfo, WorkflowNode, NodeIODefinition } from '../types/index.d'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
  uiWorkflow?: any // 仅为消除额外属性告警，无需使用
}
const props = defineProps<Props>()
const showModal = ref<boolean>(false)
const tmpItem = reactive<NodeIODefinition>({ uuid: '', type: 1, name: '', title: '', required: false, limit: 10, multiple: false })

const options = [
  { label: '文本', value: 1 },
  { label: '数字', value: 2 },
  { label: '文件', value: 4 },
  { label: '布尔值', value: 5 },
]

const columns = [
  { title: '变量名', dataIndex: 'name', key: 'name' },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { 
    title: '类型', 
    dataIndex: 'type', 
    key: 'type',
    customRender: ({ record }: { record: { type: number } }) => getNameByInputType(record.type)
  },
  { 
    title: '必填', 
    dataIndex: 'required', 
    key: 'required',
    customRender: ({ record }: { record: { required: boolean } }) => (record.required ? '是' : '否')
  },
  {
    title: '操作',
    key: 'actions',
    customRender: ({ record }: { record: NodeIODefinition }) => h('div', { class: 'flex gap-2' }, {
      default: () => [
        h(SvgIcon, { icon: 'carbon:edit', class: 'text-base cursor-pointer', onClick: () => onEdit(record) }),
        h(SvgIcon, { icon: 'carbon:delete', class: 'text-base cursor-pointer', onClick: () => onDelete(record) }),
      ],
    }),
  },
]

const submitStatus = computed(() => !!(tmpItem.name && tmpItem.title))

// 防御性初始化：确保 inputConfig 结构存在且为数组，避免新增时报错
if (!props.wfNode.inputConfig) (props.wfNode as any).inputConfig = { user_inputs: [], ref_inputs: [] }
if (!Array.isArray(props.wfNode.inputConfig.user_inputs)) (props.wfNode.inputConfig as any).user_inputs = []
if (!Array.isArray(props.wfNode.inputConfig.ref_inputs)) (props.wfNode.inputConfig as any).ref_inputs = []
// 后端开始节点可能没有 nodeConfig/prologue 字段，做兼容初始化
if (!props.wfNode.nodeConfig) (props.wfNode as any).nodeConfig = {}
if ((props.wfNode.nodeConfig as any).prologue === undefined) (props.wfNode.nodeConfig as any).prologue = ''

function onEdit(row: NodeIODefinition) {
  showModal.value = true
  const idx = props.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === row.uuid)
  const hit = idx > -1 ? props.wfNode.inputConfig.user_inputs[idx] : {
    uuid: row.uuid,
    type: row.type,
    name: row.name,
    title: row.title,
    required: row.required,
    multiple: false,
    limit: 10,
  }
  Object.assign(tmpItem, hit)
}

function onDelete(row: NodeIODefinition) {
  const idx = props.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === row.uuid)
  if (idx > -1) props.wfNode.inputConfig.user_inputs.splice(idx, 1)
}

function onShowModal() {
  showModal.value = true
  Object.assign(tmpItem, { uuid: uuidv4().replace(/-/g, ''), type: 1, name: '', title: '', required: false, multiple: false, limit: 10 })
}

function submitForm() {
  showModal.value = false
  const idx = props.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === tmpItem.uuid)
  if (idx > -1) {
    // 使用替换避免 TS 关于可能为 undefined 的报错
    props.wfNode.inputConfig.user_inputs.splice(idx, 1, { ...tmpItem })
  } else {
    props.wfNode.inputConfig.user_inputs.push({ ...tmpItem })
    Object.assign(tmpItem, { uuid: '', type: 1, name: '', title: '', required: false, multiple: false, limit: 10 })
  }
}
</script>

<template>
  <div class="flex flex-col w-full space-y-1">
    <div>
      <div class="text-xl mb-1">开场白</div>
      <div>
        <Input v-model:value="(wfNode.nodeConfig as any).prologue" type="textarea" :auto-size="{ minRows: 2, maxRows: 6 }" />
      </div>
    </div>
    <br />
    <Collapse :default-active-key="['1']">
      <Collapse.Panel key="1" header="输入" class="border border-gray-200 rounded-md m-2 px-3 pb-3">
        <Table :columns="columns" :data-source="wfNode.inputConfig.user_inputs" :pagination="false" />
      </Collapse.Panel>
    </Collapse>
    <br />
    <Button @click="onShowModal">+新增</Button>
  </div>
  <Modal v-model:open="showModal" title="变量设置" width="600px" :footer="null">
    <div class="flex flex-col w-full justify-between space-y-4">
      <div>类型<Select v-model:value="tmpItem.type" :options="options" class="w-full" /></div>
      <div>名称<Input v-model:value="tmpItem.name" :maxlength="50" show-count /></div>
      <div>标题（显示名称）<Input v-model:value="tmpItem.title" :maxlength="50" show-count /></div>
      <div>是否必须<Switch v-model:checked="tmpItem.required" size="small" /></div>
      <div v-if="tmpItem.type === 3">多选<Switch v-model:checked="tmpItem.multiple" /></div>
      <div v-if="tmpItem.type === 4">最大文件数量<InputNumber v-model:value="tmpItem.limit" class="w-full" /></div>
      <Space class="w-full justify-end" style="margin-top: 20px">
        <Button block type="primary" :disabled="!submitStatus" @click="submitForm">确认</Button>
      </Space>
    </div>
  </Modal>
</template>
 
