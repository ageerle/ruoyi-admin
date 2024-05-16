<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="模型名称" prop="modelName">
            <el-input v-model="queryParams.modelName" placeholder="请输入模型名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="模型描述" prop="modelDescribe">
            <el-input v-model="queryParams.modelDescribe" placeholder="请输入模型描述" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="模型价格" prop="modelPrice">
            <el-input v-model="queryParams.modelPrice" placeholder="请输入模型价格" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:model:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:model:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:model:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:model:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="modelList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模型名称" align="center" prop="modelName" />
        <el-table-column label="模型描述" align="center" prop="modelDescribe" />
        <el-table-column label="模型价格" align="center" prop="modelPrice" />
        
        <el-table-column prop="modelType" align="center" label="计费方式" width="100">
              <template #default="scope">
                <dict-tag :options="sys_model_billing" :value="scope.row.modelType" />
              </template>
        </el-table-column>

        <el-table-column prop="" align="center" label="显示" width="100">
              <template #default="scope">
                <dict-tag :options="sys_show_hide" :value="scope.row.modelShow" />
              </template>
        </el-table-column>

        
        <el-table-column label="备注" align="center" prop="remark" />

        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:model:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:model:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </el-card>
    <!-- 添加或修改系统模型对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="modelFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="请输入模型名称" />
        </el-form-item>

        <el-form-item label="模型描述" prop="modelDescribe">
          <el-input v-model="form.modelDescribe" placeholder="请输入模型描述" />
        </el-form-item>
        
        <el-form-item label="计费方式" prop="modelType">
          <el-radio-group v-model="form.modelType">
            <el-radio v-for="dict in sys_model_billing" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否显示" prop="modelShow">
          <el-radio-group v-model="form.modelShow">
            <el-radio v-for="dict in sys_show_hide" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="模型价格" prop="modelPrice">
          <el-input v-model="form.modelPrice" placeholder="请输入模型价格" />
        </el-form-item>
          

        <el-form-item label="模型说明" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>

        <el-form-item label="默认提示" prop="systemPrompt">
            <el-input v-model="form.systemPrompt" type="textarea" placeholder="请输入内容" />
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Model" lang="ts">
    import { addModel, delModel, getModel, listModel, updateModel} from '@/api/model/index';
    import { ModelForm, ModelQuery, ModelNameVO } from '@/api/model/types';
    import {ComponentInternalInstance} from 'vue';
    import {ElForm} from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_model_billing,sys_show_hide } = toRefs<any>(proxy?.useDict('sys_model_billing','sys_show_hide'));
const modelList = ref<ModelNameVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref(ElForm);
const modelFormRef = ref(ElForm);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ModelForm = {
  id: undefined,
  modelName: undefined,
  modelDescribe: undefined,
  modelPrice: undefined,
  modelType: undefined,
  modelShow: undefined,
  systemPrompt: undefined,
  remark: undefined
}
const data = reactive<PageData<ModelForm, ModelQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    modelName: undefined,
    modelDescribe: undefined,
    modelPrice: undefined,
    modelType: undefined,
  },
  rules: {
    modelName: [
      { required: true, message: "模型名称不能为空", trigger: "blur" }
    ],

    modelDescribe: [
      { required: true, message: "模型描述不能为空", trigger: "blur" }
    ],
    modelPrice: [
      { required: true, message: "模型价格不能为空", trigger: "blur" }
    ],
 
    remark: [
      { required: true, message: "模型说明不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询系统模型列表 */
const getList = async () => {
  loading.value = true;
  const res = await listModel(queryParams.value);
  modelList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  modelFormRef.value.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: ModelNameVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  dialog.visible = true;
  dialog.title = "添加系统模型";
  nextTick(() => {
    reset();
  });
}

/** 修改按钮操作 */
const handleUpdate = (row?: ModelNameVO) => {
  loading.value = true
  dialog.visible = true;
  dialog.title = "修改系统模型";
  nextTick(async () => {
    reset();
    const _id = row?.id || ids.value[0]
    const res = await getModel(_id);
    loading.value = false;
    Object.assign(form.value, res.data);
  });
}

/** 提交按钮 */
const submitForm = () => {
  modelFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateModel(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addModel(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ModelNameVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除系统模型编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delModel(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/model/export', {
    ...queryParams.value
  }, `model_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
