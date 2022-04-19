<template>
  <div id="BusTrip_Chart"></div>
</template>

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
  "rgba(106,156,135,0.2)",
  "rgba(103, 180, 202,0.2)",
  "rgb(88,136,103,0.2)",
  "rgba(135,159,81,0.2)",
  "rgba(166,165,36,0.2)",
  "rgb(55,147,59,0.2)",
]
export default {
  name: "BusTrip_Chart.vue",
  data() { return{
    BusTrip_Chart: null,
    tripsInfo: [],
    tripsId: [],
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
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let _this = this;
      var chartDomTrip = document.getElementById('BusTrip_Chart');
      _this.BusTrip_Chart = echarts.init(chartDomTrip);
      _this.BusTrip_Chart.showLoading();
      let optionTrip = {
        title: {
          text: 'Bus Trip Chart',
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
          data: _this.tripsId,
          top: 20,
          left: 25
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
        series: _this.tripsInfo
      };
      _this.BusTrip_Chart.hideLoading();
      optionTrip && _this.BusTrip_Chart.setOption(optionTrip);
    },
    /**
     * @description update TripChart by tripList and date
     * @param tripList
     * @param date
     * @returns {Promise<void>}
     */
    async updateTripChart(tripList, date) {
      let _this = this;
      _this.$message({
        message:"The trips chart data is loading",
        type: "success"
      })
      _this.BusTrip_Chart.showLoading();
      await _this.tripDataPrepare(tripList, date);
      let option = _this.BusTrip_Chart.getOption();
      option.series = _this.tripsInfo;
      option.legend[0].data = _this.tripsId;
      _this.BusTrip_Chart.hideLoading();
      option && _this.BusTrip_Chart.setOption(option);
    },
    async tripDataPrepare(tripList, date) {
      let _this = this;
      if(tripList.length > 0) {
        /**
         * @get, url = "/realTime/tripSpeed"
         * @dataType List<SpeedDateVo>
         */
        await _this.$axios.post("/realTime/tripSpeed", {idList: tripList, dateStr: date}).then(response=>{
          if(response && response.status == 200) {
            let tripDataList = response.data;
            _this.tripsId = [];
            _this.tripsInfo = [];
            for(let ti = 0; ti < tripDataList.length; ti++) {
              let trip = tripDataList[ti];
              let tripInfo = {}
              tripInfo.name = trip.id;
              tripInfo.type = 'line';
              tripInfo.symbol ="none";
              tripInfo.areaStyle = {};
              tripInfo.smooth = true;
              tripInfo.emphasis = {focus: 'series'};
              tripInfo.data = [];
              tripInfo.color = colorList[ti];
              tripInfo.data = trip.speedList.map((speed)=>{
                return speed.toFixed(2);
              });
              _this.tripsId.push(trip.id);
              _this.tripsInfo.push(tripInfo);
            }
          } else _this.dealResponse(response);
        }).catch(error => {
          _this.dealError(error);
        })
      } else {
        _this.$message({
          message: "No route is chosen",
          type: "warning"
        })
      }
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
#BusTrip_Chart {
  height: 100%;
  width: 700px;
  margin-left: 700px;
  margin-top: -260px;
}
</style>