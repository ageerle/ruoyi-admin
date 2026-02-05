<!--
不再支持url 统一使用ossId
去除使用`file-type`库进行文件类型检测 在Safari无法使用
-->
<script setup lang="ts">
import type {
  UploadFile,
  UploadListType,
} from 'ant-design-vue/es/upload/interface';

import type { BaseUploadProps, UploadEmits } from './props';

import { $t, I18nT } from '@vben/locales';

import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { Image, ImagePreviewGroup, Upload } from 'ant-design-vue';
import { isFunction } from 'lodash-es';

import { uploadApi } from '#/api';

import { defaultImageAcceptExts } from './helper';
import { useImagePreview, useUpload } from './hook';

interface ImageUploadProps extends BaseUploadProps {
  /**
   * 同antdv的listType
   * @default picture-card
   */
  listType?: UploadListType;
  /**
   * 使用list-type: picture-card时 是否显示动画
   * 会有一个`弹跳`的效果 默认关闭
   * @default false
   */
  withAnimation?: boolean;
}

const props = withDefaults(defineProps<ImageUploadProps>(), {
  api: () => uploadApi,
  removeOnError: true,
  showSuccessMsg: true,
  removeConfirm: false,
  accept: defaultImageAcceptExts.join(','),
  data: () => undefined,
  maxCount: 1,
  maxSize: 5,
  disabled: false,
  listType: 'picture-card',
  helpMessage: true,
  enableDragUpload: false,
  abortOnUnmounted: true,
  withAnimation: false,
});

const emit = defineEmits<UploadEmits>();

// 双向绑定 ossId
const ossIdList = defineModel<string | string[]>('value', {
  default: () => [],
});

const {
  acceptStr,
  handleChange,
  handleRemove,
  beforeUpload,
  innerFileList,
  customRequest,
} = useUpload(props, emit, ossIdList, 'image');

const { previewVisible, previewImage, handleCancel, handlePreview } =
  useImagePreview();

function currentPreview(file: UploadFile) {
  // 有自定义预览逻辑走自定义
  if (isFunction(props.preview)) {
    return props.preview(file);
  }
  // 否则走默认预览
  return handlePreview(file);
}
</script>

<template>
  <div>
    <Upload
      v-model:file-list="innerFileList"
      :class="{ 'upload-animation__disabled': !withAnimation }"
      :list-type="listType"
      :accept="accept"
      :disabled="disabled"
      :directory="directory"
      :max-count="maxCount"
      :progress="{ showInfo: true }"
      :multiple="multiple"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      @preview="currentPreview"
      @change="handleChange"
      @remove="handleRemove"
    >
      <div
        v-if="innerFileList?.length < maxCount && listType === 'picture-card'"
      >
        <PlusOutlined />
        <div class="mt-[8px]">{{ $t('component.upload.upload') }}</div>
      </div>
      <a-button
        v-if="innerFileList?.length < maxCount && listType !== 'picture-card'"
        :disabled="disabled"
      >
        <UploadOutlined />
        {{ $t('component.upload.upload') }}
      </a-button>
    </Upload>
    <slot name="helpMessage" v-bind="{ maxCount, disabled, maxSize, accept }">
      <I18nT
        v-if="helpMessage"
        scope="global"
        keypath="component.upload.uploadHelpMessage"
        tag="div"
        class="text-[14px] leading-[1.5] text-black/45 dark:text-white/45"
        :class="{
          'upload-text__disabled': disabled,
          'mt-2': listType !== 'picture-card',
        }"
      >
        <template #size>
          <span
            class="text-primary mx-1 font-medium"
            :class="{ 'upload-text__disabled': disabled }"
          >
            {{ maxSize }}MB
          </span>
        </template>
        <template #ext>
          <span
            class="text-primary mx-1 font-medium"
            :class="{ 'upload-text__disabled': disabled }"
          >
            {{ acceptStr }}
          </span>
        </template>
      </I18nT>
    </slot>

    <ImagePreviewGroup
      :preview="{
        visible: previewVisible,
        onVisibleChange: handleCancel,
      }"
    >
      <Image class="hidden" :src="previewImage" />
    </ImagePreviewGroup>
  </div>
</template>

<style lang="scss">
.ant-upload-select-picture-card {
  i {
    @apply text-[32px] text-[#999];
  }

  .ant-upload-text {
    @apply mt-[8px] text-[#666];
  }
}

.ant-upload-list-picture-card {
  .ant-upload-list-item::before {
    border-radius: 4px;
  }
}

// 禁用的样式和antd保持一致
.upload-text__disabled {
  color: rgb(50 54 57 / 25%);
  cursor: not-allowed;

  &:where(.dark, .dark *) {
    color: rgb(242 242 242 / 25%);
  }
}

// list-type: picture-card动画效果关闭样式
.upload-animation__disabled {
  .ant-upload-animate-inline {
    animation-duration: 0s !important;
  }
}
</style>
