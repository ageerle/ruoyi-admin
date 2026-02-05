<script setup lang="ts">
import type { GraphData, GraphEdge, GraphNode } from '#/api/graph/model';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
} from 'ant-design-vue';

import {
  graphGetStats,
  graphQueryByKnowledge,
  graphSearchEntity,
} from '#/api/graph';

import GraphCanvas from './components/GraphCanvas.vue';

const route = useRoute();
const knowledgeId = ref<string>((route.query.knowledgeId as string) || '');
const instanceId = ref<string>((route.query.id as string) || '');

const loading = ref(false);
const graphData = ref<GraphData | null>(null);
const graphStats = ref<any>(null);
const selectedNode = ref<GraphNode | null>(null);
const selectedEdge = ref<GraphEdge | null>(null);
const nodeDetailVisible = ref(false);
const edgeDetailVisible = ref(false);

// 搜索和过滤
const searchKeyword = ref('');
const layoutType = ref<'circular' | 'dagre' | 'force' | 'radial'>('force');
const graphCanvasRef = ref<any>(null);

// 加载图谱数据
async function loadGraphData() {
  console.group('🔍 加载图谱数据调试');
  console.log('1. instanceId:', instanceId.value);
  console.log('2. knowledgeId:', knowledgeId.value);

  if (!knowledgeId.value) {
    message.warning('缺少知识库ID');
    console.groupEnd();
    return;
  }

  loading.value = true;
  try {
    console.log('3. 开始查询图谱数据...');
    const rawData = await graphQueryByKnowledge(knowledgeId.value, 500);
    console.log('4. 查询结果:', rawData);
    console.log('4.1 vertices:', rawData.vertices?.length);
    console.log('4.2 edges:', rawData.edges?.length);
    console.log('4.3 示例边:', rawData.edges?.[0]);

    // ⭐ 修复字段名不匹配问题：后端返回 vertices/edges，前端需要 nodes/edges
    const data: GraphData = {
      nodes: rawData.vertices || rawData.nodes || [],
      edges: rawData.edges || [],
    };

    console.log('5. 节点数量:', data.nodes.length);
    console.log('6. 边数量:', data.edges.length);

    if (data.edges.length === 0 && data.nodes.length > 0) {
      console.warn('⚠️ 警告：图谱中只有节点，没有边（关系）。可能原因：');
      console.warn('  1. LLM提取时没有识别到实体之间的关系');
      console.warn('  2. 关系提取失败或格式不正确');
      console.warn('  3. 文档内容中确实没有明确的关系');
      message.warning('图谱中暂无关系数据，建议重新构建图谱');
    }

    graphData.value = data;

    // 加载统计信息
    console.log('7. 开始查询统计信息...');
    const stats = await graphGetStats(knowledgeId.value);
    console.log('8. 统计结果（完整对象）:', JSON.stringify(stats, null, 2));
    console.log('8.1 totalNodes:', stats?.totalNodes);
    console.log('8.2 totalEdges:', stats?.totalEdges);
    console.log('8.3 entityTypes:', stats?.entityTypes);
    console.log('8.4 nodeCount:', stats?.nodeCount); // ⭐ 检查旧字段
    console.log('8.5 relationshipCount:', stats?.relationshipCount); // ⭐ 检查旧字段
    console.log('8.6 labelDistribution:', stats?.labelDistribution); // ⭐ 检查旧字段

    // ⭐ 确保统计数据有默认值（兼容新旧字段名）
    graphStats.value = {
      totalNodes: stats?.totalNodes || stats?.nodeCount || 0, // ⭐ 兼容旧字段 nodeCount
      totalEdges: stats?.totalEdges || stats?.relationshipCount || 0, // ⭐ 兼容旧字段 relationshipCount
      entityTypes: stats?.entityTypes || stats?.labelDistribution || {}, // ⭐ 兼容旧字段 labelDistribution
      relationTypes: stats?.relationTypes || {},
    };

    console.log('9. 最终使用的统计数据:', graphStats.value);

    if (data?.nodes?.length > 0) {
      message.success(
        `图谱数据加载成功：${data.nodes.length} 个节点，${data.edges?.length || 0} 条边`,
      );
    } else {
      message.warning('图谱数据为空，可能还未构建图谱');
    }

    console.groupEnd();
  } catch (error) {
    console.error('加载图谱数据失败:', error);
    message.error('加载图谱数据失败');
    console.groupEnd();
  } finally {
    loading.value = false;
  }
}

// 搜索实体
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    message.warning('请输入搜索关键词');
    return;
  }

  console.group('🔍 搜索实体调试');
  console.log('1. 搜索关键词:', searchKeyword.value);
  console.log('2. knowledgeId:', knowledgeId.value);

  try {
    const results = await graphSearchEntity({
      keyword: searchKeyword.value,
      knowledgeId: knowledgeId.value,
      limit: 10,
    });

    console.log('3. 搜索结果:', results);
    console.log('4. 结果数量:', results?.length);

    if (results && results.length > 0) {
      // 高亮第一个搜索结果
      const firstNode = results[0];
      console.log('5. 第一个结果:', firstNode);
      console.log('6. 节点ID:', firstNode.nodeId);

      if (graphCanvasRef.value?.highlightNode) {
        graphCanvasRef.value.highlightNode(firstNode.nodeId);
        console.log('7. 已调用高亮方法');
      } else {
        console.warn('⚠️ GraphCanvas组件没有highlightNode方法');
      }

      message.success(`找到 ${results.length} 个相关实体`);
    } else {
      message.info('未找到相关实体');
    }

    console.groupEnd();
  } catch (error) {
    console.error('❌ 搜索失败:', error);
    message.error(`搜索失败: ${error.message || '未知错误'}`);
    console.groupEnd();
  }
}

// 节点点击事件
function handleNodeClick(node: GraphNode) {
  selectedNode.value = node;
  nodeDetailVisible.value = true;
}

// 边点击事件
function handleEdgeClick(edge: GraphEdge) {
  selectedEdge.value = edge;
  edgeDetailVisible.value = true;
}

// 切换布局
function handleLayoutChange(value: any) {
  layoutType.value = value;
}

// 导出图片
function handleExportImage() {
  graphCanvasRef.value?.exportImage();
  message.success('图片导出成功');
}

// 刷新图谱
function handleRefresh() {
  graphCanvasRef.value?.clearHighlight();
  loadGraphData();
}

// 解析属性JSON
function parseProperties(properties: string | undefined) {
  if (!properties) return {};
  try {
    return JSON.parse(properties);
  } catch {
    return {};
  }
}

onMounted(() => {
  loadGraphData();
});
</script>

<script lang="ts">
// 实体类型颜色映射
function getEntityColor(type: string): string {
  const colorMap: Record<string, string> = {
    PERSON: '#5B8FF9',
    ORGANIZATION: '#5AD8A6',
    LOCATION: '#5D7092',
    EVENT: '#F6BD16',
    CONCEPT: '#E86452',
    PRODUCT: '#6DC8EC',
    TECHNOLOGY: '#945FB9',
  };
  return colorMap[type] || '#5B8FF9';
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="graph-visualization">
      <Row :gutter="16">
        <!-- 左侧工具栏 -->
        <Col :span="4">
          <Card title="工具栏" size="small">
            <Space direction="vertical" style="width: 100%">
              <!-- 搜索 -->
              <Input
                v-model:value="searchKeyword"
                placeholder="搜索实体"
                @press-enter="handleSearch"
              >
                <template #prefix>
                  <SearchOutlined />
                </template>
              </Input>
              <Button type="primary" block @click="handleSearch"> 搜索 </Button>

              <!-- 布局选择 -->
              <div style="margin-top: 16px">
                <div style="margin-bottom: 8px; font-weight: 500">布局方式</div>
                <Select
                  v-model:value="layoutType"
                  style="width: 100%"
                  @change="handleLayoutChange"
                >
                  <Select.Option value="force">力导向布局</Select.Option>
                  <Select.Option value="dagre">层次布局</Select.Option>
                  <Select.Option value="circular">环形布局</Select.Option>
                  <Select.Option value="radial">辐射布局</Select.Option>
                </Select>
              </div>

              <!-- 操作按钮 -->
              <div style="margin-top: 16px">
                <Space direction="vertical" style="width: 100%">
                  <Button block @click="handleExportImage">
                    <DownloadOutlined /> 导出图片
                  </Button>
                  <Button block @click="handleRefresh">
                    <ReloadOutlined /> 刷新
                  </Button>
                </Space>
              </div>

              <!-- 统计信息 -->
              <div v-if="graphStats" style="margin-top: 16px">
                <div style="margin-bottom: 8px; font-weight: 500">图谱统计</div>
                <Statistic
                  title="节点数"
                  :value="graphStats.totalNodes ?? 0"
                  :value-style="{
                    color: graphStats.totalNodes > 0 ? '#3f8600' : '#999',
                  }"
                />
                <Statistic
                  title="边数"
                  :value="graphStats.totalEdges ?? 0"
                  :value-style="{
                    color: graphStats.totalEdges > 0 ? '#3f8600' : '#999',
                  }"
                  style="margin-top: 8px"
                />
              </div>

              <!-- 图例 -->
              <div style="margin-top: 16px">
                <div style="margin-bottom: 8px; font-weight: 500">实体类型</div>
                <div
                  v-if="
                    graphStats &&
                    graphStats.entityTypes &&
                    Object.keys(graphStats.entityTypes).length > 0
                  "
                >
                  <div
                    v-for="(count, type) in graphStats.entityTypes"
                    :key="type"
                    style="margin-bottom: 4px"
                  >
                    <span
                      :style="{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: getEntityColor(type),
                        marginRight: '8px',
                      }"
                    ></span>
                    {{ type }} ({{ count }})
                  </div>
                </div>
                <div v-else style="font-size: 12px; color: #999">
                  暂无实体类型数据
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <!-- 右侧图谱画布 -->
        <Col :span="20">
          <Card title="知识图谱可视化" size="small">
            <Spin :spinning="loading" tip="加载中...">
              <div style="height: calc(100vh - 200px)">
                <GraphCanvas
                  ref="graphCanvasRef"
                  :data="graphData"
                  :layout="layoutType"
                  :width="1200"
                  :height="800"
                  @node-click="handleNodeClick"
                  @edge-click="handleEdgeClick"
                />
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>

      <!-- 节点详情抽屉 -->
      <Drawer
        v-model:open="nodeDetailVisible"
        title="节点详情"
        :width="400"
        placement="right"
      >
        <Descriptions v-if="selectedNode" :column="1" bordered size="small">
          <DescriptionsItem label="节点ID">
            {{ selectedNode.nodeId }}
          </DescriptionsItem>
          <DescriptionsItem label="名称">
            {{ selectedNode.name }}
          </DescriptionsItem>
          <DescriptionsItem label="类型">
            {{ selectedNode.label }}
          </DescriptionsItem>
          <DescriptionsItem label="描述" v-if="selectedNode.description">
            {{ selectedNode.description }}
          </DescriptionsItem>
          <DescriptionsItem label="置信度" v-if="selectedNode.confidence">
            {{ (selectedNode.confidence * 100).toFixed(2) }}%
          </DescriptionsItem>
          <DescriptionsItem label="属性" v-if="selectedNode.properties">
            <pre style="margin: 0">{{
              JSON.stringify(parseProperties(selectedNode.properties), null, 2)
            }}</pre>
          </DescriptionsItem>
        </Descriptions>
      </Drawer>

      <!-- 边详情抽屉 -->
      <Drawer
        v-model:open="edgeDetailVisible"
        title="关系详情"
        :width="400"
        placement="right"
      >
        <Descriptions v-if="selectedEdge" :column="1" bordered size="small">
          <DescriptionsItem label="边ID">
            {{ selectedEdge.edgeId }}
          </DescriptionsItem>
          <DescriptionsItem label="起点">
            {{ selectedEdge.sourceNodeId }}
          </DescriptionsItem>
          <DescriptionsItem label="终点">
            {{ selectedEdge.targetNodeId }}
          </DescriptionsItem>
          <DescriptionsItem label="关系类型">
            {{ selectedEdge.label }}
          </DescriptionsItem>
          <DescriptionsItem label="置信度" v-if="selectedEdge.confidence">
            {{ (selectedEdge.confidence * 100).toFixed(2) }}%
          </DescriptionsItem>
          <DescriptionsItem label="权重" v-if="selectedEdge.weight">
            {{ selectedEdge.weight }}
          </DescriptionsItem>
          <DescriptionsItem label="属性" v-if="selectedEdge.properties">
            <pre style="margin: 0">{{
              JSON.stringify(parseProperties(selectedEdge.properties), null, 2)
            }}</pre>
          </DescriptionsItem>
        </Descriptions>
      </Drawer>
    </div>
  </Page>
</template>

<style scoped>
.graph-visualization {
  padding: 16px;
}
</style>
