import type { DictData } from '#/api/system/dict/dict-data-model';

import { dictDataInfo } from '#/api/system/dict/dict-data';
import { type Option, useDictStore } from '#/store/dict';

// todo 重复代码的封装
export function getDict(dictName: string): DictData[] {
  const { dictRequestCache, getDict, setDictInfo } = useDictStore();
  // 这里拿到
  const dictList = getDict(dictName);
  // 检查请求状态缓存
  if (dictList.length === 0 && !dictRequestCache.has(dictName)) {
    dictRequestCache.set(
      dictName,
      dictDataInfo(dictName).then((resp) => {
        // 缓存到store 这样就不用重复获取了
        // 内部处理了push的逻辑 这里不用push
        setDictInfo(dictName, resp);
        // 移除请求状态缓存
        dictRequestCache.delete(dictName);
      }),
    );
  }
  return dictList;
}

export function getDictOptions(dictName: string): Option[] {
  const { dictRequestCache, getDictOptions, setDictInfo } = useDictStore();
  const dictOptionList = getDictOptions(dictName);
  // 检查请求状态缓存
  if (dictOptionList.length === 0 && !dictRequestCache.has(dictName)) {
    dictRequestCache.set(
      dictName,
      dictDataInfo(dictName).then((resp) => {
        // 缓存到store 这样就不用重复获取了
        // 内部处理了push的逻辑 这里不用push
        setDictInfo(dictName, resp);
        // 移除请求状态缓存
        dictRequestCache.delete(dictName);
      }),
    );
  }
  return dictOptionList;
}
