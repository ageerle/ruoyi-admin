import { defineComponent, h } from 'vue';

import { Button } from 'ant-design-vue';
import buttonProps from 'ant-design-vue/es/button/buttonTypes';
import { omit } from 'lodash-es';

/**
 * 表格操作列按钮专用
 */
export const GhostButton = defineComponent({
  name: 'GhostButton',
  props: omit(buttonProps(), ['type', 'ghost', 'size']),
  setup(props, { attrs, slots }) {
    return () =>
      h(
        Button,
        { ...props, ...attrs, type: 'primary', ghost: true, size: 'small' },
        slots,
      );
  },
});
