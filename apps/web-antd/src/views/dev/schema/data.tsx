import type {FormSchemaGetter} from '#/adapter/form';
import type {VxeGridProps} from '#/adapter/vxe-table';
import {getDataNames} from '#/api/dev/schema/schema';

// 创建一个异步函数来获取表名选项
export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '菜单名称',
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
  }
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
