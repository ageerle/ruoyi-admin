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
  Slider
} from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  knowledgeId?: string | number;
}>();

const query = ref('如何重置密码');
const loading = ref(false);

const rerankOptions = [
  { label: 'jina-reranker-v2', value: 'jina-reranker-v2' },
  { label: 'cohere-rerank-3', value: 'cohere-rerank-3' },
  { label: 'bge-reranker-large', value: 'bge-reranker-large' },
];

const config = ref({
  similarityThreshold: 0.6,
  enableHybridSearch: true,
  enableRerank: true,
  rerankModelName: 'jina-reranker-v2',
  enableQueryRewrite: true,
  topK: 10,
});

const results = ref<any[]>([]);

const mockFragments = [
  {
    id: 1,
    content: '进入设置页面，点击账户安全，选择修改密码。需要输入原密码验证。',
    score: 0.94,
    rawRank: 2,
    rerankedRank: 1,
    sourceDoc: '用户手册v2.docx',
  },
  {
    id: 2,
    content: '如果忘记密码，请点击登录页面的“忘记密码”链接，通过绑定的邮箱重置。',
    score: 0.88,
    rawRank: 1,
    rerankedRank: 2,
    sourceDoc: '常见问题解答.pdf',
  },
  {
    id: 3,
    content: '管理员可以在用户管理中，强制重置某些用户的密码，新密码将随机生成并发送邮件。',
    score: 0.60,
    rawRank: 4,
    rerankedRank: 3,
    sourceDoc: '高级管理指南.txt',
  },
];

async function handleTest() {
  loading.value = true;
  setTimeout(() => {
    results.value = mockFragments;
    loading.value = false;
  }, 800);
}

function getRankDelta(raw: number | null, reranked: number | null) {
  if (raw === null || reranked === null) return 0;
  return raw - reranked;
}

const tableColumns = [
  { title: '片段内容', dataIndex: 'content', key: 'content', width: '45%' },
  { title: '来源', dataIndex: 'sourceDoc', key: 'sourceDoc' },
  { title: '最终得分', dataIndex: 'score', key: 'score', align: 'center', width: 100 },
  { title: '初始位次', dataIndex: 'rawRank', key: 'rawRank', align: 'center', width: 100 },
  { title: '重排位次', dataIndex: 'rerankedRank', key: 'rerankedRank', align: 'center', width: 100 },
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
              <div class="flex items-center justify-between mb-2">
                <span>混合检索</span>
                <Switch v-model:checked="config.enableHybridSearch" />
              </div>
              <div class="flex items-center justify-between mb-2">
                <span>查询改写</span>
                <Switch v-model:checked="config.enableQueryRewrite" />
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
              <template v-if="column.key === 'content'">
                <Tooltip :title="record.content">
                  <div class="truncate-2-lines text-sm">
                    {{ record.content }}
                  </div>
                </Tooltip>
              </template>
              
              <template v-else-if="column.key === 'sourceDoc'">
                <Tag>{{ record.sourceDoc }}</Tag>
              </template>

              <template v-else-if="column.key === 'rerankedRank'">
                <div class="flex items-center justify-center gap-1">
                  <span>{{ record.rerankedRank }}</span>
                  <span v-if="getRankDelta(record.rawRank, record.rerankedRank) > 0" class="text-xs text-green-600">
                    (↑{{ getRankDelta(record.rawRank, record.rerankedRank) }})
                  </span>
                  <span v-else-if="getRankDelta(record.rawRank, record.rerankedRank) < 0" class="text-xs text-red-500">
                    (↓{{ Math.abs(getRankDelta(record.rawRank, record.rerankedRank)) }})
                  </span>
                  <span v-else class="text-xs text-gray-400">(-)</span>
                </div>
              </template>
            </template>
          </Table>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
</style>
