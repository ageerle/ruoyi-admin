<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { NButton, NCollapse, NCollapseItem, NDataTable, NFlex, NInput, NInputNumber, NModal, NSelect, NSwitch } from 'naive-ui'
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
  { title: '变量名', key: 'name' },
  { title: '标题', key: 'title' },
  { title: '类型', key: 'type', render: (row: { type: number }) => getNameByInputType(row.type) },
  { title: '必填', key: 'required', render: (row: { required: boolean }) => (row.required ? '是' : '否') },
  {
    title: '操作', key: 'actions',
    render: (row: NodeIODefinition) => h('div', { class: 'flex gap-2' }, {
      default: () => [
        h(SvgIcon, { icon: 'carbon:edit', class: 'text-base cursor-pointer', onClick: () => onEdit(row) }),
        h(SvgIcon, { icon: 'carbon:delete', class: 'text-base cursor-pointer', onClick: () => onDelete(row) }),
      ],
    }),
  },
]

const submitStatus = computed(() => !!(tmpItem.name && tmpItem.title))

// 防御性初始化：确保配置结构存在，避免后端缺字段时面板无法展示
if (!props.wfNode.nodeConfig) (props.wfNode as any).nodeConfig = {}
if ((props.wfNode.nodeConfig as any).prologue === undefined) (props.wfNode.nodeConfig as any).prologue = ''
// 防御性初始化：确保 inputConfig 结构存在且为数组，避免新增时报错
if (!props.wfNode.inputConfig) (props.wfNode as any).inputConfig = { user_inputs: [], ref_inputs: [] }
if (!Array.isArray(props.wfNode.inputConfig.user_inputs)) (props.wfNode.inputConfig as any).user_inputs = []
if (!Array.isArray(props.wfNode.inputConfig.ref_inputs)) (props.wfNode.inputConfig as any).ref_inputs = []

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
        <NInput v-model:value="(wfNode.nodeConfig as any).prologue" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
      </div>
    </div>
    <br />
    <NCollapse :default-expanded-names="['1']">
      <NCollapseItem name="1" class="border border-gray-200 rounded-md m-2 px-3 pb-3">
        <template #header>
          <div class="text-xl">输入</div>
        </template>
        <NDataTable :columns="columns" :data="wfNode.inputConfig.user_inputs" />
      </NCollapseItem>
    </NCollapse>
    <br />
    <NButton @click="onShowModal">+新增</NButton>
  </div>
  <NModal v-model:show="showModal" style="width: 90%; max-height: 700px; max-width: 600px" preset="card" title="变量设置">
    <div class="flex flex-col w-full justify-between space-y-4">
      <div>类型<NSelect v-model:value="tmpItem.type" :options="options" /></div>
      <div>名称<NInput v-model:value="tmpItem.name" maxlength="50" show-count /></div>
      <div>标题（显示名称）<NInput v-model:value="tmpItem.title" maxlength="50" show-count /></div>
      <div>是否必须<NSwitch v-model:value="tmpItem.required" size="small" /></div>
      <div v-if="tmpItem.type === 3">多选<NSwitch v-model:value="tmpItem.multiple" /></div>
      <div v-if="tmpItem.type === 4">最大文件数量<NInputNumber v-model:value="tmpItem.limit" /></div>
      <NFlex justify="end" style="margin-top: 20px">
        <NButton block type="primary" :disabled="!submitStatus" @click="submitForm">确认</NButton>
      </NFlex>
    </div>
  </NModal>
</template>
 
