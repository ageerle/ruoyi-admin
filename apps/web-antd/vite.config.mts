import { defineConfig } from '@vben/vite-config';

// 自行取消注释来启用按需导入功能
// import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
// import Components from 'unplugin-vue-components/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      optimizeDeps: {
        include: [
          'echarts/core',
          'echarts/charts',
          'echarts/components',
          'echarts/renderers',
          'ant-design-vue/es/locale/zh_CN',
          'ant-design-vue/es/locale/en_US',
        ],
      },
      plugins: [
        // Components({
        //   dirs: [], // 默认会导入src/components目录下所有组件 不需要
        //   dts: './types/components.d.ts', // 输出类型文件
        //   resolvers: [
        //     AntDesignVueResolver({
        //       importStyle: false, // css in js
        //     }),
        //   ],
        // }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:6039',
            ws: true,
          },
        },
        warmup: {
          clientFiles: ['./index.html', './src/{views,components}/*'],
        },
      },
    },
  };
});
