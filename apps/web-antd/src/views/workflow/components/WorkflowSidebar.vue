<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { NButton, NModal, NForm, NFormItem, NInput, NSwitch, NIcon, NPopconfirm, useMessage, NSpin, NEmpty } from 'naive-ui'
import { Plus, UserRoundPen, X, LockKeyhole, ExternalLink, ChevronLeft, ChevronRight } from '@vben/icons'
import { workflowApi } from '#/api/workflow'
import type { WorkflowInfo, WorkflowComponent } from '#/packages/workflow-designer/types/index.d'

interface Props {
  collapsed?: boolean
  wfComponents?: WorkflowComponent[]
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  wfComponents: () => []
})

const emit = defineEmits<{
  (e: 'update:collapsed', collapsed: boolean): void
  (e: 'selectWorkflow', workflow: WorkflowInfo): void
}>()

const message = useMessage()

// 响应式数据
const activeTab = ref<'my' | 'public'>('my')
const loading = ref(false)
const myWorkflows = ref<any[]>([])
const publicWorkflows = ref<any[]>([])
const selectedWorkflowUuid = ref<string>('')

// 新建/编辑工作流
const showModal = ref(false)
const modalTitle = ref('新增')
const editingWorkflow = ref<any | null>(null)
const formData = reactive({
  title: '',
  remark: '',
  isPublic: false
})

// 计算属性
const currentWorkflows = computed(() => {
  return activeTab.value === 'my' ? myWorkflows.value : publicWorkflows.value
})

// 监听当前工作流列表变化，自动选中第一个
watch(currentWorkflows, (newWorkflows) => {
  if (newWorkflows.length > 0 && !selectedWorkflowUuid.value) {
    handleSelectWorkflow(newWorkflows[0])
  }
}, { immediate: true })

// 获取工作流列表
async function fetchWorkflows() {
  loading.value = true
  try {
    const [myRes, publicRes] = await Promise.all([
      workflowApi.workflowSearchMine('', 1, 100), // 我的工作流
      workflowApi.workflowSearchPublic('', 1, 100)  // 公开工作流
    ])
    myWorkflows.value = (myRes as any)?.records || []
    publicWorkflows.value = (publicRes as any)?.records || []
  } catch (error) {
    message.error('获取工作流列表失败')
  } finally {
    loading.value = false
  }
}

// 新建工作流
function handleNewWorkflow() {
  modalTitle.value = '新增'
  editingWorkflow.value = null
  Object.assign(formData, {
    title: '',
    remark: '',
    isPublic: false
  })
  showModal.value = true
}

// 编辑工作流
function handleEditWorkflow(workflow: any) {
  modalTitle.value = '编辑'
  editingWorkflow.value = workflow
  Object.assign(formData, {
    title: workflow.title,
    remark: workflow.remark || '',
    isPublic: workflow.isPublic
  })
  showModal.value = true
}

// 删除工作流
async function handleDeleteWorkflow(workflow: any) {
  try {
    await workflowApi.workflowDel(workflow.uuid)
    message.success('删除成功')
    await fetchWorkflows()
  } catch (error) {
    message.error('删除失败')
  }
}

// 保存工作流
async function handleSaveWorkflow() {
  if (!formData.title.trim()) {
    message.error('请输入工作流名称')
    return
  }

  try {
    const data = {
      title: formData.title,
      remark: formData.remark,
      isPublic: formData.isPublic
    }

    if (editingWorkflow.value) {
      await workflowApi.workflowBaseInfoUpdate({
        uuid: editingWorkflow.value.uuid,
        title: formData.title,
        remark: formData.remark,
        isPublic: formData.isPublic
      })
      message.success('更新成功')
    } else {
      const res: any = await workflowApi.workflowAdd(data)
      message.success('新增成功')
      // 记录返回的 uuid（有些后端会直接返回字符串或对象）
      const createdUuid: string | undefined = typeof res === 'string' ? res : res?.uuid
      // 先关闭弹窗
      showModal.value = false
      // 刷新列表
      await fetchWorkflows()
      // 选择目标：优先按 uuid，其次按标题，最后选最新一条
      let target: any | undefined
      if (createdUuid) target = myWorkflows.value.find(w => w.uuid === createdUuid)
      if (!target) target = myWorkflows.value.find(w => w.title === formData.title)
      if (!target) target = myWorkflows.value[0]
      if (target) handleSelectWorkflow(target)
      return
    }

    showModal.value = false
    await fetchWorkflows()
  } catch (error) {
    message.error(editingWorkflow.value ? '更新失败' : '新增失败')
  }
}

// 选择工作流
function handleSelectWorkflow(workflow: any) {
  // 设置选中状态
  selectedWorkflowUuid.value = workflow.uuid
  
  // 将后端数据转换为前端格式
  const workflowInfo: WorkflowInfo = {
    uuid: workflow.uuid,
    title: workflow.title,
    remark: workflow.remark,
    isPublic: workflow.isPublic,
    nodes: workflow.nodes || [],
    edges: workflow.edges || []
  }
  
  emit('selectWorkflow', workflowInfo)
}

// 切换侧边栏状态
function toggleCollapsed() {
  emit('update:collapsed', !props.collapsed)
}

onMounted(() => {
  fetchWorkflows()
})
</script>

<template>
  <div class="workflow-sidebar" :class="{ collapsed: collapsed }">
    <!-- 工作流列表部分 -->
    <div class="workflow-list-section">
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div class="header-tabs">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'my' }"
            @click="activeTab = 'my'"
          >
            我的
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'public' }"
            @click="activeTab = 'public'"
          >
            公开
          </div>
        </div>
        <n-button 
          type="primary" 
          size="small" 
          @click="handleNewWorkflow"
          class="new-btn"
        >
          <template #icon>
            <n-icon><Plus /></n-icon>
          </template>
          新建应用
        </n-button>
      </div>

      <!-- 工作流列表 -->
      <div class="workflow-list">
        <n-spin :show="loading">
          <n-empty v-if="!loading && currentWorkflows.length === 0" description="暂无工作流" />
          <div v-else class="workflow-items">
            <div 
              v-for="workflow in currentWorkflows" 
              :key="workflow.uuid"
              class="workflow-item"
              :class="{ 'workflow-item-selected': selectedWorkflowUuid === workflow.uuid }"
              @click="handleSelectWorkflow(workflow)"
            >
              <div class="workflow-info">
                <div class="workflow-name">{{ workflow.title }}</div>
                <div class="workflow-meta">
                  <span class="version">{{ workflow.createTime }}</span>
                </div>
              </div>
              <div class="workflow-actions">
                <n-icon 
                  v-if="activeTab === 'my'"
                  class="action-icon edit"
                  @click.stop="handleEditWorkflow(workflow)"
                >
                  <UserRoundPen />
                </n-icon>
                <n-popconfirm 
                  v-if="activeTab === 'my'"
                  positive-text="确定"
                  negative-text="取消"
                  @positive-click="handleDeleteWorkflow(workflow)"
                >
                  <template #trigger>
                    <n-icon class="action-icon delete">
                      <X />
                    </n-icon>
                  </template>
                  确定要删除这个工作流吗？
                </n-popconfirm>
              <n-icon 
                class="action-icon lock"
                :title="workflow.isPublic ? '已发布' : '未发布'"
              >
                <LockKeyhole v-if="!workflow.isPublic" />
                <ExternalLink v-if="workflow.isPublic" />
              </n-icon>
              </div>
            </div>
          </div>
        </n-spin>
      </div>
    </div>

    <!-- 收起/展开按钮 -->
    <div class="collapse-btn" @click="toggleCollapsed">
      <n-icon>
        <ChevronLeft v-if="!collapsed" />
        <ChevronRight v-if="collapsed" />
      </n-icon>
    </div>

    <!-- 新建/编辑工作流弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 500px">
      <n-form :model="formData" label-placement="left" label-width="80px">
        <n-form-item label="标题" required>
          <n-input v-model:value="formData.title" placeholder="如：翻译" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="formData.remark" placeholder="请输入" />
        </n-form-item>
        <n-form-item label="是否公开">
          <n-switch v-model:value="formData.isPublic" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showModal = false">取消</n-button>
          <n-button 
            v-if="editingWorkflow" 
            type="error" 
            @click="handleDeleteWorkflow(editingWorkflow!)"
          >
            删除
          </n-button>
          <n-button type="primary" @click="handleSaveWorkflow">
            {{ editingWorkflow ? '更新' : '新增' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.workflow-sidebar {
  width: 100%;
  height: 80%; /* 由父容器控制高度，避免整页滚动 */
  max-height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
}

.workflow-sidebar.collapsed {
  width: 100%;
}

/* 工作流列表部分 */
.workflow-list-section {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许内部滚动区域正确计算高度 */
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky; /* 顶部固定 */
  top: 0;
  background: #fff;
  z-index: 2;
}

.header-tabs {
  display: flex;
  margin-bottom: 12px;
}

.tab-item {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 14px;
}

.tab-item.active {
  background: #18a058;
  color: white;
}

.new-btn {
  width: 100%;
}

.workflow-list {
  flex: 1;
  overflow-y: auto; /* 内容过多时滚动 */
  padding: 8px;
  min-height: 0; /* 避免子元素把容器撑开 */
}

.workflow-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workflow-item {
  background: white;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workflow-item:hover {
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.1);
}

.workflow-item-selected {
  border-color: #18a058 !important;
  background-color: #f0f9ff;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.2);
}

.workflow-item-selected:hover {
  border-color: #18a058 !important;
  background-color: #e6f7ff;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.3);
}

.workflow-info {
  flex: 1;
}

.workflow-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
  font-size: 14px;
}

.workflow-meta {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 8px;
}

.workflow-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: color 0.2s;
}

.action-icon.edit {
  color: #18a058;
}

.action-icon.delete {
  color: #d03050;
}

.action-icon.lock {
  color: #666;
}

/* 工作流组件面板部分 */
.workflow-components-section {
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.components-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.components-header .tab-item {
  background: #f5f5f5;
  color: #333;
  font-size: 14px;
}

.components-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
  background: white;
}

.component-item:hover {
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.1);
}

.component-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #666;
}

.component-name {
  font-size: 14px;
  color: #333;
}

.collapse-btn {
  position: absolute;
  top: 50%;
  right: -15px;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #f5f5f5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 收起状态下的样式 */
.workflow-sidebar.collapsed {
  background: transparent;
  border-right: none;
  width: 0;
  overflow: visible;
}

.workflow-sidebar.collapsed .sidebar-header,
.workflow-sidebar.collapsed .workflow-list,
.workflow-sidebar.collapsed .workflow-components-section {
  display: none;
}

.workflow-sidebar.collapsed .collapse-btn {
  right: -15px;
  background: white;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
