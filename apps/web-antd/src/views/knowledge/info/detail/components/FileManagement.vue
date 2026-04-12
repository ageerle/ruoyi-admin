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
} from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { attachList, attachRemove } from '#/api/knowledge/attach';
import { fragmentList } from '#/api/knowledge/fragment';
import { ossInfo, checkLoginBeforeDownload } from '#/api/system/oss';
import { downloadByUrl } from '#/utils/file/download';
import { stringify } from '@vben/request';

const props = defineProps<{
  knowledgeId?: string | number;
}>();

const { apiURL, clientId } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);
const accessStore = useAccessStore();

const loading = ref(false);
const uploading = ref(false);
const attachmentData = ref([]);

const uploadUrl = `${apiURL}/system/attach/upload`;
const headers = {
  Authorization: `Bearer ${accessStore.accessToken}`,
  clientId,
};

const uploadPayload = computed(() => ({
  knowledgeId: props.knowledgeId,
}));

const columns = [
  { title: '附件名称', dataIndex: 'name', key: 'name' },
  { title: '附件类型', dataIndex: 'type', key: 'type' },
  { title: '分块数', dataIndex: 'fragmentCount', key: 'fragmentCount', width: 100 },
  { title: '操作', key: 'action', width: 250 },
];

const fragmentVisible = ref(false);
const fragmentLoading = ref(false);
const fragmentData = ref([]);
const fragmentColumns = [
  { title: '片段编号', dataIndex: 'docId', key: 'docId', width: 100 },
  { title: '片段内容', dataIndex: 'content', key: 'content' },
];

const fileDetailVisible = ref(false);
const fileDetailLoading = ref(false);
const fileDetailData = ref<any>(null);

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

async function handleChange(info: any) {
  const file = info.file;
  const status = file?.status;

  if (status === 'uploading' && !uploading.value) uploading.value = true;
  if (status === 'done') {
    if (file.response.code === 200) {
      message.success('上传成功');
      await loadAttachments();
    } else {
      message.error(file.response.msg || '上传失败');
    }
    uploading.value = false;
  } else if (status === 'error') {
    uploading.value = false;
    message.error('上传出错');
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

async function handleFragment(record: any) {
  fragmentLoading.value = true;
  fragmentVisible.value = true;
  try {
    const res = await fragmentList({ attachId: record.id, pageSize: 100 });
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
    <!-- 原生 Dragger 上传 -->
    <div class="mb-4">
      <Upload.Dragger
        :action="uploadUrl"
        :headers="headers"
        :show-upload-list="false"
        accept=".txt,.pdf,.docx,.pptx,.xlsx,.xls,.csv,.json"
        multiple
        name="file"
        :data="uploadPayload"
        @change="handleChange"
      >
        <p class="ant-upload-drag-icon pt-4">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或将文件拖曳到这里上传</p>
        <p class="ant-upload-hint pb-4">
          支持 txt, pdf, docx, pptx, xlsx 等常用格式
        </p>
      </Upload.Dragger>
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
          <template v-if="column.key === 'action'">
            <Space>
              <Button type="link" size="small" @click="handleFragment(record)">知识片段</Button>
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
    <Modal v-model:open="fragmentVisible" title="知识片段" :width="800" :footer="null" :destroyOnClose="true">
      <Table :columns="fragmentColumns" :data-source="fragmentData" :loading="fragmentLoading" :pagination="false" size="middle" bordered row-key="fid">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'content'">
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
