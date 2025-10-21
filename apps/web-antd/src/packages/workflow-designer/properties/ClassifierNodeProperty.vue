<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { Button, Collapse, Input } from 'ant-design-vue'
import type { WorkflowInfo, WorkflowNode, UIWorkflow } from '../types/index.d'
import { createNewEdge, deleteEdgesBySourceHandle, updateEdgeBySourceHandle } from '../utils/workflow-util'

interface Category { category_uuid: string; category_name: string; target_node_uuid: string }

interface Props {
  workflow: WorkflowInfo
  uiWorkflow: UIWorkflow
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as { model_name?: string; categories: Category[] }

function onCategoryTargetSelected(category: Category, nodeUuid: string) {
  category.target_node_uuid = nodeUuid
  updateEdgeBySourceHandle({ workflow: props.workflow, uiWorkflow: props.uiWorkflow, source: props.wfNode.uuid, sourceHandle: category.category_uuid, target: nodeUuid })
}

function onAdd() {
  const uuid = uuidv4().replace(/-/g, '')
  nodeConfig.categories.push({ category_uuid: uuid, category_name: `category_${uuid.slice(0, 5)}`, target_node_uuid: '' })
  createNewEdge({ workflow: props.workflow, uiWorkflow: props.uiWorkflow, source: props.wfNode.uuid, sourceHandle: uuid, target: '' })
}

function onDeleteCategory(category: Category) {
  const idx = nodeConfig.categories.findIndex(item => item.category_uuid === category.category_uuid)
  if (idx >= 0) {
    deleteEdgesBySourceHandle(props.workflow, props.uiWorkflow, props.wfNode.uuid, category.category_uuid)
    nodeConfig.categories.splice(idx, 1)
  }
}
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="mt-2">
      <div class="text-sm mb-1">模型名</div>
      <Input v-model:value="nodeConfig.model_name" placeholder="如: classify-model" />
    </div>
    <div class="mt-4 flex flex-col">
      <div class="text-sm mb-1">类别</div>
      <Collapse :default-active-key="['0']">
        <Collapse.Panel v-for="(category, idx) in nodeConfig.categories" :key="category.category_uuid" class="border border-gray-200 rounded-md m-2">
          <template #header>
            <div class="pl-1 flex justify-between items-center w-full">
              <span>分类{{ idx + 1 }}：{{ category.category_name?.substring(0, 30) }}</span>
              <span v-show="nodeConfig.categories.length > 2" class="p-2 cursor-pointer" @click.stop="onDeleteCategory(category)">X</span>
            </div>
          </template>
          <div class="flex flex-col w-full bg-gray-100 px-3">
            <div class="mt-2">类别名称</div>
            <div class="mb-2">
              <Input v-model:value="category.category_name" type="textarea" :auto-size="{ minRows: 1, maxRows: 3 }" />
            </div>
            <div class="mb-3">下一步节点 UUID</div>
            <div class="mb-3">
              <Input v-model:value="category.target_node_uuid" placeholder="在宿主中实现 UUID 选择器可替换此输入" @update:value="(val: string) => onCategoryTargetSelected(category, val || '')" />
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
    <br>
    <Button type="dashed" @click="onAdd">+新增类别</Button>
  </div>
</template>
 
