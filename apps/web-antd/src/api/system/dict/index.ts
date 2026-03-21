import type { DictData } from './dict-data-model';
import type { DictType } from './dict-type-model';
import { dictDataInfo } from './dict-data';

export type { DictData, DictType };

export {
  dictDataInfo,
  dictDataList,
  dictDataExport,
  dictDataRemove,
  dictDataAdd,
  dictDataUpdate,
  dictDetailInfo,
} from './dict-data';

export {
  dictTypeList,
  dictTypeExport,
  dictTypeRemove,
  refreshDictTypeCache,
  dictTypeAdd,
  dictTypeUpdate,
  dictTypeInfo,
  dictOptionSelectList,
} from './dict-type';

/**
 * 获取字典数据项 (dictDataInfo的别名)
 * @param dictType 字典类型
 * @returns 字典数据
 */
export function getDictItems(dictType: string) {
  return dictDataInfo(dictType);
}