<template>
  <div style="width: 100%; height: 100%" id="BusStay_Chart"></div>
</template>
<!--TODO compare different routes stay time -->
<script>
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
]);
const colorList = [
  'rgba(61,138,52,0.1)',
  'rgba(36,189,21,0.1)',
  'rgba(83,172,11,0.1)',
  'rgba(52,138,85,0.1)',
  'rgba(24,142,79,0.1)',
  'rgba(62,254,43,0.1)',
  'rgba(23,143,115,0.1)',
  'rgba(7,130,165,0.1)',
  'rgba(14,85,136,0.1)',
  'rgba(231,196,53,0.1)',
  'rgba(33,80,28,0.1)',
]
export default {
  name: "BusStay_Chart",
  data() { return{
    chart: null,
    routesInfo: [],
    routesId: [],
    times: [
      '00:00', '00:15', '00:30', '00:45',
      '01:00', '01:15', '01:30', '01:45',
      '02:00', '02:15', '02:30', '02:45',
      '03:00', '03:15', '03:30', '03:45',
      '04:00', '04:15', '04:30', '04:45',
      '05:00', '05:15', '05:30', '05:45',
      '06:00', '06:15', '06:30', '06:45',
      '07:00', '07:15', '07:30', '07:45',
      '08:00', '08:15', '08:30', '08:45',
      '09:00', '09:15', '09:30', '09:45',
      '10:00', '10:15', '10:30', '10:45',
      '11:00', '11:15', '11:30', '11:45',
      '12:00', '12:15', '12:30', '12:45',
      '13:00', '13:15', '13:30', '13:45',
      '14:00', '14:15', '14:30', '14:45',
      '15:00', '15:15', '15:30', '15:45',
      '16:00', '16:15', '16:30', '16:45',
      '17:00', '17:15', '17:30', '17:45',
      '18:00', '18:15', '18:30', '18:45',
      '19:00', '19:15', '19:30', '19:45',
      '20:00', '20:15', '20:30', '20:45',
      '21:00', '21:15', '21:30', '21:45',
      '22:00', '22:15', '22:30', '22:45',
      '23:00','23:15', '23:30', '23:45',
    ]
  }
  }, //图表实例
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let _this = this;
      var chartDom = document.getElementById('BusStay_Chart');
      var BusStay_Chart = echarts.init(chartDom);
      var option;
      BusStay_Chart.showLoading();
      this.$axios.get('/mapv/origin').then(response => {
        let routes = response.data;
        //Foreach route
        for(var ri = 0; ri < 5; ri ++) {
          let route = routes[ri];
          let routeInfo = {}
          routeInfo.name = route.routeId;
          _this.routesId.push(route.routeId);
          routeInfo.type = 'line';
          // routeInfo.stack = 'Total';
          routeInfo.symbol ="none";
          routeInfo.areaStyle = {};
          routeInfo.smooth = true;
          routeInfo.emphasis = {focus: 'series'};
          routeInfo.data = [];
          routeInfo.color = colorList[ri];
          for(var i = 0; i < 96; i ++) {
            routeInfo.data.push(Math.random()*100);
          }
          _this.routesInfo.push(routeInfo);
        }
        option = {
          title: {
            text: 'Bus Stay Time Chart',
            right: 50,
            top: 20
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: _this.routesId,
            top: 20,
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: _this.times
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: _this.routesInfo
        };
        BusStay_Chart.hideLoading();
        option && BusStay_Chart.setOption(option);
      }).catch(error => {
        console.log(error);
      });
    }
  }
};
</script>

<style scoped>

</style>