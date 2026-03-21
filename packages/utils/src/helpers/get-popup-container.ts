/**
 * If the node is holding inside a form, return the form element,
 * otherwise return the parent node of the given element or
 * the document body if the element is not provided.
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (
    node?.closest('form') ?? (node?.parentNode as HTMLElement) ?? document.body
  );
}

/**
 * VxeTable专用弹窗层
 * 解决问题: https://gitee.com/dapppp/ruoyi-plus-vben5/issues/IB1DM3
 * @param node 触发的元素
 * @param tableId 表格ID，用于区分不同表格（可选）
 * @returns 挂载节点
 */
export function getVxePopupContainer(
  node?: HTMLElement,
  tableId?: string,
): HTMLElement {
  if (!node) return document.body;

  // 检查是否在固定列内
  const isInFixedColumn =
    node.closest('.vxe-table--fixed-wrapper') ||
    node.closest('.vxe-table--fixed-left-wrapper') ||
    node.closest('.vxe-table--fixed-right-wrapper');

  // 如果在固定列内，则挂载到固定列容器
  if (isInFixedColumn) {
    // 优先查找表格容器及父级容器
    const tableContainer =
      // 查找通用固定列容器
      node.closest('.vxe-table--fixed-wrapper') ||
      // 查找固定列容器（左侧固定列）
      node.closest('.vxe-table--fixed-left-wrapper') ||
      // 查找固定列容器（右侧固定列）
      node.closest('.vxe-table--fixed-right-wrapper');

    // 如果指定了tableId，可以查找特定ID的表格
    if (tableId && tableContainer) {
      const specificTable = tableContainer.closest(
        `[data-table-id="${tableId}"]`,
      );
      if (specificTable) {
        return specificTable as HTMLElement;
      }
    }

    return tableContainer as HTMLElement;
  }

  /**
   * 设置行高度需要特殊处理
   */
  const fixedHeightElement = node.closest('td.col--cs-height');
  if (fixedHeightElement) {
    // 默认为hidden 显示异常
    (fixedHeightElement as HTMLTableCellElement).style.overflow = 'visible';
  }

  // 兜底方案：使用元素的父节点或文档体
  return (node.parentNode as HTMLElement) || document.body;
}
