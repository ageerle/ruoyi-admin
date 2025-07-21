import type {FormSchemaGetter} from '#/adapter/form';
import type {VxeGridProps} from '#/adapter/vxe-table';
import {schemaList} from '#/api/dev/schema';

export const columns: VxeGridProps['columns'] = [
  {
    title: '序号',
    type: 'seq',
    width: 60,
    fixed: 'left',
    visible: false,
  },
  {
    title: '模型ID',
    field: 'schemaId',
    width: 80,
    visible: false,
  },
  {
    title: '字段名称',
    field: 'name',
    width: 120,
    editRender: {
      name: 'VxeInput',
    },
  },
  {
    title: '字段编码',
    field: 'code',
    width: 120,
    editRender: {
      name: 'VxeInput',
    },
  },
  {
    title: '字段类型',
    field: 'type',
    width: 100,
    editRender: {
      name: 'VxeSelect',
      options: [
        {label: 'varchar', value: 'varchar'},
        {label: 'char', value: 'char'},
        {label: 'text', value: 'text'},
        {label: 'int', value: 'int'},
        {label: 'bigint', value: 'bigint'},
        {label: 'decimal', value: 'decimal'},
        {label: 'datetime', value: 'datetime'},
        {label: 'date', value: 'date'},
        {label: 'timestamp', value: 'timestamp'},
        {label: 'tinyint', value: 'tinyint'},
      ],
    },
  },
  {
    title: '字段注释',
    field: 'comment',
    width: 150,
    editRender: {
      name: 'VxeInput',
    },
  },
  {
    title: '字段长度',
    field: 'length',
    width: 100,
    editRender: {
      name: 'VxeInput',
      props: {
        type: 'number',
      },
    },
  },
  {
    title: '主键',
    field: 'isPk',
    width: 80,
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
  },
  {
    title: '必填',
    field: 'isRequired',
    width: 80,
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
  },
  {
    title: '列表显示',
    field: 'isList',
    width: 100,
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
  },
  {
    title: '查询字段',
    field: 'isQuery',
    width: 100,
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
  },
  {
    title: '插入字段',
    field: 'isInsert',
    width: 100,
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
  },
  {
    title: '编辑字段',
    field: 'isEdit',
    width: 100,
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
  },
  {
    title: '查询方式',
    field: 'queryType',
    width: 100,
    editRender: {
      name: 'VxeSelect',
      options: [
        {label: '等于', value: 'EQ'},
        {label: '不等于', value: 'NE'},
        {label: '大于', value: 'GT'},
        {label: '小于', value: 'LT'},
        {label: '模糊', value: 'LIKE'},
        {label: '范围', value: 'BETWEEN'},
      ],
    },
  },
  {
    title: 'HTML类型',
    field: 'htmlType',
    width: 120,
    editRender: {
      name: 'VxeSelect',
      options: [
        {label: '输入框', value: 'input'},
        {label: '文本域', value: 'textarea'},
        {label: '下拉框', value: 'select'},
        {label: '复选框', value: 'checkbox'},
        {label: '单选框', value: 'radio'},
        {label: '日期控件', value: 'datetime'},
        {label: '上传控件', value: 'upload'},
        {label: '富文本', value: 'editor'},
      ],
    },
  },
  {
    title: '字典类型',
    field: 'dictType',
    width: 120,
    editRender: {
      name: 'VxeInput',
    },
  },
  {
    title: '排序',
    field: 'sort',
    width: 80,
    editRender: {
      name: 'VxeInput',
      props: {
        type: 'number',
      },
    },
  },
];

export const querySchema: FormSchemaGetter = () => [
  {
    fieldName: 'schemaId',
    label: '数据模型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择数据模型',
      showSearch: true,
      allowClear: true,
      options: [],
      api: async () => {
        try {
          const response = await schemaList({pageSize: 1000});
          return response.rows?.map(item => ({
            label: `${item.code}-${item.name}`,
            value: item.id,
          })) || [];
        } catch (error) {
          console.error('加载数据模型选项失败:', error);
          return [];
        }
      },
      filterOption: (input: string, option: any) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
    },
    colProps: {
      span: 8,
    },
  },
  {
    fieldName: 'name',
    label: '字段名称',
    component: 'Input',
    colProps: {
      span: 8,
    },
  },
  {
    fieldName: 'code',
    label: '字段编码',
    component: 'Input',
    colProps: {
      span: 8,
    },
  },
  {
    fieldName: 'type',
    label: '字段类型',
    component: 'Select',
    componentProps: {
      options: [
        {label: 'varchar', value: 'varchar'},
        {label: 'char', value: 'char'},
        {label: 'text', value: 'text'},
        {label: 'int', value: 'int'},
        {label: 'bigint', value: 'bigint'},
        {label: 'decimal', value: 'decimal'},
        {label: 'datetime', value: 'datetime'},
        {label: 'date', value: 'date'},
        {label: 'timestamp', value: 'timestamp'},
        {label: 'tinyint', value: 'tinyint'},
      ],
    },
    colProps: {
      span: 8,
    },
  },
];
