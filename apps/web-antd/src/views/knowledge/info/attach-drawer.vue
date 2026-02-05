<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import {
  Drawer,
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
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { attachList, attachRemove } from '#/api/knowledge/attach';
import { fragmentList } from '#/api/knowledge/fragment';
import { ossInfo, checkLoginBeforeDownload } from '#/api/system/oss';
import { downloadByUrl } from '#/utils/file/download';
import { stringify } from '@vben/request';

const { apiURL, clientId } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);
const accessStore = useAccessStore();

const visible = ref(false);
const loading = ref(false);
const uploading = ref(false);
const currentKnowledgeId = ref<string | number | null>(null);
const attachmentData = ref([]);

const uploadUrl = `${apiURL}/system/attach/upload`;
const headers = {
  Authorization: `Bearer ${accessStore.accessToken}`,
  clientId,
};

const uploadPayload = computed(() => ({
  knowledgeId: currentKnowledgeId.value,
}));

const columns = [
  { title: '附件名称', dataIndex: 'name', key: 'name' },
  { title: '附件类型', dataIndex: 'type', key: 'type' },
  { title: '操作', key: 'action', width: 300 },
];

// 知识片段相关
const fragmentVisible = ref(false);
const fragmentLoading = ref(false);
const fragmentData = ref([]);
const fragmentColumns = [
  { title: '片段编号', dataIndex: 'docId', key: 'docId' },
  { title: '片段内容', dataIndex: 'content', key: 'content' },
];

// 文件详情相关
const fileDetailVisible = ref(false);
const fileDetailLoading = ref(false);
const fileDetailData = ref<any>(null);

async function loadAttachments() {
  if (!currentKnowledgeId.value) return;
  loading.value = true;
  try {
    const res = await attachList({
      knowledgeId: currentKnowledgeId.value,
      pageSize: 100,
    });
    attachmentData.value = res.rows || [];
  } finally {
    loading.value = false;
  }
}

function open(knowledgeId: string | number) {
  currentKnowledgeId.value = knowledgeId;
  visible.value = true;
  loadAttachments();
}

function close() {
  visible.value = false;
  currentKnowledgeId.value = null;
  attachmentData.value = [];
}

async function handleChange(info: any) {
  const file = info.file;
  const status = file?.status;

  switch (status) {
    case 'uploading': {
      if (!uploading.value) {
        uploading.value = true;
      }
      break;
    }
    case 'done': {
      const { response } = file;
      const { code, msg = '服务器错误' } = response;
      if (code === 200) {
        message.success('上传成功');
        await loadAttachments();
      } else {
        message.error(msg);
      }
      uploading.value = false;
      break;
    }
    case 'error': {
      uploading.value = false;
      message.error('上传失败');
      break;
    }
  }
}

async function handleDeleteAttachment(record: any) {
  try {
    await attachRemove(record.id);
    message.success('删除成功');
    await loadAttachments();
  } catch (error) {
    message.error('删除失败');
  }
}

async function handleFragment(record: any) {
  fragmentLoading.value = true;
  try {
    // 根据附件ID查询知识片段，这里需要根据实际API调整参数
    const res = await fragmentList({
      attachId: record.id, // 或者其他关联字段
      pageSize: 100,
    });
    fragmentData.value = res.rows || [];
    fragmentVisible.value = true;
  } catch (error) {
    message.error('加载知识片段失败');
  } finally {
    fragmentLoading.value = false;
  }
}

function closeFragment() {
  fragmentVisible.value = false;
  fragmentData.value = [];
}

// 查看文件详情
async function handleViewFile(record: any) {
  if (!record.ossId) {
    message.error('文件信息不完整');
    return;
  }

  fileDetailLoading.value = true;
  try {
    const res = await ossInfo(record.ossId);
    if (res && res.length > 0) {
      fileDetailData.value = res[0];
      fileDetailVisible.value = true;
    } else {
      message.error('未找到文件信息');
    }
  } catch (error) {
    message.error('获取文件信息失败');
  } finally {
    fileDetailLoading.value = false;
  }
}

// 下载文件
async function handleDownloadFile(ossId: string, fileName: string) {
  try {
    await checkLoginBeforeDownload();

    const params = {
      clientid: clientId,
      Authorization: `Bearer ${accessStore.accessToken}`,
    };

    const downloadLink = `${apiURL}/resource/oss/download/${ossId}?${stringify(params)}`;
    downloadByUrl({ fileName, url: downloadLink });
  } catch (error) {
    message.error('下载失败');
  }
}

function closeFileDetail() {
  fileDetailVisible.value = false;
  fileDetailData.value = null;
}

// 判断是否是图片文件
function isImageFile(fileSuffix: string) {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageTypes.some(type =>
    fileSuffix.toLowerCase().includes(type)
  );
}

defineExpose({
  open,
  close,
});
</script>

<template>
  <Drawer
    title="知识库附件"
    :open="visible"
    @close="close"
    :width="800"
  >
    <div style="margin-bottom: 16px">
      <Upload
        :action="uploadUrl"
        :headers="headers"
        :show-upload-list="false"
        accept=".txt,.pdf,.docx,.pptx,.xlsx,.xls,.csv,.json"
        multiple
        name="file"
        :data="uploadPayload"
        @change="handleChange"
      >
        <Button type="primary" :loading="uploading">
          文件上传
        </Button>
      </Upload>
    </div>

    <Table
      :columns="columns"
      :data-source="attachmentData"
      :loading="loading"
      :pagination="false"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <span v-if="column.key === 'action'">
          <Space>
            <Button type="primary" size="small" @click="handleFragment(record)">
              知识片段
            </Button>
            <Button type="primary" size="small" @click="handleViewFile(record)">
              查看文件
            </Button>
            <Popconfirm
              title="确定删除吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="handleDeleteAttachment(record)"
            >
              <Button type="primary" danger size="small">
                删除
              </Button>
            </Popconfirm>
          </Space>
        </span>
      </template>
    </Table>
  </Drawer>

  <!-- 知识片段抽屉 -->
  <Drawer
    title="知识片段"
    :open="fragmentVisible"
    @close="closeFragment"
    :width="1000"
  >
    <Table
      :columns="fragmentColumns"
      :data-source="fragmentData"
      :loading="fragmentLoading"
      :pagination="false"
      row-key="fid"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'content'">
          <Tooltip :title="record.content">
            <span>
              {{
                record.content && record.content.length > 50
                  ? record.content.slice(0, 50) + '...'
                  : record.content
              }}
            </span>
          </Tooltip>
        </template>
      </template>
    </Table>
  </Drawer>

  <!-- 文件详情弹框 -->
  <Modal
    title="文件详情"
    :open="fileDetailVisible"
    @cancel="closeFileDetail"
    :width="600"
    :footer="null"
  >
    <div v-if="fileDetailLoading" class="text-center py-4">
      <Spin />
    </div>
    <div v-else-if="fileDetailData">
      <Descriptions :column="1" bordered>
        <DescriptionsItem label="文件名">
          {{ fileDetailData.fileName }}
        </DescriptionsItem>
        <DescriptionsItem label="文件原名">
          {{ fileDetailData.originalName }}
        </DescriptionsItem>
        <DescriptionsItem label="文件扩展名">
          {{ fileDetailData.fileSuffix }}
        </DescriptionsItem>
        <DescriptionsItem label="创建时间">
          {{ fileDetailData.createTime }}
        </DescriptionsItem>
        <DescriptionsItem label="上传人">
          {{ fileDetailData.createByName }}
        </DescriptionsItem>
        <DescriptionsItem label="服务商">
          {{ fileDetailData.service }}
        </DescriptionsItem>
        <DescriptionsItem label="文件预览">
          <div v-if="isImageFile(fileDetailData.fileSuffix)">
            <Image
              :src="fileDetailData.url"
              :width="200"
              :preview="true"
            />
          </div>
          <div v-else>
            <a :href="fileDetailData.url" target="_blank" rel="noopener noreferrer">
              {{ fileDetailData.url }}
            </a>
          </div>
        </DescriptionsItem>
      </Descriptions>

      <div class="text-center mt-4">
        <Space>
          <Button @click="closeFileDetail">关闭</Button>
          <Button
            type="primary"
            @click="handleDownloadFile(fileDetailData.ossId, fileDetailData.originalName)"
          >
            下载文件
          </Button>
        </Space>
      </div>
    </div>
  </Modal>
</template>
