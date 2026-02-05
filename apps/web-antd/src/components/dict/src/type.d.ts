/**
 * fallback的渲染
 * 可返回 字符串/Vnode
 */
export type DictFallback =
  | ((current: number | string) => string | VNode)
  | string;
