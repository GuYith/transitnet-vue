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
  data() {
    return {
      arrivalTime: [],
      allCountList: [],
      lateCountList: [],
      ratioList: [],
      chart: null,
      maxCount: 20000,
      BusTime_Chart: {},
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
        '23:00', '23:15', '23:30', '23:45',
      ],
    }
  },
  props: {
    realTimeDate: String,
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      let _this = this;
      var chartDom = document.getElementById('busTime');
      await _this.$message({
        message:"Loading the arrival time data, please wait",
        type: "success"
      })
      _this.BusTime_Chart = echarts.init(chartDom);
      _this.BusTime_Chart.showLoading();
      await this.$axios.get('/visual/arrivalTime?date=' + _this.realTimeDate).then(response => {
        _this.arrivalTime = response.data;
        _this.allCountList = [];
        _this.lateCountList = [];
        _this.rateList = [];
        // get data List
        for(let ai = 0; ai < _this.arrivalTime.length; ai ++) {
          _this.maxCount = Math.max(_this.arrivalTime[ai].allCount, _this.maxCount);
        }
        let indicator = [
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "23:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "22:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "",  max: this.maxCount }, { name: "21:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "20:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "",  max: this.maxCount }, { name: "", max: this.maxCount }, { name: "19:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "18:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "17:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "16:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "15:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "14:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "13:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "12:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "11:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "10:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "09:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "08:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "07:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "06:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "05:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "04:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "03:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "02:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "01:00", max: this.maxCount },
          { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "", max: this.maxCount }, { name: "00:00", max: this.maxCount } ]

        for(let ai = 0; ai < _this.arrivalTime.length; ai ++) {
          _this.allCountList.push(parseInt(_this.arrivalTime[ai].allCount));
          _this.lateCountList.push(parseInt(_this.arrivalTime[ai].lateCount));
          _this.ratioList.push(parseInt(_this.arrivalTime[ai].lateCount) / parseInt(_this.arrivalTime[ai].allCount) * _this.maxCount)
        }
        let sourceData = [
          {
            value : _this.allCountList,
            name: 'All Stop Count',
            areaStyle: {color: 'rgba(162,208,201,0.3)'},
            lineStyle: {color: 'rgb(79,109,117)'}
          },
          {
            value : _this.lateCountList,
            name: 'Late Stop Count',
            areaStyle: {color: 'rgba(222,105,105,0.3)'},
            lineStyle: {color: 'rgba(117,59,59,0.8)'}
          },
          {
            value : _this.ratioList,
            name: 'Late Ratio',
            areaStyle: {color: 'transparent'},
            lineStyle: { color: 'rgb(196,107,32)'}
          }
        ];
        for(var di = 0; di < sourceData.length; di ++) {
          sourceData[di].value && sourceData[di].value.reverse()
        }

        let option = {
          color: ['rgb(79,109,117)', 'rgba(117,59,59,0.8)', 'rgb(196,107,32)'],
          title: {
            text: 'Bus Arrival',
            left: 'center',
            top: 10
          },
          legend: {
            data: [
              'All Stop Count',
              'Late Stop Count',
              'Late Ratio'
            ],
            bottom: 0,
          },
          tooltip: {},
          grid: [
            {top: '30'},
          ],
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          radar: {
            label: {
              show: true,
            },
            startAngle: 90,
            indicator: indicator,
            triggerEvent: true
          },
          series: _this.buildAllSeries(sourceData)
        };
        _this.BusTime_Chart.setOption(option);
      }).catch(error => {
        console.log(error);
      });
      _this.BusTime_Chart.hideLoading();
    },
    buildAllSeries(sDs) {
      let results = [];
      results = results.concat(this.buildSeries(sDs, 0));
      results = results.concat(this.buildSeries(sDs, 1));
      results = results.concat(this.buildSeries(sDs, 2));
      return results ;
    },
    buildSeries(sDs, si) {
      let _this = this;
      let sD = sDs[si];
      let data = sD.value;
      const helper = data.map((item, index) => {
        const arr = new Array(data.length);
        arr.splice(index, 1, item);
        return arr;
      })
      return [data, ...helper].map((item, index) => {
        return {
          type: 'radar',
          symbol: index === 0 ? 'circle' : 'none',
          symbolSize: 2,
          lineStyle: index === 0 ? sD.lineStyle : {color: 'transparent'},
          areaStyle: sD.areaStyle,
          tooltip: {
            show: index === 0 ? false : true,
            formatter: function() {
              return  "<b>" + _this.realTimeDate+ " " +  _this.times[index - 1] + '</b>: <br/>'
                  + "All Stop Count: " +  sDs[0].value[index - 1] + ' <br/>'
                  + "Late Stop Count: " + sDs[1].value[index - 1] + ' <br/>'
                  + "Late Ratio: " + Math.floor(sDs[1].value[index - 1] / sDs[0].value[index - 1]*10000)/100 + "%";
            }
          },
          z: index === 0 ? 1 : 2,
          data: [
            {
              value: item,
              name: sD.name
            }
          ]
        }
      })
    },
    async updateArrivalTimeChartData(curTime) {
      let _this = this;
      await _this.$message({
        message:"Update the arrival time data, please wait",
        type: "success"
      })
      _this.BusTime_Chart.showLoading();
      await this.$axios.get('/visual/arrivalTime?date=' + curTime).then(response => {
        if(response && response.status == 200) {
          _this.arrivalTime = response.data;
          if(_this.arrivalTime.length === 0) {
            _this.$message({
              message:"The arrival time list in this date is empty",
              type: "warning"
            })
            return ;
          }
          _this.allCountList = [];
          _this.lateCountList = [];
          _this.rateList = [];
          //get data List
          for (let ai = 0; ai < _this.arrivalTime.length; ai++) {
            _this.maxCount = Math.max(_this.arrivalTime[ai].allCount, _this.maxCount);
          }

          for (let ai = 0; ai < _this.arrivalTime.length; ai++) {
            _this.allCountList.push(parseInt(_this.arrivalTime[ai].allCount));
            _this.lateCountList.push(parseInt(_this.arrivalTime[ai].lateCount));
            _this.ratioList.push(parseInt(_this.arrivalTime[ai].lateCount) / parseInt(_this.arrivalTime[ai].allCount) * _this.maxCount)
          }
          let sourceData = [
            {
              value: _this.allCountList,
              name: 'All Stop Count',
              areaStyle: {color: 'rgba(162,208,201,0.3)'},
              lineStyle: {color: 'rgb(79,109,117)'}
            },
            {
              value: _this.lateCountList,
              name: 'Late Stop Count',
              areaStyle: {color: 'rgba(222,105,105,0.3)'},
              lineStyle: {color: 'rgba(117,59,59,0.8)'}
            },
            {
              value: _this.ratioList,
              name: 'Late Ratio',
              areaStyle: {color: 'transparent'},
              lineStyle: {color: 'rgb(196,107,32)'}
            }
          ];
          for (var di = 0; di < sourceData.length; di++) {
            sourceData[di].value && sourceData[di].value.reverse()
          }
          let seriesData = _this.buildAllSeries(sourceData);
          let newOption = _this.BusTime_Chart.getOption()
          newOption.series = seriesData;
          _this.BusTime_Chart.setOption(newOption);
          _this.BusTime_Chart.hideLoading();
        } else _this.dealResponse(response);
      }).catch(error => {
        _this.dealError(error);
      });
      _this.BusTime_Chart.hideLoading();
    },
    dealResponse(response) {
      this.$message({
        message: "Get " + response.status + " from server",
        type: 'error'
      });
    },
    dealError(error) {
      if(error.response) {
        this.$message({
          message: 'Get ' + error.response.status + " from server",
          type: 'error'
        });
      } else if (error.request) {
        this.$message({
          message: "Request without response",
          type: 'error'
        });
      } else {
        this.$message({
          message: "Request sending failed",
          type: 'error'
        })
      }
      console.log(error);
    }
  }
}
</script>

<style scoped>

</style>