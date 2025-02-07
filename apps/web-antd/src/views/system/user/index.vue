<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import {
  Page,
  useVbenDrawer,
  useVbenModal,
  type VbenFormProps,
} from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getPopupContainer } from '@vben/utils';

import {
  Avatar,
  Dropdown,
  Menu,
  MenuItem,
  Modal,
  Popconfirm,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  userExport,
  userList,
  userRemove,
  userStatusChange,
} from '#/api/system/user';
import { TableSwitch } from '#/components/table';
import { downloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import userDrawer from './user-drawer.vue';
import userImportModal from './user-import-modal.vue';
import userInfoModal from './user-info-modal.vue';
import userResetPwdModal from './user-reset-pwd-modal.vue';

/**
 * 导入
 */
const [UserImpotModal, userImportModalApi] = useVbenModal({
  connectedComponent: userImportModal,
});

function handleImport() {
  userImportModalApi.open();
}

// 左边部门用
const selectDeptId = ref<string[]>([]);

const formOptions: VbenFormProps = {
  schema: querySchema(),
  commonConfig: {
    labelWidth: 80,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    trigger: 'default',
    checkMethod: ({ row }) => row?.userId !== 1,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
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
        // 部门树选择处理
        if (selectDeptId.value.length === 1) {
          formValues.deptId = selectDeptId.value[0];
        } else {
          Reflect.deleteProperty(formValues, 'deptId');
        }

        return await userList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'userId',
    height: 48,
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
    checkboxChange: (e: any) => {
      checked.value = e.records.length > 0;
    },
    checkboxAll: (e: any) => {
      checked.value = e.records.length > 0;
    },
  },
});

const [UserDrawer, userDrawerApi] = useVbenDrawer({
  connectedComponent: userDrawer,
});

function handleAdd() {
  userDrawerApi.setData({});
  userDrawerApi.open();
}

function handleEdit(row: Recordable<any>) {
  userDrawerApi.setData({ id: row.userId });
  userDrawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await userRemove(row.userId);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.userId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await userRemove(ids);
      await tableApi.query();
    },
  });
}

const [UserInfoModal, userInfoModalApi] = useVbenModal({
  connectedComponent: userInfoModal,
});
function handleUserInfo(row: Recordable<any>) {
  userInfoModalApi.setData({ userId: row.userId });
  userInfoModalApi.open();
}

const [UserResetPwdModal, userResetPwdModalApi] = useVbenModal({
  connectedComponent: userResetPwdModal,
});

function handleResetPwd(record: Recordable<any>) {
  userResetPwdModalApi.setData({ record });
  userResetPwdModalApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-[8px]">
      <!-- <DeptTree
        v-model:select-dept-id="selectDeptId"
        :height="300"
        class="w-[260px]"
        @select="() => tableApi.query()"
      /> -->
      <BasicTable class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <span class="pl-[7px] text-[16px]">用户列表</span>
        </template>
        <template #toolbar-tools>
          <Space>
            <a-button
              v-access:code="['system:user:export']"
              @click="downloadExcel(userExport, '用户管理', {})"
            >
              {{ $t('pages.common.export') }}
            </a-button>
            <a-button
              v-access:code="['system:user:import']"
              @click="handleImport"
            >
              {{ $t('pages.common.import') }}
            </a-button>
            <a-button
              :disabled="!checked"
              danger
              type="primary"
              v-access:code="['system:user:remove']"
              @click="handleMultiDelete"
            >
              {{ $t('pages.common.delete') }}
            </a-button>
            <a-button
              type="primary"
              v-access:code="['system:user:add']"
              @click="handleAdd"
            >
              {{ $t('pages.common.add') }}
            </a-button>
          </Space>
        </template>
        <template #avatar="{ row }">
          <Avatar v-if="row.avatar" :src="row.avatar" />
          <Avatar
            v-else
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
          />
        </template>
        <template #status="{ row }">
          <TableSwitch
            v-model="row.status"
            :api="() => userStatusChange(row)"
            :disabled="row.userId === 1"
            :reload="() => tableApi.query()"
          />
        </template>
        <template #action="{ row }">
          <template v-if="row.userId !== 1">
            <a-button
              size="small"
              type="link"
              v-access:code="['system:user:edit']"
              @click.stop="handleEdit(row)"
            >
              {{ $t('pages.common.edit') }}
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
                v-access:code="['system:user:remove']"
                @click.stop=""
              >
                {{ $t('pages.common.delete') }}
              </a-button>
            </Popconfirm>
            <Dropdown
              :get-popup-container="getPopupContainer"
              placement="bottomRight"
            >
              <template #overlay>
                <Menu>
                  <MenuItem key="1" @click="handleUserInfo(row)">
                    用户信息
                  </MenuItem>
                  <MenuItem key="2" @click="handleResetPwd(row)">
                    重置密码
                  </MenuItem>
                </Menu>
              </template>
              <a-button size="small" type="link">更多</a-button>
            </Dropdown>
          </template>
        </template>
      </BasicTable>
    </div>
    <UserImpotModal />
    <UserDrawer @reload="tableApi.query()" />
    <UserInfoModal />
    <UserResetPwdModal />
  </Page>
</template>
