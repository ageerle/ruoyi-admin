import type {FormSchemaGetter} from '#/adapter/form';
import type {VxeGridPropTypes} from '#/adapter/vxe-table';
import {schemaList} from '#/api/dev/schema/schema';

export const columns: VxeGridPropTypes.Columns = [
  {
    title: '序号',
    type: 'seq',
    fixed: 'left',
    visible: false,
  },
  {
    title: '模型ID',
    field: 'schemaId',
    visible: false,
  },

  {
    title: '模型名称',
    field: 'schemaName',
    visible: false,
  },
  {
    title: '字段编码',
    field: 'code',
  },
  {
    title: '字段描述',
    field: 'name',
  },
  {
    title: '字段类型',
    field: 'type',
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
    title: '默认值',
    field: 'defaultValue',
  },
  {
    title: '字段长度',
    field: 'length',
  },
  {
    title: '主键',
    field: 'isPk',
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
    formatter: ({cellValue}) => {
      return cellValue === '1' || cellValue === 1 ? '是' : '否';
    },
  },
  {
    title: '必填',
    field: 'isRequired',
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
    formatter: ({cellValue}) => {
      return cellValue === '1' || cellValue === 1 ? '是' : '否';
    },
  },
  {
    title: '列表显示',
    field: 'isList',
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
    formatter: ({cellValue}) => {
      return cellValue === '1' || cellValue === 1 ? '是' : '否';
    },
  },
  {
    title: '查询字段',
    field: 'isQuery',
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
    formatter: ({cellValue}) => {
      return cellValue === '1' || cellValue === 1 ? '是' : '否';
    },
  },
  {
    title: '插入字段',
    field: 'isInsert',
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
    formatter: ({cellValue}) => {
      return cellValue === '1' || cellValue === 1 ? '是' : '否';
    },
  },
  {
    title: '编辑字段',
    field: 'isEdit',
    editRender: {
      name: 'VxeSwitch',
      props: {
        openValue: '1',
        closeValue: '0',
      },
    },
    formatter: ({cellValue}) => {
      return cellValue === '1' || cellValue === 1 ? '是' : '否';
    },
  },
  {
    title: '查询方式',
    field: 'queryType',
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
    editRender: {
      name: 'VxeSelect',
      options: [
        {label: '输入框', value: 'input'},
        {label: '文本域', value: 'textarea'},
        {label: '下拉框', value: 'select'},
        {label: '复选框', value: 'checkbox'},
        {label: '单选框', value: 'radio'},
        {label: '日期控件', value: 'datetime'},
        {label: '日期时间控件', value: 'datetime'},
        {label: '日期控件', value: 'date'},
        {label: '时间控件', value: 'time'},
        {label: '上传控件', value: 'upload'},
        {label: '富文本', value: 'editor'},
      ],
    },
  },
  {
    title: '字典类型',
    field: 'dictType',
  }
];

export const querySchema: FormSchemaGetter = () => [
  {
    fieldName: 'schemaId',
    label: '数据模型',
    component: 'ApiSelect',
    componentProps: {
      api: schemaList,
      immediate: true,
      showSearch: true,
      allowClear: true,
      placeholder: '请选择数据模型',
      // 处理返回的数据结构
      afterFetch: (data: any) => {
        // 检查返回的数据结构
        const schemas = data?.rows || data || [];
        return schemas.map((item: any) => ({
          label: `${item.name}-${item.tableName}`,
          value: item.id,
        }));
      },
      onError: (error: any) => {
        console.error('API调用失败:', error);
      },
    },
    colProps: {
      span: 8,
    }
  },
  {
    fieldName: 'code',
    label: '字段编码',
    component: 'Input',
  },
];
