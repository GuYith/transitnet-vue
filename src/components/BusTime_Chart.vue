<template>
  <div style="width: 100%; height: 400px" id="busTime"></div>
</template>

<script>
let echarts = require('echarts/lib/echarts')
import {LegendComponent} from 'echarts/components'
import {PolarComponent} from 'echarts/components'
import {ScatterChart} from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { RadarChart } from 'echarts/charts';
import { LineChart } from 'echarts/charts';

echarts.use([GridComponent])
echarts.use([LegendComponent])
echarts.use([PolarComponent])
echarts.use([ScatterChart])
echarts.use([RadarChart]);
echarts.use([LineChart]);
export default {
  name: "BusTime_Chart",
  data() {return {chart: null}},
  mounted() {
    this.init()
  },
  methods: {
    init() {
      var chartDom = document.getElementById('busTime');
      var myChart = echarts.init(chartDom);
      var option;

// prettier-ignore
      const hours = [
        '12a', '1a', '2a', '3a', '4a', '5a', '6a',
        '7a', '8a', '9a', '10a', '11a',
        '12p', '1p', '2p', '3p', '4p', '5p',
        '6p', '7p', '8p', '9p', '10p', '11p'
      ];
// prettier-ignore
      const minutes = [
          5,10,15,20,25,30
      ]
// prettier-ignore
      const data = [{
        value: [10,20,23,30,15,20,23,30,18,15,20,13,23,23,32,11,22,12,23,18]
          }, {
          value: [23,30,18,15,20,13,23,23,32,11,22,12,23,18,10,20,23,30,15,20]
        }, {
            value: [23,23,32,11,22,12,23,18,10,20,23,30,15,20,23,30,18,15,20,13]
          }
      ]
      ;
      option = {
        title: {
          text: 'Bus Arrival',
          left: 'center',
          top: 10
        },
        grid: [
          {top: '30'},
        ],
        // legend: {
        //   data: ['BusTime Chart'],
        //   left: 'center'
        // },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        radar: {
          indicator: [
            { name:'12a', max: 35}, { name:'1a', max:35}, { name:'2a', max:35},
            { name:'3a', max:35},{ name:'4a', max:35},{ name:'5a', max:35},
            { name:'6a', max:35},{ name:'7a', max:35},{ name:'8a', max:35},
            { name:'9a', max:35},{ name:'10a', max:35},{ name:'11a', max:35},
            { name:'12p', max:35},{ name:'1p', max:35},{ name:'2p', max:35},
            { name:'3p', max:35},{ name:'4p', max:35},{ name:'5p', max:35},
            { name:'6p', max:35},{ name:'7p', max:35},{ name:'8p', max:35},
            { name:'9p', max:35},{ name:'10p', max:35},{ name:'11p', max:35},
          ]
        },
        series: [
          {
            name: 'BusTime_Chart',
            type: 'radar',
            // coordinateSystem: 'polar',
            symbolSize: 2,
            itemStyle: {
              normal: {
                color: 'rgba(222,105,105,0.3)'
              }
            },
            areaStyle: {},
            data: data,
            animationDelay: function (idx) {
              return idx * 5;
            }
          }
        ]
      };
      option && myChart.setOption(option);
    }
  }
}
</script>

<style scoped>

</style>