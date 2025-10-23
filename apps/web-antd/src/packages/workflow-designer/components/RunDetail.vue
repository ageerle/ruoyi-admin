<script lang="ts" setup>
import { nextTick, onUnmounted, reactive, ref, watch } from 'vue'
import { Button, Input, InputNumber, Switch, Tabs, Upload, message } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue'
import RuntimeNodes from './RuntimeNodes.vue'
import SvgIcon from './SvgIcon.vue'
import { workflowRun, workflowRuntimeResume, getUploadAction } from '#/api/workflow'
import { useWfStore } from '#/packages/workflow-designer/store'

interface Props { workflow: any }
interface TabObj { name: string; tab: string; defaultTab: string }
interface Emit { (e: 'runDone'): void; (e: 'runError', errorMsg: string): void }

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const headers: Record<string, string> = { Authorization: '' }
const wfStore = useWfStore()
const token = ref<string>('')
const submitting = ref<boolean>(wfStore.submitting)
const startNode = ref<any>(null)
const wfRuntimeUuid = ref<string>('')
const runtimeNodes = reactive<any[]>([])
const runtimeErrorMsg = ref<string>('')
const userInputs = ref<any[]>([])
const errorMsg = ref<string>('')
const currWfUuid = props.workflow.uuid
const showCurrentExecution = ref<boolean>(false)
const tabObj = ref<TabObj>({ name: 'runtimes', defaultTab: '流程执行详情', tab: '流程执行详情 ↓' })
const fileListLength = ref(0)
const uploadRef = ref<any>(null)
const fileList = ref<UploadFile[]>([])
const uploadedFileUuids = ref<string[]>([])
const humanFeedback = ref<boolean>(false)
const humanFeedbackTip = ref<string>('')
const humanFeedbackContent = ref<string>('')
let controller = new AbortController()
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (!submitting.value) run()
  }
}

async function uploadBeforeRun() {
  uploadedFileUuids.value = []
  // Antd的Upload组件自动提交，无需手动调用submit
}

async function resetInputs() {
  fileList.value = []
  uploadedFileUuids.value = []
  userInputs.value.forEach((input: any) => { input.content.value = null })
}

async function run() {
  if (submitting.value) return

  for (const input of userInputs.value) {
    if (input.required && input.content.type === 4 && input.content.value === null && fileListLength.value === 0) {
      message.warning('请上传文件')
      return
    }
  }

  if (fileListLength.value > 0 && uploadedFileUuids.value.length !== fileListLength.value) { uploadBeforeRun(); return }
  else {
    // 若存在文件输入但未走上传控件回调，直接将已上传的uuid写入
    const fileInput = userInputs.value.find((input: any) => input.content.type === 4)
    if (fileInput && (!fileInput.content.value || fileInput.content.value.length === 0)) {
      fileInput.content.value = uploadedFileUuids.value
    }
  }

  if (userInputs.value.some((input: any) => input.required && input.content.value === null)) { message.warning('请输入所有必填参数'); return }

  submitting.value = true
  showCurrentExecution.value = true
  tabObj.value.tab = showCurrentExecution.value ? `${tabObj.value.defaultTab} ↓` : `${tabObj.value.defaultTab} ↑`

  controller = new AbortController()
  try {
    wfRuntimeUuid.value = ''
    const nodeUuidToRuntimeNodeUuid = new Map<string, string>()
    runtimeNodes.splice(0, runtimeNodes.length)
    await workflowRun({
      options: { uuid: currWfUuid, inputs: userInputs.value },
      signal: controller.signal,
      startCallback: (wfRuntimeJson) => {
        if (!wfRuntimeJson) { message.error('启动失败'); return }
        const wfRuntime = JSON.parse(wfRuntimeJson)
        wfRuntime.input = {}
        userInputs.value.forEach((item: any) => { wfRuntime.input[item.name] = { ...item.content } })
        wfRuntimeUuid.value = wfRuntime.uuid
        wfStore.appendWfRuntimes(currWfUuid, [wfRuntime])
      },
      thinkingDataReceived: (chunk) => { console.log('Thinking data received:', chunk) },
      messageReceived: (chunk, event) => {
        const eventName = event || ''
        try {
          if (eventName.includes('[NODE_RUN_')) {
            const nodeUuid = eventName.replace('[NODE_RUN_', '').replace(']', '')
            const runtimeNode = JSON.parse(chunk)
            nodeUuidToRuntimeNodeUuid.set(nodeUuid, runtimeNode.uuid)
            // 补充节点元信息（标题、组件），用于 UI 展示
            const wfNodeMeta = (props.workflow?.nodes || []).find((n: any) => n.uuid === nodeUuid)
            if (wfNodeMeta) {
              ;(runtimeNode as any).nodeTitle = wfNodeMeta.title
              ;(runtimeNode as any).wfComponent = wfNodeMeta.wfComponent
            }
            wfStore.appendRuntimeNode(wfRuntimeUuid.value, runtimeNode)
            runtimeNodes.push(runtimeNode)
          } else if (eventName.includes('[NODE_CHUNK_')) {
            console.log('NODE_CHUNK_', eventName, chunk)
            const nodeUuid = eventName.replace('[NODE_CHUNK_', '').replace(']', '')
            const runtimeNodeUuid = nodeUuidToRuntimeNodeUuid.get(nodeUuid) || ''
            wfStore.appendChunkToRuntimeNode(wfRuntimeUuid.value, runtimeNodeUuid, chunk)
            const hit = runtimeNodes.find((n: any) => n.uuid === runtimeNodeUuid)
            if (hit) {
              ;(hit as any).chunks = ((hit as any).chunks || '') + chunk
            }
          } else if (eventName.includes('[NODE_INPUT_')) {
            const nodeUuid = eventName.replace('[NODE_INPUT_', '').replace(']', '')
            const runtimeNodeUuid = nodeUuidToRuntimeNodeUuid.get(nodeUuid) || ''
            wfStore.appendInputToRuntimeNode(wfRuntimeUuid.value, runtimeNodeUuid, chunk)
            const hit = runtimeNodes.find((n: any) => n.uuid === runtimeNodeUuid)
            if (hit) {
              const payload = JSON.parse(chunk)
              ;(hit as any).input = { ...(hit as any).input, [payload.name]: payload.content }
            }
          } else if (eventName.includes('[NODE_OUTPUT_')) {
            const nodeUuid = eventName.replace('[NODE_OUTPUT_', '').replace(']', '')
            const runtimeNodeUuid = nodeUuidToRuntimeNodeUuid.get(nodeUuid) || ''
            wfStore.appendOutputToRuntimeNode(wfRuntimeUuid.value, runtimeNodeUuid, chunk)
            const hit = runtimeNodes.find((n: any) => n.uuid === runtimeNodeUuid)
            if (hit) {
              const payload = JSON.parse(chunk)
              ;(hit as any).output = { ...(hit as any).output, [payload.name]: payload.content }
            }
          } else if (eventName.includes('[NODE_WAIT_FEEDBACK_BY_')) {
            humanFeedback.value = true
            humanFeedbackTip.value = chunk || ''
            message.info(humanFeedbackTip.value)
          }
        } catch (error) { console.error(error) }
      },
      doneCallback: (chunk) => {
        nextTick(() => {
          submitting.value = false
          resetInputs()
          wfStore.updateSuccess(currWfUuid, wfRuntimeUuid.value, chunk)
          runtimeErrorMsg.value = ''
          message.success('执行成功')
          emit('runDone')
        })
      },
      errorCallback: (error) => {
        submitting.value = false
        resetInputs()
        message.error(`系统提示：${error}`)
        wfStore.updateErrorMsg(currWfUuid, wfRuntimeUuid.value, error)
        runtimeErrorMsg.value = error || ''
        emit('runError', error)
      },
    })
  } catch (error: any) {
    const errorMessage = error?.message ?? '执行出错'
    message.error(errorMessage)
    submitting.value = false
  }
}

async function resume() {
  submitting.value = true
  try {
    await workflowRuntimeResume({ runtimeUuid: wfRuntimeUuid.value, feedbackContent: humanFeedbackContent.value })
  } catch (e) {
    message.error(`系统提示：${e}`)
  } finally {
    humanFeedback.value = false
    humanFeedbackTip.value = ''
    humanFeedbackContent.value = ''
  }
}

function handleFileListChange(info: any) {
  fileList.value = info.fileList
  fileListLength.value = info.fileList.length
  
  if (info.file.status === 'done') {
    const res = info.file.response
    if (res && res.success) {
      uploadedFileUuids.value.push(res.data.uuid)
      if (uploadedFileUuids.value.length === fileListLength.value) {
        run()
      }
    }
  }
}

function handleStop() {
  if (wfStore.wfUuidToWfRuntimeLoading.get(currWfUuid)) controller.abort()
  submitting.value = false
}

function handleClick() {
  showCurrentExecution.value = !showCurrentExecution.value
  tabObj.value.tab = showCurrentExecution.value ? `${tabObj.value.defaultTab} ↓` : `${tabObj.value.defaultTab} ↑`
}

function findStartNodeFromWorkflow() {
  return Array.isArray(props.workflow?.nodes)
    ? props.workflow.nodes.find((n: any) => {
        // 优先检查 wfComponent.name（编辑时的数据结构）
        if (n?.wfComponent?.name === 'Start') return true;
        // 检查 workflowComponentId（后端返回的数据结构）
        // 后端返回的是字符串，需要转换为数字比较
        if (Number(n?.workflowComponentId) === 1) return true;
        return false;
      })
    : null
}

function rebuildUserInputs() {
  const storeStart = wfStore.getStartNode(props.workflow.uuid)
  const localStart = findStartNodeFromWorkflow()
  startNode.value = storeStart || localStart || null
  if (startNode.value && Array.isArray(startNode.value.inputConfig?.user_inputs)) {
    userInputs.value = startNode.value.inputConfig.user_inputs.map((input: any) => ({
      uuid: input.uuid,
      name: input.name,
      content: { title: input.title, value: null, type: input.type },
      required: input.required,
    }))
  } else {
    userInputs.value = []
  }
}

rebuildUserInputs()

watch(() => props.workflow, () => rebuildUserInputs(), { deep: true })

headers.Authorization = token.value
onUnmounted(() => { if (wfStore.wfUuidToWfRuntimeLoading.get(currWfUuid)) controller.abort() })
</script>

<template>
  <div class="w-full max-w-screen-xl m-auto z-10" @keydown="onKeydown">
    <Tabs :active-key="tabObj.name" type="line" @click="handleClick">
      <Tabs.TabPane key="runtimes" :tab="tabObj.tab" />
    </Tabs>
    <transition name="collapse">
      <div v-show="showCurrentExecution" class="max-h-[500px] overflow-y-auto mb-2">
        <RuntimeNodes :nodes="runtimeNodes" :workflow="workflow" :error-msg="runtimeErrorMsg" :token="token" />
        <div class="sticky bottom-0 left-0 flex justify-center">
          <Button v-show="submitting" size="small" @click="handleStop">
            <template #icon><SvgIcon icon="ri:stop-circle-line" /></template>
            停止请求
          </Button>
        </div>
      </div>
    </transition>
    <div v-if="errorMsg">{{ errorMsg }}</div>
    <div class="flex flex-col items-center justify-between space-y-2 max-h-[300px] overflow-y-auto">
      <template v-if="!humanFeedback">
        <div v-for="(userInput, idx) in userInputs" :key="`${idx}_${userInput.name}`" class="w-full flex">
          <div class="min-w-24">{{ userInput.content.title }}</div>
          <Input v-if="userInput.content.type === 1" v-model:value="userInput.content.value" type="textarea" :auto-size="{ minRows: 1, maxRows: 5 }" />
          <InputNumber v-if="userInput.content.type === 2" v-model:value="userInput.content.value" class="w-full" />
          <div v-if="userInput.content.type === 3" />
          <Upload v-if="userInput.content.type === 4" ref="uploadRef" multiple :action="getUploadAction()" :max-count="startNode?.inputConfig.user_inputs.find((item: any) => item.uuid === userInput.uuid)?.limit || 10" :headers="headers" :file-list="fileList" @change="handleFileListChange">
            <Upload.Dragger>
              <div style="font-size: 16px">点击或者拖动文件到该区域来上传</div>
              <div style="margin: 4px 0 0 0; color: #999">文件格式: TXT、PDF、DOC、DOCX、XLS、XLXS、PPT、PPTX；文件大小：不超过10M</div>
            </Upload.Dragger>
          </Upload>
          <Switch v-if="userInput.content.type === 5" v-model:checked="userInput.content.value" />
        </div>
        <div class="w-full flex items-center justify-between text-xs text-gray-400" @keydown.enter="run">
          <div>按 Enter 提交，Shift + Enter 换行</div>
          <Button type="primary" :disabled="submitting" :loading="submitting" @click="run">提交</Button>
        </div>
      </template>
      <template v-if="humanFeedback">
        <div class="flex flex-col p-2 w-full space-y-2">
          <div class="flex bg-gray-100 px-2 py-1 rounded-md">
            <div class="text-base text-red-500">流程已暂停，等待用户输入中...</div>
          </div>
          <div class="flex flex-col w-full">
            <div v-if="humanFeedbackTip" class="text-sm leading-8">提示：{{ humanFeedbackTip }}</div>
            <Input v-model:value="humanFeedbackContent" type="textarea" :auto-size="{ minRows: 2, maxRows: 5 }" />
          </div>
          <div class="flex justify-end"><Button type="primary" @click="resume">提交</Button></div>
        </div>
      </template>
    </div>
  </div>
</template>


