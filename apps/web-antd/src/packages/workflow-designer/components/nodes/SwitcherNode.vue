<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import CommonNodeHeader from '../CommonNodeHeader.vue'

const props = defineProps<NodeProps>()

// 获取分支配置
const nodeConfig = computed(() => (props.data?.nodeConfig || {}) as any)

// 获取所有分支（用于生成Handle）
const cases = computed(() => {
  return Array.isArray(nodeConfig.value.cases) ? nodeConfig.value.cases : []
})

// 计算每个Handle的垂直位置
function getHandlePosition(index: number, total: number) {
  if (total === 0) return 50
  if (total === 1) return 50
  
  // 如果是最后一个（默认分支），固定在50%位置
  if (index === total - 1) {
    return 50
  }
  
  // 其他分支均匀分布在15%到85%之间
  const step = 70 / total
  return 15 + step * (index + 0.5)
}

// 截断文本
function cut(val: string, n = 20) {
  if (!val) return ''
  return val.length > n ? `${val.slice(0, n)}...` : val
}

// 获取条件摘要
function getConditionSummary(caseItem: any) {
  if (!caseItem.conditions || caseItem.conditions.length === 0) {
    return '未配置条件'
  }
  const first = caseItem.conditions[0]
  const count = caseItem.conditions.length
  const summary = `${first.node_param_name || '参数'} ${first.operator || ''} ${cut(first.value || '', 10)}`
  return count > 1 ? `${summary} +${count - 1}` : summary
}
</script>

<template>
  <div class="switcher-node">
    <!-- 输入Handle -->
    <Handle type="target" :position="Position.Left" class="handle-target" />
    
    <!-- 节点头部 -->
    <CommonNodeHeader :wf-node="data" />
    
    <!-- 节点内容 -->
    <div class="node-content">
      <div class="info-line">
        <span class="label">分支数量:</span>
        <span class="value">{{ cases.length }}</span>
      </div>
      <div class="info-line">
        <span class="label">逻辑:</span>
        <span class="value">{{ cases[0]?.operator?.toUpperCase() || 'AND' }}</span>
      </div>
    </div>

    <!-- 分支列表 -->
    <div v-if="cases.length > 0" class="branches-list">
      <div
        v-for="(caseItem, index) in cases"
        :key="caseItem.uuid"
        class="branch-item"
        :style="{ top: `${getHandlePosition(index, cases.length + 1)}%` }"
      >
        <div class="branch-label">
          <span class="branch-number">{{ index + 1 }}</span>
          <span class="branch-condition">{{ getConditionSummary(caseItem) }}</span>
        </div>
        <!-- 每个分支的输出Handle -->
        <Handle
          :id="caseItem.uuid"
          type="source"
          :position="Position.Right"
          class="handle-source branch-handle"
          :style="{ top: '50%', transform: 'translateY(-50%)' }"
        />
      </div>
    </div>

    <!-- 默认分支 -->
    <div class="default-branch-wrapper">
      <div class="default-branch" :style="{ top: `${getHandlePosition(cases.length, cases.length + 1)}%` }">
        <div class="branch-label default">
          <span class="branch-number">默认</span>
          <span class="branch-condition">其他情况</span>
        </div>
        <Handle
          id="default"
          type="source"
          :position="Position.Right"
          class="handle-source default-handle"
          :style="{ top: '50%', transform: 'translateY(-50%)' }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.switcher-node {
  min-width: 280px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  cursor: pointer; /* 明确指示节点可点击 */
}

.node-content {
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.info-line {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.info-line .label {
  color: #6b7280;
  font-weight: 500;
}

.info-line .value {
  color: #111827;
  font-weight: 600;
}

.branches-list {
  position: relative;
  min-height: 100px;
  padding: 8px 0;
}

.default-branch-wrapper {
  position: relative;
  min-height: 60px;
  padding: 12px 0;
  margin-top: 8px;
  border-top: 1px dashed #e5e7eb;
  background: linear-gradient(to bottom, transparent, #f8fafc);
}

.branch-item,
.default-branch {
  position: absolute;
  right: 0;
  width: 100%;
  padding: 6px 40px 6px 12px;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
  pointer-events: none; /* 允许点击事件穿透到父节点 */
}

.branch-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  flex: 1;
  pointer-events: none; /* 允许点击事件穿透 */
}

.branch-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
  padding: 0 4px;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

.branch-label.default {
  opacity: 0.9;
}

.branch-label.default .branch-number {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 1px 3px rgba(107, 114, 128, 0.3);
  min-width: 44px;
  padding: 0 8px;
}

.branch-condition {
  color: #4b5563;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.branch-label.default .branch-condition {
  color: #6b7280;
  font-style: italic;
}

.handle-target {
  left: -8px;
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.handle-source {
  right: -8px;
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.default-handle {
  background: #6b7280;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2);
}

.branch-handle,
.default-handle {
  pointer-events: auto; /* Handle 需要响应鼠标事件 */
}

.branch-handle:hover,
.default-handle:hover {
  width: 14px;
  height: 14px;
  right: -9px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.default-handle:hover {
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.3);
}

/* 连接时的高亮效果 */
.handle-source.connecting {
  background: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
}
</style>

