<script setup lang="ts">
import type { TraceDetail, TraceNode, TraceRun } from '#/api/monitor/trace/model';

import { computed, ref, shallowRef } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  Alert,
  Descriptions,
  DescriptionsItem,
  Empty,
  Tag,
  Tooltip,
  Tree,
} from 'ant-design-vue';

import {
  traceDetail,
  traceNodeList,
  traceRunInfo,
} from '#/api/monitor/trace';

// ======================== Types ========================

interface TreeNode {
  children?: TreeNode[];
  key: string;
  raw: TraceNode;
  title: string;
}

// ======================== State ========================

const currentRun = shallowRef<null | TraceRun>(null);
const nodeList = ref<TraceNode[]>([]);
const selectedKeys = ref<string[]>([]);
const detailData = shallowRef<null | TraceDetail>(null);

// ======================== Drawer ========================

const [BasicDrawer, drawerApi] = useVbenDrawer({
  async onOpenChange(open) {
    if (!open) return null;

    drawerApi.drawerLoading(true);
    const { traceId } = drawerApi.getData() as { traceId: string };
    try {
      const [runInfo, nodes, detail] = await Promise.all([
        traceRunInfo(traceId),
        traceNodeList(traceId),
        traceDetail(traceId),
      ]);
      detailData.value = detail;
      currentRun.value = detail.run || detail.traceRun || runInfo;
      nodeList.value = getDetailNodes(detail, nodes);
      selectedKeys.value = treeData.value[0]?.key ? [treeData.value[0].key] : [];
    } finally {
      drawerApi.drawerLoading(false);
    }
  },
  onClosed() {
    currentRun.value = null;
    nodeList.value = [];
    selectedKeys.value = [];
    detailData.value = null;
  },
});

// ======================== Tree ========================

const treeData = computed<TreeNode[]>(() => buildTree(nodeList.value));

const nodeMap = computed(() => {
  const map = new Map<string, TraceNode>();
  collectNodes(treeData.value, map);
  return map;
});

const selectedNode = computed(() => nodeMap.value.get(selectedKeys.value[0] || ''));

// ======================== Statistics ========================

const stats = computed(() => detailData.value?.statistics);

// ======================== Helpers ========================

function getDetailNodes(detail: TraceDetail, fallback: TraceNode[]) {
  return detail.nodes || detail.nodeList || detail.traceNodes || fallback || [];
}

function buildTree(nodes: TraceNode[]): TreeNode[] {
  if (nodes.some((node) => node.children?.length)) {
    return nodes.map((node, index) => toTreeNode(node, index));
  }

  const treeNodes = nodes.map((node, index) => toTreeNode(node, index));
  const nodeMapById = new Map(treeNodes.map((node) => [node.key, node]));
  const roots: TreeNode[] = [];

  for (const item of treeNodes) {
    const parentKey = String(item.raw.parentNodeId || item.raw.parentId || '');
    const parent = parentKey ? nodeMapById.get(parentKey) : undefined;
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}

function toTreeNode(node: TraceNode, index: number): TreeNode {
  const key = String(node.nodeId || `${node.traceId || 'trace-node'}-${index}`);
  const children = node.children?.map((child, childIndex) =>
    toTreeNode(child, childIndex),
  );
  const displayName = node.nodeDisplayName || node.nodeName || node.nodeType || key;
  const duration = node.durationMs == null ? '' : ` (${formatDuration(node.durationMs)})`;

  return { children, key, raw: node, title: `${displayName}${duration}` };
}

function collectNodes(nodes: TreeNode[], map: Map<string, TraceNode>) {
  for (const node of nodes) {
    map.set(node.key, node.raw);
    if (node.children?.length) collectNodes(node.children, map);
  }
}

function handleSelect(keys: (string | number)[]) {
  selectedKeys.value = keys.map(String);
}

// ======================== Formatters ========================

function formatDuration(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return '-';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`;
  const m = Math.floor(ms / 60_000);
  const s = ((ms % 60_000) / 1000).toFixed(1);
  return `${m}m ${s}s`;
}

function statusTagColor(status?: string): string {
  const key = (status || '').toLowerCase();
  const colorMap: Record<string, string> = {
    error: 'error',
    fail: 'error',
    failed: 'error',
    running: 'processing',
    success: 'success',
    timeout: 'warning',
  };
  return colorMap[key] || 'default';
}

function tryFormatJson(raw: any): string {
  if (!raw) return '-';
  try {
    const jsonValue = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return JSON.stringify(jsonValue, null, 2);
  } catch {
    return typeof raw === 'string' ? raw : String(raw);
  }
}

// ======================== Payload helpers ========================

function hasParsedContent(parsed?: Record<string, any> | null): boolean {
  if (!parsed || typeof parsed !== 'object') return false;
  return Object.keys(parsed).length > 0;
}

function formatPayloadValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return `${value.length} 项`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isSimpleValue(value: any): boolean {
  return value === null || value === undefined
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean';
}

function isComplexArray(value: any): boolean {
  return Array.isArray(value) && value.length > 0 && !isSimpleValue(value[0]);
}

// ======================== Timeline ========================

interface TimelineItem {
  node: TraceNode;
  displayName: string;
  typeLabel: string;
  durationMs: number;
  percent: number;
  leftPercent: number;
  statusClass: string;
}

const timeline = computed<TimelineItem[]>(() => {
  const nodes = nodeList.value;
  if (!nodes.length) return [];

  const runStart = currentRun.value?.startTime;
  const baseStart = runStart
    ? new Date(runStart).getTime()
    : nodes.reduce((min, n) => {
        const t = n.startTime ? new Date(n.startTime).getTime() : Infinity;
        return t < min ? t : min;
      }, Infinity);

  const runEnd = currentRun.value?.endTime
    ? new Date(currentRun.value.endTime).getTime()
    : nodes.reduce((max, n) => {
        const t = n.endTime ? new Date(n.endTime).getTime() : 0;
        return t > max ? t : max;
      }, 0);

  const totalWindow = Math.max(runEnd - baseStart, currentRun.value?.durationMs ?? 1, 1);

  return nodes
    .filter((n: TraceNode) => n.startTime != null || n.durationMs != null)
    .map((n) => {
      const start = n.startTime ? new Date(n.startTime).getTime() : baseStart;
      const offsetMs = Math.max(0, start - baseStart);
      // 优先用 durationMs，为 0 时用时间差兜底
      let durationMs = n.durationMs ?? 0;
      if (durationMs <= 0 && n.endTime) {
        durationMs = Math.max(0, new Date(n.endTime).getTime() - start);
      }
      const percent = totalWindow > 0 ? Math.min(100, (Math.max(durationMs, 1) / totalWindow) * 100) : 0;
      const leftPercent = totalWindow > 0 ? Math.min(99, (offsetMs / totalWindow) * 100) : 0;

      const statusKey = (n.status || '').toLowerCase();
      let statusClass = 'bg-blue-400';
      if (statusKey === 'success') statusClass = 'bg-emerald-400';
      else if (statusKey === 'error' || statusKey === 'failed') statusClass = 'bg-red-400';
      else if (statusKey === 'running') statusClass = 'bg-amber-400';

      return {
        node: n,
        displayName: n.nodeDisplayName || n.nodeName || n.nodeType || n.nodeId || '-',
        typeLabel: n.nodeTypeLabel || n.nodeType || '-',
        durationMs,
        percent: Math.max(percent, 0.8),
        leftPercent,
        statusClass,
      };
    })
    .sort((a: TimelineItem, b: TimelineItem) => a.leftPercent - b.leftPercent);
});

const topSlowNodes = computed(() => stats.value?.topSlowNodes || []);
</script>

<template>
  <BasicDrawer :footer="false" class="w-[960px]" title="链路追踪详情">
    <div v-if="currentRun" class="flex flex-col gap-[16px]">
      <!-- ========== 运行基本信息 ========== -->
      <Descriptions bordered size="small" :column="2">
        <DescriptionsItem label="Trace名称">
          {{ currentRun.traceName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="Trace ID">
          <span class="font-mono text-xs">{{ currentRun.traceId }}</span>
        </DescriptionsItem>
        <DescriptionsItem label="业务类型">
          {{ currentRun.businessTypeLabel || currentRun.businessType || '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="业务ID">
          {{ currentRun.businessId || '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="状态">
          <Tag :color="statusTagColor(currentRun.status)">{{ currentRun.statusLabel || currentRun.status || '-' }}</Tag>
        </DescriptionsItem>
        <DescriptionsItem label="总耗时">
          <span class="font-semibold text-blue-600">
            {{ formatDuration(currentRun.durationMs) }}
          </span>
        </DescriptionsItem>
        <DescriptionsItem label="开始时间">
          {{ currentRun.startTime ? formatDateTime(currentRun.startTime) : '-' }}
        </DescriptionsItem>
        <DescriptionsItem v-if="currentRun.errorMessage" label="异常信息" :span="2">
          <span class="font-semibold text-red-600">
            {{ currentRun.errorMessage }}
          </span>
        </DescriptionsItem>
      </Descriptions>

      <!-- ========== 统计卡片 ========== -->
      <div
        v-if="stats"
        class="grid grid-cols-5 gap-[12px]"
      >
        <div class="rounded-lg border border-solid border-gray-200 bg-gray-50 px-[12px] py-[10px] text-center">
          <div class="mb-[4px] text-xs text-gray-500">总节点</div>
          <div class="text-xl font-bold" style="color: #1677ff">{{ stats.totalNodes }}</div>
        </div>
        <div class="rounded-lg border border-solid border-gray-200 bg-gray-50 px-[12px] py-[10px] text-center">
          <div class="mb-[4px] text-xs text-gray-500">成功</div>
          <div class="text-xl font-bold" style="color: #52c41a">{{ stats.successCount }}</div>
        </div>
        <div class="rounded-lg border border-solid border-gray-200 bg-gray-50 px-[12px] py-[10px] text-center">
          <div class="mb-[4px] text-xs text-gray-500">失败</div>
          <div class="text-xl font-bold" :style="{ color: stats.failedCount > 0 ? '#ff4d4f' : '#999' }">
            {{ stats.failedCount }}
          </div>
        </div>
        <div class="rounded-lg border border-solid border-gray-200 bg-gray-50 px-[12px] py-[10px] text-center">
          <div class="mb-[4px] text-xs text-gray-500">平均耗时</div>
          <div class="text-lg font-bold" style="color: #722ed1">{{ formatDuration(stats.avgDurationMs) }}</div>
        </div>
        <div class="rounded-lg border border-solid border-gray-200 bg-gray-50 px-[12px] py-[10px] text-center">
          <div class="mb-[4px] text-xs text-gray-500">最大深度</div>
          <div class="text-xl font-bold" style="color: #fa8c16">{{ stats.maxDepth }}</div>
        </div>
      </div>

      <!-- ========== 执行时间排序 ========== -->
      <div v-if="topSlowNodes.length > 0" class="rounded-lg border border-solid border-gray-200 p-[12px]">
        <div class="mb-[8px] text-sm font-semibold text-gray-700">
          执行时间排序
        </div>
        <div class="flex flex-col gap-[6px]">
          <div
            v-for="(slow, idx) in topSlowNodes"
            :key="slow.nodeId"
            class="flex items-center gap-[8px] rounded bg-gray-50 px-[10px] py-[6px]"
          >
            <span class="text-xs font-medium text-gray-400">#{{ idx + 1 }}</span>
            <span class="flex-1 truncate text-sm">{{ slow.nodeDisplayName }}</span>
            <Tag>{{ slow.nodeTypeLabel }}</Tag>
            <span class="text-sm font-semibold text-blue-600">{{ formatDuration(slow.durationMs) }}</span>
            <span class="text-xs text-gray-400">{{ slow.percentOfTotal }}%</span>
          </div>
        </div>
      </div>

      <!-- ========== 节点树 + 详情 两栏布局 ========== -->
      <div class="grid grid-cols-1 gap-[16px] lg:grid-cols-[320px_1fr]">
        <!-- 左侧：节点树 -->
        <div class="rounded-lg border border-solid border-gray-200 p-[12px]">
          <div class="mb-[8px] text-sm font-semibold">执行节点</div>
          <Tree
            v-if="treeData.length > 0"
            :selected-keys="selectedKeys"
            :show-line="{ showLeafIcon: false }"
            :tree-data="treeData"
            :virtual="false"
            default-expand-all
            @select="handleSelect"
          />
          <Empty v-else description="暂无节点" />
        </div>

        <!-- 右侧：节点详情 + Payload + 时序 -->
        <div class="flex flex-col gap-[12px]">
          <!-- 节点详情 -->
          <div class="rounded-lg border border-solid border-gray-200 p-[12px]">
            <div class="mb-[8px] text-sm font-semibold">节点详情</div>
            <Descriptions v-if="selectedNode" bordered size="small" :column="2">
              <DescriptionsItem label="节点名称">
                {{ selectedNode.nodeDisplayName || selectedNode.nodeName || '-' }}
              </DescriptionsItem>
              <DescriptionsItem label="节点类型">
                <Tag>{{ selectedNode.nodeTypeLabel || selectedNode.nodeType || '-' }}</Tag>
              </DescriptionsItem>
              <DescriptionsItem label="状态">
                <Tag :color="statusTagColor(selectedNode.status)">{{ selectedNode.statusLabel || selectedNode.status || '-' }}</Tag>
              </DescriptionsItem>
              <DescriptionsItem label="耗时">
                <span class="font-semibold text-blue-600">
                  {{ formatDuration(selectedNode.durationMs) }}
                </span>
              </DescriptionsItem>
              <DescriptionsItem v-if="selectedNode.startTime" label="开始时间">
                {{ formatDateTime(selectedNode.startTime) }}
              </DescriptionsItem>
              <DescriptionsItem v-if="selectedNode.endTime" label="结束时间">
                {{ formatDateTime(selectedNode.endTime) }}
              </DescriptionsItem>
              <DescriptionsItem v-if="selectedNode.errorMessage" label="异常信息" :span="2">
                <Alert
                  type="error"
                  :message="selectedNode.errorMessage"
                  banner
                  class="[&_.ant-alert-message]:text-xs"
                />
              </DescriptionsItem>
            </Descriptions>
            <Empty v-else description="请在左侧选择节点查看详情" class="py-[32px]" />
          </div>

          <!-- Input Payload -->
          <div
            v-if="selectedNode && (hasParsedContent(selectedNode.parsedInput) || selectedNode.inputPayload)"
            class="rounded-lg border border-solid border-gray-200 p-[12px]"
          >
            <div class="mb-[8px] text-sm font-semibold">输入参数</div>
            <!-- 结构化展示 -->
            <table
              v-if="hasParsedContent(selectedNode.parsedInput)"
              class="w-full text-xs"
            >
              <tbody>
                <tr
                  v-for="(value, key) in (selectedNode.parsedInput as Record<string, any>)"
                  :key="key"
                  class="border-b border-gray-100"
                >
                  <td class="w-[140px] py-[6px] pr-[12px] font-medium text-gray-500 align-top whitespace-nowrap">
                    {{ key }}
                  </td>
                  <td class="py-[6px] text-gray-700 break-all">
                    <template v-if="isComplexArray(value)">
                      <details class="cursor-pointer">
                        <summary class="text-blue-600 hover:text-blue-800">
                          {{ (value as any[]).length }} 条记录（点击展开）
                        </summary>
                        <pre class="json-preview-small mt-[4px]">{{ JSON.stringify(value, null, 2) }}</pre>
                      </details>
                    </template>
                    <template v-else-if="isSimpleValue(value)">
                      {{ formatPayloadValue(value) }}
                    </template>
                    <template v-else>
                      <Tooltip :title="JSON.stringify(value)">
                        <span class="text-blue-600 cursor-help">查看 (hover)</span>
                      </Tooltip>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- 回退：原始 JSON -->
            <pre
              v-else-if="selectedNode.inputPayload"
              class="json-preview"
            >{{ tryFormatJson(selectedNode.inputPayload) }}</pre>
          </div>

          <!-- Output Payload -->
          <div
            v-if="selectedNode && (hasParsedContent(selectedNode.parsedOutput) || selectedNode.outputPayload)"
            class="rounded-lg border border-solid border-gray-200 p-[12px]"
          >
            <div class="mb-[8px] text-sm font-semibold">输出结果</div>
            <table
              v-if="hasParsedContent(selectedNode.parsedOutput)"
              class="w-full text-xs"
            >
              <tbody>
                <tr
                  v-for="(value, key) in (selectedNode.parsedOutput as Record<string, any>)"
                  :key="key"
                  class="border-b border-gray-100"
                >
                  <td class="w-[140px] py-[6px] pr-[12px] font-medium text-gray-500 align-top whitespace-nowrap">
                    {{ key }}
                  </td>
                  <td class="py-[6px] text-gray-700 break-all">
                    <template v-if="isComplexArray(value)">
                      <details class="cursor-pointer">
                        <summary class="text-blue-600 hover:text-blue-800">
                          {{ (value as any[]).length }} 条记录（点击展开）
                        </summary>
                        <pre class="json-preview-small mt-[4px]">{{ JSON.stringify(value, null, 2) }}</pre>
                      </details>
                    </template>
                    <template v-else-if="isSimpleValue(value)">
                      {{ formatPayloadValue(value) }}
                    </template>
                    <template v-else>
                      <Tooltip :title="JSON.stringify(value)">
                        <span class="text-blue-600 cursor-help">查看 (hover)</span>
                      </Tooltip>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
            <pre
              v-else-if="selectedNode.outputPayload"
              class="json-preview"
            >{{ tryFormatJson(selectedNode.outputPayload) }}</pre>
          </div>

          <!-- Metadata -->
          <div
            v-if="selectedNode && (hasParsedContent(selectedNode.parsedMetadata) || selectedNode.metadata)"
            class="rounded-lg border border-solid border-gray-200 p-[12px]"
          >
            <div class="mb-[8px] text-sm font-semibold">元数据</div>
            <table
              v-if="hasParsedContent(selectedNode.parsedMetadata)"
              class="w-full text-xs"
            >
              <tbody>
                <tr
                  v-for="(value, key) in (selectedNode.parsedMetadata as Record<string, any>)"
                  :key="key"
                  class="border-b border-gray-100"
                >
                  <td class="w-[140px] py-[6px] pr-[12px] font-medium text-gray-500 align-top whitespace-nowrap">
                    {{ key }}
                  </td>
                  <td class="py-[6px] text-gray-700 break-all">
                    <template v-if="isComplexArray(value)">
                      <details class="cursor-pointer">
                        <summary class="text-blue-600 hover:text-blue-800">
                          {{ (value as any[]).length }} 条记录（点击展开）
                        </summary>
                        <pre class="json-preview-small mt-[4px]">{{ JSON.stringify(value, null, 2) }}</pre>
                      </details>
                    </template>
                    <template v-else-if="isSimpleValue(value)">
                      {{ formatPayloadValue(value) }}
                    </template>
                    <template v-else>
                      <Tooltip :title="JSON.stringify(value)">
                        <span class="text-blue-600 cursor-help">查看 (hover)</span>
                      </Tooltip>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
            <pre
              v-else-if="selectedNode.metadata"
              class="json-preview"
            >{{ tryFormatJson(selectedNode.metadata) }}</pre>
          </div>

          <!-- 执行时序 -->
          <div
            v-if="timeline.length > 0"
            class="rounded-lg border border-solid border-gray-200 p-[12px]"
          >
            <div class="mb-[8px] text-sm font-semibold">
              执行时序
              <span class="ml-[8px] text-xs font-normal text-gray-400">
                共 {{ timeline.length }} 个节点
              </span>
            </div>
            <div class="flex flex-col gap-[4px]">
              <div
                v-for="item in timeline"
                :key="item.node.nodeId"
                class="group flex cursor-pointer items-center gap-[8px] rounded px-[8px] py-[4px] hover:bg-blue-50"
                :class="{ 'bg-blue-50 ring-1 ring-blue-200': selectedKeys[0] === item.node.nodeId }"
                @click="selectedKeys = [item.node.nodeId || '']"
              >
                <div class="flex w-[260px] shrink-0 items-center gap-[6px]">
                  <span
                    class="min-w-0 flex-1 truncate text-xs"
                    :title="item.displayName"
                  >
                    {{ item.displayName }}
                  </span>
                  <Tag class="!m-0 shrink-0 !text-[10px]">{{ item.typeLabel }}</Tag>
                </div>
                <div class="relative h-[20px] flex-1 rounded bg-gray-100">
                  <div
                    class="absolute top-[2px] h-[16px] min-w-[4px] rounded transition-all"
                    :class="item.statusClass"
                    :style="{
                      left: `${item.leftPercent}%`,
                      width: `${item.percent}%`,
                    }"
                    :title="`${item.displayName}: ${formatDuration(item.durationMs)}`"
                  />
                </div>
                <span class="w-[70px] shrink-0 text-right text-xs font-medium text-gray-600">
                  {{ formatDuration(item.durationMs) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>

<style lang="scss" scoped>
.json-preview {
  max-height: 260px;
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  @apply rounded bg-gray-50 p-[8px] text-xs;
}

.json-preview-small {
  max-height: 200px;
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  @apply rounded bg-gray-50 p-[6px] text-[11px];
}
</style>
