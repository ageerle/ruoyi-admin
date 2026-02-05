import type { UploadFile } from 'ant-design-vue';

/**
 * 默认支持上传的图片文件类型
 */
export const defaultImageAcceptExts = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
];

/**
 * 默认支持上传的文件类型
 */
export const defaultFileAcceptExts = ['.xlsx', '.csv', '.docx', '.pdf'];

/**
 * 文件(非图片)的默认预览逻辑
 * 默认: window.open打开 交给浏览器接管
 * @param file file
 */
export function defaultFilePreview(file: UploadFile) {
  if (file?.url) {
    window.open(file.url);
  }
}
