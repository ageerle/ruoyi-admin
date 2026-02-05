<script setup lang="ts">
import type { GraphData, GraphEdge, GraphNode } from '#/api/graph/model';

import { onMounted, onUnmounted, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

// 注意: 使用 G6 v5 API
// pnpm add @antv/g6 -F @vben/web-antd

interface Props {
  data: GraphData | null;
  layout?: 'circular' | 'dagre' | 'force' | 'radial';
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'force',
  width: 800,
  height: 600,
});

const emit = defineEmits<{
  edgeClick: [edge: GraphEdge];
  nodeClick: [node: GraphNode];
}>();

const container = ref<HTMLDivElement>();
let graph: any = null;

// 初始化图谱 (G6 v5)
async function initGraph() {
  if (!container.value) return;

  try {
    // 动态导入G6 v5
    const G6 = await import('@antv/g6');
    console.log('G6 模块:', G6);
    console.log('Graph 类:', G6.Graph);

    graph = new G6.Graph({
      container: container.value,
      width: props.width,
      height: props.height,
      // 自动调整画布
      autoFit: 'view',
      // 布局配置
      layout: {
        type: props.layout || 'force',
      },
      // 节点样式配置
      node: {
        style: {
          size: 40,
          fill: '#5B8FF9',
          stroke: '#fff',
          lineWidth: 2,
          labelText: (d: any) => d.data?.label || d.id || '节点',
          labelFill: '#000',
          labelFontSize: 12,
          labelOffsetY: 50,
          labelBackground: true,
          labelBackgroundFill: '#fff',
          labelBackgroundOpacity: 0.8,
          labelPadding: [4, 8],
          labelRadius: 4,
        },
        palette: {
          type: 'group',
          field: (d: any) => d.data?.type || 'default',
        },
      },
      // 边样式配置
      edge: {
        style: {
          stroke: '#e2e2e2',
          lineWidth: 2,
          labelText: (d: any) => d.data?.label || '',
          labelFill: '#000',
          labelFontSize: 10,
          labelBackground: true,
          labelBackgroundFill: '#fff',
          labelBackgroundOpacity: 0.8,
          labelPadding: [2, 4],
          labelRadius: 2,
        },
      },
      // 交互行为
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'click-select'],
    });

    // 监听节点点击事件
    graph.on('node:click', (evt: any) => {
      const { item } = evt;
      if (item) {
        const model = item.getModel();
        emit('nodeClick', model.data.originalData || model.data);
      }
    });

    // 监听边点击事件
    graph.on('edge:click', (evt: any) => {
      const { item } = evt;
      if (item) {
        const model = item.getModel();
        emit('edgeClick', model.data.originalData || model.data);
      }
    });

    // 渲染图谱
    await graph.render();

    message.success('图谱初始化成功');
  } catch (error) {
    console.error('初始化图谱失败:', error);
    message.error('初始化图谱失败，请检查是否已安装 @antv/g6');
  }
}

// 获取节点颜色
function getNodeColor(type: string): string {
  const colorMap: Record<string, string> = {
    PERSON: '#5B8FF9',
    ORGANIZATION: '#5AD8A6',
    LOCATION: '#5D7092',
    EVENT: '#F6BD16',
    CONCEPT: '#E86452',
    PRODUCT: '#6DC8EC',
    TECHNOLOGY: '#945FB9',
    default: '#5B8FF9',
  };
  return colorMap[type] || colorMap.default;
}

// 加载图谱数据
async function loadGraphData() {
  if (!props.data || !graph) return;

  try {
    const { nodes = [], edges = [] } = props.data;

    console.log('GraphCanvas - 接收到的数据:', {
      nodesCount: nodes.length,
      edgesCount: edges.length,
      sampleNode: nodes[0],
    });

    if (nodes.length === 0) {
      message.info('暂无图谱数据');
      return;
    }

    // G6 v5 使用 changeData 方法更新数据
    // ⭐ 处理后端数据格式：nodeId 可能为 null，使用 name 作为 fallback
    const graphData = {
      nodes: nodes.map((n, index) => ({
        id: n.nodeId || n.id || `node-${index}`, // ⭐ 使用 index 作为 fallback
        data: {
          label: n.name || '未命名',
          type: n.label || 'default',
          originalData: n,
        },
      })),
      edges: edges.map((e, index) => ({
        id: e.edgeId || e.id || `edge-${index}`,
        source: e.sourceNodeId || e.source,
        target: e.targetNodeId || e.target,
        data: {
          label: e.label || e.description || '',
          originalData: e,
        },
      })),
    };

    console.log('GraphCanvas - 转换后的数据:', {
      nodesCount: graphData.nodes.length,
      edgesCount: graphData.edges.length,
      sampleNode: graphData.nodes[0],
      sampleNodeData: graphData.nodes[0]?.data,
    });

    // ⭐ 使用 setData 加载数据
    console.log('✅ 使用 setData 方法加载数据...');
    await graph.setData(graphData);

    await graph.render();

    message.success(
      `图谱加载成功：${nodes.length} 个节点，${edges.length} 条边`,
    );
  } catch (error) {
    console.error('加载图谱数据失败:', error);
    message.error('加载图谱数据失败');
  }
}

// 更新布局（G6 v5）
function updateLayout(layout: string) {
  if (!graph) {
    console.warn('⚠️ Graph实例不存在，无法更新布局');
    return;
  }

  console.log('🎨 切换布局:', layout);

  try {
    // G6 v5: 使用 setLayout
    graph.setLayout({
      type: layout,
      animated: true, // 动画效果
    });

    // 触发布局重新计算
    graph.layout();

    console.log('✅ 布局切换成功');
  } catch (error) {
    console.error('❌ 布局切换失败:', error);

    // 降级方案：重新加载数据（会重新应用布局）
    try {
      console.log('📦 使用降级方案：重新加载数据...');
      loadGraphData();
    } catch (fallbackError) {
      console.error('❌ 降级方案也失败:', fallbackError);
    }
  }
}

// 高亮节点（G6 v5）
function highlightNode(nodeId: string) {
  if (!graph) {
    console.warn('⚠️ Graph实例不存在，无法高亮节点');
    return;
  }

  console.log('🎯 开始高亮节点:', nodeId);

  try {
    // G6 v5: 使用 setElementState
    graph.setElementState(nodeId, 'selected', true);

    // G6 v5: 使用 focusElement
    graph.focusElement(nodeId, true);

    console.log('✅ 节点高亮成功');
  } catch (error) {
    console.error('❌ 高亮节点失败:', error);

    // 降级方案：直接更新节点样式
    try {
      const data = graph.getData();
      const node = data.nodes?.find((n: any) => n.id === nodeId);
      if (node) {
        graph.updateNodeData([
          {
            id: nodeId,
            data: {
              ...node.data,
              style: {
                ...node.data?.style,
                fill: '#ff4d4f', // 红色高亮
                stroke: '#ff4d4f',
                lineWidth: 3,
              },
            },
          },
        ]);
        console.log('✅ 使用降级方案高亮成功');
      }
    } catch (fallbackError) {
      console.error('❌ 降级方案也失败:', fallbackError);
    }
  }
}

// 清除高亮（G6 v5）
function clearHighlight() {
  if (!graph) return;

  console.log('🧹 清除所有高亮');

  try {
    // G6 v5: 清除所有元素状态
    const data = graph.getData();
    data.nodes?.forEach((node: any) => {
      graph.setElementState(node.id, 'selected', false);
    });
    console.log('✅ 高亮清除成功');
  } catch (error) {
    console.error('❌ 清除高亮失败:', error);
  }
}

// 导出图片（G6 v5）
function exportImage() {
  if (!graph) return;

  console.log('📷 开始导出图片');

  try {
    // G6 v5: 使用 toDataURL
    const dataURL = graph.toDataURL({
      type: 'image/png',
      backgroundColor: '#fff',
    });

    // 下载图片
    const link = document.createElement('a');
    link.download = 'knowledge-graph.png';
    link.href = dataURL;
    link.click();

    console.log('✅ 图片导出成功');
  } catch (error) {
    console.error('❌ 导出图片失败:', error);
  }
}

// 暴露方法给父组件
defineExpose({
  highlightNode,
  clearHighlight,
  exportImage,
  updateLayout,
});

// 监听数据变化
watch(
  () => props.data,
  () => {
    loadGraphData();
  },
  { deep: true },
);

// 监听布局变化
watch(
  () => props.layout,
  (newLayout) => {
    if (newLayout && graph) {
      console.log('🔄 检测到布局变化:', newLayout);
      updateLayout(newLayout);
    }
  },
);

onMounted(() => {
  initGraph();
});

onUnmounted(() => {
  if (graph) {
    graph.destroy();
  }
});
</script>

<template>
  <div ref="container" class="graph-canvas"></div>
</template>

<style scoped>
.graph-canvas {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
