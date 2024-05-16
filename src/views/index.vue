<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in cards" :key="item.title">
        <el-card :body-style="{ padding: '20px' }">
          <h3>{{ item.title }}</h3>
          <div>{{ item.content }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div ref="chart1" style="height: 400px;"></div>
      </el-col>
      <el-col :span="12">
        <div ref="chart2" style="height: 400px;"></div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div ref="chart3" style="height: 400px;"></div>
      </el-col>
      <el-col :span="12">
        <div ref="chart4" style="height: 400px;"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'Dashboard',
  data() {
    return {
      cards: [
        { title: '总对话数', content: '1,234,567' },
        { title: '满意度评分', content: '4.5/5' },
        { title: '日活跃用户数', content: '12,345' },
        { title: '平均响应时间', content: '1.2秒' },
      ],
    };
  },
  mounted() {
    this.initChart(this.$refs.chart1, 'bar');
    this.initChart(this.$refs.chart2, 'line');
    this.initChart(this.$refs.chart3, 'pie');
    this.initChart(this.$refs.chart4, 'scatter');
  },
  methods: {
    initChart(chartDom, type) {
      var myChart = echarts.init(chartDom);
      var option = {};

      switch (type) {
        case 'bar':
          option = {
            title: { text: '总对话数（按月）' },
            tooltip: {},
            xAxis: { data: ["1月", "2月", "3月", "4月", "5月", "6月"] },
            yAxis: {},
            series: [{ name: '对话数', type: 'bar', data: [1200, 2000, 1500, 800, 700, 1100] }]
          };
          break;
        case 'line':
          option = {
            title: { text: '满意度评分（按月）' },
            tooltip: {},
            xAxis: { type: 'category', data: ["1月", "2月", "3月", "4月", "5月", "6月"] },
            yAxis: { type: 'value' },
            series: [{ name: '评分', type: 'line', data: [4.2, 4.5, 4.3, 4.4, 4.6, 4.5] }]
          };
          break;
        case 'pie':
          option = {
            title: { text: '用户反馈类别分布' },
            tooltip: {},
            series: [{
              name: '访问来源',
              type: 'pie',
              radius: '55%',
              data: [
                {value: 235, name: '功能建议'},
                {value: 274, name: '报告错误'},
                {value: 310, name: '其他'},
                {value: 335, name: '用户体验'},
                {value: 400, name: '性能问题'}
              ]
            }]
          };
          break;
        case 'scatter':
          option = {
            title: { text: '日活跃用户数与平均响应时间关系' },
            xAxis: {},
            yAxis: {},
            series: [{
              symbolSize: 20,
              data: [
                [10, 1.2],
                [20, 1.0],
                [30, 1.5],
                [40, 1.1],
                [50, 1.6],
                [60, 1.8]
              ],
              type: 'scatter'
            }]
          };
          break;
      }

      myChart.setOption(option);
    },
  },
};
</script>

<style scoped>
/* 卡片样式 */
.el-card {
  margin-top: 10px;
  transition: transform .3s, box-shadow .3s;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.el-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}

.el-card .el-card__body {
  padding: 20px;
  color: #333;
  font-size: 16px;
  line-height: 1.5;
}

.el-card h3 {
  margin-top: 0;
  color: #333;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 15px;
}

/* 调整卡片间距 */
.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

</style>
