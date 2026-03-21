import { UnauthorizedException } from '#/api/helper';
import { dictDataInfo } from '#/api/system/dict/dict-data';
import { useDictStore } from '#/store/dict';

/**
 * 一般是Select, Radio, Checkbox等组件使用
 * @warning 注意内部为异步实现 所以不要写这种`getDictOptions()[0]`的代码 会获取不到
 * @warning 需要保持`formatNumber`统一 在所有调用地方需要一致 不能出现A处为string B处为number
 *
 * @param dictName 字典名称
 * @param formatNumber 是否格式化字典value为number类型
 * @returns Options数组
 */
export function getDictOptions(dictName: string, formatNumber = false) {
  const { dictRequestCache, setDictInfo, getDictOptions } = useDictStore();
  const dataList = getDictOptions(dictName);

  // 检查请求状态缓存
  if (dataList.length === 0 && !dictRequestCache.has(dictName)) {
    dictRequestCache.set(
      dictName,
      dictDataInfo(dictName)
        .then((resp) => {
          // 缓存到store 这样就不用重复获取了
          // 内部处理了push的逻辑 这里不用push
          setDictInfo(dictName, resp, formatNumber);
        })
        .catch((error) => {
          /**
           * 需要判断是否为401抛出的特定异常 401清除缓存
           * 其他error清除缓存会导致无限循环调用字典接口 则不做处理
           */
          if (error instanceof UnauthorizedException) {
            // 401时 移除字典缓存 下次登录重新获取
            dictRequestCache.delete(dictName);
          }
          // 其他不做处理
        })
        .finally(() => {
          // 移除请求状态缓存
          /**
           * 这里主要判断字典item为空的情况(无奈兼容 不给字典item本来就是错误用法)
           * 会导致if一直进入逻辑导致接口无限刷新
           * 在这里dictList为空时 不删除缓存
           */
          if (dataList.length > 0) {
            dictRequestCache.delete(dictName);
          }
        }),
    );
  }
  return dataList;
}
