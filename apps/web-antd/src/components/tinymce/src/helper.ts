import { ossInfo } from '#/api/system/oss';

/**
 * 富文本内容中图片ossId转换  确保每次链接都是最新获取的(对于私有桶情况)
 *
 * 当然你可以使用后端来解析dom替换 达到相同的效果 就不用前端调用了
 * 使用方法: 在赋值前调用此方法 contentWithOssIdTransform(content); 转换一次再赋值
 * @param content 富文本内容
 * @returns string
 */
export async function contentWithOssIdTransform(content: string) {
  if (!content) {
    return null;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const imgDom = doc.querySelectorAll('img[data-oss-id]');

  // 没有包含图片 不做处理
  if (imgDom.length === 0) {
    return content;
  }

  // 提取所有data-oss-id属性 作为string[]
  const ossIds = [...imgDom].map(
    (img) => (img as HTMLImageElement).dataset.ossId ?? '',
  );
  // 兼容之前的代码 可能并没有储存ossId
  if (ossIds.length === 0) {
    return content;
  }
  const ossFileList = await ossInfo(ossIds);

  imgDom.forEach((item) => {
    const img = item as HTMLImageElement;
    // 找到对应的 替换
    const src =
      ossFileList.find((file) => file.ossId === img.dataset.ossId)?.url ??
      // 未找到 取原先自己的src
      img.src;
    img.setAttribute('src', src);
  });

  // 获取dom string
  return doc.body.innerHTML;
}
