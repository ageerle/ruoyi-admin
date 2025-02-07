import { h } from 'vue';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Button, Image } from 'ant-design-vue';

import { renderDict } from '#/utils/render';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: true,
        minHeight: 180,
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'rows',
            total: 'total',
            list: 'rows',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        columnConfig: {
          resizable: true,
        },
        toolbarConfig: {
          // 自定义列
          custom: true,
          // 最大化
          zoom: true,
          // 刷新
          refresh: true,
        },
        round: true,
        size: 'medium',
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderDefault(_renderOpts, params) {
        const { column, row } = params;
        return h(Image, { src: row[column.field] });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          Button,
          { size: 'small', type: 'link' },
          { default: () => props?.text },
        );
      },
    });

    /**
     * 表格dict渲染 必传 props: { field: 参数名, dictName: 字典名 }
     */
    vxeUI.renderer.add('DictTag', {
      renderDefault(renderOpts, params) {
        const { props } = renderOpts;
        const field = props?.field;
        const dictName = props?.dictName;
        if (!field || !dictName) {
          console.warn('DictTag: field or dictName is not provided');
          return 'error';
        }
        const { row } = params;
        return renderDict(row[field], dictName);
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
  useVbenForm,
});

export { useVbenVxeGrid };

export type * from '@vben/plugins/vxe-table';
