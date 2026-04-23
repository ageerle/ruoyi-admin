<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
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
  Modal,
} from 'ant-design-vue';
import { 
  SearchOutlined, 
  CopyOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  LineOutlined,
  ThunderboltFilled,
  QuestionCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import { knowledgeRetrieval, infoInfo, infoUpdate } from '#/api/knowledge/info';
import { modelList } from '#/api/chat/model';
import { message } from 'ant-design-vue';

const props = defineProps<{
  knowledgeId?: string | number;
}>();

const emit = defineEmits<{
  (e: 'configUpdated'): void;
}>();

const query = ref('');
const loading = ref(false);

const rerankOptions = ref<any[]>([]);

const config = ref({
  similarityThreshold: 0.5,
  enableHybridSearch: false,
  hybridAlpha: 0.5,
  enableRerank: false,
  rerankModelName: undefined as string | undefined,
  enableQueryRewrite: false,
  topK: 10,
});

async function loadRerankModels() {
  try {
    const res = await modelList({ category: 'rerank' });
    rerankOptions.value = (res.rows || []).map((m: any) => ({
      label: m.modelDescribe || m.modelName,
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

const renderMark = (label: string) => h('span', { style: { fontSize: '10px', opacity: 0.7 } }, label);

const thresholdMarks = {
  0.2: renderMark('宽松'),
  0.5: renderMark('标准'),
  0.8: renderMark('严谨')
};

const limitMarks = {
  3: renderMark('精简'),
  5: renderMark('默认'),
  10: renderMark('丰富'),
  20: renderMark('20')
};

const alphaMarks = {
  0.3: renderMark('偏向量'),
  0.5: renderMark('平衡'),
  0.7: renderMark('偏全文')
};

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
      enableHybrid: config.value.enableHybridSearch,
      hybridAlpha: config.value.hybridAlpha,
    });
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

async function handleApplyConfig() {
  if (!props.knowledgeId) {
    message.error('知识库ID缺失');
    return;
  }

  Modal.confirm({
    title: '确认应用配置？',
    content: '此操作将当前的检索测试参数（TopK、相似度阈值、混合检索、重排配置等）永久保存至该知识库的全局配置中。',
    okText: '确定应用',
    cancelText: '取消',
    onOk: async () => {
      try {
        loading.value = true;
        // 1. 获取最新详情以便完整更新
        const record = await infoInfo(props.knowledgeId as string | number);
        
        // 2. 合并当前配置
        const updatedData = {
          ...record,
          retrieveLimit: config.value.topK,
          similarityThreshold: config.value.similarityThreshold,
          enableHybrid: config.value.enableHybridSearch ? 1 : 0,
          hybridAlpha: config.value.hybridAlpha,
          enableRerank: config.value.enableRerank ? 1 : 0,
          rerankModel: config.value.rerankModelName,
        };

        // 3. 提交更新
        await infoUpdate(updatedData);
        message.success('配置已成功应用至知识库');
        emit('configUpdated');
      } catch (error) {
        console.error('应用配置失败:', error);
        message.error('应用配置失败，请检查网络或后端服务');
      } finally {
        loading.value = false;
      }
    }
  });
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
                <FormItem>
                  <template #label>
                    <div class="flex items-center gap-1">
                      <span>相似度阈值</span>
                      <Tooltip placement="top">
                        <template #title>
                          设置召回结果的最低相似度过滤分值。只有得分超过该阈值的文本块才会被返回。阈值越高，结果越精准但召回数量可能减少。
                        </template>
                        <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
                      </Tooltip>
                    </div>
                  </template>
                  <Row>
                    <Col :span="16" class="pb-6">
                      <Slider 
                        v-model:value="config.similarityThreshold" 
                        :min="0" :max="1" :step="0.01" 
                        :marks="thresholdMarks"
                      />
                    </Col>
                    <Col :span="7" :offset="1">
                      <InputNumber v-model:value="config.similarityThreshold" :min="0" :max="1" :step="0.01" class="w-full" />
                    </Col>
                  </Row>
                </FormItem>
              </Col>
              <Col :span="24">
                <FormItem>
                  <template #label>
                    <div class="flex items-center gap-1">
                      <span>返回数量 (Top K)</span>
                      <Tooltip placement="top">
                        <template #title>
                          指定从知识库中检索并提供给大模型的最大文本块数量。较多的数量能提供更丰富的内容，但也会增加上下文长度。
                        </template>
                        <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
                      </Tooltip>
                    </div>
                  </template>
                  <Row>
                    <Col :span="16" class="pb-6">
                      <Slider 
                        v-model:value="config.topK" 
                        :min="1" :max="20" 
                        :marks="limitMarks"
                      />
                    </Col>
                    <Col :span="7" :offset="1">
                      <InputNumber v-model:value="config.topK" :min="1" :max="20" size="small" class="w-full text-xs" />
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            </Row>

            <FormItem>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1">
                  <span>混合检索</span>
                  <Tooltip placement="top">
                    <template #title>
                      结合向量检索与全文检索，通过 RRF 算法融合结果。Alpha 值决定了全文检索的权重，值越大全文检索影响越大。
                    </template>
                    <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
                  </Tooltip>
                </div>
                <Switch v-model:checked="config.enableHybridSearch" />
              </div>

              <div v-if="config.enableHybridSearch" class="mb-4 pl-4 border-l-2 border-primary/20">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center gap-2">
                    <span class="italic text-gray-500 text-xs">vector</span>
                    <span class="bg-gray-100 dark:bg-zinc-800 text-primary px-1.5 py-0.5 rounded text-[10px] font-mono border border-gray-200 dark:border-gray-700 leading-none">
                      {{ (1 - config.hybridAlpha).toFixed(2) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="italic text-gray-500 text-xs">full-text</span>
                    <span class="bg-gray-100 dark:bg-zinc-800 text-primary px-1.5 py-0.5 rounded text-[10px] font-mono border border-gray-200 dark:border-gray-700 leading-none">
                      {{ config.hybridAlpha.toFixed(2) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-3 pb-6">
                  <Slider 
                    v-model:value="config.hybridAlpha" 
                    :min="0" :max="1" :step="0.01"
                    :marks="alphaMarks"
                    class="flex-1"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between mb-2 opacity-50 cursor-not-allowed">
                <div class="flex items-center gap-1">
                  <span>查询改写</span>
                  <Tooltip placement="top">
                    <template #title>
                      利用大模型对用户原始问题进行扩充或归一化，解决描述不清晰或语义偏移的问题，提升检索匹配率。
                    </template>
                    <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
                  </Tooltip>
                </div>
                <Switch :checked="false" disabled />
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <span>启用重排</span>
                  <Tooltip placement="top">
                    <template #title>
                      在检索召回后的结果中，使用重排模型对待选文本块与原始问题进行二次相关性精打分。这能有效提升排序质量。
                    </template>
                    <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
                  </Tooltip>
                </div>
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
              <template #icon><SearchOutlined /></template>
              开始检索测试
            </Button>

            <Button 
              class="w-full mt-2 border-primary text-primary hover:bg-primary/5"
              :loading="loading" 
              @click="handleApplyConfig"
            >
              <template #icon><CheckCircleOutlined /></template>
              应用至知识库配置
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
