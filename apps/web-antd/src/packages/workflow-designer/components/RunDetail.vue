<script lang="ts" setup>
import { nextTick, onUnmounted, reactive, ref, watch } from 'vue'
import { NButton, NInput, NInputNumber, NP, NSwitch, NTab, NTabPane, NTabs, NText, NUpload, NUploadDragger, useMessage } from 'naive-ui'
import type { UploadFileInfo, UploadInst } from 'naive-ui'
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
const ms = useMessage()
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
const uploadRef = ref<UploadInst | null>(null)
const uploadedFileUuids = ref<string[]>([])
const humanFeedback = ref<boolean>(false)
const humanFeedbackTip = ref<string>('')
const humanFeedbackContent = ref<string>('')
let controller = new AbortController()

async function uploadBeforeRun() {
  uploadedFileUuids.value = []
  if (uploadRef.value && Array.isArray(uploadRef.value) && uploadRef.value.length > 0) uploadRef.value[0]?.submit()
  else if (uploadRef.value) uploadRef.value?.submit()
}

async function resetInputs() {
  if (uploadRef.value && Array.isArray(uploadRef.value) && uploadRef.value.length > 0) uploadRef.value.forEach((item: any) => item.clear())
  else if (uploadRef.value) uploadRef.value?.clear()
  uploadedFileUuids.value = []
  userInputs.value.forEach((input: any) => { input.content.value = null })
}

async function run() {
  if (submitting.value) return

  for (const input of userInputs.value) {
    if (input.required && input.content.type === 4 && input.content.value === null && fileListLength.value === 0) {
      ms.warning('请上传文件')
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

  if (userInputs.value.some((input: any) => input.required && input.content.value === null)) { ms.warning('请输入所有必填参数'); return }

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
        if (!wfRuntimeJson) { ms.error('启动失败'); return }
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
            wfStore.appendRuntimeNode(wfRuntimeUuid.value, runtimeNode)
            runtimeNodes.push(runtimeNode)
          } else if (eventName.includes('[NODE_CHUNK_')) {
            const nodeUuid = eventName.replace('[NODE_CHUNK_', '').replace(']', '')
            const runtimeNodeUuid = nodeUuidToRuntimeNodeUuid.get(nodeUuid) || ''
            wfStore.appendChunkToRuntimeNode(wfRuntimeUuid.value, runtimeNodeUuid, chunk)
          } else if (eventName.includes('[NODE_INPUT_')) {
            const nodeUuid = eventName.replace('[NODE_INPUT_', '').replace(']', '')
            const runtimeNodeUuid = nodeUuidToRuntimeNodeUuid.get(nodeUuid) || ''
            wfStore.appendInputToRuntimeNode(wfRuntimeUuid.value, runtimeNodeUuid, chunk)
          } else if (eventName.includes('[NODE_OUTPUT_')) {
            const nodeUuid = eventName.replace('[NODE_OUTPUT_', '').replace(']', '')
            const runtimeNodeUuid = nodeUuidToRuntimeNodeUuid.get(nodeUuid) || ''
            wfStore.appendOutputToRuntimeNode(wfRuntimeUuid.value, runtimeNodeUuid, chunk)
          } else if (eventName.includes('[NODE_WAIT_FEEDBACK_BY_')) {
            humanFeedback.value = true
            humanFeedbackTip.value = chunk || ''
            ms.info(humanFeedbackTip.value)
          }
        } catch (error) { console.error(error) }
      },
      doneCallback: (chunk) => {
        nextTick(() => {
          submitting.value = false
          resetInputs()
          wfStore.updateSuccess(currWfUuid, wfRuntimeUuid.value, chunk)
          runtimeErrorMsg.value = ''
          ms.success('执行成功')
          emit('runDone')
        })
      },
      errorCallback: (error) => {
        submitting.value = false
        resetInputs()
        ms.error(`系统提示：${error}`)
        wfStore.updateErrorMsg(currWfUuid, wfRuntimeUuid.value, error)
        runtimeErrorMsg.value = error || ''
        emit('runError', error)
      },
    })
  } catch (error: any) {
    const errorMessage = error?.message ?? '执行出错'
    ms.error(errorMessage)
    submitting.value = false
  }
}

async function resume() {
  submitting.value = true
  try {
    await workflowRuntimeResume({ runtimeUuid: wfRuntimeUuid.value, feedbackContent: humanFeedbackContent.value })
  } catch (e) {
    ms.error(`系统提示：${e}`)
  } finally {
    humanFeedback.value = false
    humanFeedbackTip.value = ''
    humanFeedbackContent.value = ''
  }
}

function onUploadChange(options: { fileList: UploadFileInfo[] }) { console.log('onUploadChange', options) }

function handleFileListChange(fileList: UploadFileInfo[]) {
  fileListLength.value = fileList.length
  if (uploadedFileUuids.value.length === fileListLength.value) run()
}

function onUploadFinish({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) {
  const res = JSON.parse((event?.target as XMLHttpRequest).response)
  if (res.success) uploadedFileUuids.value.push(res.data.uuid)
  return file
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
    ? props.workflow.nodes.find((n: any) => n?.wfComponent?.name === 'Start')
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
  <div class="w-full max-w-screen-xl m-auto z-10">
    <NTabs type="line" justify-content="space-evenly" animated default-value="runtimes">
      <NTab name="runtimes" @click="handleClick">{{ tabObj.tab }}</NTab>
    </NTabs>
    <NTabs type="line" justify-content="space-evenly" animated>
      <NTabPane name="runtimes" display-directive="show" :tab-props="{ style: 'display:none' }">
        <transition name="collapse">
          <div v-show="showCurrentExecution" class="max-h-[500px] overflow-y-auto mb-2">
            <RuntimeNodes :nodes="runtimeNodes" :workflow="workflow" :error-msg="runtimeErrorMsg" :token="token" />
            <div class="sticky bottom-0 left-0 flex justify-center">
              <NButton v-show="submitting" size="tiny" @click="handleStop">
                <template #icon><SvgIcon icon="ri:stop-circle-line" /></template>
                停止请求
              </NButton>
            </div>
          </div>
        </transition>
      </NTabPane>
    </NTabs>
    <div v-if="errorMsg">{{ errorMsg }}</div>
    <div class="flex flex-col items-center justify-between space-y-2 max-h-[300px] overflow-y-auto">
      <template v-if="!humanFeedback">
        <div v-for="(userInput, idx) in userInputs" :key="`${idx}_${userInput.name}`" class="w-full flex">
          <div class="min-w-24">{{ userInput.content.title }}</div>
          <NInput v-if="userInput.content.type === 1" v-model:value="userInput.content.value" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" />
          <NInputNumber v-if="userInput.content.type === 2" v-model:value="userInput.content.value" />
          <div v-if="userInput.content.type === 3" />
          <NUpload v-if="userInput.content.type === 4" ref="uploadRef" multiple directory-dnd :action="getUploadAction()" :default-upload="false" :max="startNode?.inputConfig.user_inputs.find((item: any) => item.uuid === userInput.uuid)?.limit || 10" :headers="headers" @update:file-list="handleFileListChange" @finish="onUploadFinish" @change="onUploadChange">
            <NUploadDragger>
              <NText style="font-size: 16px">点击或者拖动文件到该区域来上传</NText>
              <NP depth="2" style="margin: 4px 0 0 0">文件格式: TXT、PDF、DOC、DOCX、XLS、XLXS、PPT、PPTX；文件大小：不超过10M</NP>
            </NUploadDragger>
          </NUpload>
          <NSwitch v-if="userInput.content.type === 5" v-model:value="userInput.content.value" />
        </div>
        <div class="w-full flex justify-end">
          <NButton type="primary" :disabled="submitting" :loading="submitting" @click="run">提交</NButton>
        </div>
      </template>
      <template v-if="humanFeedback">
        <div class="flex flex-col p-2 w-full space-y-2">
          <div class="flex bg-gray-100 px-2 py-1 rounded-md">
            <div class="text-base text-red-500">流程已暂停，等待用户输入中...</div>
          </div>
          <div class="flex flex-col w-full">
            <div v-if="humanFeedbackTip" class="text-sm leading-8">提示：{{ humanFeedbackTip }}</div>
            <NInput v-model:value="humanFeedbackContent" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" />
          </div>
          <div class="flex justify-end"><NButton type="primary" @click="resume">提交</NButton></div>
        </div>
      </template>
    </div>
  </div>
</template>


