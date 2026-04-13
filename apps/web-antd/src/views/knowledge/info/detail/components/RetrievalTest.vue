<script setup lang="ts">
import { ref } from 'vue';
import {
  Button,
  Input,
  Select,
  Switch,
  InputNumber,
  Row,
  Col,
  Table,
  Tooltip,
  Card,
  Form,
  FormItem,
  Tag,
  Alert,
  Slider,
  Typography,
  TypographyParagraph,
  Drawer,
  Descriptions,
  DescriptionsItem,
} from 'ant-design-vue';
import { 
  SearchOutlined, 
  CopyOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  LineOutlined,
  ThunderboltFilled
} from '@ant-design/icons-vue';
import { knowledgeRetrieval } from '#/api/knowledge/info';
import { modelList } from '#/api/chat/model';
import { message } from 'ant-design-vue';
import { onMounted } from 'vue';

const props = defineProps<{
  knowledgeId?: string | number;
}>();

const query = ref('');
const loading = ref(false);

const rerankOptions = ref<any[]>([]);

const config = ref({
  similarityThreshold: 0.5,
  enableHybridSearch: false,
  enableRerank: false,
  rerankModelName: undefined as string | undefined,
  enableQueryRewrite: false,
  topK: 10,
});

async function loadRerankModels() {
  try {
    const res = await modelList({ category: 'rerank' });
    // 过滤：仅显示后端已实现 ScoringModel 的供应商
    const supportedProviders = ['alibailian', 'siliconflow'];
    rerankOptions.value = (res.rows || [])
      .filter(m => supportedProviders.includes(m.providerCode?.toLowerCase()))
      .map(m => ({
        label: m.modelName,
        value: m.modelName
      }));
    if (rerankOptions.value.length > 0) {
      config.value.rerankModelName = rerankOptions.value[0].value;
    }
  } catch (err) {
    console.error('加载重排模型失败:', err);
  }
}

onMounted(() => {
  loadRerankModels();
});

const results = ref<any[]>([]);

const resultDetailVisible = ref(false);
const currentResult = ref<any>(null);

function handleViewResultDetail(record: any) {
  currentResult.value = record;
  resultDetailVisible.value = true;
}

async function handleCopy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  } catch (err) {
    message.error('复制失败');
  }
}

async function handleTest() {
  if (!query.value.trim()) {
    message.warning('请输入检索词');
    return;
  }
  if (!props.knowledgeId) {
    message.error('知识库ID缺失');
    return;
  }

  loading.value = true;
  try {
    const res = await knowledgeRetrieval({
      knowledgeId: props.knowledgeId,
      query: query.value,
      topK: config.value.topK,
      threshold: config.value.similarityThreshold,
      enableRerank: config.value.enableRerank,
      rerankModel: config.value.rerankModelName,
    });
    // 初始化结果并记录当前排名（用于对比 originalIndex）
    results.value = (res || []).map((item: any, index: number) => ({ 
      ...item, 
      _currentIndex: index,
      _expanded: false 
    }));
  } catch (error) {
    console.error('检索测试失败:', error);
    message.error('检索测试请求失败');
  } finally {
    loading.value = false;
  }
}

function getRankDelta(raw: number | null, reranked: number | null) {
  if (raw === null || reranked === null) return 0;
  return raw - reranked;
}

const tableColumns = [
  { title: '位次/变动', key: 'rank', width: 100, align: 'center' },
  { title: '片段内容', dataIndex: 'content', key: 'content', width: '50%' },
  { title: '得分对比', dataIndex: 'score', key: 'score', align: 'center', width: 140 },
  { title: '来源文档', dataIndex: 'sourceName', key: 'sourceName', width: '20%' },
];
</script>

<template>
  <div class="test-container pt-2">
    <Row :gutter="16">
      <!-- 左侧：参数配置 -->
      <Col :span="8">
        <Card title="检索参数配置" size="small" :bordered="true" class="mb-4">
          <Form layout="vertical">
            <FormItem label="检索词 (Query)">
              <Input
                v-model:value="query"
                placeholder="请输入检索词"
                @pressEnter="handleTest"
              >
                <template #prefix>
                  <SearchOutlined />
                </template>
              </Input>
            </FormItem>

            <Row :gutter="16">
              <Col :span="24">
                <FormItem label="相似度阈值">
                  <Row>
                    <Col :span="16">
                      <Slider v-model:value="config.similarityThreshold" :min="0" :max="1" :step="0.01" />
                    </Col>
                    <Col :span="7" :offset="1">
                      <InputNumber v-model:value="config.similarityThreshold" :min="0" :max="1" :step="0.01" class="w-full" />
                    </Col>
                  </Row>
                </FormItem>
              </Col>
              <Col :span="24">
                <FormItem label="返回数量 (Top K)">
                  <Row>
                    <Col :span="16">
                      <Slider v-model:value="config.topK" :min="1" :max="50" />
                    </Col>
                    <Col :span="7" :offset="1">
                      <InputNumber v-model:value="config.topK" :min="1" class="w-full" />
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            </Row>

            <FormItem>
              <div class="flex items-center justify-between mb-2 opacity-50 cursor-not-allowed">
                <Tooltip title="暂未开启，请先配置重写模型">
                  <span>混合检索</span>
                </Tooltip>
                <Switch :checked="false" disabled />
              </div>
              <div class="flex items-center justify-between mb-2 opacity-50 cursor-not-allowed">
                <Tooltip title="暂未开启，请先配置重写模型">
                  <span>查询改写</span>
                </Tooltip>
                <Switch :checked="false" disabled />
              </div>
              <div class="flex items-center justify-between">
                <span>启用重排</span>
                <Switch v-model:checked="config.enableRerank" />
              </div>
            </FormItem>

            <FormItem label="重排序模型" v-if="config.enableRerank">
              <Select
                v-model:value="config.rerankModelName"
                :options="rerankOptions"
                class="w-full"
              />
            </FormItem>

            <Button 
              type="primary" 
              class="w-full mt-2"
              :loading="loading" 
              @click="handleTest"
            >
              开始检索测试
            </Button>
          </Form>
        </Card>
      </Col>

      <!-- 右侧：结果展示 -->
      <Col :span="16">
        <Card title="检索结果" size="small" :bordered="true" class="h-full">
          <template #extra v-if="results.length">
            <Tag color="blue">命中 {{ results.length }} 项</Tag>
          </template>

          <Alert
            v-if="!results.length && !loading"
            message="请在左侧调整参数并点击开始检索以获取结果。"
            type="info"
            show-icon
            class="mb-4"
          />

          <Table
            v-if="results.length || loading"
            :columns="tableColumns"
            :data-source="results"
            :loading="loading"
            :pagination="false"
            size="middle"
            rowKey="id"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'rank'">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-base font-mono font-bold">{{ record._currentIndex + 1 }}</span>
                  <!-- 排名变动显示 -->
                  <div v-if="record.originalIndex !== undefined && record.originalIndex !== null" class="text-xs mt-0.5">
                    <template v-if="record.originalIndex > record._currentIndex">
                      <span class="text-green-500 flex items-center">
                        <CaretUpOutlined /> {{ record.originalIndex - record._currentIndex }}
                      </span>
                    </template>
                    <template v-else-if="record.originalIndex < record._currentIndex">
                      <span class="text-orange-500 flex items-center">
                        <CaretDownOutlined /> {{ record._currentIndex - record.originalIndex }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="text-gray-300"><LineOutlined /></span>
                    </template>
                  </div>
                </div>
              </template>

              <template v-else-if="column.key === 'content'">
                <div 
                  class="cursor-pointer hover:text-blue-600 transition-colors"
                  @click="handleViewResultDetail(record)"
                >
                  <div class="line-clamp-3" style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
                    <Tag v-if="record.originalIndex > 5 && record._currentIndex < 5" color="purple" size="small" class="mr-1">
                      <ThunderboltFilled /> 捞起
                    </Tag>
                    {{ record.content }}
                  </div>
                </div>
              </template>
              
              <template v-else-if="column.key === 'sourceName'">
                <Tag color="cyan">{{ record.sourceName }}</Tag>
              </template>

              <template v-else-if="column.key === 'score'">
                <div class="flex flex-col items-center">
                  <!-- 主得分 -->
                  <div class="flex items-center gap-1">
                    <span class="text-sm font-bold" :class="record.score > 0.7 ? 'text-green-600' : (record.score > 0.4 ? 'text-orange-500' : 'text-red-500')">
                      {{ (record.score * 100).toFixed(1) }}%
                    </span>
                  </div>

                  <!-- 原始得分对比 -->
                  <Tooltip v-if="record.rawScore !== undefined && record.rawScore !== null" placement="bottom">
                    <template #title>
                      原始向量分: {{ (record.rawScore * 100).toFixed(2) }}%
                    </template>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span class="text-[10px] text-gray-400 opacity-80">原: {{ (record.rawScore * 100).toFixed(1) }}%</span>
                      <!-- 分数增减百分比 -->
                      <span 
                        v-if="record.score !== record.rawScore"
                        :class="record.score > record.rawScore ? 'text-green-500' : 'text-red-400'"
                        class="text-[10px] font-bold"
                      >
                        {{ record.score > record.rawScore ? '+' : '' }}{{ ((record.score - record.rawScore) * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </Tooltip>
                </div>
              </template>
            </template>
          </Table>
        </Card>
      </Col>
    </Row>

    <!-- 侧边详情抽屉 -->
    <Drawer
      v-model:open="resultDetailVisible"
      title="检索结果详情"
      placement="right"
      :width="600"
    >
      <div v-if="currentResult" class="flex flex-col h-full">
        <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
          <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button type="link" size="small" @click="handleCopy(currentResult.content)">
               <template #icon><CopyOutlined /></template>
               复制
             </Button>
          </div>
          <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #333;">
            {{ currentResult.content }}
          </div>
        </div>

        <Descriptions title="匹配信息" :column="1" size="small" bordered>
          <DescriptionsItem label="相关性得分">
            <Tag :color="currentResult.score > 0.7 ? 'green' : (currentResult.score > 0.4 ? 'orange' : 'red')">
               {{ (currentResult.score * 100).toFixed(2) }}%
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="来源文档">{{ currentResult.sourceName }}</DescriptionsItem>
          <DescriptionsItem label="字符数量">{{ currentResult.content?.length || 0 }} 字</DescriptionsItem>
        </Descriptions>
        
        <div class="mt-auto pt-6 flex justify-end">
          <Button @click="resultDetailVisible = false">关闭</Button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.test-container {
  height: 100%;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
