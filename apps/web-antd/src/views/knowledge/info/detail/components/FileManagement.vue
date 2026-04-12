<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Button,
  Upload,
  Table,
  Space,
  Popconfirm,
  message,
  Tooltip,
  Modal,
  Descriptions,
  DescriptionsItem,
  Image,
  Spin,
  Badge,
  Switch,
} from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { attachList, attachRemove, attachParse } from '#/api/knowledge/attach';
import { fragmentList } from '#/api/knowledge/fragment';
import { ossInfo, checkLoginBeforeDownload } from '#/api/system/oss';
import { downloadByUrl } from '#/utils/file/download';
import { stringify } from '@vben/request';
import { requestClient } from '#/api/request';

const props = defineProps<{
  knowledgeId?: string | number;
}>();

const { apiURL, clientId } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);
const accessStore = useAccessStore();

const attachmentData = ref([]);
const uploadUrl = `${apiURL}/system/attach/upload`;
const loading = ref(false);
const uploading = ref(false);
const headers = {
  Authorization: `Bearer ${accessStore.accessToken}`,
  clientId,
};

const autoParse = ref(true);

const uploadPayload = computed(() => ({
  knowledgeId: props.knowledgeId,
  autoParse: autoParse.value,
}));

const columns = [
  { title: '附件名称', dataIndex: 'name', key: 'name' },
  { title: '附件类型', dataIndex: 'type', key: 'type' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '上传时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '分块数', dataIndex: 'fragmentCount', key: 'fragmentCount', width: 80 },
  { title: '操作', key: 'action', width: 280 },
];

const statusMap = {
  0: { text: '待解析', status: 'default' },
  1: { text: '解析中', status: 'processing' },
  2: { text: '已解析', status: 'success' },
  3: { text: '解析失败', status: 'error' },
};

const fragmentVisible = ref(false);
const fragmentLoading = ref(false);
const fragmentData = ref([]);
const fragmentColumns = [
  { title: '序号', dataIndex: 'idx', key: 'idx', width: 80 },
  { title: '片段内容', dataIndex: 'content', key: 'content' },
];

const fileDetailVisible = ref(false);
const fileDetailLoading = ref(false);
const fileDetailData = ref<any>(null);

const uploadModalVisible = ref(false);
const fileList = ref<any[]>([]);

function handleOpenUpload() {
  fileList.value = [];
  uploadModalVisible.value = true;
}

async function loadAttachments() {
  if (!props.knowledgeId) return;
  loading.value = true;
  try {
    const res = await attachList({
      knowledgeId: props.knowledgeId,
      pageSize: 100,
    });
    attachmentData.value = res.rows || [];
  } finally {
    loading.value = false;
  }
}

watch(() => props.knowledgeId, () => {
  if (props.knowledgeId) {
    loadAttachments();
  }
}, { immediate: true });

function handleBeforeUpload(file: any) {
  fileList.value = [...fileList.value, file];
  return false;
}

function handleRemove(file: any) {
  const index = fileList.value.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
}

async function handleManualUpload() {
  if (fileList.value.length === 0) {
    message.warning('请先选择要上传的文件');
    return;
  }

  uploading.value = true;
  try {
    for (const file of fileList.value) {
      const formData = new FormData();
      // ant-design-vue 的 fileList 中的项可能是包装过的，需获取 originFileObj
      const rawFile = file.originFileObj || file;
      formData.append('file', rawFile);
      formData.append('knowledgeId', String(props.knowledgeId));
      formData.append('autoParse', String(autoParse.value));

      // 使用原生 requestClient 发送请求
      await requestClient.post('/system/attach/upload', formData);
    }
    
    message.success('所有文件上传成功');
    fileList.value = [];
    uploadModalVisible.value = false;
    await loadAttachments();
  } catch (error: any) {
    message.error(error.message || '上传失败');
  } finally {
    uploading.value = false;
  }
}

async function handleDeleteAttachment(record: any) {
  try {
    await attachRemove(record.id);
    await loadAttachments();
  } catch (error) {
    message.error('删除失败');
  }
}

async function handleParse(record: any) {
  try {
    loading.value = true;
    await attachParse(record.id);
    message.success('已触发解析，请稍后刷新查看状态');
    await loadAttachments();
  } catch (error) {
    message.error('触发解析失败');
  } finally {
    loading.value = false;
  }
}

async function handleFragment(record: any) {
  fragmentLoading.value = true;
  fragmentVisible.value = true;
  try {
    const res = await fragmentList({ docId: record.docId, pageSize: 100 });
    fragmentData.value = res.rows || [];
  } catch (error) {
    message.error('加载片段失败');
  } finally {
    fragmentLoading.value = false;
  }
}

function closeFragment() {
  fragmentVisible.value = false;
  fragmentData.value = [];
}

async function handleViewFile(record: any) {
  if (!record.ossId) return message.error('文件信息缺失');
  fileDetailLoading.value = true;
  fileDetailVisible.value = true;
  try {
    const res = await ossInfo(record.ossId);
    if (res && res.length > 0) fileDetailData.value = res[0];
    else { message.error('未找到对应文件'); closeFileDetail(); }
  } catch (error) {
    message.error('获取文件详情失败'); closeFileDetail();
  } finally { fileDetailLoading.value = false; }
}

async function handleDownloadFile(ossId: string, fileName: string) {
  try {
    await checkLoginBeforeDownload();
    const params = { clientid: clientId, Authorization: `Bearer ${accessStore.accessToken}` };
    downloadByUrl({ fileName, url: `${apiURL}/resource/oss/download/${ossId}?${stringify(params)}` });
  } catch (error) { message.error('下载失败'); }
}

function closeFileDetail() { fileDetailVisible.value = false; fileDetailData.value = null; }

function isImageFile(fileSuffix: string) {
  return fileSuffix ? ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(t => fileSuffix.toLowerCase().includes(t)) : false;
}
</script>

<template>
  <div class="p-2">
    <!-- 顶部操作栏 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button type="primary" @click="handleOpenUpload">
          <template #icon><InboxOutlined /></template>
          上传文档
        </Button>
      </div>
      <div class="flex items-center gap-2">
        <Tooltip title="刷新列表以获取最新解析状态">
          <Button @click="loadAttachments">
            刷新
          </Button>
        </Tooltip>
      </div>
    </div>

    <div class="relative">
      <div v-if="uploading" class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
        <Spin />
      </div>
      
      <Table
        :columns="columns"
        :data-source="attachmentData"
        :loading="loading"
        :pagination="false"
        size="middle"
        bordered
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <Tooltip v-if="record.status === 3 && record.remark" :title="record.remark">
               <Badge v-bind="statusMap[record.status]" style="cursor: help" />
            </Tooltip>
            <Badge v-else-if="statusMap[record.status]" v-bind="statusMap[record.status]" />
            <span v-else>未知</span>
          </template>
          <template v-else-if="column.key === 'createTime'">
            {{ record.createTime ? new Date(record.createTime).toLocaleString('zh-CN', { hour12: false }) : '-' }}
          </template>
          <template v-else-if="column.key === 'action'">
            <Space>
              <Button 
                v-if="record.status === 0 || record.status === 3"
                type="link" 
                size="small" 
                @click="handleParse(record)"
              >
                解析
              </Button>
              <Button 
                v-if="record.status === 2"
                type="link" 
                size="small" 
                @click="handleFragment(record)"
              >
                知识片段
              </Button>
              <Button type="link" size="small" @click="handleViewFile(record)">查看源文件</Button>
              <Popconfirm title="确定要删除这个文件吗？" @confirm="handleDeleteAttachment(record)">
                <Button type="link" danger size="small">删除</Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </div>

    <!-- Modals -->
    <Modal v-model:open="uploadModalVisible" title="上传文档" :width="600" :footer="null">
      <div class="mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-blue-800">解析策略设置</span>
          <Switch v-model:checked="autoParse" checked-children="自动解析" un-checked-children="仅上传" />
        </div>
        <p class="text-xs text-gray-500 leading-relaxed">
          <b>自动解析</b>：上传完成后立即开始文档切块并存入向量库，适用于需要立即检索的文件。<br/>
          <b>仅上传</b>：仅保存到云端存储，您可以稍后在列表中手动触发解析。
        </p>
      </div>

      <Upload.Dragger
        v-model:file-list="fileList"
        :before-upload="handleBeforeUpload"
        @remove="handleRemove"
        :show-upload-list="true"
        accept=".txt,.pdf,.docx,.pptx,.xlsx,.xls,.csv,.json"
        multiple
        name="file"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text font-medium">点击或将文件拖拽到此区域上传</p>
        <p class="ant-upload-hint">支持多文件选择，点击下方“开始上传”按钮触发保存</p>
      </Upload.Dragger>

      <div class="mt-6 flex justify-end gap-3">
        <Button @click="uploadModalVisible = false">取消</Button>
        <Button 
          type="primary" 
          :loading="uploading" 
          @click="handleManualUpload"
        >
          确定并保存
        </Button>
      </div>
    </Modal>

    <Modal v-model:open="fragmentVisible" title="知识分片列表" :width="800" :footer="null" :destroyOnClose="true">
      <Table :columns="fragmentColumns" :data-source="fragmentData" :loading="fragmentLoading" :pagination="false" size="middle" bordered row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'idx'">
            {{ Number(record.idx) + 1 }}
          </template>
          <template v-else-if="column.key === 'content'">
            <Tooltip :title="record.content">
              <span>{{ record.content && record.content.length > 50 ? record.content.slice(0, 50) + '...' : record.content }}</span>
            </Tooltip>
          </template>
        </template>
      </Table>
    </Modal>

    <Modal v-model:open="fileDetailVisible" title="文件详情" :width="600" :footer="null">
      <div v-if="fileDetailLoading" class="flex justify-center p-4"><Spin /></div>
      <div v-else-if="fileDetailData">
        <Descriptions :column="1" bordered size="small">
          <DescriptionsItem label="系统文件名">{{ fileDetailData.fileName }}</DescriptionsItem>
          <DescriptionsItem label="原始文件名">{{ fileDetailData.originalName }}</DescriptionsItem>
          <DescriptionsItem label="扩展名">{{ fileDetailData.fileSuffix }}</DescriptionsItem>
          <DescriptionsItem label="创建时间">{{ fileDetailData.createTime }}</DescriptionsItem>
          <DescriptionsItem label="上传人">{{ fileDetailData.createByName }}</DescriptionsItem>
        </Descriptions>
        
        <div v-if="isImageFile(fileDetailData.fileSuffix)" class="mt-4 text-center">
          <Image :src="fileDetailData.url" :preview="true" style="max-height: 200px" />
        </div>
        <div v-else class="mt-4 text-center">
          <a :href="fileDetailData.url" target="_blank">{{ fileDetailData.url }}</a>
        </div>

        <div class="flex justify-center gap-4 mt-6">
          <Button @click="closeFileDetail">关闭</Button>
          <Button type="primary" @click="handleDownloadFile(fileDetailData.ossId, fileDetailData.originalName)">下载</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
