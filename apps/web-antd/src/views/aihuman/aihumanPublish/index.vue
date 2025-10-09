<script setup lang="ts">
// 依赖引入
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { AihumanPublishInfo } from '#/api/aihuman/aihumanPublish/types';

import { ref, computed, watch, onMounted } from 'vue';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { Space, Button, Select, Input, Radio, message } from 'ant-design-vue';
import axios from 'axios';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { aihumanPublishList } from '#/api/aihuman/aihumanPublish';

import { columns, querySchema } from './data';
import Live2DViewer from './Live2DViewer.vue';

defineOptions({
  name: 'AihumanAihumanPublish',
});

const { Option } = Select;

// 控制面板相关变量
const viewerRef = ref<InstanceType<typeof Live2DViewer> | null>(null);
const selectedModel = ref<string>('');
const textContent = ref('');
const localEyeMode = ref('true'); // 创建本地ref用于v-model绑定

// 添加聊天相关变量
const chatText = ref('');
const chatOutput = ref('');
const isLoading = ref(false);

// 添加缩放比例相关变量
const scaleOptions = [
  { value: 0.6, label: '小 (0.6)' },
  { value: 1.0, label: '中 (1.0)' },
  { value: 1.5, label: '大 (1.5)' }
];

// 默认0.6
const selectedScale = ref<number>(0.6);

// 添加模型名称映射，存储场景名称到模型名称的对应关系
const nameToModelMap = ref<Record<string, string>>({});

// Coze API配置
const cozeConfig = ref({
  apiUrl: 'https://api.coze.cn/v3/chat',
  authorizationToken: 'sat_8T9q3ZjHmSFiyfTm5zvAEDv3HaAvLrS3J8aiIKrqP4qgTGCF39J7dRNUMM8NPYAn',
  botId: '7506335095931338792',
  userId: '7376476310010937396'
});

// 语音合成配置
const ttsConfig = ref({
  apiUrl: 'http://127.0.0.1:9880',
  textLang: 'zh',
  refAudioPath: './meiduo.wav',
  promptLang: 'zh',
  promptText: '你好呀，我叫暖暖，你看我这身白色毛衣',
  textSplitMethod: 'cut5',
  batchSize: 10,
  mediaType: 'wav',
  speedFactor: '1.0'
});

onMounted(() => {
  // 页面加载时初始化模型列表
  // 由于viewerRef可能需要时间加载，添加一个延迟以确保组件已完全初始化
  setTimeout(() => {
    if (viewerRef.value && viewerRef.value.configData && viewerRef.value.configData.length > 0) {
      initModelList();
    } else if (viewerRef.value) {
      // 如果还没有configData，调用fetchConfigData获取数据
      viewerRef.value.fetchConfigData().then(() => {
        initModelList();
      });
    }
  }, 500);
});

// 监听viewerRef变化，同步eyeMode值并初始化模型列表
watch(viewerRef, (newViewer) => {
  if (newViewer && newViewer.eyeModeRef) {
    localEyeMode.value = newViewer.eyeModeRef.value;
  }
  // 当下拉框元素已存在且有configData时，初始化模型列表
  if (newViewer && newViewer.configData && newViewer.configData.length > 0) {
    initModelList();
  }
});

// 添加对localEyeMode变化的监听，实现点击切换立即生效
watch(localEyeMode, (newValue) => {
  console.log('眼神模式切换为:', newValue === 'true' ? '跟随鼠标' : '前方直视');
  // 直接调用viewerRef的updateEyeMode方法更新模型状态
  if (viewerRef.value && viewerRef.value.updateEyeMode) {
    viewerRef.value.updateEyeMode(newValue);
  }
  handleUpdateModel();
});

// 表单和表格配置
const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  schema: querySchema(),
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await aihumanPublishList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'aihuman-aihumanPublish-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

// 初始化模型列表
const initModelList = () => {
  const selectElement = document.getElementById('model_list') as HTMLSelectElement;
  if (selectElement && viewerRef.value && viewerRef.value.configData && viewerRef.value.configData.length > 0) {
    // 清空现有选项和映射
    selectElement.innerHTML = '';
    nameToModelMap.value = {};

    // 从configData中获取场景名称作为下拉框选项
    viewerRef.value.configData.forEach(item => {
      const option = document.createElement('option');
      option.value = item.name; // 使用场景名称作为value
      option.textContent = item.name; // 使用场景名称作为显示文本
      selectElement.appendChild(option);

      // 存储场景名称到模型名称的映射
      nameToModelMap.value[item.name] = item.modelName;
    });

    // 确保数组不为空再赋值
    if (viewerRef.value.configData.length > 0) {
      selectedModel.value = viewerRef.value.configData[0].name as string;
    }
  }
};

// 测试音频
const handleTestAudio = () => {
  if (viewerRef.value) {
    viewerRef.value.testAudio();
  }
};

// 更新模型
const handleUpdateModel = () => {
  if (viewerRef.value && selectedModel.value && nameToModelMap.value[selectedModel.value]) {
    // 根据选中的场景名称查找对应的模型名称
    const modelName = nameToModelMap.value[selectedModel.value];
    const newModelPath = `/Live2D/models/${modelName}/${modelName}.model3.json`;
    viewerRef.value.updateModel(newModelPath);
  }
};

// 停止讲话
const handleStopSpeaking = () => {
  if (viewerRef.value) {
    viewerRef.value.stopSpeaking();
  }
};

// 刷新配置数据
const handleRefreshConfig = () => {
  if (viewerRef.value) {
    viewerRef.value.fetchConfigData();
  }
};

// 并行推理（语音合成）
const startParallel = async () => {
  if (!textContent.value.trim()) {
    message.warning('请输入推理内容');
    return;
  }

  try {
    isLoading.value = true;
    const response = await axios.post(ttsConfig.value.apiUrl, {
      text_lang: ttsConfig.value.textLang,
      ref_audio_path: ttsConfig.value.refAudioPath,
      prompt_lang: ttsConfig.value.promptLang,
      prompt_text: ttsConfig.value.promptText,
      text_split_method: ttsConfig.value.textSplitMethod,
      batch_size: ttsConfig.value.batchSize,
      media_type: ttsConfig.value.mediaType,
      speed_factor: ttsConfig.value.speedFactor,
      text: textContent.value
    }, {
      responseType: 'arraybuffer'
    });

    const audioBlob = new Blob([response.data], { type: `audio/${ttsConfig.value.mediaType}` });
    const audioUrl = URL.createObjectURL(audioBlob);
    if (viewerRef.value) {
      viewerRef.value.talk(audioUrl);
    }
  } catch (error) {
    console.error('并行推理失败:', error);
    message.error('语音合成失败');
  } finally {
    isLoading.value = false;
  }
};

// 流式推理
const startStream = async () => {
  if (!textContent.value.trim()) {
    message.warning('请输入推理内容');
    return;
  }

  try {
    isLoading.value = true;
    const data = {
      text_lang: ttsConfig.value.textLang,
      ref_audio_path: ttsConfig.value.refAudioPath,
      prompt_lang: ttsConfig.value.promptLang,
      prompt_text: ttsConfig.value.promptText,
      text_split_method: ttsConfig.value.textSplitMethod,
      batch_size: 1,
      media_type: 'ogg',
      speed_factor: ttsConfig.value.speedFactor,
      text: textContent.value,
      streaming_mode: 'true'
    };

    const response = await fetch(ttsConfig.value.apiUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    });

    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const audioBlob = new Blob([value.buffer], { type: 'audio/ogg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (viewerRef.value) {
          viewerRef.value.talk(audioUrl);
        }
      }
    }
  } catch (error) {
    console.error('流式推理失败:', error);
    message.error('流式语音合成失败');
  } finally {
    isLoading.value = false;
  }
};

// 添加处理模型大小调整的方法
const handleIncreaseSize = () => {
  if (viewerRef.value) {
    viewerRef.value.adjustModelSize(0.1); // 每次增加0.1的比例
  }
};

const handleDecreaseSize = () => {
  if (viewerRef.value) {
    viewerRef.value.adjustModelSize(-0.1); // 每次减少0.1的比例
  }
};

// 发送聊天消息到Coze
const sendChatMessage = async () => {
  const userInput = chatText.value.trim();
  if (!userInput) {
    message.warning('请输入聊天内容');
    return;
  }

  try {
    isLoading.value = true;
    chatOutput.value = '';

    const response = await fetch(cozeConfig.value.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cozeConfig.value.authorizationToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bot_id: cozeConfig.value.botId,
        user_id: cozeConfig.value.userId,
        stream: true,
        auto_save_history: true,
        additional_messages: [{
          role: "user",
          content: userInput,
          content_type: "text"
        }]
      })
    });

    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    let fullAnswer = "";
    let lastContent = "";
    let debounceTimer = null;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Coze响应完成");
          if (fullAnswer) {
            chatOutput.value = fullAnswer;
            // 响应完成后自动进行语音合成
            textContent.value = fullAnswer;
            await startParallel();
          }
          break;
        }

        const lines = value.split("\n").filter(line => line.trim());
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith("event:")) {
            const eventType = line.replace("event:", "").trim();
            const nextLineIndex = i + 1;
            if (nextLineIndex >= lines.length) continue;
            const dataLine = lines[nextLineIndex];

            if (dataLine && dataLine.startsWith("data:")) {
              const rawData = dataLine.replace("data:", "").trim();
              try {
                const data = JSON.parse(rawData);

                switch (eventType) {
                  case "conversation.message.delta":
                    if (data.type === "answer" && data.content_type === "text") {
                      const currentContent = data.content || "";
                      if (currentContent === lastContent) continue;
                      lastContent = currentContent;

                      fullAnswer += currentContent;
                      clearTimeout(debounceTimer);
                      debounceTimer = setTimeout(() => {
                        chatOutput.value = fullAnswer.trim();
                      }, 50);
                    }
                    break;

                  case "conversation.message.completed":
                    if (data.type === "answer" && data.content_type === "text") {
                      fullAnswer = (data.content || "").trim();
                      chatOutput.value = fullAnswer;
                    }
                    break;
                }
              } catch (parseError) {
                console.error("解析data失败，原始数据:", rawData);
                console.error("解析错误:", parseError);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Coze接口调用失败:", error);
    message.error('聊天请求失败');
  } finally {
    isLoading.value = false;
  }
};

// 初始化模型列表
initModelList();

</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-[8px]">
      <!-- 左侧显示控制面板 -->
      <div class="w-1/3 overflow-hidden border border-gray-200 rounded bg-white">
        <div id="control" class="p-4">
          <Button @click="handleTestAudio">测试音频</Button>
          <br /><br />

          <label>选择已发布场景：</label>
          <select v-model="selectedModel" id="model_list" class="ml-2"></select>
          <Button @click="handleUpdateModel" class="ml-2">更新场景</Button>
          <br /><br />

          <!-- 修改眼神跟随的radio绑定 -->
          <label>眼神跟随鼠标：</label>&nbsp&nbsp
          <input type="radio" name="eyes" value="true" v-model="localEyeMode" class="ml-2"><label> 跟随鼠标</label>&nbsp&nbsp
          <input type="radio" name="eyes" value="false" v-model="localEyeMode" class="ml-2"><label> 前方直视</label>
          <br /><br />

          <!-- 聊天交互组件 -->
          <div class="chat-section">
            <h3>聊天交互</h3>
            <div class="control-group">
              <Input
                v-model:value="chatText"
                placeholder="我是梅朵，请输入想要咨询的内容"
                style="width: 300px; margin-bottom: 10px;"
              />
              <Button
                @click="sendChatMessage"
                :loading="isLoading"
              >
                发送消息
              </Button>
            </div>
            <div class="chat-output">
              <textarea
                v-model="chatOutput"
                placeholder="对话历史"
                style="width: 100%; height: 150px; resize: vertical;"
                :disabled="true"
              ></textarea>
            </div>
          </div>

          <!-- 语音合成组件 -->
          <div class="tts-section mt-4">
            <h3>语音合成</h3>
            <textarea
              v-model="textContent"
              placeholder="请输入推理内容"
              style="width: 100%; height: 100px;"
            ></textarea>
            <div class="button-group mt-2">
              <Button
                @click="startParallel"
                :loading="isLoading"
              >
                并行推理
              </Button>
              <Button
                @click="startStream"
                :loading="isLoading"
                class="ml-2"
              >
                流式推理
              </Button>
              <Button
                @click="handleStopSpeaking"
                class="ml-2"
              >
                停止讲话
              </Button>
            </div>
          </div>

          <!-- 配置数据展示区域 -->
          <!-- <div class="config-data-container mt-4">
            <h3>已发布配置数据</h3>
            <div v-if="viewerRef?.configData && viewerRef.configData.length > 0">
              <div v-for="item in viewerRef.configData" :key="item.id" class="config-item">
                <div class="config-info">
                  <p><strong>场景名称:</strong> {{ item.name }}</p>
                  <p><strong>模型名称:</strong> {{ item.modelName }}</p>
                  <p><strong>模型路径:</strong> {{ item.modelPath }}</p>
                  <p><strong>状态:</strong> {{ item.status === 1 ? '正常' : '禁用' }}</p>
                  <p><strong>发布状态:</strong> {{ item.publish === 1 ? '已发布' : '未发布' }}</p>
                  <p><strong>创建时间:</strong> {{ formatDate(item.createTime) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="no-data">暂无配置数据</div>
            <Button @click="handleRefreshConfig" class="mt-2">刷新配置数据</Button>
          </div> -->
        </div>
      </div>

      <!-- 右侧显示 Live2D 数字人 -->
      <div class="w-full overflow-hidden border border-gray-200 rounded">
        <div class="p-2 bg-gray-100 border-b border-gray-200 flex items-center justify-end">
          <Button type="text" @click="handleDecreaseSize" icon="minus" size="small" />
          <span class="mx-2 text-sm">调整大小</span>
          <Button type="text" @click="handleIncreaseSize" icon="plus" size="small" />
        </div>
        <Live2DViewer ref="viewerRef" :eyeMode="localEyeMode" />
      </div>

    </div>
  </Page>
</template>

<style scoped>
.flex {
  display: flex;
}

.h-full {
  height: 100%;
}

.gap-\[8px\] {
  gap: 8px;
}

.w-1\/3 {
  width: 33.3333%;
}

.w-full {
  width: 100%;
}

.overflow-hidden {
  overflow: hidden;
}

.border {
  border-width: 1px;
}

.border-gray-200 {
  border-color: rgb(229 231 235);
}

.rounded {
  border-radius: 0.25rem;
}

.bg-white {
  background-color: white;
}

.p-2 {
  padding: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-10 {
  margin-bottom: 2.5rem;
}

.bg-gray-100 {
  background-color: rgb(243 244 246);
}

.border-b {
  border-bottom-width: 1px;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.text-sm {
  font-size: 0.875rem;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

#control {
  height: 100%;
  overflow-y: auto;
}

#control input, #control select, #control textarea {
  margin: 5px 0;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background-color: white;
  color: #333333;
}

#control label {
  color: #333333;
  font-weight: 500;
}

/* 聊天和语音合成区域样式 */
.chat-section,
.tts-section {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.8);
}

.chat-section h3,
.tts-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #1890ff;
  font-weight: 600;
  font-size: 16px;
}

.control-group {
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 8px;
}

/* 配置数据展示样式 */
.config-data-container {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.8);
}

.config-data-container h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #1890ff;
  font-weight: 600;
  font-size: 16px;
}

.config-item {
  margin-bottom: 10px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.config-info p {
  margin: 3px 0;
  font-size: 12px;
  color: #333333;
}

.no-data {
  text-align: center;
  color: #999999;
  padding: 20px 0;
}
</style>
