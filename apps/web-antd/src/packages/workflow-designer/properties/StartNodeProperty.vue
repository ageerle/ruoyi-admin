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

function onEdit(row: NodeIODefinition) {
  showModal.value = true
  const idx = props.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === row.uuid)
  Object.assign(tmpItem, props.wfNode.inputConfig.user_inputs[idx])
}

function onDelete(row: NodeIODefinition) {
  const idx = props.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === row.uuid)
  if (idx > -1) props.wfNode.inputConfig.user_inputs.splice(idx, 1)
}

function onShowModal() {
  showModal.value = true
  Object.assign(tmpItem, { uuid: uuidv4().replace(/-/g, ''), type: 1, name: '', title: '', required: false })
}

function submitForm() {
  showModal.value = false
  const idx = props.wfNode.inputConfig.user_inputs.findIndex(item => item.uuid === tmpItem.uuid)
  if (idx > -1) {
    Object.assign(props.wfNode.inputConfig.user_inputs[idx], { ...tmpItem })
  } else {
    props.wfNode.inputConfig.user_inputs.push({ ...tmpItem })
    Object.assign(tmpItem, { uuid: '', type: 1, name: '', label: '', required: false })
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


