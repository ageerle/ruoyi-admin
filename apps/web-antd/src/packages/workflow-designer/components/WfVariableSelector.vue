<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { Select, Button, Collapse, Input } from 'ant-design-vue'
import type { VNodeChild } from 'vue'
import { emptyWorkflowInfo } from '../utils/workflow-util'
import { getIconByComponentName, getIconClassByComponentName } from '../utils/workflow-util'
import SvgIcon from './SvgIcon.vue'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
  excludeNodes: string[]
  whiteListComponents?: string[]
  whiteListUserInputTypes?: number[]
}
const props = withDefaults(defineProps<Props>(), {
  workflow: () => emptyWorkflowInfo(),
  whiteListComponents: () => [],
})

// 本组件内部状态（自动写回节点）
const selectedVars = ref<string[]>([])
const keysRef = ref<string[]>([])

function renderDropdownLabel(option: any): VNodeChild {
  if (option.options) return option.label as string
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

const options = computed(() => {
  const userInputOptions: any[] = []
  const componentOutputOptions: any[] = []
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
        userInputOptions.push({ label: userInput.title, value: `${node.uuid}::${userInput.name}` })
      }
    } else {
      componentOutputOptions.push({ label: node.title, value: `${node.uuid}::output` })
    }
  }
  return [
    { label: '用户的输入', options: userInputOptions },
    { label: '节点的输出', options: componentOutputOptions },
  ]
})

// function getLabelByValue(val: string): string { /* 保留备选 */ return '' }

// 初始化：从节点自身读取
function rebuildSelectedVars() {
  const src = ((props.wfNode as any)?.inputConfig?.ref_inputs || []) as any[]
  selectedVars.value = src.map((x) => `${x.node_uuid || ''}::${x.node_param_name || ''}`)
  keysRef.value = src.map((x) => x.name || '')
  syncKeysLength()
}

rebuildSelectedVars()

function two(n: number) { return String(n).padStart(2, '0') }
function defaultKeyAt(idx: number) { return `var_${two(idx + 1)}` }
function nextAutoKey(list: string[]) {
  const nums = list
    .map((k) => (k && /^var_(\d+)$/.test(k) ? Number((k.match(/^var_(\d+)$/) as RegExpMatchArray)[1]) : 0))
  const max = nums.length ? Math.max(...nums) : 0
  return `var_${two(max + 1)}`
}
function syncKeysLength() {
  const targetLen = selectedVars.value.length
  if (!Array.isArray(keysRef.value)) keysRef.value = []
  while (keysRef.value.length < targetLen) keysRef.value.push(nextAutoKey(keysRef.value))
  while (keysRef.value.length > targetLen) keysRef.value.pop()
}

function toRefDef(val: string): { node_uuid: string; node_param_name: string } {
  const vs = String(val || '').split('::')
  return { node_uuid: vs[0] || '', node_param_name: vs[1] || '' }
}

function handleSelectAt(index: number, value: string) {
  const arr = selectedVars.value.slice()
  arr[index] = value
  selectedVars.value = arr
  // 写回节点
  const payload = selectedVars.value.map(toRefDef)
  const next = payload.map((m, i) => ({ name: keysRef.value[i] || `var_${i + 1}`, node_uuid: m.node_uuid, node_param_name: m.node_param_name }))
  if (!(props.wfNode as any).inputConfig) (props.wfNode as any).inputConfig = { user_inputs: [], ref_inputs: [] }
  ;(props.wfNode.inputConfig as any).ref_inputs = next
}

function addVariable() {
  selectedVars.value = [...selectedVars.value, '']
  keysRef.value = [...keysRef.value, nextAutoKey(keysRef.value)]
  handleSelectAt(selectedVars.value.length - 1, '')
}

function removeVariable(index: number) {
  const arr = selectedVars.value.slice()
  arr.splice(index, 1)
  selectedVars.value = arr
  const ks = keysRef.value.slice()
  ks.splice(index, 1)
  keysRef.value = ks
  const payload = selectedVars.value.map(toRefDef)
  const next = payload.map((m, i) => ({ name: keysRef.value[i] || `var_${i + 1}`, node_uuid: m.node_uuid, node_param_name: m.node_param_name }))
  if (!(props.wfNode as any).inputConfig) (props.wfNode as any).inputConfig = { user_inputs: [], ref_inputs: [] }
  ;(props.wfNode.inputConfig as any).ref_inputs = next
}
</script>

<template>
  <Collapse :default-active-key="['vars']">
    <Collapse.Panel key="vars" header="输入">
      <div class="flex flex-col gap-2">
        <div v-for="(sv, idx) in selectedVars" :key="idx" class="flex items-center gap-2">
          <div class="min-w-36 text-gray-600 flex items-center justify-between pr-2">
            <Input v-model:value="keysRef[idx]" placeholder="var_xxx" size="small" />
          </div>
          <Select
            :value="sv"
            :show-arrow="true"
            :options="options"
            @update:value="(val: string) => handleSelectAt(idx, val)"
            class="flex-1"
          >
            <template #optionRender="{ option }">
              <component :is="() => renderDropdownLabel(option)" />
            </template>
          </Select>
          <Button size="small" title="删除" @click="removeVariable(idx)">
            <SvgIcon icon="carbon:delete" />
          </Button>
        </div>
        <div>
          <Button size="small" type="dashed" @click="addVariable">+ 新增变量</Button>
        </div>
      </div>
    </Collapse.Panel>
  </Collapse>
</template>
