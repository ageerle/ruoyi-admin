import { defineComponent, h } from 'vue';

/**
 * 使用默认插槽来自定义组件
 * 给vbenForm的components使用
 */
export const DefaultSlot = defineComponent({
  name: 'DefaultSlot',
  inheritAttrs: false,
  props: {
    /**
     * 绑定到根节点的div上的属性
     */
    rootDivAttrs: {
      type: Object,
      default: () => ({}),
    },
  },
  render() {
    /**
     * 获取属性 传递给作用域插槽供外部使用
     */
    const attrs = this.$attrs;

    return h('div', { ...this.rootDivAttrs }, this.$slots.default?.(attrs));
  },
});
