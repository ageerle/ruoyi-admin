<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, type VbenFormProps } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Image,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import { configInfoByKey } from '#/api/system/config';
import { ossDownload, ossList, ossRemove } from '#/api/system/oss';
import { downloadByData } from '#/utils/file/download';

import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
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
      query: async ({ page, sort }, formValues = {}) => {
        // 区间选择器处理
        if (formValues?.createTime) {
          formValues.params = {
            beginTime: dayjs(formValues.createTime[0]).format(
              'YYYY-MM-DD 00:00:00',
            ),
            endTime: dayjs(formValues.createTime[1]).format(
              'YYYY-MM-DD 23:59:59',
            ),
          };
          Reflect.deleteProperty(formValues, 'createTime');
        } else {
          Reflect.deleteProperty(formValues, 'params');
        }

        const params: any = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        if (!isEmpty(sort)) {
          params.orderByColumn = sort.field;
          params.isAsc = sort.order;
        }
        return await ossList(params);
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'ossId',
    height: 65,
  },
  sortConfig: {
    remote: true,
  },
  round: true,
  align: 'center',
  showOverflow: true,
};

const checked = ref(false);
const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    sortChange: () => {
      tableApi.query();
    },
    checkboxChange: (e: any) => {
      checked.value = e.records.length > 0;
    },
    checkboxAll: (e: any) => {
      checked.value = e.records.length > 0;
    },
  },
});

async function handleDownload(row: Recordable<any>) {
  const hideLoading = message.loading($t('pages.common.downloadLoading'), 0);
  try {
    const data = await ossDownload(row.ossId);
    downloadByData(data, row.originalName);
  } finally {
    hideLoading();
  }
}

async function handleDelete(row: Recordable<any>) {
  await ossRemove(row.ossId);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.ossId);
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
  const resp = await configInfoByKey('sys.oss.previewListResource');
  preview.value = Boolean(resp);
});

function isImageFile(ext: string) {
  const supportList = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return supportList.some((item) => ext.toLocaleLowerCase().includes(item));
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">文件列表</span>
      </template>
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
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['system:oss:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Space>
      </template>
      <template #url="{ row }">
        <Image
          v-if="preview && isImageFile(row.url)"
          :src="row.url"
          height="50px"
        />
        <span v-else>{{ row.url }}</span>
      </template>
      <template #action="{ row }">
        <a-button
          size="small"
          type="link"
          v-access:code="['system:oss:edit']"
          @click="handleDownload(row)"
        >
          {{ $t('pages.common.download') }}
        </a-button>
        <Popconfirm
          placement="left"
          title="确认删除？"
          @confirm="handleDelete(row)"
        >
          <a-button
            danger
            size="small"
            type="link"
            v-access:code="['system:oss:remove']"
            @click.stop=""
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Popconfirm>
      </template>
    </BasicTable>
  </Page>
</template>
