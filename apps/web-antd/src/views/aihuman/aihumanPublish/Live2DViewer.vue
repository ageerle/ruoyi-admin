<template>
  <div class="live2d-container">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineExpose, watch, defineProps } from 'vue';

// 导入项目中已有的API函数和类型
import { aihumanPublishList } from '#/api/aihuman/aihumanPublish';
import type { AihumanPublishInfo } from '#/api/aihuman/aihumanPublish/types';

// 定义props接收eyeMode
const props = defineProps<{
  eyeMode?: string;
}>();

let app: any = null;
let model4: any = null;
let PIXI: any = null;
let live2d: any = null;

// 响应式变量
const internalEyeMode = ref(props.eyeMode || 'true');
// 存储接口返回的配置数据
const configData = ref<AihumanPublishInfo[]>([]);
// 默认缩放比例为0.6
const modelScale = ref(0.6);

// 监听props变化，更新内部状态
watch(() => props.eyeMode, (newValue) => {
  if (newValue !== undefined) {
    internalEyeMode.value = newValue;
    // 如果模型已初始化，更新眼神跟随状态
    if (model4 && typeof model4.setAutoInteract === 'function') {
      model4.setAutoInteract(newValue === 'true');
    }
  }
});

// 加载外部脚本
const loadExternalScripts = async () => {
  // 在实际项目中，您可能需要通过动态加载这些脚本
};

// 初始化 Live2D
const initLive2D = async () => {
  try {
    // 在实际项目中，这里需要正确导入 PIXI 和 live2d
    PIXI = (window as any).PIXI;
    live2d = PIXI.live2d;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    app = new PIXI.Application({
      view: canvas,
      autoStart: true,
      resizeTo: window,
      transparent: true,
      backgroundAlpha: 0,
      antialias: true,
    });

    // 使用默认模型路径
    const cubism4Model = '/Live2D/models/kei_vowels_pro/kei_vowels_pro.model3.json';

    const models = await Promise.all([
      live2d.Live2DModel.from(cubism4Model, { autoInteract: internalEyeMode.value === 'true' })
    ]);

    // 添加模型到舞台并设置属性
    models.forEach((model: any) => {
      app.stage.addChild(model);
      const scaleX = window.innerWidth / model.width;
      const scaleY = window.innerHeight / model.height;

      // 使用响应式的缩放比例
      model.scale.set(Math.min(scaleX, scaleY) * modelScale.value);

      model.y = window.innerHeight * 0.1;

      // 设置模型居中
      centerModel();

      draggable(model);
    });

    model4 = models[0];
    model4.x = window.innerWidth / 2;

    model4.on('hit', (hitAreas: string[]) => {
      if (hitAreas.includes('Body')) {
        model4.motion('Tap');
      }
      if (hitAreas.includes('Head')) {
        model4.expression();
      }
    });

    // 获取配置数据
    fetchConfigData();
  } catch (error) {
    console.error('初始化 Live2D 失败:', error);
  }
};

// 获取已发布的配置列表数据
const fetchConfigData = async () => {
  try {
    // 使用项目中已有的API函数，而不是直接调用axios
    const response = await aihumanPublishList();

    // 根据AihumanPublishListResponse接口结构处理返回数据
    if (response.rows && Array.isArray(response.rows)) {
      configData.value = response.rows;
    } else {
      configData.value = [];
    }
  } catch (error) {
    console.error('获取配置数据失败:', error);
    configData.value = [];
  }
};

// 使模型可拖拽
const draggable = (model: any) => {
  model.buttonMode = true;
  model.on('pointerdown', (e: any) => {
    model.dragging = true;
    model._pointerX = e.data.global.x - model.x;
    model._pointerY = e.data.global.y - model.y;
  });
  model.on('pointermove', (e: any) => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
    }
  });
  model.on('pointerupoutside', () => (model.dragging = false));
  model.on('pointerup', () => (model.dragging = false));
};

// 让模型说话
const talk = (audio: string) => {
  if (model4) {
    const options = {
      volume: 1, // 音量（0.0~1.0）
      expression: 8, // 播放时使用的表情索引
      resetExpression: true, // 播放完成后恢复默认表情
      crossOrigin: "anonymous" // 跨域配置（用于非同源音频）
    };
    model4.speak(audio, options);
  }
};

// 播放指定表情
const playExpression = (expressionName: string) => {
  if (model4 && typeof model4.expression === 'function') {
    model4.expression(expressionName);
  }
};

// 测试音频
const testAudio = () => {
  talk('/Live2D/jieshao.mp3');
};

// 更新模型
const updateModel = async (modelPath: string) => {
  try {
    if (app && model4) {
      app.stage.removeChild(model4);
      const newModel = await live2d.Live2DModel.from(modelPath, { autoInteract: internalEyeMode.value === 'true' });
      app.stage.addChild(newModel);
      const scaleX = window.innerWidth / newModel.width;
      const scaleY = window.innerHeight / newModel.height;
      newModel.scale.set(Math.min(scaleX, scaleY) * 0.6);
      newModel.y = window.innerHeight * 0.1;
      newModel.x = window.innerWidth / 2;
      draggable(newModel);
      model4 = newModel;
      // 设置默认缩放比例 改为 应用当前的缩放比例
      model4.scale.set(Math.min(scaleX, scaleY) * modelScale.value);
    }
  } catch (error) {
    console.error('更新模型失败:', error);
  }
};

// 停止讲话
const stopSpeaking = () => {
  if (model4) {
    model4.stopSpeaking();
  }
};

// 添加方法用于更新眼神模式
const updateEyeMode = (mode: string) => {
  internalEyeMode.value = mode;
  // 如果模型已初始化，更新眼神跟随状态
  if (model4 && typeof model4.setAutoInteract === 'function') {
    model4.setAutoInteract(mode === 'true');
  }
};

// 添加方法用于更新模型缩放比例
const updateModelScale = (scaleFactor: number) => {
  if (model4) {
    const scaleX = window.innerWidth / model4.width;
    const scaleY = window.innerHeight / model4.height;
    model4.scale.set(Math.min(scaleX, scaleY) * scaleFactor);
  }
};

// 调整模型大小的方法
const adjustModelSize = (delta: number) => {
  // 更新缩放比例
  modelScale.value = Math.max(0.3, Math.min(2.0, modelScale.value + delta));

  // 如果模型已初始化，应用新的缩放比例并保持居中
  if (model4 && app) {
    const scaleX = window.innerWidth / model4.width;
    const scaleY = window.innerHeight / model4.height;
    model4.scale.set(Math.min(scaleX, scaleY) * modelScale.value);
    // 保持模型居中
    centerModel();
  }
};

// 保持模型居中的方法
const centerModel = () => {
  if (model4 && app) {
    model4.x = window.innerWidth / 2;
    model4.y = window.innerHeight / 2;
  }
};

defineExpose({
  testAudio,
  updateModel,
  stopSpeaking,
  fetchConfigData,
  configData,
  eyeModeRef: internalEyeMode,  // 重命名为eyeModeRef以明确这是ref对象
  updateEyeMode,
  adjustModelSize,
  modelScale,
  talk,
  playExpression
});

onMounted(async () => {
  await loadExternalScripts();
  await initLive2D();
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy();
  }
});
</script>

<style scoped>
.live2d-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f8f9fa; /* 浅色背景 */
}

#canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff; /* 白色背景 */
}
</style>
