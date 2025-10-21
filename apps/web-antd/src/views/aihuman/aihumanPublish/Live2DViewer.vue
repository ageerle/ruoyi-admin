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


// 定义props接收eyeMode和defaultModelPath
const props = defineProps<{
  eyeMode?: string;
  defaultModelPath?: string;
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
    const defaultPath = props.defaultModelPath || '/Live2D/models/梅朵吉祥物/梅朵吉祥物.model3.json';
    const cubism4Model = defaultPath;

    const models = await Promise.all([
      live2d.Live2DModel.from(cubism4Model, { autoInteract: internalEyeMode.value === 'true' })
    ]);

    // 添加模型到舞台并设置属性
    models.forEach((model: any) => {
      app.stage.addChild(model);
      const baseScale = 0.3;
      model.scale.set(baseScale * modelScale.value);
      model.y = window.innerHeight / 16;
      model.x = window.innerWidth / 16;
      draggable(model);
    });

    model4 = models[0];
    model4.x = window.innerWidth / 16;
    model4.y = window.innerHeight / 16;

    // 设置初始动作 - 根据参考代码添加idle动作
    if (model4 && typeof model4.startRandomMotion === 'function') {
      model4.startRandomMotion('idle');
      console.log('已启动idle动作');
    }

    // 添加鼠标点击事件 - 根据参考代码实现
    model4.buttonMode = true;
    model4.interactive = true;

    // 修改点击事件处理逻辑
    model4.on('click', (evt: any) => {
      try {
        const point = evt.data.global;
        console.log(`点击坐标: X=${point.x}, Y=${point.y}`);

        // 检查是否点击了身体部位
        if (typeof model4.hitTest === 'function') {
          // 尝试检测body区域 - 使用tap_body动作
          if (model4.hitTest('body', point.x, point.y) ||
              model4.hitTest('Body', point.x, point.y) ||
              model4.hitTest('HitArea2', point.x, point.y)) { // 添加对HitArea2的支持
            console.log('检测到点击身体');
            if (typeof model4.startRandomMotionOnce === 'function') {
              model4.startRandomMotionOnce('Idle');
            } else if (typeof model4.motion === 'function') {
              model4.motion('TapBody'); // 修改为tap_body
            }
          }
          // 尝试检测head区域 - 也使用tap_body动作（根据参考代码）
          else if (model4.hitTest('head', point.x, point.y) ||
                   model4.hitTest('Head', point.x, point.y) ||
                   model4.hitTest('HitArea', point.x, point.y)) { // 添加对HitArea的支持
            console.log('检测到点击头部');
            // 根据参考代码，头部点击也使用tap_body动作
            if (typeof model4.startRandomMotionOnce === 'function') {
              model4.startRandomMotionOnce('Idle');
            } else if (typeof model4.motion === 'function') {
              model4.motion('TapBody');
            }
            // 可以保留声音播放，但不是必须的
            if (typeof model4.playSound === 'function') {
              try {
                model4.playSound('星のカケラ.mp3', 'sound/');
              } catch (soundError) {
                console.warn('播放声音失败，可能路径不正确:', soundError);
              }
            }
          }
        } else {
          console.warn('模型不支持hitTest方法');
          // 备用方案：使用原有的hit事件
          if (model4._hitAreas) {
            // 这里可以添加自定义的区域检测逻辑
          }
        }
      } catch (error) {
        console.error('处理点击事件时出错:', error);
      }
    });

    // 添加鼠标移动事件 - 根据参考代码实现视角跟随
    model4.on('mousemove', (evt: any) => {
      try {
        const point = evt.data.global;
        // 只有在眼神跟随开启时才设置视角
        if (internalEyeMode.value === 'true') {
          if (typeof model4.setViewPoint === 'function') {
            model4.setViewPoint(point.x, point.y);
          } else if (typeof model4.lookAt === 'function') {
            // 某些实现可能使用lookAt方法
            model4.lookAt(point.x, point.y);
          }
        }
      } catch (error) {
        console.error('处理鼠标移动事件时出错:', error);
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
  model.interactive = true;

  // 使用pointer事件以兼容触摸设备
  model.on('pointerdown', (e: any) => {
    model.dragging = true;
    model._pointerX = e.data.global.x - model.x;
    model._pointerY = e.data.global.y - model.y;
    // 阻止事件冒泡，避免与点击事件冲突
    e.stopPropagation();
  });

  model.on('pointermove', (e: any) => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
      console.log(`数字人位置 - X: ${model.position.x.toFixed(2)}, Y: ${model.position.y.toFixed(2)}`);
      // 阻止事件冒泡
      e.stopPropagation();
    }
  });

  model.on('pointerupoutside', () => {
    model.dragging = false;
  });

  model.on('pointerup', () => {
    model.dragging = false;
  });
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
  talk('/Live2D/meiduo.wav');
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
      newModel.y = window.innerHeight / 16;
      newModel.x = window.innerWidth / 16;
      draggable(newModel);
      model4 = newModel;
      // 设置默认缩放比例 改为 应用当前的缩放比例
      model4.scale.set(Math.min(scaleX, scaleY) * modelScale.value);
    }
  } catch (error) {
    console.error('更新模型失败:', error);
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

// 修改调整模型大小的方法，从接受增量改为接受绝对值
const adjustModelSize = (scaleFactor: number) => {
  console.log('接收到的缩放因子:', scaleFactor);
  // 直接设置缩放比例，限制在合理范围内
  modelScale.value = Math.max(0.1, Math.min(2.0, scaleFactor));
  console.log('处理后的缩放比例:', modelScale.value);

  // 如果模型已初始化，应用新的缩放比例并保持居中
  if (model4 && app) {
    // 使用固定的基准缩放值，确保与滑块值成线性关系
    const baseScale = 0.6; // 基准缩放值
    const finalScale = baseScale * modelScale.value;
    console.log('最终应用的缩放值:', finalScale);
    model4.scale.set(finalScale);
    centerModel(); // 调用居中方法，确保每次缩放后模型都居中
  }
};

// 保持模型居中的方法 - 取消注释
const centerModel = () => {
  if (model4 && app) {
    model4.x = window.innerWidth / 16;
    model4.y = window.innerHeight / 16;
  }
};


// 播放指定肢体动作 - 仅支持动作类型
const playMotion = (motionType: string) => {
  try {
    console.log(`播放肢体动作: 类型=${motionType}`);
    if (model4) {
      // 1. 首先尝试停止所有动作和讲话，确保彻底清除当前状态
      try {
        // 停止讲话 - 确保在播放动作前停止任何正在进行的讲话
        // if (typeof model4.stopSpeaking === 'function') {
        //   model4.stopSpeaking();
        //   console.log('已停止讲话');
        // }
        // 优先尝试stopAllMotions方法（如果存在）
        if (typeof model4.stopAllMotions === 'function') {
          model4.stopAllMotions();
          console.log('已停止所有动作');
        }
        // 同时也尝试stopMotion方法作为备份
        if (typeof model4.stopMotion === 'function') {
          model4.stopMotion(motionType);
          console.log(`已停止特定动作: ${motionType}`);
        }
      } catch (e) {
        console.log('停止动作方法调用失败，继续尝试播放');
      }

      // 2. 使用setTimeout创建一个小延迟，确保状态清理完成
      setTimeout(() => {
        try {
          if (model4) {
            // 3. 重新播放动作
            if (typeof model4.startRandomMotionOnce === 'function') {
              console.log(`使用startRandomMotionOnce方法播放: ${motionType}`);
              model4.startRandomMotionOnce(motionType);
            } else if (typeof model4.motion === 'function') {
              console.log(`使用model.motion方法播放: ${motionType}`);
              model4.motion(motionType);
            }
          }
        } catch (playError) {
          console.error(`重新播放肢体动作失败: ${playError}`);
        }
      }, 50); // 50毫秒延迟，足够让状态清理但对用户无感知
    }
  } catch (error) {
    console.error(`播放肢体动作失败: ${error}`);
  }
};

// 停止讲话
const stopSpeaking = () => {
  try {
    console.log('停止讲话');
    if (model4 && typeof model4.stopSpeaking === 'function') {
      model4.stopSpeaking();
    }
  } catch (e) {
    console.error('停止讲话失败:', e);
  }
};


// 在defineExpose中取消注释playMotion
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
  playExpression,
  playMotion  // 确保playMotion被正确暴露
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
  height: 0;
  padding-bottom: 140%; /* 根据Live2D模型的原始宽高比调整，140%是示例值 */
  background-color: #f8f9fa; /* 浅色背景 */
}

#canvas {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ffffff; /* 白色背景 */
}
</style>
