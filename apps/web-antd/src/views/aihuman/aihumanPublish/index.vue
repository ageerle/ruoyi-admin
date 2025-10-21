<script setup lang="ts">

// 依赖引入
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { AihumanPublishInfo } from '#/api/aihuman/aihumanPublish/types';

import { ref, computed, watch, onMounted } from 'vue';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { Space, Button, Select, Input, Radio, message, Slider } from 'ant-design-vue';
import axios from 'axios';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// 接口引入 start
import { aihumanPublishList } from '#/api/aihuman/aihumanPublish';
// 接口引入 end

import { columns, querySchema } from './data';
import Live2DViewer from './Live2DViewer.vue';

defineOptions({
  name: 'AihumanAihumanPublish',
});

// 控制面板相关变量
const viewerRef = ref<InstanceType<typeof Live2DViewer> | null>(null);
const selectedModel = ref<string>('');
const textContent = ref('');
const localEyeMode = ref('true'); // 创建本地ref用于v-model绑定

// 添加聊天相关变量
const chatText = ref('');
const chatOutput = ref('');
const isLoading = ref(false);

// 在expressionsList变量附近添加
const expressionsList = ref<any[]>([]);
const motionsList = ref<any[]>([]); // 添加肢体交互列表变量

// 添加当前模型缩放比例变量
const modelScale = ref<number>(0.6);

// 添加模型名称映射，存储场景名称到模型名称的对应关系
const nameToModelMap = ref<Record<string, string>>({});
// 添加默认模型路径变量
const defaultModelPath = ref<string>('');

// Coze API配置 - 初始化空对象，后续从API获取
const cozeConfig = ref({
  apiUrl: '',
  authorizationToken: '',
  botId: '',
  userId: ''
});

// 语音合成配置 - 初始化空对象，后续从API获取
const ttsConfig = ref({
  apiUrl: '',
  textLang: '',
  refAudioPath: '',
  promptLang: '',
  promptText: '',
  textSplitMethod: '',
  batchSize: 0,
  mediaType: '',
  speedFactor: ''
});

// 当前语音类型
const currentVoiceType = ref(''); // 保存当前的voice类型，如'GPT-SoVITS'或'edge-tts'


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

// 从API获取指定模型的配置参数
const fetchConfigParams = async (modelName?: string) => {
  try {
    // 使用项目中已有的API函数
    const response = await aihumanPublishList();

    let targetConfig;

    // 如果指定了模型名称，查找对应的配置
    if (modelName && response.rows && Array.isArray(response.rows)) {
      // 查找与模型名称匹配的配置
      targetConfig = response.rows.find((row: AihumanPublishInfo) =>
        row.name === modelName || row.modelName === modelName
      );
    }

    // 如果没有找到指定模型的配置或未指定模型，使用第一个有modelParams或agentParams的配置
    if (!targetConfig && response.rows && Array.isArray(response.rows)) {
      targetConfig = response.rows.find((row: AihumanPublishInfo) => row.modelParams || row.agentParams);
    }

    if (targetConfig) {

      // 解析modelParams
      if (targetConfig.modelParams) {
        try {
          // 先处理modelParams文本中的转义字符
          // 替换所有的\n和\t为对应的实际字符
          let modelParamsText = targetConfig.modelParams;

          // 处理转义字符
          modelParamsText = modelParamsText
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');

          // 解析处理后的JSON字符串
          const params = JSON.parse(modelParamsText);

          // 清空表情列表，避免累积旧数据
          expressionsList.value = [];

          // 清空肢体交互列表，避免累积旧数据
          motionsList.value = [];

          // 提取Expressions数组，增加全面的安全检查
          if (params.FileReferences &&
              typeof params.FileReferences === 'object' &&
              Array.isArray(params.FileReferences.Expressions)) {
            expressionsList.value = params.FileReferences.Expressions;
            console.log(`成功加载模型表情配置，共${expressionsList.value.length}个表情：`,
                      expressionsList.value.map(exp => exp.Name).join(', '));
          } else {
            console.log('模型配置中未找到有效的Expressions数组');
          }

          // 提取Motions配置，支持多种结构
          if (params.FileReferences &&
              typeof params.FileReferences === 'object' &&
              params.FileReferences.Motions &&
              typeof params.FileReferences.Motions === 'object') {
            // 创建一个存储所有Motions类别的对象
            const allMotions = {};

            // 获取Motions对象的所有键
            const motionKeys = Object.keys(params.FileReferences.Motions);

            if (motionKeys.length > 0) {
              // 遍历所有Motions键
              motionKeys.forEach(key => {
                const motionArray = params.FileReferences.Motions[key];
                if (Array.isArray(motionArray) && motionArray.length > 0) {
                  allMotions[key] = motionArray;
                  console.log(`成功加载模型肢体动作类别: ${key}，共${motionArray.length}个动作`);
                }
              });

              // 存储所有动作类别
              allMotionsList.value = allMotions;
            } else {
              console.log('模型配置中Motions对象为空');
            }
          } else {
            console.log('模型配置中未找到有效的Motions对象');
          }

        } catch (modelParseError) {
          console.error('解析modelParams失败:', modelParseError);
          console.error('原始modelParams文本:', targetConfig.modelParams);
          // 解析失败时清空表情和肢体交互列表
          expressionsList.value = [];
          motionsList.value = [];
        }
      }

      // 现有的agentParams解析逻辑
      if (targetConfig.agentParams) {
        try {
          const agentParams = JSON.parse(targetConfig.agentParams);

          // 从agentParams.agentConfig获取coze配置
          if (agentParams.agent === 'coze' && agentParams.agentConfig) {
            cozeConfig.value = agentParams.agentConfig;
          } else if (agentParams.agent) {
            // 预留其他平台的处理逻辑
            console.log(`不支持的agent类型: ${agentParams.agent}`);
          }

          // 从agentParams.voiceConfig获取tts配置
          if (agentParams.voice === 'GPT-SoVITS' && agentParams.voiceConfig) {
            ttsConfig.value = agentParams.voiceConfig;
            currentVoiceType.value = 'GPT-SoVITS';
          }
          // 集成 edge-tts
          else if (agentParams.voice === 'edge-tts' && agentParams.voiceConfig) {
            ttsConfig.value = agentParams.voiceConfig;
            currentVoiceType.value = 'edge-tts';

            // 从配置中提取Edge-tts所需参数
            ttsConfig.value.voice = agentParams.voiceConfig.voice || 'zh-CN-XiaoxiaoNeural'; // 默认语音包
            ttsConfig.value.rate = agentParams.voiceConfig.rate || 0; // 语速调整
            ttsConfig.value.volume = agentParams.voiceConfig.volume || 0; // 音量调整
            ttsConfig.value.pitch = agentParams.voiceConfig.pitch || 0; // 音调调整

          } else if (agentParams.voice) {
            // 预留其他语音平台的处理逻辑
            console.log(`不支持的voice类型: ${agentParams.voice}`);
            currentVoiceType.value = agentParams.voice;
          }
          console.log(`成功为模型 ${modelName || '默认'} 加载配置参数`);
        } catch (parseError) {
          console.error('解析agentParams失败:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('获取配置参数失败:', error);
    message.error('获取配置参数失败，使用默认配置');
  }
};

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

// 测试音频
const handleTestAudio = () => {
  if (viewerRef.value) {
    viewerRef.value.testAudio();
  }
};

// 更新模型
const handleUpdateModel = async () => {
  if (viewerRef.value && selectedModel.value) {
    // 假设nameToModelMap中直接包含modelPath信息
    // 或者从某个数据源获取与selectedModel对应的modelPath
    const modelPath = nameToModelMap.value[selectedModel.value] as string;
    viewerRef.value.updateModel(modelPath);

    console.log(`更新模型为: ${modelPath}`);

    // 获取并应用当前模型对应的配置参数
    await fetchConfigParams(selectedModel.value);
  }
};

// 保留这个正确的async版本函数定义
const initModelList = async () => {
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

      // 修改这里：存储场景名称到模型路径的映射，而不是模型名称
      nameToModelMap.value[item.name] = item.modelPath;
    });

    // 确保数组不为空再赋值
    if (viewerRef.value.configData.length > 0) {
      selectedModel.value = viewerRef.value.configData[0].name as string;
      // 设置默认模型路径为下拉框第一条记录的modelPath
      defaultModelPath.value = viewerRef.value.configData[0].modelPath as string;
      // 为默认选中的模型加载配置参数
      await fetchConfigParams(selectedModel.value);
    }
  }
};

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

// 停止讲话
const handleStopSpeaking = () => {
  if (viewerRef.value) {
    viewerRef.value.stopSpeaking();
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

    // 根据当前语音类型进行不同的处理
    if (currentVoiceType.value === 'GPT-SoVITS') {
      // GPT-SoVITS的处理逻辑
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
    }
    // 处理其他语音平台（edge-tts）
    else if (currentVoiceType.value === 'edge-tts') {
      // edge-tts的处理逻辑（使用浏览器兼容的方式）
      console.log('使用edge-tts进行语音合成');
      try {
        // 由于浏览器环境限制，使用Web Speech API作为替代方案
        // 这是一个浏览器兼容的文本转语音实现
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(textContent.value);

          // 设置语音参数
          const voices = window.speechSynthesis.getVoices();
          const voiceName = ttsConfig.value.voice || 'Microsoft Xiaoxiao - Chinese (Simplified)';

          // 尝试找到匹配的语音
          const selectedVoice = voices.find(v => v.name.includes(voiceName.split('-')[0]));
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          // 设置语速、音量和音调
          utterance.rate = 1 + (ttsConfig.value.rate || 0) / 100; // 将百分比转换为0.1-10的范围
          utterance.volume = Math.min(1, (ttsConfig.value.volume || 0) / 100 + 1); // 0-1范围
          utterance.pitch = Math.min(2, Math.max(0, (ttsConfig.value.pitch || 0) / 50 + 1)); // 0-2范围

          // 播放语音
          window.speechSynthesis.speak(utterance);

          // 由于Web Speech API不直接提供音频URL，我们可以创建一个简单的反馈
          message.success('语音合成开始播放');
        }
        // 如果浏览器不支持Web Speech API，使用备用方案
        else {
          message.warning('您的浏览器不支持语音合成功能');
          // 备用方案：显示通知并请求服务器进行语音合成
          if (ttsConfig.value.apiUrl) {
            // 尝试通过API调用进行语音合成
            try {
              const response = await axios.post(ttsConfig.value.apiUrl, {
                text: textContent.value,
                voice: ttsConfig.value.voice || 'zh-CN-XiaoxiaoNeural',
                rate: ttsConfig.value.rate || 0,
                volume: ttsConfig.value.volume || 0,
                pitch: ttsConfig.value.pitch || 0
              }, {
                responseType: 'arraybuffer'
              });

              const audioBlob = new Blob([response.data], { type: 'audio/wav' });
              const audioUrl = URL.createObjectURL(audioBlob);
              if (viewerRef.value) {
                viewerRef.value.talk(audioUrl);
              }
            } catch (apiError) {
              console.error('语音合成API调用失败:', apiError);
              message.error('语音合成服务暂时不可用');
            }
          }
        }
      } catch (edgeError) {
        console.error('edge-tts语音合成失败:', edgeError);
        message.error('语音合成失败');
      }
    } else {
      // 默认使用GPT-SoVITS的逻辑
      console.log(`未识别的语音类型: ${currentVoiceType.value}，使用默认处理逻辑`);
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

    // 根据当前语音类型进行不同的处理
    if (currentVoiceType.value === 'GPT-SoVITS') {
      // GPT-SoVITS的流式处理逻辑
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
    } else if (currentVoiceType.value === 'edge-tts') {
      // edge-tts的流式处理逻辑（预留）
      console.log('edge-tts流式语音合成暂未实现');
      message.warning('edge-tts流式语音合成功能正在开发中');



    } else {
      // 默认使用GPT-SoVITS的流式逻辑
      console.log(`未识别的语音类型: ${currentVoiceType.value}，使用默认流式处理逻辑`);
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
    }
  } catch (error) {
    console.error('流式推理失败:', error);
    message.error('流式语音合成失败');
  } finally {
    isLoading.value = false;
  }
};


// 添加处理模型大小调整的方法
const handleScaleChange = (value: number) => {
  console.log('滑块值变化:', value); // 增加日志输出滑块值
  if (viewerRef.value) {
    // 直接传入目标缩放比例，不再计算增量
    modelScale.value = value;
    console.log('设置模型缩放比例:', modelScale.value); // 增加日志输出设置的缩放比例
    viewerRef.value.adjustModelSize(value);
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

// 在变量定义区域之后添加playExpression函数
const playExpression = (expressionName: string) => {
  try {
    if (viewerRef.value && typeof viewerRef.value.playExpression === 'function') {
      viewerRef.value.playExpression(expressionName);
      console.log(`播放表情: ${expressionName}`);
    } else {
      console.warn('Live2DViewer组件未初始化或没有playExpression方法');
    }
  } catch (error) {
    console.error(`播放表情失败: ${expressionName}`, error);
  }
};

// 播放指定肢体动作 - 仅支持动作类型
const playMotion = (motionType: string) => {
  try {
    console.log(`请求播放肢体动作: 类型=${motionType}`);
    if (viewerRef.value && typeof viewerRef.value.playMotion === 'function') {
      console.log(`调用playMotion: 类型=${motionType}`);
      viewerRef.value.playMotion(motionType);
    } else {
      console.warn('Live2DViewer组件未找到或不支持playMotion方法');
    }
  } catch (error) {
    console.error(`播放肢体动作失败: ${error}`);
  }
};

// 获取动作类型的显示名称
const getMotionTypeName = (motionType: string) => {
  if (motionType === '') {
    return '默认动作';
  }
  // 转换首字母大写的格式为更友好的显示格式
  return motionType.replace(/([A-Z])/g, ' $1').trim();
};

// 添加响应式数据
const allMotionsList = ref({});

// 初始化模型列表
initModelList();

</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-[8px]">
      <!-- 左侧显示控制面板 -->
      <div class="w-1/3 overflow-hidden border border-gray-200 rounded bg-white">
        <div id="control" class="p-4">
          <Button @click="handleTestAudio">讲话测试</Button>
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

          <!-- 表情交互组件 -->
          <div v-if="expressionsList.length > 0" class="mb-10">
            <label>表情交互：</label>
            <br />
            <Space wrap>
              <Button
                v-for="expression in expressionsList"
                :key="expression.Name"
                :id="expression.Name"
                @click="playExpression(expression.Name)"
                type="primary"
                size="middle"
              >
                {{ expression.Name }}
              </Button>
            </Space>
          </div>

          <div v-if="Object.keys(allMotionsList).length > 0" class="mb-10">
            <label>肢体交互：</label>
            <br />
            <Space wrap>
              <Button
                v-for="(motionArray, motionType) in allMotionsList"
                :key="motionType"
                @click="playMotion(motionType)"
                type="primary"
                size="middle"
              >
                {{ getMotionTypeName(motionType) }}
              </Button>
            </Space>
          </div>

          <!-- 聊天交互组件 -->
          <div class="chat-section">
            <h3>聊天交互</h3>
            <br /><br />
            <div class="control-group">
              <Input
                v-model:value="chatText"
                placeholder="请输入想要对话的内容"
                style="width: 100%; margin-bottom: 10px;"
              />
              &nbsp
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
                placeholder="数字人返回的对话内容"
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

        </div>
      </div>

      <!-- 右侧显示 Live2D 数字人 -->
      <div class="w-full overflow-hidden border border-gray-200 rounded">
        <div class="p-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
          <span class="text-sm">调整大小: {{ modelScale.toFixed(1) }}</span>
          <Slider
            :min="0.1"
            :max="2.0"
            :step="0.1"
            :value="modelScale"
            @change="handleScaleChange"
            :style="{ width: '200px' }"
          />
        </div>
        <Live2DViewer ref="viewerRef" :eyeMode="localEyeMode" :default-model-path="defaultModelPath" />
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
