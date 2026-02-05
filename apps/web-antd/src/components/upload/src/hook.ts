/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { UploadChangeParam, UploadFile } from 'ant-design-vue';
import type { FileType } from 'ant-design-vue/es/upload/interface';
import type {
  RcFile,
  UploadRequestOption,
} from 'ant-design-vue/es/vc-upload/interface';

import type { ModelRef } from 'vue';

import type {
  BaseUploadProps,
  CustomGetter,
  UploadEmits,
  UploadType,
} from './props';

import type { AxiosProgressEvent, UploadResult } from '#/api';
import type { OssFile } from '#/api/system/oss/model';

import { computed, onUnmounted, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { message, Modal } from 'ant-design-vue';
import { isFunction, isString } from 'lodash-es';

import { ossInfo } from '#/api/system/oss';

/**
 * 图片预览hook
 * @returns 预览
 */
export function useImagePreview() {
  /**
   * 获取base64字符串
   * @param file 文件
   * @returns base64字符串
   */
  function getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', (error) => reject(error));
    });
  }

  // Modal可见
  const previewVisible = ref(false);
  // 预览的图片 url/base64
  const previewImage = ref('');
  // 预览的图片名称
  const previewTitle = ref('');

  function handleCancel() {
    previewVisible.value = false;
    previewTitle.value = '';
  }

  async function handlePreview(file: UploadFile) {
    if (!file) {
      return;
    }
    // 文件预览 取base64
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = (await getBase64(file.originFileObj)) as string;
    }
    // 这里不可能为空
    const url = file.url ?? '';
    previewImage.value = url || file.preview || '';
    previewVisible.value = true;
    previewTitle.value =
      file.name || url.slice(Math.max(0, url.lastIndexOf('/') + 1));
  }

  return {
    previewVisible,
    previewImage,
    previewTitle,
    handleCancel,
    handlePreview,
  };
}

/**
 * 图片上传和文件上传的通用hook
 * @param props 组件props
 * @param emit 事件
 * @param bindValue 双向绑定的idList
 * @param uploadType 区分是文件还是图片上传
 * @returns hook
 */
export function useUpload(
  props: Readonly<BaseUploadProps>,
  emit: UploadEmits,
  bindValue: ModelRef<string | string[]>,
  uploadType: UploadType,
) {
  // 组件内部维护fileList
  const innerFileList = ref<UploadFile[]>([]);

  const acceptStr = computed(() => {
    // string类型
    if (isString(props.acceptFormat)) {
      return props.acceptFormat;
    }
    // 函数类型
    if (isFunction(props.acceptFormat)) {
      return props.acceptFormat(props.accept!);
    }
    // 默认 会对拓展名做处理
    return props.accept
      ?.split(',')
      .map((item) => {
        if (item.startsWith('.')) {
          return item.slice(1);
        }
        return item;
      })
      .join(', ');
  });

  /**
   * 自定义文件显示名称 需要区分不同的接口
   * @param cb callback
   * @returns 文件名
   */
  function transformFilename(cb: Parameters<CustomGetter<string>>[0]) {
    if (isFunction(props.customFilename)) {
      return props.customFilename(cb);
    }
    // info接口
    if (cb.type === 'info') {
      return cb.response.originalName;
    }
    // 上传接口
    return cb.response.fileName;
  }

  /**
   * 自定义缩略图 需要区分不同的接口
   * @param cb callback
   * @returns 缩略图地址
   */
  function transformThumbUrl(cb: Parameters<CustomGetter<undefined>>[0]) {
    if (isFunction(props.customThumbUrl)) {
      return props.customThumbUrl(cb);
    }
    // image 默认返回图片链接
    if (uploadType === 'image') {
      // info接口
      if (cb.type === 'info') {
        return cb.response.url;
      }
      // 上传接口
      return cb.response.url;
    }
    // 文件默认返回空 走antd默认的预览图逻辑
    return undefined;
  }

  // 用来标识是否为上传 这样在watch内部不需要请求api
  let isUpload = false;
  function handleChange(info: UploadChangeParam) {
    /**
     * 移除当前文件
     * @param currentFile 当前文件
     * @param currentFileList 当前所有文件list
     */
    function removeCurrentFile(
      currentFile: UploadChangeParam['file'],
      currentFileList: UploadChangeParam['fileList'],
    ) {
      if (props.removeOnError) {
        currentFileList.splice(currentFileList.indexOf(currentFile), 1);
      } else {
        currentFile.status = 'error';
      }
    }

    const { file: currentFile, fileList } = info;

    switch (currentFile.status) {
      // 上传成功 只是判断httpStatus 200 需要手动判断业务code
      case 'done': {
        if (!currentFile.response) {
          return;
        }
        // 获取返回结果 为customRequest的reslove参数
        // 只有success才会走到这里
        const { ossId, url } = currentFile.response as UploadResult;
        currentFile.url = url;
        currentFile.uid = ossId;

        const cb = {
          type: 'upload',
          response: currentFile.response as UploadResult,
        } as const;

        currentFile.fileName = transformFilename(cb);
        currentFile.name = transformFilename(cb);
        currentFile.thumbUrl = transformThumbUrl(cb);
        // 标记为上传 watch根据值做处理
        isUpload = true;
        // ossID添加 单个文件会被当做string
        if (props.maxCount === 1) {
          bindValue.value = ossId;
        } else {
          // 给默认值
          if (!Array.isArray(bindValue.value)) {
            bindValue.value = [];
          }
          // 直接使用.value无法触发useForm的更新(原生是正常的) 需要修改地址
          bindValue.value = [...bindValue.value, ossId];
        }
        break;
      }
      // 上传失败 网络原因导致httpStatus 不等于200
      case 'error': {
        removeCurrentFile(currentFile, fileList);
      }
    }
    emit('change', info);
  }

  function handleRemove(currentFile: UploadFile) {
    function remove() {
      // fileList会自行处理删除 这里只需要处理ossId
      if (props.maxCount === 1) {
        bindValue.value = '';
      } else {
        (bindValue.value as string[]).splice(
          bindValue.value.indexOf(currentFile.uid),
          1,
        );
      }
      // 触发remove事件
      emit('remove', currentFile);
    }

    if (!props.removeConfirm) {
      remove();
      return true;
    }

    return new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: $t('pages.common.tip'),
        content: $t('component.upload.confirmDelete', [currentFile.name]),
        okButtonProps: { danger: true },
        centered: true,
        onOk() {
          resolve(true);
          remove();
        },
        onCancel() {
          resolve(false);
        },
      });
    });
  }

  /**
   * 上传前检测文件大小
   * 拖拽时候前置会有浏览器自身的accept校验 校验失败不会执行此方法
   * @param file file
   * @returns file | false
   */
  function beforeUpload(file: FileType) {
    const isLtMax = file.size / 1024 / 1024 < props.maxSize!;
    if (!isLtMax) {
      message.error($t('component.upload.maxSize', [props.maxSize]));
      return false;
    }
    // 大坑 Safari不支持file-type库 去除文件类型的校验
    return file;
  }

  const uploadAbort = new AbortController();
  /**
   * 自定义上传实现
   * @param info
   */
  async function customRequest(info: UploadRequestOption<any>) {
    const { api } = props;
    if (!isFunction(api)) {
      console.warn('upload api must exist and be a function');
      return;
    }
    try {
      // 进度条事件
      const progressEvent: AxiosProgressEvent = (e) => {
        const percent = Math.trunc((e.loaded / e.total!) * 100);
        info.onProgress!({ percent });
      };
      const res = await api(info.file as File, {
        onUploadProgress: progressEvent,
        signal: uploadAbort.signal,
        otherData: props?.data,
      });
      info.onSuccess!(res);
      if (props.showSuccessMsg) {
        message.success($t('component.upload.uploadSuccess'));
      }
      emit('success', info.file as RcFile, res);
    } catch (error: any) {
      console.error(error);
      info.onError!(error);
    }
  }

  onUnmounted(() => {
    props.abortOnUnmounted && uploadAbort.abort();
  });

  /**
   * 这里默认只监听list地址变化 即重新赋值才会触发watch
   * immediate用于初始化触发
   */
  watch(
    () => bindValue.value,
    async (value) => {
      if (value.length === 0) {
        // 清空绑定值时，同时清空innerFileList，避免外部使用时还能读取到
        innerFileList.value = [];
        return;
      }

      // 上传完毕 不需要调用获取信息接口
      if (isUpload) {
        // 清理 使下一次状态可用
        isUpload = false;
        return;
      }

      // 处理URL直接传入的情况（例如编辑时从数据库获取的完整URL）
      // 检查value是否是URL格式
      const isUrl = isString(value) && (value.startsWith('http://') || value.startsWith('https://'));

      if (isUrl) {
        // 直接使用URL，不调用ossInfo
        const fileitem: UploadFile = {
          uid: value, // 使用URL作为uid
          name: value.split('/').pop() || value, // 从URL提取文件名
          fileName: value.split('/').pop() || value,
          url: value,
          thumbUrl: value,
          status: 'done',
        };
        innerFileList.value = [fileitem];
        return;
      }

      const resp = await ossInfo(value);
      function transformFile(info: OssFile) {
        const cb = { type: 'info', response: info } as const;

        const fileitem: UploadFile = {
          uid: info.ossId,
          name: transformFilename(cb),
          fileName: transformFilename(cb),
          url: info.url,
          thumbUrl: transformThumbUrl(cb),
          status: 'done',
        };
        return fileitem;
      }
      const transformOptions = resp.map((item) => transformFile(item));
      innerFileList.value = transformOptions;
      // 单文件 丢弃策略
      if (props.maxCount === 1 && resp.length === 0 && !props.keepMissingId) {
        bindValue.value = '';
        return;
      }
      // 多文件
      // 单文件查到了也会走这里的逻辑 filter会报错 需要maxCount判断处理
      if (
        resp.length !== value.length &&
        !props.keepMissingId &&
        props.maxCount !== 1
      ) {
        // 给默认值
        if (!Array.isArray(bindValue.value)) {
          bindValue.value = [];
        }
        bindValue.value = bindValue.value.filter((ossId) =>
          resp.map((res) => res.ossId).includes(ossId),
        );
      }
    },
    { immediate: true },
  );

  return {
    handleChange,
    handleRemove,
    beforeUpload,
    customRequest,
    innerFileList,
    acceptStr,
  };
}
