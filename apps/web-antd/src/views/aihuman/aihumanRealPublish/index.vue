<template>
  <Page :auto-content-height="true">

    <div class="flex h-full gap-[8px] p-4">

      <div class="w-1/3 overflow-hidden border border-gray-200 rounded bg-white p-4">
        <!-- 视频和音频元素，用于显示 WebRTC 流 -->

        <div class="option mb-4">
          <a-checkbox id="use-stun" v-model:checked="useStun">Use STUN server</a-checkbox>
        </div>
        <a-button @click="start" :disabled="isRunning" class="mr-2 mb-2">Start</a-button>
        <a-button @click="stop" v-show="isRunning" :disabled="!isRunning" class="mr-2 mb-2">Stop</a-button>
        <a-button type="primary" @click="startRecording" :disabled="isRecording" class="mr-2 mb-2">Start Recording</a-button>
        <a-button type="primary" @click="stopRecording" :disabled="isRecording" class="mb-4">Stop Recording</a-button>
        <a-input type="hidden" id="sessionid" v-model:value="sessionId" />

        <!-- 配置选择 -->
        <!-- <div class="option mt-4">
          <label>选择配置:</label>
          <a-select
            v-model:value="selectedConfigId"
            @change="loadSelectedConfig"
            class="form-control"
            style="width: 100%;"
            placeholder="请选择运行中的配置"
          >
            <a-select-option value="">-- 请选择运行中的配置 --</a-select-option>
            <a-select-option v-for="config in configList" :key="config.id" :value="config.id">
              {{ config.name }} - {{ config.avatars }}
            </a-select-option>
          </a-select>
        </div> -->

        <div class="form-inline mt-4">
          <div class="form-group">
            <!-- 添加专门发送给Coze的输入框 -->
            <p class="mb-2">发送给AI</p>
            <a-input
              v-model:value="cozeInput"
              style="width:100%;margin-bottom:10px;"
              class="form-control"
              placeholder="请输入要发送给AI的内容"
            />
            <a-button
              type="primary"
              @click="sendToCoze"
              style="margin-bottom:10px;"
              :disabled="isSendingCoze"
              :loading="isSendingCoze"
            >{{ isSendingCoze ? '发送中...' : '发送到AI' }}</a-button>

            <!-- 添加Coze回答显示区域 -->
            <p class="mb-2 mt-4">AI 回答</p>
            <a-input.TextArea
              rows={3}
              style="width:100%;height:120px;"
              class="form-control"
              id="coze_response"
              :disabled="true"
              v-model:value="cozeResponse"
            />

            <!-- 语音+视频合成 -->
            <p class="mb-2 mt-4">语音+视频合成</p>
            <a-input.TextArea
              rows={3}
              style="width:100%;height:80px;"
              class="form-control"
              v-model:value="message"
              placeholder="请输入要合成的文字..."
            />
          </div>
          <a-button class="mt-2"
            type="default"
            @click="handleSynthesis"
            :disabled="isSynthesizing"
            :loading="isSynthesizing"
          >{{ isSynthesizing ? '播放中...' : '合成' }}</a-button>
        </div>
      </div>

      <div class="w-full overflow-hidden border border-gray-200 rounded p-4">
        <div id="media">
          <h2 class="mb-4">实时交互数字人</h2>
          <audio id="audio" autoplay="true" class="mb-2"></audio>
          <video id="video" autoplay="true" playsinline="true"></video>
        </div>
      </div>

    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { aihumanRealPublishList } from '#/api/aihuman/aihumanRealPublish';
import type { AihumanRealPublishInfo, AihumanRealPublishQueryParams } from '#/api/aihuman/aihumanRealPublish/types';
import { Modal } from 'ant-design-vue';
import { Page } from '@vben/common-ui';
import { Button as AButton, Checkbox as ACheckbox, Input as AInput, Select as ASelect } from 'ant-design-vue';

// API服务器前缀
const API_PREFIX = 'http://127.0.0.1:8010';

// 配置数据相关
const configList = ref<AihumanRealPublishInfo[]>([]);
const selectedConfigId = ref<string>('');
const agentParams = ref<any>(null);

// 界面状态
const sessionId = ref<string>('0');
const useStun = ref<boolean>(false);
const isRunning = ref<boolean>(false);
const isRecording = ref<boolean>(false);
const message = ref<string>('');
const cozeInput = ref<string>('');
const cozeResponse = ref<string>('');
const isSendingCoze = ref<boolean>(false);
const isSynthesizing = ref<boolean>(false);

// Coze API配置（从agentParams中动态获取）
const cozeConfig = ref({
  apiUrl: '',
  authorizationToken: '',
  botId: '',
  userId: ''
});

// 状态检查相关
let speakingCheckInterval: number | null = null;
const MAX_RETRY_COUNT = 5;
let currentRetryCount = 0;
let currentSessionId = null;

// 页面加载时获取配置列表
onMounted(async () => {
  await loadConfigList();
  // 加载client.js脚本
  loadClientScript();
});

// 页面卸载时清理
onUnmounted(() => {
  if (speakingCheckInterval !== null) {
    clearInterval(speakingCheckInterval);
  }
});

// 加载配置列表
async function loadConfigList() {
  try {
    const queryParams: AihumanRealPublishQueryParams = {};
    const response = await aihumanRealPublishList(queryParams);
    configList.value = response.rows || [];

    // 如果有配置，默认选择第一个
    if (configList.value.length > 0) {
      selectedConfigId.value = configList.value[0].id?.toString() || '';
      loadSelectedConfig();
    }
  } catch (error) {
    console.error('获取运行中配置列表失败:', error);
  }
}

// 加载选中的配置
function loadSelectedConfig() {
  const config = configList.value.find(c => c.id?.toString() === selectedConfigId.value);
  if (config && config.agentParams) {
    try {
      agentParams.value = JSON.parse(config.agentParams);
      if (agentParams.value.agentConfig) {
        cozeConfig.value = {
          apiUrl: agentParams.value.agentConfig.apiUrl || '',
          authorizationToken: agentParams.value.agentConfig.authorizationToken || '',
          botId: agentParams.value.agentConfig.botId || '',
          userId: agentParams.value.agentConfig.userId || ''
        };
        console.log('已加载Coze配置:', cozeConfig.value);
      }
    } catch (error) {
      console.error('解析agentParams失败:', error);
    }
  }
}

// 加载client.js脚本
function loadClientScript() {
  const script = document.createElement('script');
  script.src = '/LiveTalking/client.js';
  document.body.appendChild(script);
}

// WebRTC相关函数
function start() {
  if (window.start) {
    window.start();
    isRunning.value = true;
  } else {
    console.error('client.js未加载完成');
  }
}

function stop() {
  if (window.stop) {
    window.stop();
    isRunning.value = false;
  } else {
    console.error('client.js未加载完成');
  }
}

// 录制功能
function startRecording() {
  // 添加带时间戳的文件路径
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `recordings/recording_${timestamp}.mp4`;

  fetch(API_PREFIX + '/record', {
    body: JSON.stringify({
      type: 'start_record',
      sessionid: Number(sessionId.value),
      file_path: filePath
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then(function (response) {
    if (response.ok) {
      isRecording.value = true;
    }
  }).catch(function (error) {
    console.error('录制错误:', error);
  });
}

function stopRecording() {
  fetch(API_PREFIX + '/record', {
    body: JSON.stringify({
      type: 'end_record',
      sessionid: Number(sessionId.value),
      // 结束录制也需要提供文件路径
      file_path: null
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then(function (response) {
    if (response.ok) {
      isRecording.value = false;
    }
  }).catch(function (error) {
    console.error('录制错误:', error);
  });
}

// 检查说话状态
async function checkSpeakingStatus() {
  // 直接从DOM中获取client.js设置的sessionid
  const domSessionId = document.getElementById('sessionid')?.value;
  // 如果DOM中没有，回退到Vue状态中的值
  const currentId = domSessionId || sessionId.value;
  if (!currentId) {
    return;
  }

  try {
    const response = await fetch(API_PREFIX + '/is_speaking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionid: Number(currentId) })
    });

    if (!response.ok) {
      throw new Error(`接口请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();
    currentRetryCount = 0;

    if (data.code === 0) {
      if (data.data === true) {
        isSynthesizing.value = true;
      } else {
        isSynthesizing.value = false;
        if (speakingCheckInterval !== null) {
          clearInterval(speakingCheckInterval);
          speakingCheckInterval = null;
        }
        currentSessionId = null;
      }
    }
  } catch (error) {
    console.error('调用is_speaking接口失败:', error);
    currentRetryCount++;

    if (currentRetryCount >= MAX_RETRY_COUNT) {
      isSynthesizing.value = false;
      if (speakingCheckInterval !== null) {
        clearInterval(speakingCheckInterval);
        speakingCheckInterval = null;
      }
      currentSessionId = null;
      currentRetryCount = 0;
    }
  }
}

// 发送请求到human接口
function sendHumanRequest(text: string) {
  // 直接从DOM中获取client.js设置的sessionid
  const domSessionId = document.getElementById('sessionid')?.value;
  // 如果DOM中没有，回退到Vue状态中的值
  const requestSessionId = domSessionId || sessionId.value;
  currentSessionId = requestSessionId;
  console.log(`准备发送请求到human接口，sessionid: ${currentSessionId}`);

  return fetch(API_PREFIX + '/human', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      type: 'echo',
      interrupt: true,
      sessionid: Number(requestSessionId)
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    return response.json();
  }).then(result => {
    if (result && (result.sessionid || result.code === 0)) {
      setTimeout(() => {
        if (speakingCheckInterval !== null) {
          clearInterval(speakingCheckInterval);
        }
        speakingCheckInterval = window.setInterval(checkSpeakingStatus, 1000);
      }, 2000);
    }
    return result;
  }).catch(error => {
    console.error('调用human接口失败:', error);
    isSynthesizing.value = false;
    throw error;
  });
}

// 处理合成按钮点击
function handleSynthesis() {
  if (!message.value.trim()) {
    Modal.warning({
      title: '提示',
      content: '请输入要合成的文字内容',
    });
    return;
  }

  isSynthesizing.value = true;
  currentRetryCount = 0;

  if (speakingCheckInterval !== null) {
    clearInterval(speakingCheckInterval);
    speakingCheckInterval = null;
  }

  sendHumanRequest(message.value);
}

// 发送到Coze
async function sendToCoze() {
  const userInput = cozeInput.value.trim();
  if (!userInput) {
    Modal.warning({
      title: '提示',
      content: '请输入要发送给AI的内容',
    });
    return;
  }

  if (!cozeConfig.value.apiUrl || !cozeConfig.value.authorizationToken) {
    Modal.warning({
      title: '提示',
      content: 'Coze配置未加载，请先选择配置',
    });
    return;
  }

  isSendingCoze.value = true;
  cozeResponse.value = "获取回答中...";
  message.value = "";

  try {
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
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    let fullAnswer = "";
    let lastContent = "";
    let debounceTimer: number | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (fullAnswer) {
          cozeResponse.value = fullAnswer.trim();
          message.value = fullAnswer.trim();
          isSynthesizing.value = true;
          currentRetryCount = 0;

          // 自动触发语音视频合成
          await sendHumanRequest(fullAnswer.trim());
        }
        isSendingCoze.value = false;
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
                    if (debounceTimer !== null) {
                      clearTimeout(debounceTimer);
                    }
                    debounceTimer = window.setTimeout(() => {
                      cozeResponse.value = fullAnswer.trim();
                      message.value = fullAnswer.trim();
                    }, 50);
                  }
                  break;

                case "conversation.message.completed":
                  if (data.type === "answer" && data.content_type === "text") {
                    fullAnswer = (data.content || "").trim();
                    cozeResponse.value = fullAnswer;
                    message.value = fullAnswer;
                  }
                  break;
              }
            } catch (parseError) {
              console.error('解析Coze响应数据失败', parseError);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Coze接口调用失败:', error);
    cozeResponse.value = "获取回答失败: " + (error as Error).message;
  } finally {
    isSendingCoze.value = false;
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

/* 移除原生button样式，使用ant-design-vue的按钮样式 */

video {
  width: 100%;
  height: auto;
  object-fit: contain;
  max-height: calc(100vh - 150px);
}

.option {
  margin-bottom: 16px;
}

#media {
  max-width: 1280px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.layout-container {
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.control-panel {
  width: 350px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.media-panel {
  flex: 1;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 使用ant-design-vue的样式类来设置文本区域样式 */
:deep(.ant-input-textarea) {
  background-color: #f5f5f5;
  font-family: 'Courier New', Courier, monospace;
}

.mt-4 {
  margin-top: 16px;
}

/* 为ant-design-vue组件添加适当的间距 */
:deep(.ant-btn) {
  margin-right: 8px;
  margin-bottom: 8px;
}

/* 保持form-control类以兼容已有结构，但使用ant-design-vue的样式 */
.form-control {
  width: 100%;
}
</style>
