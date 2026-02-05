<script setup lang="ts">
import type { IPropTypes } from '@tinymce/tinymce-vue/lib/cjs/main/ts/components/EditorPropTypes';
import type { Editor as EditorType } from 'tinymce/tinymce';

import type { AxiosProgressEvent, UploadResult } from '#/api';

import { computed, nextTick, ref, shallowRef, useAttrs, watch } from 'vue';

import { preferences, usePreferences } from '@vben/preferences';

import Editor from '@tinymce/tinymce-vue';
import { Spin } from 'ant-design-vue';
import { camelCase } from 'lodash-es';

import { uploadApi } from '#/api';
import {
  plugins as defaultPlugins,
  toolbar as defaultToolbar,
} from '#/components/tinymce/src/tinymce';

type InitOptions = IPropTypes['init'];

interface Props {
  height?: number | string;
  options?: Partial<InitOptions>;
  plugins?: string;
  toolbar?: string;
  disabled?: boolean;
}

defineOptions({
  name: 'Tinymce',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  options: () => ({}),
  plugins: defaultPlugins,
  toolbar: defaultToolbar,
  disabled: false,
});

const emit = defineEmits<{
  mounted: [];
}>();

/**
 * https://www.jianshu.com/p/59a9c3802443
 * 使用自托管方案（本地）代替cdn  没有key的限制
 * 注意publicPath要以/结尾
 */
const tinymceScriptSrc = `${import.meta.env.VITE_BASE}tinymce/tinymce.min.js`;

const content = defineModel<string>('modelValue', {
  default: '',
});

const editorRef = shallowRef<EditorType | null>(null);

// 存储上传图片的 url -> ossId 映射，用于后续附加 data-oss-id
const pendingImageMap = new Map<string, string>();

const { isDark, locale } = usePreferences();
const skinName = computed(() => {
  return isDark.value ? 'oxide-dark' : 'oxide';
});

const contentCss = computed(() => {
  return isDark.value ? 'dark' : 'default';
});

/**
 * tinymce支持 en zh_CN
 */
const langName = computed(() => {
  const lang = preferences.app.locale.replace('-', '_');
  if (lang.includes('en_US')) {
    return 'en';
  }
  return 'zh_CN';
});

/**
 * 通过v-if来挂载/卸载组件来完成主题切换切换
 * 语言切换也需要监听 不监听在切换时候会显示原始<textarea>样式
 */
const init = ref(true);
watch([isDark, locale], async () => {
  if (!editorRef.value) {
    return;
  }
  // 相当于手动unmounted清理 非常重要
  editorRef.value.destroy();
  init.value = false;
  // 放在下一次tick来切换
  // 需要先加载组件 也就是v-if为true  然后需要拿到editorRef 必须放在setTimeout(相当于onMounted)
  await nextTick();
  init.value = true;
});

// 加载完毕前显示spin
const loading = ref(true);
const initOptions = computed((): InitOptions => {
  const { height, options, plugins, toolbar } = props;
  return {
    auto_focus: true,
    branding: false, // 显示右下角的'使用 TinyMCE 构建'
    content_css: contentCss.value,
    content_style:
      'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
    contextmenu: 'link image table',
    default_link_target: '_blank',
    height,
    image_advtab: true, // 图片高级选项
    image_caption: true,
    importcss_append: true,
    language: langName.value,
    link_title: false,
    menubar: 'file edit view insert format tools table help',
    noneditable_class: 'mceNonEditable',
    /**
     * 允许粘贴图片 默认base64格式
     * images_upload_handler启用时为上传
     */
    paste_data_images: true,
    images_file_types: 'jpeg,jpg,png,gif,bmp,webp',
    plugins,
    quickbars_selection_toolbar:
      'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    skin: skinName.value,
    toolbar,
    toolbar_mode: 'sliding',
    // 隐藏下面的 按xxx获取帮助
    help_accessibility: false,
    // https://blog.csdn.net/qq_46380656/article/details/122171418
    // 避免图片地址和链接地址转换成相对路径
    relative_urls: false,
    remove_script_host: false,
    convert_urls: false,
    ...options,
    /**
     * 覆盖默认的base64行为
     * @param blobInfo
     * 大坑 不要调用这两个函数  success failure:
     * 使用resolve/reject代替
     * (PS: 新版已经没有success failure)
     */
    images_upload_handler: (blobInfo, progress) => {
      return new Promise((resolve, reject) => {
        const file = blobInfo.blob();
        // const filename = blobInfo.filename();
        // 进度条事件
        const progressEvent: AxiosProgressEvent = (e) => {
          const percent = Math.trunc((e.loaded / e.total!) * 100);
          progress(percent);
        };
        uploadApi(file, { onUploadProgress: progressEvent })
          .then((response) => {
            const { url, ossId } = response as unknown as UploadResult;
            console.log('tinymce上传图片:', url);
            // 将 url -> ossId 映射存储起来，等待图片插入后再附加
            pendingImageMap.set(url, ossId);
            resolve(url);
          })
          .catch((error) => {
            console.error('tinymce上传图片失败:', error);
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ message: error.message, remove: true });
          });
      });
    },
    setup: (editor) => {
      editorRef.value = editor;
      editor.on('init', () => {
        emit('mounted');
        loading.value = false;
      });

      // 监听内容变化，处理待附加 data-oss-id 的图片
      editor.on('change', () => {
        if (pendingImageMap.size === 0) {
          return;
        }

        pendingImageMap.forEach((ossId, url) => {
          const imgDoms = editor.dom.select(`img[src="${url}"]`);
          if (imgDoms && imgDoms.length > 0) {
            imgDoms.forEach((imgDom) => {
              // 只处理还没有 data-oss-id 属性的图片
              if (!editor.dom.getAttrib(imgDom, 'data-oss-id')) {
                editor.dom.setAttrib(imgDom, 'data-oss-id', ossId);
                console.log('已附加 data-oss-id:', url, ossId);
              }
            });
            pendingImageMap.delete(url);
          }
        });
      });
    },
  };
});

const attrs = useAttrs();
/**
 * 获取透传的事件 通过v-on绑定
 * 可绑定的事件 https://www.tiny.cloud/docs/tinymce/latest/vue-ref/#event-binding
 */
const events = computed(() => {
  const onEvents: Record<string, any> = {};
  for (const key in attrs) {
    if (key.startsWith('on')) {
      const eventKey = camelCase(key.split('on')[1]!);
      onEvents[eventKey] = attrs[key];
    }
  }
  return onEvents;
});
</script>

<template>
  <div class="app-tinymce">
    <Spin :spinning="loading">
      <Editor
        v-if="init"
        v-model="content"
        :init="initOptions"
        :tinymce-script-src="tinymceScriptSrc"
        :disabled="disabled"
        license-key="gpl"
        v-on="events"
      />
    </Spin>
  </div>
</template>

<style lang="scss">
// 展开层元素z-index
$dropdown-index: 2025;

@mixin tinymce-valid-fail($color) {
  .app-tinymce {
    // 最外层的tinymce容器
    .tox-tinymce {
      border-color: $color;
    }
    // focus样式
    .tox .tox-edit-area::before {
      border-color: $color;
      border-right: none;
      border-left: none;
    }
  }
}

.tox.tox-silver-sink.tox-tinymce-aux {
  /** 该样式默认为1300的zIndex  */
  z-index: $dropdown-index;
}

.tox-fullscreen .tox.tox-tinymce-aux {
  z-index: $dropdown-index !important;
}

.app-tinymce {
  /**
  隐藏右上角upgrade按钮
  */
  .tox-promotion {
    display: none;
  }

  /** 保持focus时与primary色一致 */
  .tox .tox-edit-area::before {
    border-color: hsl(var(--primary));
  }
}

// antd原生表单 校验失败样式
.ant-form-item:has(.ant-form-item-explain-error) {
  $error-color: #ff3860;

  @include tinymce-valid-fail($error-color);
}

// useVbenForm 校验失败样式
.form-valid-error {
  $error-color: hsl(var(--destructive));

  @include tinymce-valid-fail($error-color);
}

// 全屏下样式处理 不去掉transform位置会异常
div[role='dialog']:has(.tox.tox-tinymce.tox-fullscreen) {
  transform: none !important;
}
</style>
