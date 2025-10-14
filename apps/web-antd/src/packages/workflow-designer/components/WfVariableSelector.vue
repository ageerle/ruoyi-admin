<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { NSelect, NButton, NCollapse, NCollapseItem, NInput } from 'naive-ui'
import type { VNodeChild } from 'vue'
import type { SelectGroupOption, SelectOption } from 'naive-ui'
import { emptyWorkflowInfo } from '../utils/workflow-util'
import { getIconByComponentName, getIconClassByComponentName } from '../utils/workflow-util'
import SvgIcon from './SvgIcon.vue'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'

type NodeIORefDefinition = { node_uuid: string; node_param_name: string }

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
  wfRefVar: NodeIORefDefinition
  excludeNodes: string[]
  whiteListComponents?: string[]
  whiteListUserInputTypes?: number[]
  // 可选：多变量模式数据来源（v-model）
  modelValue?: NodeIORefDefinition[]
  multiple?: boolean
  displayKeys?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  workflow: () => emptyWorkflowInfo(),
  whiteListComponents: () => [],
  multiple: true,
  displayKeys: () => [],
})

interface Emit {
  (e: 'variableSelected', nodeUuidParanmName: string[]): void
}
const emit = defineEmits<Emit>()

// 兼容：单变量字符串列表（用于 NSelect 的 v-model）
const selectedVars = ref<string[]>([])
const isMultiple = computed(() => !!props.multiple)
const keysRef = ref<string[]>([])

const userInputGroup: SelectGroupOption = {
  type: 'group',
  label: '用户的输入',
  key: 'userInput',
  children: [] as Array<{ label: string; value: string }>,
}

const componentOutputGroup: SelectGroupOption = {
  type: 'group',
  label: '节点的输出',
  key: 'componentOutput',
  children: [] as Array<{ label: string; value: string }>,
}

function renderDropdownLabel(option: SelectOption): VNodeChild {
  if ((option as any).type === 'group') return option.label as string
  const val = String(option.value || '')
  const nodeUuid = val.split('::')[0]
  const componentName = (props.workflow.nodes || []).find(item => item.uuid === nodeUuid)?.wfComponent?.name || ''
  return [
    h('div', { class: 'flex items-center' }, {
      default: () => [
        h(SvgIcon, { icon: getIconByComponentName(componentName), class: getIconClassByComponentName(componentName) }),
        h('div', { class: 'ml-1.5' }, { default: () => option.label as string }),
      ],
    }),
  ]
}

const options = computed<Array<SelectOption | SelectGroupOption>>(() => {
  const opts: Array<SelectOption | SelectGroupOption> = [
    { ...userInputGroup, children: [] },
    { ...componentOutputGroup, children: [] },
  ]
  const nodes = props.workflow.nodes || []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (!node || !node.uuid || !node.wfComponent) continue
    if ((props.excludeNodes || []).includes(node.uuid) || node.wfComponent.name === 'End') continue
    if ((props.whiteListComponents || []).length > 0 && !(props.whiteListComponents || []).includes(node.wfComponent.name)) continue
    const inputConfig = node.inputConfig || { user_inputs: [], ref_inputs: [] }
    if (node.wfComponent.name === 'Start') {
      const arr = Array.isArray(inputConfig.user_inputs) ? inputConfig.user_inputs : []
      for (let j = 0; j < arr.length; j++) {
        const userInput: any = arr[j]
        if ((props.whiteListUserInputTypes || []).length > 0 && !(props.whiteListUserInputTypes || []).includes(userInput.type)) continue
        ;(opts[0] as any).children.push({ label: userInput.title, value: `${node.uuid}::${userInput.name}` })
      }
    } else {
      ;(opts[1] as any).children.push({ label: node.title, value: `${node.uuid}::output` })
    }
  }
  return opts
})

function getLabelByValue(val: string): string {
  const arr = options.value
  for (const group of arr) {
    // @ts-ignore
    const children = (group.children || []) as any[]
    const hit = children.find(c => c.value === val)
    if (hit) return hit.label as string
  }
  return ''
}

// 初始化/同步选择值
function rebuildSelectedVars() {
  if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    selectedVars.value = props.modelValue.map(v => `${v.node_uuid}::${v.node_param_name}`)
  } else if (props.wfRefVar) {
    const n = props.wfRefVar
    selectedVars.value = (n && n.node_uuid && n.node_param_name) ? [`${n.node_uuid}::${n.node_param_name}`] : []
  } else {
    selectedVars.value = []
  }
  syncKeysLength()
}

rebuildSelectedVars()
watch(() => props.modelValue, () => rebuildSelectedVars(), { deep: true })
watch(() => props.displayKeys, (val) => {
  if (Array.isArray(val)) keysRef.value = val.slice()
  syncKeysLength()
}, { deep: true, immediate: true })

// 占位默认 key（如需外部未传时的回填可启用）
// function defaultKeyAt(idx: number) { return `var_${idx + 1}` }
function syncKeysLength() {
  const targetLen = selectedVars.value.length
  if (!Array.isArray(keysRef.value)) keysRef.value = []
  while (keysRef.value.length < targetLen) keysRef.value.push('')
  while (keysRef.value.length > targetLen) keysRef.value.pop()
}

function toRefDef(val: string): NodeIORefDefinition {
  const vs = String(val || '').split('::')
  return { node_uuid: vs[0] || '', node_param_name: vs[1] || '' }
}

function handleSelectAt(index: number, value: string) {
  if (isMultiple.value) {
    const arr = selectedVars.value.slice()
    arr[index] = value
    selectedVars.value = arr
    const payload = selectedVars.value.map(toRefDef)
    // 双向绑定
    // @ts-ignore
    emit('update:modelValue', payload)
  } else {
    selectedVars.value = [value]
    emit('variableSelected', String(value || '').split('::'))
  }
}

function addVariable() {
  selectedVars.value = [...selectedVars.value, '']
  keysRef.value = [...keysRef.value, '']
  const payload = selectedVars.value.map(toRefDef)
  // @ts-ignore
  emit('update:modelValue', payload)
  // @ts-ignore
  emit('update:displayKeys', keysRef.value)
}

function removeVariable(index: number) {
  const arr = selectedVars.value.slice()
  arr.splice(index, 1)
  selectedVars.value = arr
  const ks = keysRef.value.slice()
  ks.splice(index, 1)
  keysRef.value = ks
  const payload = selectedVars.value.map(toRefDef)
  // @ts-ignore
  emit('update:modelValue', payload)
  // @ts-ignore
  emit('update:displayKeys', keysRef.value)
}
</script>

<template>
  <NCollapse :default-expanded-names="['vars']">
    <NCollapseItem name="vars" title="引用变量">
      <div class="flex flex-col gap-2">
        <div v-for="(sv, idx) in selectedVars" :key="idx" class="flex items-center gap-2">
          <div class="min-w-36 text-gray-600 flex items-center justify-between pr-2">
            <NInput v-model:value="keysRef[idx]" placeholder="var_xxx" size="small" />
            <span class="text-gray-400 ml-2">{{ getLabelByValue(sv) }}</span>
          </div>
          <NSelect
            :value="sv"
            placement="top-start"
            trigger="click"
            :show-arrow="true"
            :render-label="renderDropdownLabel"
            :options="options"
            :consistent-menu-width="false"
            @update:value="(val) => handleSelectAt(idx, val as string)"
          />
          <NButton size="small" tertiary title="删除" @click="removeVariable(idx)">
            <SvgIcon icon="carbon:delete" />
          </NButton>
        </div>
        <div>
          <NButton size="small" dashed @click="addVariable">+ 新增变量</NButton>
        </div>
      </div>
    </NCollapseItem>
  </NCollapse>
</template>
