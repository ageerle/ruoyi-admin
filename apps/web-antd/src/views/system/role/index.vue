<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import {
  Page,
  useVbenDrawer,
  useVbenModal,
  type VbenFormProps,
} from '@vben/common-ui';
import { getPopupContainer } from '@vben/utils';

import {
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
  roleChangeStatus,
  roleExport,
  roleList,
  roleRemove,
} from '#/api/system/role';
import { TableSwitch } from '#/components/table';
import { downloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import roleAuthModal from './role-auth-modal.vue';
import roleDrawer from './role-drawer.vue';

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
    checkMethod: ({ row }) => row.roleId !== 1,
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

        return await roleList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'roleId',
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
const [RoleDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: roleDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.roleId });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await roleRemove(row.roleId);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.roleId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await roleRemove(ids);
      await tableApi.query();
    },
  });
}

const { hasAccessByCodes } = useAccess();

const [RoleAuthModal, authModalApi] = useVbenModal({
  connectedComponent: roleAuthModal,
});

function handleAuthEdit(record: Recordable<any>) {
  authModalApi.setData({ id: record.roleId });
  authModalApi.open();
}

const router = useRouter();
function handleAssignRole(record: Recordable<any>) {
  router.push(`/system/role-assign/${record.roleId}`);
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">参数列表</span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:role:export']"
            @click="downloadExcel(roleExport, '角色数据', {})"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['system:role:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:role:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <TableSwitch
          v-model="row.status"
          :api="() => roleChangeStatus(row)"
          :disabled="
            row.roleId === 1 ||
            row.roleKey === 'admin' ||
            !hasAccessByCodes(['system:role:edit'])
          "
          :reload="() => tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <template v-if="row.roleId !== 1">
          <a-button
            size="small"
            type="link"
            v-access:code="['system:role:edit']"
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
              v-access:code="['system:role:remove']"
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
                <MenuItem key="1" @click="handleAuthEdit(row)">
                  数据权限
                </MenuItem>
                <MenuItem key="2" @click="handleAssignRole(row)">
                  分配用户
                </MenuItem>
              </Menu>
            </template>
            <a-button size="small" type="link">更多</a-button>
          </Dropdown>
        </template>
      </template>
    </BasicTable>
    <RoleDrawer @reload="tableApi.query()" />
    <RoleAuthModal @reload="tableApi.query()" />
  </Page>
</template>
