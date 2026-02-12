<script setup lang="ts">
import { computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { Button, Collapse, Input, Select, Space, message } from 'ant-design-vue'
import type { SelectValue } from 'ant-design-vue/es/select'
import type { WorkflowInfo, WorkflowNode, UIWorkflow } from '../types/index.d'
import { createNewEdge, deleteEdgesBySourceHandle, updateEdgeBySourceHandle } from '../utils/workflow-util'
import { conditionOperators, logicOperators } from '../utils/operators'

interface Condition {
  node_uuid: string
  node_param_name: string
  operator: string
  value: string
}

interface Case {
  uuid: string
  operator: 'and' | 'or'
  target_node_uuid: string
  conditions: Condition[]
}

interface Props {
  workflow: WorkflowInfo
  uiWorkflow: UIWorkflow
  wfNode: WorkflowNode
}

const props = defineProps<Props>()

function normalizeToString(value: SelectValue): string {
  if (Array.isArray(value)) return normalizeToString(value[0] ?? '')
  if (value === null || value === undefined) return ''
  return String(value)
}

// 确保 nodeConfig 结构正确
const nodeConfig = props.wfNode.nodeConfig as {
  default_target_node_uuid?: string
  cases: Case[]
}

// 防御性初始化
if (!nodeConfig.cases) {
  nodeConfig.cases = []
}
if (nodeConfig.default_target_node_uuid === undefined) {
  nodeConfig.default_target_node_uuid = ''
}

// 获取可用的节点列表（排除自身和Start节点）
const availableNodes = computed(() => {
  return props.workflow.nodes
    .filter(n => n.uuid !== props.wfNode.uuid && n.wfComponent?.name !== 'Start')
    .map(n => ({
      label: n.title || n.wfComponent?.title || n.uuid,
      value: n.uuid,
    }))
})

// 注意：availableParams 暂未使用，但保留供未来功能使用
// const availableParams = computed(() => {
//   const startNode = props.workflow.nodes.find(n => n.wfComponent?.name === 'Start')
//   if (!startNode?.inputConfig?.user_inputs) return []
//   
//   return startNode.inputConfig.user_inputs.map(input => ({
//     label: input.title || input.name,
//     value: input.name,
//     nodeUuid: startNode.uuid,
//   }))
// })

// 获取所有可选的源节点（包括Start和其他节点的输出）
const sourceNodeOptions = computed(() => {
  const options: Array<{ label: string; value: string }> = []
  
  // 添加Start节点的用户输入
  const startNode = props.workflow.nodes.find(n => n.wfComponent?.name === 'Start')
  if (startNode) {
    options.push({
      label: `${startNode.title || '开始'} (用户输入)`,
      value: startNode.uuid,
    })
  }
  
  // 添加其他前置节点
  props.workflow.nodes
    .filter(n => n.uuid !== props.wfNode.uuid && n.wfComponent?.name !== 'Start')
    .forEach(n => {
      options.push({
        label: n.title || n.wfComponent?.title || n.uuid,
        value: n.uuid,
      })
    })
  
  return options
})

// 根据选中的节点获取可用参数
function getParamsForNode(nodeUuid: string) {
  const node = props.workflow.nodes.find(n => n.uuid === nodeUuid)
  if (!node) return []
  
  if (node.wfComponent?.name === 'Start') {
    return node.inputConfig?.user_inputs?.map(input => ({
      label: input.title || input.name,
      value: input.name,
    })) || []
  }
  
  // 其他节点返回通用输出参数
  return [
    { label: '输出结果', value: 'output' },
    { label: '状态', value: 'status' },
  ]
}

// 新增分支
function onAddCase() {
  const uuid = uuidv4().replace(/-/g, '')
  const startNode = props.workflow.nodes.find(n => n.wfComponent?.name === 'Start')
  const firstParam = startNode?.inputConfig?.user_inputs?.[0]?.name || ''
  
  const newCase: Case = {
    uuid,
    operator: 'and',
    target_node_uuid: '',
    conditions: [
      {
        node_uuid: startNode?.uuid || '',
        node_param_name: firstParam,
        operator: 'contains',
        value: '',
      },
    ],
  }
  
  nodeConfig.cases.push(newCase)
  // 创建对应的边
  createNewEdge({
    workflow: props.workflow,
    uiWorkflow: props.uiWorkflow,
    source: props.wfNode.uuid,
    sourceHandle: uuid,
    target: '',
  })
}

// 删除分支
function onDeleteCase(caseItem: Case) {
  const idx = nodeConfig.cases.findIndex(item => item.uuid === caseItem.uuid)
  if (idx >= 0) {
    deleteEdgesBySourceHandle(props.workflow, props.uiWorkflow, props.wfNode.uuid, caseItem.uuid)
    nodeConfig.cases.splice(idx, 1)
  }
}

// 更新分支目标节点
function onCaseTargetSelected(caseItem: Case, nodeUuid: SelectValue) {
  const normalized = normalizeToString(nodeUuid)
  caseItem.target_node_uuid = normalized
  updateEdgeBySourceHandle({
    workflow: props.workflow,
    uiWorkflow: props.uiWorkflow,
    source: props.wfNode.uuid,
    sourceHandle: caseItem.uuid,
    target: normalized,
  })
}

// 更新默认分支目标
function onDefaultTargetSelected(nodeUuid: SelectValue) {
  const normalized = normalizeToString(nodeUuid)
  nodeConfig.default_target_node_uuid = normalized
  // 默认分支使用特殊的handle id
  updateEdgeBySourceHandle({
    workflow: props.workflow,
    uiWorkflow: props.uiWorkflow,
    source: props.wfNode.uuid,
    sourceHandle: 'default',
    target: normalized,
  })
}

// 新增条件
function onAddCondition(caseItem: Case) {
  const startNode = props.workflow.nodes.find(n => n.wfComponent?.name === 'Start')
  const firstParam = startNode?.inputConfig?.user_inputs?.[0]?.name || ''
  
  caseItem.conditions.push({
    node_uuid: startNode?.uuid || '',
    node_param_name: firstParam,
    operator: 'contains',
    value: '',
  })
}

// 删除条件
function onDeleteCondition(caseItem: Case, conditionIndex: number) {
  if (caseItem.conditions.length > 1) {
    caseItem.conditions.splice(conditionIndex, 1)
  }
}

// 当源节点变化时，重置参数选择
function onSourceNodeChange(condition: Condition, nodeUuid: SelectValue) {
  const normalized = normalizeToString(nodeUuid)
  condition.node_uuid = normalized
  const params = getParamsForNode(normalized)
  condition.node_param_name = params[0]?.value || ''
}

// 验证条件是否有效
function validateCondition(condition: Condition): { valid: boolean; message?: string } {
  if (!condition.node_uuid) {
    return { valid: false, message: '请选择源节点' }
  }
  if (!condition.node_param_name) {
    return { valid: false, message: '请选择参数' }
  }
  if (!condition.operator) {
    return { valid: false, message: '请选择运算符' }
  }
  // 对于非 empty/not_empty 运算符，value 不能为空
  if (!['empty', 'not empty'].includes(condition.operator) && !condition.value) {
    return { valid: false, message: '请输入比较值' }
  }
  return { valid: true }
}

// 验证分支是否有效
function validateCase(caseItem: Case, index: number): { valid: boolean; message?: string } {
  if (!caseItem.target_node_uuid) {
    return { valid: false, message: `分支 ${index + 1} 的目标节点不能为空` }
  }
  if (!caseItem.conditions || caseItem.conditions.length === 0) {
    return { valid: false, message: `分支 ${index + 1} 至少需要一个条件` }
  }
  for (let i = 0; i < caseItem.conditions.length; i++) {
    const condition = caseItem.conditions[i]
    if (!condition) continue
    const result = validateCondition(condition)
    if (!result.valid) {
      return { valid: false, message: `分支 ${index + 1} 的条件 ${i + 1}: ${result.message}` }
    }
  }
  return { valid: true }
}

// 检查是否有无效配置
function hasInvalidConfig(caseItem: Case): boolean {
  return !caseItem.target_node_uuid || 
         caseItem.conditions.some(c => 
           !c.node_uuid || 
           !c.node_param_name || 
           (!['empty', 'not empty'].includes(c.operator) && !c.value)
         )
}

// 验证所有配置（用于保存前验证）
function validateAllConfig(): boolean {
  // 检查是否有分支
  if (nodeConfig.cases.length === 0) {
    message.warning('请至少添加一个条件分支')
    return false
  }
  
  // 验证每个分支
  for (let i = 0; i < nodeConfig.cases.length; i++) {
    const caseItem = nodeConfig.cases[i]
    if (!caseItem) continue
    const result = validateCase(caseItem, i)
    if (!result.valid) {
      message.warning(result.message || '配置无效')
      return false
    }
  }
  
  // 验证默认分支
  if (!nodeConfig.default_target_node_uuid) {
    message.warning('请为默认分支选择目标节点')
    return false
  }
  
  return true
}
</script>

<template>
  <div class="switcher-property-panel">
    <!-- 说明 -->
    <div class="info-card">
      <div class="info-header">
        <span class="info-icon"></span>
        <span class="info-icon"></span>

        <span class="info-title"> 条件分支说明</span>
      </div>
      <ul class="info-list">
        <li>按顺序评估每个分支的条件</li>
        <li>第一个满足条件的分支将被执行</li>
        <li>如果所有分支都不满足，执行默认分支</li>
        <li>每个分支可以包含多个条件，支持AND/OR逻辑</li>
      </ul>
    </div>

    <!-- 分支列表 -->
    <div class="branches-section">
      <div class="section-header">
        <h3 class="section-title">条件分支</h3>
        <Button size="small" type="dashed" @click="onAddCase">
          <template #icon>
            <span>+</span>
          </template>
          新增分支
        </Button>
      </div>

      <Collapse v-if="nodeConfig.cases.length > 0" :default-active-key="['0']" class="branches-collapse">
        <Collapse.Panel
          v-for="(caseItem, caseIdx) in nodeConfig.cases"
          :key="caseItem.uuid"
          class="branch-collapse-item"
        >
          <template #header>
            <div class="branch-header">
              <div class="branch-header-left">
                <span class="branch-number-badge" :class="{ 'invalid': hasInvalidConfig(caseItem) }">
                  {{ caseIdx + 1 }}
                  <span v-if="hasInvalidConfig(caseItem)" class="warning-icon">⚠</span>
                </span>
                <span class="branch-title">分支 {{ caseIdx + 1 }}</span>
              </div>
              <span class="branch-meta">
                {{ caseItem.conditions.length }} 个条件 · {{ caseItem.operator.toUpperCase() }}
              </span>
            </div>
          </template>
          
          <template #extra>
            <div class="delete-btn" @click.stop="onDeleteCase(caseItem)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
              </svg>
            </div>
          </template>

          <div class="branch-content">
            <!-- 逻辑运算符 -->
            <div class="form-group">
              <label class="form-label">条件组合方式</label>
              <Select
                v-model:value="caseItem.operator"
                :options="logicOperators as any"
                size="small"
              />
            </div>

            <!-- 条件列表 -->
            <div class="conditions-section">
              <label class="form-label">条件列表</label>
              <div
                v-for="(condition, condIdx) in caseItem.conditions"
                :key="condIdx"
                class="condition-item"
              >
                <Space direction="vertical" :size="12">
                  <!-- 源节点选择 -->
                  <div class="field-group">
                    <label class="field-label">源节点</label>
                    <Select
                      :value="condition.node_uuid"
                      :options="sourceNodeOptions"
                      size="small"
                      placeholder="选择节点"
                      @update:value="(val) => onSourceNodeChange(condition, val)"
                    />
                  </div>

                  <!-- 参数选择 -->
                  <div class="field-group">
                    <label class="field-label">参数</label>
                    <Select
                      v-model:value="condition.node_param_name"
                      :options="getParamsForNode(condition.node_uuid)"
                      size="small"
                      placeholder="选择参数"
                    />
                  </div>

                  <!-- 运算符 -->
                  <div class="field-group">
                    <label class="field-label">运算符</label>
                    <Select
                      v-model:value="condition.operator"
                      :options="conditionOperators as any"
                      size="small"
                    />
                  </div>

                  <!-- 比较值 -->
                  <div v-if="!['empty', 'not empty'].includes(condition.operator)" class="field-group">
                    <label class="field-label">
                      比较值
                      <span v-if="!condition.value" class="required-mark">*</span>
                    </label>
                    <Input
                      v-model:value="condition.value"
                      :status="!condition.value ? 'warning' : undefined"
                      size="small"
                      placeholder="输入比较值"
                    />
                    <div v-if="!condition.value" class="warning-hint">
                      💡 建议填写比较值，空值会匹配任何内容
                    </div>
                  </div>

                  <!-- 删除条件按钮 -->
                  <div v-if="caseItem.conditions.length > 1" class="condition-actions">
                    <Button
                      size="small"
                      type="text"
                      danger
                      @click="onDeleteCondition(caseItem, condIdx)"
                    >
                      <template #icon>
                        <span>×</span>
                      </template>
                      删除此条件
                    </Button>
                  </div>
                </Space>
              </div>

              <!-- 添加条件按钮 -->
              <Button
                class="add-condition-btn"
                size="small"
                type="dashed"
                block
                @click="onAddCondition(caseItem)"
              >
                <template #icon>
                  <span>+</span>
                </template>
                添加条件
              </Button>
            </div>

            <div class="divider"></div>

            <!-- 目标节点 -->
            <div class="form-group">
              <label class="form-label">
                跳转到节点
                <span v-if="!caseItem.target_node_uuid" class="required-mark">*</span>
              </label>
              <Select
                :value="caseItem.target_node_uuid"
                :options="availableNodes"
                :status="!caseItem.target_node_uuid ? 'error' : undefined"
                size="small"
                placeholder="选择目标节点"
                allow-clear
                @update:value="(val) => onCaseTargetSelected(caseItem, val || '')"
              />
              <div v-if="!caseItem.target_node_uuid" class="error-hint">
                ⚠️ 目标节点不能为空，否则该分支将被跳过
              </div>
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>

      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <p>暂无分支</p>
        <span>点击上方按钮添加条件分支</span>
      </div>
    </div>

    <!-- 默认分支 -->
    <div class="default-branch-section">
      <div class="default-branch-card">
        <div class="default-branch-header">
          <div class="default-branch-title">
            <span class="default-icon">🔄</span>
            <span>默认分支</span>
          </div>
          <span class="default-branch-desc">所有条件都不满足时执行</span>
        </div>
        <div class="form-group">
          <label class="form-label">
            跳转到节点
            <span v-if="!nodeConfig.default_target_node_uuid" class="required-mark">*</span>
          </label>
          <Select
            :value="nodeConfig.default_target_node_uuid"
            :options="availableNodes"
            :status="!nodeConfig.default_target_node_uuid ? 'error' : undefined"
            placeholder="选择默认目标节点"
            allow-clear
            @update:value="(val) => onDefaultTargetSelected(val || '')"
          />
          <div v-if="!nodeConfig.default_target_node_uuid" class="error-hint">
            ⚠️ 默认分支的目标节点不能为空
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主容器 */
.switcher-property-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 说明卡片 */
.info-card {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  padding: 16px;
  color: white;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.info-icon {
  font-size: 20px;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-list li {
  font-size: 13px;
  padding-left: 20px;
  position: relative;
  line-height: 1.5;
  opacity: 0.95;
}

.info-list li::before {
  content: "•";
  position: absolute;
  left: 8px;
  font-weight: bold;
}

/* 分支区域 */
.branches-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* 折叠面板 */
.branches-collapse {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.branch-collapse-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: all 0.2s;
}

.branch-collapse-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

:deep(.branch-collapse-item .n-collapse-item__header) {
  padding: 12px 16px;
  background: linear-gradient(to right, #f8fafc, #ffffff);
  border-bottom: 1px solid #e5e7eb;
}

:deep(.branch-collapse-item .n-collapse-item__content-inner) {
  padding: 0;
}

/* 分支头部 */
.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

.branch-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.branch-number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 0 6px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.branch-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.branch-meta {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* 分支内容 */
.branch-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
}

/* 表单组 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

/* 条件区域 */
.conditions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  transition: all 0.2s;
  position: relative;
}

.condition-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 8px 0 0 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.condition-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}

.condition-item:hover::before {
  opacity: 1;
}

/* 字段组 */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.condition-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

/* 添加条件按钮 */
.add-condition-btn {
  margin-top: 4px;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  margin: 8px 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  color: #9ca3af;
}

.empty-state svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #6b7280;
}

.empty-state span {
  font-size: 12px;
}

/* 默认分支区域 */
.default-branch-section {
  margin-top: 8px;
}

.default-branch-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: white;
  transition: all 0.2s;
}

.default-branch-card:hover {
  border-color: #6b7280;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.default-branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.default-branch-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.default-icon {
  font-size: 18px;
}

.default-branch-desc {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* 必填标记 */
.required-mark {
  color: #ef4444;
  font-weight: bold;
  margin-left: 4px;
}

/* 错误提示 */
.error-hint {
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
  padding: 6px 10px;
  background: #fee2e2;
  border-radius: 4px;
  border-left: 3px solid #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 警告提示 */
.warning-hint {
  font-size: 12px;
  color: #f59e0b;
  margin-top: 6px;
  padding: 6px 10px;
  background: #fef3c7;
  border-radius: 4px;
  border-left: 3px solid #f59e0b;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 无效配置的分支徽章 */
.branch-number-badge.invalid {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.warning-icon {
  font-size: 10px;
  margin-left: 2px;
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}
</style>
