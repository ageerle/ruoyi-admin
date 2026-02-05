<script setup lang="ts">
import type { ExtractionResult, GraphRetrievalResult } from '#/api/graph/model';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Divider,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tag,
} from 'ant-design-vue';

import { modelList } from '#/api/chat/model';
import {
  graphExtractEntities,
  graphIngestText,
  graphRetrieve,
} from '#/api/graph';
import { infoList as knowledgeList } from '#/api/knowledge/info';

// 知识库列表
const knowledgeOptions = ref<any[]>([]);
const modelOptions = ref<any[]>([]);

// 实体抽取
const extractText = ref('');
const extractModel = ref<string>();
const extractLoading = ref(false);
const extractionResult = ref<ExtractionResult | null>(null);

// 文本入库
const ingestText = ref('');
const ingestKnowledgeId = ref<string>();
const ingestModel = ref<string>();
const ingestLoading = ref(false);
const ingestResult = ref<ExtractionResult | null>(null);

// 图谱检索
const retrieveQuery = ref('');
const retrieveKnowledgeId = ref<string>();
const retrieveTopK = ref(5);
const retrieveLoading = ref(false);
const retrievalResult = ref<GraphRetrievalResult | null>(null);

// 加载知识库列表
async function loadKnowledgeList() {
  try {
    const res = await knowledgeList();
    knowledgeOptions.value = (res.rows || []).map((item: any) => ({
      label: item.kname,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载知识库列表失败:', error);
  }
}

// 加载模型列表
async function loadModelList() {
  try {
    const res = await modelList({ pageNum: 1, pageSize: 100 });
    modelOptions.value = (res.rows || []).map((item: any) => ({
      label: item.modelName,
      value: item.modelName,
    }));
  } catch (error) {
    console.error('加载模型列表失败:', error);
  }
}

// 实体抽取
async function handleExtract() {
  if (!extractText.value.trim()) {
    message.warning('请输入要抽取的文本');
    return;
  }

  extractLoading.value = true;
  try {
    const result = await graphExtractEntities({
      text: extractText.value,
      modelName: extractModel.value,
    });
    extractionResult.value = result;
    message.success('实体抽取成功');
  } catch (error) {
    console.error('实体抽取失败:', error);
    message.error('实体抽取失败');
  } finally {
    extractLoading.value = false;
  }
}

// 文本入库
async function handleIngest() {
  if (!ingestText.value.trim()) {
    message.warning('请输入要入库的文本');
    return;
  }

  if (!ingestKnowledgeId.value) {
    message.warning('请选择知识库');
    return;
  }

  ingestLoading.value = true;
  try {
    const result = await graphIngestText({
      text: ingestText.value,
      knowledgeId: ingestKnowledgeId.value,
      modelName: ingestModel.value,
    });
    ingestResult.value = result;
    message.success('文本入库成功');
  } catch (error) {
    console.error('文本入库失败:', error);
    message.error('文本入库失败');
  } finally {
    ingestLoading.value = false;
  }
}

// 图谱检索
async function handleRetrieve() {
  if (!retrieveQuery.value.trim()) {
    message.warning('请输入检索查询');
    return;
  }

  if (!retrieveKnowledgeId.value) {
    message.warning('请选择知识库');
    return;
  }

  retrieveLoading.value = true;
  try {
    const result = await graphRetrieve({
      query: retrieveQuery.value,
      knowledgeId: retrieveKnowledgeId.value,
      topK: retrieveTopK.value,
    });
    retrievalResult.value = result;
    message.success('检索成功');
  } catch (error) {
    console.error('检索失败:', error);
    message.error('检索失败');
  } finally {
    retrieveLoading.value = false;
  }
}

// 初始化
loadKnowledgeList();
loadModelList();
</script>

<template>
  <Page :auto-content-height="true">
    <div class="graph-rag">
      <Row :gutter="16">
        <!-- 实体抽取测试 -->
        <Col :span="12">
          <Card title="实体抽取测试" size="small">
            <Space direction="vertical" style="width: 100%" :size="16">
              <div>
                <div style="margin-bottom: 8px">选择模型（可选）</div>
                <Select
                  v-model:value="extractModel"
                  placeholder="选择LLM模型"
                  style="width: 100%"
                  :options="modelOptions"
                  allow-clear
                />
              </div>

              <div>
                <div style="margin-bottom: 8px">输入文本</div>
                <Input.TextArea
                  v-model:value="extractText"
                  placeholder="请输入要抽取实体的文本..."
                  :rows="6"
                />
              </div>

              <Button
                type="primary"
                block
                :loading="extractLoading"
                @click="handleExtract"
              >
                <ThunderboltOutlined /> 开始抽取
              </Button>

              <Divider />

              <div v-if="extractionResult">
                <Alert
                  message="抽取结果"
                  type="success"
                  style="margin-bottom: 16px"
                />

                <div style="margin-bottom: 16px">
                  <div style="margin-bottom: 8px; font-weight: 500">
                    实体 ({{ extractionResult.entities?.length || 0 }})
                  </div>
                  <Space wrap>
                    <Tag
                      v-for="(entity, index) in extractionResult.entities"
                      :key="index"
                      color="blue"
                    >
                      {{ entity.name }} ({{ entity.type }})
                    </Tag>
                  </Space>
                </div>

                <div>
                  <div style="margin-bottom: 8px; font-weight: 500">
                    关系 ({{ extractionResult.relations?.length || 0 }})
                  </div>
                  <div
                    v-for="(relation, index) in extractionResult.relations"
                    :key="index"
                    style="margin-bottom: 8px"
                  >
                    <Tag color="green">{{ relation.source }}</Tag>
                    <span style="margin: 0 8px">→ {{ relation.type }} →</span>
                    <Tag color="green">{{ relation.target }}</Tag>
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <!-- 文本入库测试 -->
        <Col :span="12">
          <Card title="文本入库测试" size="small">
            <Space direction="vertical" style="width: 100%" :size="16">
              <div>
                <div style="margin-bottom: 8px">选择知识库</div>
                <Select
                  v-model:value="ingestKnowledgeId"
                  placeholder="选择知识库"
                  style="width: 100%"
                  :options="knowledgeOptions"
                />
              </div>

              <div>
                <div style="margin-bottom: 8px">选择模型（可选）</div>
                <Select
                  v-model:value="ingestModel"
                  placeholder="选择LLM模型"
                  style="width: 100%"
                  :options="modelOptions"
                  allow-clear
                />
              </div>

              <div>
                <div style="margin-bottom: 8px">输入文本</div>
                <Input.TextArea
                  v-model:value="ingestText"
                  placeholder="请输入要入库的文本..."
                  :rows="4"
                />
              </div>

              <Button
                type="primary"
                block
                :loading="ingestLoading"
                @click="handleIngest"
              >
                <ThunderboltOutlined /> 开始入库
              </Button>

              <Divider />

              <div v-if="ingestResult">
                <Alert
                  message="入库成功"
                  type="success"
                  style="margin-bottom: 16px"
                />

                <Descriptions :column="1" bordered size="small">
                  <DescriptionsItem label="抽取实体数">
                    {{ ingestResult.entities?.length || 0 }}
                  </DescriptionsItem>
                  <DescriptionsItem label="抽取关系数">
                    {{ ingestResult.relations?.length || 0 }}
                  </DescriptionsItem>
                </Descriptions>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row :gutter="16" style="margin-top: 16px">
        <!-- 图谱检索测试 -->
        <Col :span="24">
          <Card title="图谱检索测试" size="small">
            <Row :gutter="16">
              <Col :span="8">
                <Space direction="vertical" style="width: 100%" :size="16">
                  <div>
                    <div style="margin-bottom: 8px">选择知识库</div>
                    <Select
                      v-model:value="retrieveKnowledgeId"
                      placeholder="选择知识库"
                      style="width: 100%"
                      :options="knowledgeOptions"
                    />
                  </div>

                  <div>
                    <div style="margin-bottom: 8px">Top K</div>
                    <Input.Number
                      v-model:value="retrieveTopK"
                      :min="1"
                      :max="20"
                      style="width: 100%"
                    />
                  </div>

                  <div>
                    <div style="margin-bottom: 8px">检索查询</div>
                    <Input.TextArea
                      v-model:value="retrieveQuery"
                      placeholder="请输入检索查询..."
                      :rows="4"
                    />
                  </div>

                  <Button
                    type="primary"
                    block
                    :loading="retrieveLoading"
                    @click="handleRetrieve"
                  >
                    <SearchOutlined /> 开始检索
                  </Button>
                </Space>
              </Col>

              <Col :span="16">
                <Spin :spinning="retrieveLoading" tip="检索中...">
                  <div v-if="retrievalResult" style="min-height: 400px">
                    <Alert
                      message="检索结果"
                      type="success"
                      style="margin-bottom: 16px"
                    />

                    <div style="margin-bottom: 16px">
                      <div style="margin-bottom: 8px; font-weight: 500">
                        增强内容
                      </div>
                      <Card size="small">
                        <pre style="margin: 0; white-space: pre-wrap">{{
                          retrievalResult.content
                        }}</pre>
                      </Card>
                    </div>

                    <div style="margin-bottom: 16px">
                      <div style="margin-bottom: 8px; font-weight: 500">
                        相关实体 ({{
                          retrievalResult.relevantEntities?.length || 0
                        }})
                      </div>
                      <Space wrap>
                        <Tag
                          v-for="(
                            entity, index
                          ) in retrievalResult.relevantEntities"
                          :key="index"
                          color="blue"
                        >
                          {{ entity.name }} ({{ entity.label }})
                        </Tag>
                      </Space>
                    </div>

                    <div>
                      <div style="margin-bottom: 8px; font-weight: 500">
                        相关关系 ({{
                          retrievalResult.relevantRelations?.length || 0
                        }})
                      </div>
                      <div
                        v-for="(
                          relation, index
                        ) in retrievalResult.relevantRelations"
                        :key="index"
                        style="margin-bottom: 8px"
                      >
                        <Tag color="green">{{ relation.sourceNodeId }}</Tag>
                        <span style="margin: 0 8px">→ {{ relation.label }} →</span>
                        <Tag color="green">{{ relation.targetNodeId }}</Tag>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 400px;
                      color: #999;
                    "
                  >
                    暂无检索结果
                  </div>
                </Spin>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style scoped>
.graph-rag {
  padding: 16px;
}
</style>
