import type {FormSchemaGetter} from '#/adapter/form';
import type {VxeGridProps} from '#/adapter/vxe-table';

import {DictEnum} from '@vben/constants';

import {renderDict} from '#/utils/render';
import {getDataNames} from '#/api/dev/schema';
import { DictTag } from '#/components/dict';

// 创建一个异步函数来获取表名选项
export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '菜单名称',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '菜单目录',
  },
  {
    component: 'ApiSelect',
    fieldName: 'tableName',
    label: '表名',
    componentProps: {
      api: getDataNames,
      immediate: true,
      showSearch: true,
      placeholder: '请选择表名',
      // 直接处理返回的字符串数组
      afterFetch: (data: any) => {

        // 检查返回的数据结构
        const tableNames = data?.data || data || [];
        return tableNames.map((tableName: string) => ({
          label: tableName,
          value: tableName,
        }));
      },
      onError: (error: any) => {
        console.error('API调用失败:', error);
      },
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      options: [
        {label: '正常', value: '0'},
        {label: '停用', value: '1'},
      ],
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  {type: 'checkbox', width: 60},
  {
    title: '主键',
    field: 'id',
    visible: false,
  },
  {
    title: '菜单名称',
    field: 'name',
  },
  {
    title: '菜单目录',
    field: 'code',
  },
  {
    title: '表名',
    field: 'tableName',
  },
  {
    title: '表注释',
    field: 'comment',
  },
  {
    title: '状态',
    field: 'status',
    width: 120,
    slots: {
      default: ({row}) => {
        // return renderDict(row.status, DictEnum.STATUS_TYPE);
        return row.status == '0' ?'正常' :'停用'
      },
    },
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: {default: 'action'},
    title: '操作',
    width: 180,
  },
];

export const drawerSchema: FormSchemaGetter = () => [

  {
    component: 'Input',
    fieldName: 'schemaGroupId',
    label: '分组ID',
  },

  {
    component: 'Input',
    fieldName: 'name',
    label: '菜单名称',
  },

  {
    component: 'Input',
    fieldName: 'code',
    label: '菜单目录',
  },

  {
    component: 'Input',
    fieldName: 'tableName',
    label: '表名',
  },

  {
    component: 'Input',
    fieldName: 'comment',
    label: '表注释',
  },

  {
    component: 'Input',
    fieldName: 'engine',
    label: '存储引擎',
  },

  {
    component: 'Input',
    fieldName: 'listKeys',
    label: '列表字段',
  },

  {
    component: 'Input',
    fieldName: 'searchFormKeys',
    label: '搜索表单字段',
  },

  {
    component: 'Input',
    fieldName: 'designer',
    label: '表单设计',
  },

  {
    component: 'Input',
    fieldName: 'status',
    label: '状态（0正常 1停用）',
  },

  {
    component: 'Input',
    fieldName: 'sort',
    label: '排序',
  },

  {
    component: 'Input',
    fieldName: 'remark',
    label: '备注',
  },

  {
    component: 'Input',
    fieldName: 'delFlag',
    label: '删除标志（0代表存在 2代表删除）',
  },

  {
    component: 'Input',
    fieldName: 'tenantId',
    label: '租户编号',
  },

  {
    component: 'Input',
    fieldName: 'createDept',
    label: '创建部门',
  },

  {
    component: 'Input',
    fieldName: 'createBy',
    label: '创建者',
  },

  {
    component: 'Input',
    fieldName: 'updateBy',
    label: '更新者',
  },
];
