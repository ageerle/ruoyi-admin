<script lang="ts">
import type { EChartsOption } from 'echarts';

import { defineComponent, onActivated, onMounted, ref, watch } from 'vue';

import {
  EchartsUI,
  type EchartsUIType,
  useEcharts,
} from '@vben/plugins/echarts';

export default defineComponent({
  components: { EchartsUI },
  props: {
    data: {
      default: '0',
      type: String,
    },
  },
  setup(props, { expose }) {
    expose({});

    const memoryHtmlRef = ref<EchartsUIType>();
    const { renderEcharts, resize } = useEcharts(memoryHtmlRef);

    watch(
      () => props.data,
      () => {
        if (!memoryHtmlRef.value) return;
        setEchartsOption(props.data);
      },
      { immediate: true },
    );

    onMounted(() => {
      setEchartsOption(props.data);
    });
    // 从其他页面切换回来会有一个奇怪的动画效果 需要调用resize
    onActivated(resize);

    function getNearestPowerOfTen(num: number) {
      let power = 10;
      while (power <= num) {
        power *= 10;
      }
      return power;
    }

    function setEchartsOption(value: string) {
      // x10
      const formattedValue = Math.floor(Number.parseFloat(value));
      // 最大值 10以内取10  100以内取100 以此类推
      const max = getNearestPowerOfTen(formattedValue);
      const options: EChartsOption = {
        series: [
          {
            animation: true,
            animationDuration: 1000,
            data: [
              {
                name: '内存消耗',
                value: Number.parseFloat(value),
              },
            ],
            detail: {
              formatter: `${value}M`,
              valueAnimation: true,
            },
            max,
            min: 0,
            name: '峰值',
            progress: {
              show: true,
            },
            type: 'gauge',
          },
        ],
        tooltip: {
          formatter: `{b} <br/>{a} : ${value}M`,
        },
      };
      renderEcharts(options);
    }

    return {
      memoryHtmlRef,
    };
  },
});
</script>

<template>
  <EchartsUI ref="memoryHtmlRef" height="400px" width="100%" />
</template>
