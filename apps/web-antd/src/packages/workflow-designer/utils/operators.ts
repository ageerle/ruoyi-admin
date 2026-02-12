/**
 * 条件运算符配置
 */

export interface OperatorOption {
  label: string
  value: string
  description?: string
}

// 条件运算符列表
// 注意: value 值必须与后端 OperatorEnum 完全匹配
export const conditionOperators: OperatorOption[] = [
  { label: '包含', value: 'contains', description: '文本包含' },
  { label: '不包含', value: 'not contains', description: '文本不包含' },
  { label: '开始内容是', value: 'start with', description: '以指定内容开始' },
  { label: '结束内容是', value: 'end with', description: '以指定内容结束' },
  { label: '为空', value: 'empty', description: '值为空或未定义' },
  { label: '不为空', value: 'not empty', description: '值存在且不为空' },
  { label: '等于', value: '=', description: '完全相等' },
  { label: '不等于', value: '!=', description: '不相等' },
  { label: '大于', value: '>', description: '数值大于' },
  { label: '大于或等于', value: '>=', description: '数值大于或等于' },
  { label: '小于', value: '<', description: '数值小于' },
  { label: '小于或等于', value: '<=', description: '数值小于或等于' },
]

// 逻辑运算符列表
export const logicOperators: OperatorOption[] = [
  { label: '且(AND)', value: 'and', description: '所有条件都满足' },
  { label: '或(OR)', value: 'or', description: '任一条件满足' },
]

/**
 * 获取运算符显示名称
 */
export function getOperatorLabel(value: string): string {
  const operator = conditionOperators.find(op => op.value === value)
  return operator?.label || value
}

/**
 * 获取逻辑运算符显示名称
 */
export function getLogicOperatorLabel(value: string): string {
  const operator = logicOperators.find(op => op.value === value)
  return operator?.label || value
}
