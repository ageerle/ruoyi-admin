<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { PageQuery } from '#/api/common';
import type { OssFile } from '#/api/system/oss/model';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';

import {
  Image,
  message,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import {
  addSortParams,
  useVbenVxeGrid,
  vxeCheckboxChecked,
} from '#/adapter/vxe-table';
import { configInfoByKey } from '#/api/system/config';
import { ossDownload, ossList, ossRemove } from '#/api/system/oss';
import { calculateFileSize } from '#/utils/file';
import { downloadByData } from '#/utils/file/download';

import { columns, fallbackImageBase64, querySchema } from './data';
import fileUploadModal from './file-upload-modal.vue';
import imageUploadModal from './image-upload-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 日期选择格式化
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginCreateTime]', 'params[endCreateTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    // trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page, sorts }, formValues = {}) => {
        const params: PageQuery = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        // 添加排序参数
        addSortParams(params, sorts);
        return await ossList(params);
      },
    },
  },
  rowConfig: {
    keyField: 'ossId',
    height: 65,
  },
  sortConfig: {
    // 远程排序
    remote: true,
    // 支持多字段排序 默认关闭
    multiple: false,
  },
  id: 'system-oss-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    // 排序 重新请求接口
    sortChange: () => tableApi.query(),
  },
});

async function handleDownload(row: OssFile) {
  const downloadSize = ref($t('pages.common.downloadLoading'));
  const hideLoading = message.loading({
    content: () => downloadSize.value,
    duration: 0,
  });
  try {
    const data = await ossDownload(row.ossId, (e) => {
      // 计算下载进度
      const percent = Math.floor((e.loaded / e.total!) * 100);
      // 已经下载
      const current = calculateFileSize(e.loaded);
      // 总大小
      const total = calculateFileSize(e.total!);
      downloadSize.value = `已下载: ${current}/${total} (${percent}%)`;
    });
    downloadByData(data, row.originalName);
    message.success('下载完成');
  } finally {
    hideLoading();
  }
}

async function handleDelete(row: OssFile) {
  await ossRemove([row.ossId]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: OssFile) => row.ossId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await ossRemove(ids);
      await tableApi.query();
    },
  });
}

const router = useRouter();
function handleToSettings() {
  router.push('/system/oss-config');
}

const preview = ref(false);
onMounted(async () => {
  const previewStr = await configInfoByKey('sys.oss.previewListResource');
  preview.value = previewStr === 'true';
});

function isImageFile(ext: string) {
  const supportList = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return supportList.some((item) => ext.toLocaleLowerCase().includes(item));
}
const [ImageUploadModal, imageUploadApi] = useVbenModal({
  connectedComponent: imageUploadModal,
});

const [FileUploadModal, fileUploadApi] = useVbenModal({
  connectedComponent: fileUploadModal,
});
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="文件列表">
      <template #toolbar-tools>
        <Space>
          <Tooltip title="预览图片">
            <Switch v-model:checked="preview" />
          </Tooltip>
          <a-button
            v-access:code="['system:ossConfig:list']"
            @click="handleToSettings"
          >
            配置管理
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['system:oss:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            v-access:code="['system:oss:upload']"
            @click="fileUploadApi.open"
          >
            文件上传
          </a-button>
          <a-button
            v-access:code="['system:oss:upload']"
            @click="imageUploadApi.open"
          >
            图片上传
          </a-button>
        </Space>
      </template>
      <template #url="{ row }">
        <!-- placeholder为图片未加载时显示的占位图 -->
        <!-- fallback为图片加载失败时显示 -->
        <!-- 需要设置key属性 否则切换翻页会有延迟 -->
        <Image
          :key="row.ossId"
          v-if="preview && isImageFile(row.url)"
          :src="row.url"
          height="50px"
          :fallback="fallbackImageBase64"
        >
          <template #placeholder>
            <div class="flex size-full items-center justify-center">
              <Spin />
            </div>
          </template>
        </Image>
        <span v-else>{{ row.url }}</span>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['system:oss:download']"
            @click="handleDownload(row)"
          >
            {{ $t('pages.common.download') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['system:oss:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ImageUploadModal @reload="tableApi.query" />
    <FileUploadModal @reload="tableApi.query" />
  </Page>
</template>
