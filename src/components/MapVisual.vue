<template>
  <div id = "root">
  <el-container>
    <el-aside :width="isCollapseLeft ? '0px':'350px'" id = "asideLeft">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="RealTime Panel" name="first">
          <el-form>
            <el-form-item label="Date">
              <el-date-picker v-model="realTimeDate"  type="date"  placeholder="Select Date">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Time"> Real-time bus data will update over time </el-form-item>
            <div id="clockContainer">
              <flip-clock/>
            </div>
            <el-form-item>
              <el-button @click="startDisplayVehicles">start</el-button>
              <el-button @click="stopDisplayVehicles">stop</el-button>
              <el-button @click="clearDisplayVehicles">clear</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Routes Analysis Panel" name="second">
          <el-form label-width="30px" :label-position="labelPosition" id="form">
            <el-form-item label="Time">
<!--              TODO 设置默认的时间，如107，所有的显示按照这个日期来-->
              <el-date-picker v-model="timeSpan" type="daterange" start-placeholder = "Start" end-placeholder= "End" :default-time="['00:00:01','23:59:59']" ></el-date-picker>
              <el-button class="btn" @click="clearTimeSpan">clear</el-button>
              <el-button class="btn" @click="setTimeSpan">SetTimeSpan</el-button>
<!--              TODO 按钮的方法和显示的label需要修改，应该改为showAll-->
              <el-button class="btn" @click="displayOriginTrips_Canvas">Origin</el-button>
            </el-form-item>
            <el-form-item label="RouteId">
              <el-select v-model="curRouteId" placeholder="Select RouteId" @change="listTrips">
                <el-option
                    v-for="item in routeIdOptions"
                    :key="item.routeId"
                    :label="item.routeId"
                    :value="item.routeId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="TripId">
              <el-select v-model="curTripId" placeholder="Select TripId" >
                <el-option
                    v-for="item in tripIdOptions"
                    :key="item.tripId"
                    :label="item.tripId"
                    :value="item.tripId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="showOneTrajectory">Select</el-button>
            </el-form-item>
            <el-form-item id="lastItem">
              <el-table :data="stopData" height="350">
                <el-table-column
                    prop="stopId"
                    label="stopId">
                </el-table-column>
                <el-table-column
                    prop="stopName"
                    label="stopName">
                </el-table-column>
                <el-table-column
                    prop="arrivalTime"
                    label="arrivalTime">
                </el-table-column>
                <el-table-column
                    prop="departureTime"
                    label="departureTime">
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-aside>
    <el-container>
      <el-container height="100%">
        <el-main>
          <el-button class="toggleButton" @click="toggleCollapseLeft" :icon="isCollapseLeft ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"> </el-button>
          <div id="map_container">
            <div id="legend" ref="mapLegend"></div>
            <div id="baiduMap" ></div>
              <div id="detailWindow" ref="detailWindow">
                <div id="infoWindow">
                  <i id="closeButton" class="el-icon-close" @click="hiddenDetailWindow"></i>
                  <BusSpeed_Chart v-bind:cur-vehicle = "curVehicle" ref="speedChart"></BusSpeed_Chart>
                </div>
                <div id="detailTail"></div>
              </div>
          </div>
          <el-button id = 'toggleRight' class="toggleButton" @click="toggleCollapseRight" :icon="isCollapseRight ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"> </el-button>
        </el-main>
        <el-aside :width="isCollapseRight ? '0px':'350px'" id = "asideRight">
          <BusTime_Chart></BusTime_Chart>
        </el-aside>
      </el-container>
      <el-footer height="260px">
        <el-container>
<!--          <div style="width: 50%; height: 300px">-->
<!--            <BusSpeed_Chart></BusSpeed_Chart>-->
<!--          </div>-->
          <div style="width: 100%; height: 260px">
            <BusStay_Chart></BusStay_Chart>
          </div>
        </el-container>
      </el-footer>
    </el-container>
  </el-container>
  </div>
</template>

<script>
/* eslint-disable */
import {mapStyle} from '../../public/map.js';
import * as zrender from 'zrender';
import FlipClock from 'kuan-vue-flip-clock';
import {MP} from '../../public/map.js';
import {CanvasLayer} from "../../public/CanvasLayer.js";
import BusStay_Chart from "@/components/BusStay_Chart";
import BusTime_Chart from "@/components/BusTime_Chart";
import BusSpeed_Chart from "@/components/BusSpeed_Chart";
export default {
  name: "MapVisual",
  components: {FlipClock, BusStay_Chart, BusTime_Chart, BusSpeed_Chart},
  data() {
    return {
      ak: 'wS6oFNUtxQkjV7NsMd5iyNn2ydw2XlmE',
      activeName: 'first',
      trajData: {
        trajectories: [],
        weights: [],
        totalPoints: []
      },
      map: {},
      timeSpan: [],
      stopData: [],
      labelPosition: 'top',
      routeIdOptions: [],
      tripIdOptions: [],
      visualVehicles: {
        vehicleIds: [],
        vehicleInfos: [],
        bearings: [],
        points: [],
        speeds: [],
      },
      mapVOptions: {
        mapv_bus_line_light_green: {
          strokeStyle: 'rgb(30,200,81,0.7)',
          shadowColor: 'rgb(32,57,31)',
          shadowBlur: 3,
          lineWidth: 5.0,
          draw: 'simple',
        },
        mapv_option_stop: {
          fillStyle: 'rgba(255, 250, 250, 1)',
          size: 3,
          label: {
            show: true
          },
          draw: 'simple',
        },
        mapv_option_dot_animation: {
          zIndex: 3,
          fillStyle: 'rgba(255, 250, 250, 1)',
          //coordType: 'bd09mc',
          globalCompositeOperation: "lighter",
          size: 1.5,
          animation: {
            type: 'time',
            stepsRange: {
              start: 0,
              end: 400
            },
            trails: 3,
            duration: 25,  //update every 8 seconds
          },
          draw: 'simple'
        }
      },
      mapLayers: {
        lineLayer: null,
        stopLayer: null,
        canvasLayerLine: null,
        canvasLayerPointer: null,
        canvasLayerBack: null,
        canvasLayerBusVehicle: null,
      },
      curRouteId: '',
      curTripId: '',
      isCollapseLeft: false,
      isCollapseRight: false,
      timer: undefined,
      curVehicle: {
        curVehiclePoint: undefined,
        curVehicleInfo: {
          vehicleId: "",
          routeId: "",
          agencyId: "",
          nextStop: "",
          speed: 0.0
        },
        curVehicleSpeedList:[],
      },
      realTimeDate: '2022-01-01',
      realTimeTime: '18:00:00',
    }
  },
  async mounted() {
    let _this = this;
    await MP(_this.ak);
    _this.$nextTick(() => {
      setTimeout(() => {
        _this.initMap();
      }, 500);
    });
    _this.showLegend();
  },
  computed: {},
  methods: {
    showLegend() {
      let canvas = this.$refs.mapLegend;
      let zr = zrender.init(canvas);
      let legendData = [
        {
          label: ">=45",
          color: 'rgb(23,128,31)'
        },
        {
          label: "30-45",
          color: 'rgb(52,186,7)'
        },
        {
          label: "20-30",
          color: 'rgb(114,233,23)'
        },
        {
          label: "10-20",
          color: 'rgb(255,179,22)'
        },
        {
          label: "5-10",
          color: 'rgb(238,75,48)'
        },
        {
          label: "<=5km/h",
          color: 'rgb(201,28,28)'
        }
      ]
      let interval = 25;
      for (let i = 0, len = legendData.length; i < len; i ++) {
        let circle = new zrender.Circle({
          shape: {
            cx: 20,
            cy: 20+i * interval,
            r: 10,
          },
          style: {
            fill: legendData[i].color
          }
        });
        zr.add(circle);
        let txt = new zrender.Text({
          style: {
            textFill: "rgb(0,0,0)",
            text: legendData[i].label,
            fontSize: 12,
          },
          position:[35, i*interval + 17]
        });
        zr.add(txt);
      }
    },
    /**
     * @description clear TimeSpan
     */
    clearTimeSpan() {
      this.timeSpan = [];
      this.clearAll();
      this.displayOriginTrips_Canvas();
    },
    /**
     * @description toggle asideLeft
     */
    toggleCollapseLeft() {
      this.isCollapseLeft = !this.isCollapseLeft;
      if (this.isCollapseLeft === true) {
        document.getElementById('asideLeft').style.marginLeft = "0";
        document.getElementById('asideLeft').style.marginRight = "0";
      } else {
        document.getElementById('asideLeft').style.marginLeft = "10px";
        document.getElementById('asideLeft').style.marginRight = "10px";
      }
    },
    /**
     * @description toggle asideRight
     */
    toggleCollapseRight() {
      this.isCollapseRight = !this.isCollapseRight;
      if (this.isCollapseRight === true) {
        document.getElementById('asideRight').style.marginLeft = "0";
        document.getElementById('asideRight').style.marginRight = "0";
      } else {
        document.getElementById('asideRight').style.marginLeft = "10px";
        document.getElementById('asideRight').style.marginRight = "10px";
      }
    },
    /**
     * @description get RandomInt between min, max
     * @param min
     * @param max
     * @returns {*}
     */
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    /**
     * @description init the map
     * 1. init the baidu map component
     * 2. set the map style
     * 3. display the origin trajectory
     */
    async initMap() {
      let _this = this;
      _this.map = new BMap.Map("baiduMap", {
        enableMapClick: false
      });
      _this.map.setMapStyle({style: "light"});
      _this.map.centerAndZoom(new BMap.Point(-73.88601, 40.880624), 13); //set map center and zoom
      _this.map.enableScrollWheelZoom(true);

      ["dragging", "dragstart", "dragend", "zoomstart", "zoomend"].forEach(
          function (item) {
            _this.map.addEventListener(item, () => {
              if(_this.$refs.detailWindow.style.display === 'block') {
                _this.setDetailWindowPosition();
              }
            })
          }
      )

      const navigation = new BMap.NavigationControl({ //init the navigation
        anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
        type: BMAP_NAVIGATION_CONTROL_SMALL
      });
      _this.listAllRoutesIdOption();
      _this.map.addControl(navigation); //add navigation control to map
      await _this.displayOriginTrips_Canvas(); //canvas Layer for route
      await _this.displayVehicle_Canvas(); //canvas Layer for busVehicle
    },
    async displayVehicle_Canvas() {
      this.$message({
        message: 'Loading the real-time bus position',
        type: 'success'
      });
      let _this = this;
      await _this.updateVehicleData();
      _this.timer = setInterval(this.updateVehicleData, 1000*60);
      _this.mapLayers.canvasLayerBusVehicle = new CanvasLayer({
        map: _this.map,
        update: _this.updateCanvasBusVehicle,
        zIndex: 5 //make sure the layer's index is high enough to trigger the mouse methods
      });
    },
    /**
     * @description display origin trajectories of every Route
     * by canvas
     */
    async displayOriginTrips_Canvas() {
      this.$message({
        message: 'Loading the routes',
        type: 'success'
      });
      let _this = this;
      var routes = [];
      _this.trajData.trajectories = [];
      _this.trajData.totalPoints = [];
      /**
       * @get, url: /mapv/origin
       * @dataType List<RoutesVo>
       */
      await this.$axios.get('/mapv/origin').then(response => {
        if (response && response.status === 200) {
          routes = response.data;
          //Foreach route
          routes.forEach(route => {
            _this.trajData.trajectories.push(route.trajJsonModel);
          });
          //CanvasLayer color to display the speed of points
          let maxLength = _this.trajData.trajectories.length;
          for (let k = 0; k < maxLength; k++) {
            let pointsList = [];
            let tempList = _this.trajData.trajectories[k].geometry.coordinates;
            for (let i = 0; i < tempList.length; i++) {
              let bp = new BMap.Point(tempList[i][0], tempList[i][1]);
              pointsList.push(bp);
            }
            _this.trajData.totalPoints.push(pointsList);
            let weightList = [];
            for (let i = 0; i < pointsList.length; i += 1) {
              weightList.push(Math.random() * 100);
            }
            _this.trajData.weights.push(weightList);
          }
        } else _this.dealResponse(response);
      }).catch(error => {
        _this.dealError(error);
      });

      _this.mapLayers.canvasLayerLine = new CanvasLayer({
        map: _this.map,
        update: _this.updateCanvasLine
      });

    },
    /**
     * @description triggered when set timespan, list and display by timespan
     */
    setTimeSpan() {
      // this.displayTripsByTimeSpan();
      this.listRoutesIdOptionByTimeSpan();
    },
    /**
     * @description display route's trip by timespan
     */
    displayTripsByTimeSpan() {
      this.stopDisplayVehicles();
      let _this = this;
      _this.clearAll();
      _this.trajData.trajectories = [];
      let routes = [];
      /**
       * @get, url = '/mapv/timespan/?startDate={startDate}&endDate={endDate}'
       * @dataType List<RoutesVo>
       */
      this.$axios.get('/mapv/timespan/?startDate=' + _this.timeSpan[0].toLocaleDateString().replaceAll('/', '-')
          + '&endDate=' + _this.timeSpan[1].toLocaleDateString().replaceAll('/', '-')).then(response => {
        if(response && response.status === 200) {
          routes = response.data;
          //push each Route to trajetories
          routes.forEach(route => {
            _this.trajData.trajectories.push(route.trajJsonModel);
          });
          //check the routes
          if (routes.length === 0) {
            this.$message({
              message: 'The Bus Service List In This TimeSpan is Empty',
              type: 'warning'
            });
            return;
          }
          _this.displayMapvLineLayer();
        } else _this.dealResponse(response);
      }).catch(error => {
        _this.dealError(error);
      });
    },
    /**
     * @description list all RoutesId Option for
     */
    listAllRoutesIdOption() {
      let _this = this;
      /**
       * @get, url = '/routes'
       * @dataType List<RoutesEntity>
       */
      this.$axios.get('/routes').then(response => {
        if(response && response.status === 200)
          _this.routeIdOptions = response.data;
        else _this.dealResponse(response);
      }).catch(error => {
        _this.dealError(error);
      });
    },
    /**
     *@description list RoutesId option by timespan
     */
    listRoutesIdOptionByTimeSpan() {
      let _this = this;
      /**
       * @get, url = '/routes/timespan?startDate={startDate}&endDate={endDate}' YYYY-mm-dd
       * @dataType List<RoutesEntity>
       */
      this.$axios.get('/routes/timespan?startDate=' + _this.timeSpan[0].toLocaleDateString().replaceAll('/', '-')
          + '&endDate=' + _this.timeSpan[1].toLocaleDateString().replaceAll('/', '-')).then(response => {
            if(response && response.status === 200)  _this.routeIdOptions = response.data;
            else _this.dealResponse(response);
      }).catch(error =>{
        _this.dealError(error);
      });
    },
    /**
     * @description list trips options
     * by timespan or not
     */
    listTrips() {
      if (this.timeSpan.length === 0) { // if set timespan
        this.listTripsByRouteId();
      } else { //if not set timespan
        this.listTripsByRouteIdAndTimeSpan();
      }
    },
    /**
     * @description list trips option by route id
     */
    listTripsByRouteId() {
      let _this = this;
      /**
       * @get, url = '/trips?routeId={routeId}'
       * @dataType List<TripsEntity>
       */
      this.$axios.get('/trips?routeId=' + _this.curRouteId).then(response => {
        if(response && response.status === 200) _this.tripIdOptions = response.data;
        else _this.dealResponse(response);
      }).catch(error => {
        _this.dealError(error);
      });
    },
    /**
     * @description list trips options by routeid and timespan
     */
    listTripsByRouteIdAndTimeSpan() {
      let _this = this;
      /**
       * @get, url = '/trips/timespan?routeId={routeId}&startDate={startDate}&endDate{endDate}' YYYY-mm-dd
       * @datatype List<TripsEntity>
       */
      this.$axios.get('/trips/timespan?routeId=' + _this.curRouteId
          + '&startDate=' + _this.timeSpan[0].toLocaleDateString().replaceAll('/', '-')
          + '&endDate=' + _this.timeSpan[1].toLocaleDateString().replaceAll('/', '-')).then(response => {
            if(response && response.status === 200) _this.tripIdOptions = response.data;
            else _this.dealResponse(response);
      }).catch(error => {
        _this.dealError(error);
      });
    },
    /**
     * @description get one trajectory by routeId and tripId
     */
    displayOneTrajectory() {
      let _this = this;
      _this.trajData.trajectories = [];
      _this.trajData.totalPoints = [];
      _this.trajData.stopData = [];
      //Warning message
      if (_this.curRouteId === "") {
        this.$message({
          message: 'Please Check the RouteId is Selected',
          type: 'warning'
        });
        return;
      }
      if (_this.curTripId === "") {
        this.$message({
          message: 'Please Check the TripId is Selected',
          type: 'warning'
        });
        return;
      }
      /**
       * @get, url = '/mapv/?routeId={routeId}&tripId={tripId}'
       * @dataType RoutesVo
       */
      this.$axios.get('/mapv/?routeId=' + _this.curRouteId + "&tripId=" + _this.curTripId).then(response => {
        if (response && response.status === 200) {
          _this.trajData.trajectories.push(response.data.trajJsonModel);
          //warning message
          if (_this.trajData.trajectories[0].geometry.coordinates.length === 0) {
            this.$message({
              message: 'Please Check Matched RouteId and TripId are selected',
              type: 'error'
            });
            return;
          }
          this.$message({
            message: 'The selected trajectory is loading, please wait',
            type: 'success'
          });
          let dataSet = new mapv.DataSet(_this.trajData.trajectories);
          let curGeometry = _this.trajData.trajectories[0].geometry;
          let centerPoint = new BMap.Point(curGeometry.coordinates[0][0], curGeometry.coordinates[0][1]);
          _this.map.centerAndZoom(centerPoint, 14);
          _this.mapLayers.lineLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapVOptions.mapv_bus_line_light_green);

          let pointsList = [];
          for (let i = 0; i < curGeometry.coordinates.length; i++) {
            let bp = new BMap.Point(curGeometry.coordinates[i][0], curGeometry.coordinates[i][1]);
            pointsList.push(bp);
          }
          _this.trajData.totalPoints.push(pointsList);
          //init CanvasLayers
          // _this.mapLayers.canvasLayerBack = new CanvasLayer({
          //   map: _this.map,
          //   update: _this.updateCanvasBack
          // });
          // _this.mapLayers.canvasLayerLine = new CanvasLayer({
          //   map: _this.map,
          //   update: _this.updateCanvasLine
          // });
          _this.mapLayers.canvasLayerPointer = new CanvasLayer({
            map: _this.map,
            update: _this.updateCanvasPointer
          });
        } else _this.dealResponse(response);
      }).catch((error) => {
        _this.dealError(error);
      });
      /**
       * @get, url = '/stops/?tripId={tripId}'
       * @dataType List<StopsVo>
       */
      this.$axios.get('/stops/?tripId=' + _this.curTripId).then(response => {
        if (response && response.status === 200) {
          let tempStopData = response.data;
          //process stop data to geometry
          for (let i = 0; i < tempStopData.length; i++) {
            _this.trajData.stopData.push({
              geometry: {
                type: "Point",
                coordinates: [tempStopData[i].stopLon, tempStopData[i].stopLat]
              }
            });
          }
          let dataSet = new mapv.DataSet(_this.trajData.stopData);
          _this.mapLayers.stopLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapVOptions.mapv_option_stop);
        } else _this.dealResponse(response);
      }).catch((error) => {
        _this.dealError(error);
      });
    },
    /**
     * @description display mapV layers
     * 1. mapV linelayer
     * 2. mapV animationLayer (X)
     */
    displayMapvLineLayer() {
      let _this = this;
      let dataSet = new mapv.DataSet(_this.trajData.trajectories); //set dataSet
      _this.mapLayers.lineLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapVOptions.mapv_bus_line_light_green); // set the layer
    },
    /**
     * @description show one route's trajectory
     * 1. clear the map
     * 2. show the trajectory
     */
    showOneTrajectory() {
      this.$message({
        message: "Clear and Stop the real-time bus data update",
        type: "warning"
      });
      if(this.visualVehicles.vehicleIds.length !== 0) {
        this.clearDisplayVehicles();
        this.stopDisplayVehicles();
      }
      this.clearAll();
      this.displayOneTrajectory();
    },
    /**
     * @description clear all the overlays of map
     */
    clearAll() {
      let _this = this;
      _this.map.clearOverlays();
      if (_this.mapLayers.lineLayer != null) {
        _this.mapLayers.lineLayer.destroy();
        _this.mapLayers.lineLayer = null;
      }
      if (_this.mapLayers.stopLayer != null) {
        _this.mapLayers.stopLayer.destroy();
        _this.mapLayers.stopLayer = null;
      }
      if (_this.mapLayers.canvasLayerLine != null) {
        _this.mapLayers.canvasLayerLine = null;
      }
      if (_this.mapLayers.canvasLayerBack != null) {
        _this.mapLayers.canvasLayerBack = null;
      }
      if (_this.mapLayers.canvasLayerBack != null) {
        _this.mapLayers.canvasLayerBack = null;
      }
      if (_this.mapLayers.canvasLayerBusVehicle != null) {
        _this.mapLayers.canvasLayerBusVehicle = null;
      }
    },
    updateCanvasBusVehicle() {
      let that = this;
      let _this = this.mapLayers.canvasLayerBusVehicle;
      if (!_this.zr) {
        _this.zr = zrender.init(_this.canvas);
      } else {
        _this.zr.clear();
      }
      _this.zr.resize(); //solve the offset caused by dragging or zooming the map
      //data prepare Test
      let points = that.visualVehicles.points;
      let weights = that.visualVehicles.speeds;
      let bearings = that.visualVehicles.bearings;
      let infos = that.visualVehicles.vehicleInfos;
      for (let k = 0; k < weights.length; k ++) {
        const pixel = that.map.pointToPixel(points[k]);
        let circle = new zrender.Circle({
          shape: {
            cx: pixel.x,
            cy: pixel.y,
            r: 10
          },
          style: {
            fill: that.getVehicleColor(weights[k]),
            stroke: '#faf9f9'//'#2e2d2d'
          },
          onclick: async function () {
            that.$message({
              message: 'Loading the detailWindow',
              type: 'success'
            });
            that.curVehicle.curVehiclePoint = points[k];
            that.curVehicle.curVehicleInfo = infos[k];
            await that.curVehicleChartPrepare(k);
            that.$refs.speedChart.updateSpeedChartVehicleData();
            that.showDetailWindow();
            that.setDetailWindowPosition();
          }
        });
        _this.zr.add(circle);
        // Render arrows according to render pixel distance
        // Pointer length
        const pointerLong = 8;
        const res = that.generateBusVehiclePointer(pointerLong, pixel, bearings[k], 45);
        const aPixel = res.aPixel; //set arrow point
        const bPixel = res.bPixel;
        const midPixel = res.midPixel;
        let line1 = new zrender.Polyline({
          shape: {
            points: [
              [aPixel.x, aPixel.y],
              [midPixel.x, midPixel.y],
              [bPixel.x, bPixel.y],
            ]
          },
          style: {
            stroke: '#000000',
            lineWidth: 2,
          }
        });
        _this.zr.add(line1);
      }
    },
    removeOneVehicle(tempIdx) {
      this.visualVehicles.vehicleIds.splice(tempIdx,1);
      this.visualVehicles.bearings.splice(tempIdx,1);
      this.visualVehicles.speeds.splice(tempIdx,1);
      this.visualVehicles.vehicleInfos.splice(tempIdx,1);
      this.visualVehicles.points.splice(tempIdx,1);
    },
    async curVehicleChartPrepare(k) {
      let _this = this;
      let vehicleId = _this.visualVehicles.vehicleIds[k];
      _this.curVehicle.curVehicleInfo = _this.visualVehicles.vehicleInfos[k];
      await _this.$axios.get("/realTime/speed/?vehicleId=" + vehicleId + "&curTime=" + _this.realTimeDate + " " + _this.realTimeTime).then((response) => {
        if (response && response.status === 200) { //last seven days
          _this.curVehicle.curVehicleSpeedList = response.data;
        } else _this.dealResponse(response);
      }).catch(error=>{
        _this.dealError(error);
      });
    },
    generateBusVehiclePointer(lineLong, pixel, bearing, theta) {
      const aPixel = {};
      const bPixel = {};
      const midPixel = {};
      let angle = bearing + 90;
      let angle1 = (angle + theta) * Math.PI / 180;
      let angle2 = (angle - theta) * Math.PI / 180
      midPixel.x = pixel.x - Math.cos(angle * Math.PI / 180)*lineLong/2;
      midPixel.y = pixel.y - Math.sin(angle * Math.PI / 180)*lineLong/2;
      aPixel.x = Math.cos(angle1)*lineLong + midPixel.x;
      aPixel.x = Math.cos(angle1)*lineLong + midPixel.x;
      aPixel.y = Math.sin(angle1)*lineLong + midPixel.y;
      bPixel.x = Math.cos(angle2)*lineLong + midPixel.x;
      bPixel.y = Math.sin(angle2)*lineLong + midPixel.y;
      return {aPixel, bPixel, midPixel};
    },
    async updateVehicleData() {
      let _this = this;
      let now = new Date();
      _this.realTimeTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      let curTime = _this.realTimeDate + ' ' + _this.realTimeTime;
      let curTimeDate = new Date(curTime);
      let DELETEBEFORE = 5*1000*60;
      await _this.$axios.get('/realTime/?curTime=' + _this.realTimeDate + ' ' + _this.realTimeTime).then((response) => {
        if(response && response.status === 200) {
          let realTimeVehicleList = response.data;
          realTimeVehicleList.forEach((realTimeVehicle) => { // {point speed}
            let tempVehicle = realTimeVehicle.point;
            let tempSpeed = window.isNaN(realTimeVehicle.speed) ? 0 : realTimeVehicle.speed.toFixed(2);
            if(_this.visualVehicles.vehicleIds.indexOf(tempVehicle.vehicleId) === -1) { //not exist
              _this.visualVehicles.vehicleIds.push(tempVehicle.vehicleId);
              _this.visualVehicles.speeds.push(tempSpeed);
              _this.visualVehicles.points.push(new BMap.Point(tempVehicle.lon, tempVehicle.lat));
              _this.visualVehicles.bearings.push(tempVehicle.bearing);
              _this.visualVehicles.vehicleInfos.push({routeId: tempVehicle.routeId, agencyId: tempVehicle.agencyId,
                nextStop: tempVehicle.nextStop, speed: tempSpeed, recordedTime: tempVehicle.recordedTime, vehicleId: tempVehicle.vehicleId});
            } else {
              let curVIdx = _this.visualVehicles.vehicleIds.indexOf(tempVehicle.vehicleId);
              //remove the vehicle already arrival the end
              if(tempVehicle.nextStop === "") _this.removeOneVehicle(curVIdx);
              else {
                _this.visualVehicles.points[curVIdx] = new BMap.Point(tempVehicle.lon, tempVehicle.lat);
                _this.visualVehicles.bearings[curVIdx] = tempVehicle.bearing;
                _this.visualVehicles.speeds[curVIdx] = tempSpeed;
                _this.visualVehicles.vehicleInfos[curVIdx] = {routeId: tempVehicle.routeId, agencyId: tempVehicle.agencyId,
                  nextStop: tempVehicle.nextStop, speed: tempSpeed, recordedTime: tempVehicle.recordedTime, vehicleId: tempVehicle.vehicleId}
              }
            }
          });
          //remove the vehicle not update with past 5 minutes
          _this.visualVehicles.vehicleIds.forEach((curVehicle) => {
            let tempVIdx = _this.visualVehicles.vehicleIds.indexOf(curVehicle);
            let recordTime = new Date(_this.visualVehicles.vehicleInfos[tempVIdx].recordedTime);
            if(curTimeDate.getTime() - recordTime.getTime() >= DELETEBEFORE) _this.removeOneVehicle(tempVIdx);
          });
        } else _this.dealResponse(response);
      }).catch(error=>{
        _this.dealError(error);
      });
      if(_this.mapLayers.canvasLayerBusVehicle != null) _this.updateCanvasBusVehicle();
    },
    calSpeed(curTime, curPoint, lastTime, lastPoint) {
      if(curTime === lastTime)  return 0;
      else {
        let dist = this.calDistance(curPoint, lastPoint);
        let date1 = new Date(lastTime);
        let date2 = new Date(curTime);
        let speed = dist / (date2.getTime() - date1.getTime()) * 1000; // m/s
        return Math.round(speed * 3.6); //km/h
      }
    }
    ,
    calDistance(curPoint, lastPoint) {
      /** 计算两经纬度之间的距离，单位是m
       * approx distance between two points on earth ellipsoid
       */
      function getGreatCircleDistance(lat1,lng1,lat2,lng2){
        const PI = Math.PI;
        const EARTH_RADIUS = 6378.137; //km
        function getRad (d) {
          return d * PI / 180.0;
        }
        let radLat1 = getRad(lat1);
        let radLat2 = getRad(lat2);
        let a = radLat1 - radLat2;
        let b = getRad(lng1) - getRad(lng2);
        let s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
        s = s*EARTH_RADIUS;
        s = Math.round(s*10000)/10000.0;
        return s*1000; //m
      }
      return getGreatCircleDistance(curPoint.lat, curPoint.lng, lastPoint.lat, lastPoint.lng);
    },
    /**
     * @description start the real time display
     */
    startDisplayVehicles() {
      if(this.timer !== null) {
        this.$message({
          message: 'Real-time bus data update has started',
          type: 'warning'
        });
        return;
      }
      this.$message({
        message: 'Real-time bus data update is starting, please wait',
        type: 'success'
      });
      if(this.mapLayers.canvasLayerBusVehicle != null) {
        this.updateVehicleData();
        this.updateCanvasBusVehicle();
      } else {
        this.displayVehicle_Canvas();
      }
    },
    /**
     * @description stop the real time display
     */
    stopDisplayVehicles() {
      this.$message({
        message: 'Stop real-time bus data updates',
        type: 'warning'
      });
      if(this.timer === null) {
        this.$message({
          message: 'Real-time bus data update has stopped',
          type: 'error'
        });
        return;
      }
      clearInterval(this.timer);
      this.timer = null;
    },
    clearDisplayVehicles() {
      this.$message({
        message: 'Bus point on the map is clearing, please wait',
        type: 'warning'
      });
      this.visualVehicles = {
        vehicleIds: [],
        vehicleInfos: [],
        bearings: [],
        points: [],
        speeds: [],
      };
      this.updateCanvasBusVehicle();
    },
    /**
     * @description updateCanvas Line
     * @for CanvasLayerLine
     */
    updateCanvasLine() {
      let _this = this;
      const ctx = _this.mapLayers.canvasLayerLine.canvas.getContext('2d'); //init
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear
      for (let k = 0; k < _this.trajData.totalPoints.length; k++) {
        let pointsList = _this.trajData.totalPoints[k];
        let weightList = _this.trajData.weights[k];
        if (pointsList.length !== 0) {
          for (let i = 0, len = pointsList.length; i < len - 2; i += 1) {
            //init pixels
            const pixel = _this.map.pointToPixel(pointsList[i]);
            const nextPixel = _this.map.pointToPixel(pointsList[i + 1]);
            ctx.beginPath();
            ctx.moveTo(pixel.x, pixel.y); // move to the start pixel
            ctx.lineCap = 'round';
            ctx.lineWidth = 3;
            //set gradient
            const grd = ctx.createLinearGradient(pixel.x, pixel.y, nextPixel.x, nextPixel.y);
            const nowValue = weightList[i]; //value weight
            const nextValue = weightList[i + 1];
            grd.addColorStop(0, _this.getTrajColorByValue(nowValue));
            grd.addColorStop(1, _this.getTrajColorByValue(nextValue));
            ctx.strokeStyle = grd;
            ctx.lineTo(nextPixel.x, nextPixel.y);
            ctx.stroke(); //to draw
          }
          // ctx.closePath();
        }
      }
    },
    /**
     * @description updateCanvas Pointer
     * @for CanvasLayerPointer
     */
    updateCanvasPointer() {
      let _this = this;
      const ctx = _this.mapLayers.canvasLayerPointer.canvas.getContext('2d'); //init
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear
      for (let k = 0; k < _this.trajData.totalPoints.length; k++) {
        let pointsList = _this.trajData.totalPoints[k];
        if (pointsList.length !== 0) {
          let pixelPart = 0;
          const pixelPartUnit = 40;
          for (let i = 0, len = pointsList.length; i < len - 1; i += 1) {
            //init pixels
            const pixel = _this.map.pointToPixel(pointsList[i]);
            const nextPixel = _this.map.pointToPixel(pointsList[i + 1]);
            pixelPart += (((nextPixel.x - pixel.x) ** 2) + ((nextPixel.y - pixel.y) **
                2)) ** 0.5;
            if (pixelPart <= pixelPartUnit) {
              // too close continue;
            }
            pixelPart = 0;
            ctx.beginPath();
            // Render arrows according to render pixel distance
            if (Math.abs(nextPixel.x - pixel.x) > 10 || Math.abs(nextPixel.y - pixel
                .y) > 10) {
              // An arrow needs five points:
              //    start point, end point, center point, arrow endpoint 1, and arrow endpoint 2
              const midPixel = new self.BMap.Pixel(
                  (pixel.x + nextPixel.x) / 2,
                  (pixel.y + nextPixel.y) / 2,
              );
              // distance of start and end
              const distance = (((nextPixel.x - pixel.x) ** 2) +
                  ((nextPixel.y - pixel.y) ** 2)) ** 0.5;
              // Pointer length
              const pointerLong = 4;
              const aPixel = _this.arrowPoint(pointerLong, midPixel, distance, nextPixel, pixel).aPixel; //set arrow point
              const bPixel = _this.arrowPoint(pointerLong, midPixel, distance, nextPixel, pixel).bPixel;
              ctx.moveTo(aPixel.x, aPixel.y);
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#eee';
              ctx.lineTo(midPixel.x, midPixel.y);
              ctx.lineTo(bPixel.x, bPixel.y);
              ctx.lineCap = 'round';
              ctx.stroke(); //to draw
            }
          }
        }
      }
    },
    /**
     * @description updateCanvas Back
     * @for CanvasLayerBack
     */
    updateCanvasBack() {
      let _this = this;
      const ctx = _this.mapLayers.canvasLayerBack.canvas.getContext('2d'); //init
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear
      for (let k = 0; k < _this.trajData.totalPoints.length; k++) {
        let pointsList = _this.trajData.totalPoints[k];
        if (pointsList.length !== 0) {
          for (let i = 0, len = pointsList.length; i < len - 2; i += 1) {
            //init pixels
            const pixel = _this.map.pointToPixel(pointsList[i]);
            const nextPixel = _this.map.pointToPixel(pointsList[i + 1]);
            ctx.beginPath();
            ctx.moveTo(pixel.x, pixel.y);
            ctx.lineWidth = 5 + 3;
            ctx.strokeStyle = '#8b8b89';
            ctx.lineTo(nextPixel.x, nextPixel.y);
            ctx.lineCap = 'round';
            ctx.stroke(); //to draw
          }
        }
      }
    },
    /**
     * @description set canvas color value
     * @param value
     * @returns {string}
     */
    getTrajColorByValue(value) {
      // if(value > 67) return '#bca8eb';
      // else if(value > 33) return '#61099b';//'#8c18da';
      // else return '#61099b';
      // if(value > 67) return '#a8d9eb';
      // else if(value > 33) return '#18a6da';
      // else return '#093f9b';
      if(value < 50) return "#ff8c35";
      else return "#f9d382"
      // if (value > 50) return "#DC143C";
      // else return "#1abd15";
    },
    /**
     * @description set the arrowPoint
     * @param pointerLong
     * @param midPixel
     * @param distance
     * @param nextPixel
     * @param pixel
     * @returns {{bPixel: {}, aPixel: {}}}
     */
    arrowPoint(pointerLong, midPixel, distance, nextPixel, pixel) {
      const aPixel = {}; //the coordinates of arrow endpoint 1
      const bPixel = {}; //the coordinates of arrow endpoint 2
      // calculation rules of coordinates
      // When The next x-coordinate is equal to the last coordinate
      if (nextPixel.x - pixel.x === 0) {
        //The next y-coordinate is greater than the last coordinate
        if (nextPixel.y - pixel.y > 0) {
          aPixel.x = midPixel.x - pointerLong * 0.5 ** 0.5;
          aPixel.y = midPixel.y - pointerLong * 0.5 ** 0.5;
          bPixel.x = midPixel.x + pointerLong * 0.5 ** 0.5;
          bPixel.y = midPixel.y - pointerLong * 0.5 ** 0.5;
        }
        // The next y-coordinate is less than the previous one
        else if (nextPixel.y - pixel.y < 0) {
          aPixel.x = midPixel.x - pointerLong * 0.5 ** 0.5;
          aPixel.y = midPixel.y + pointerLong * 0.5 ** 0.5;
          bPixel.x = midPixel.x + pointerLong * 0.5 ** 0.5;
          bPixel.y = midPixel.y + pointerLong * 0.5 ** 0.5;
        }
      }
      // The next X coordinate is not the same as the previous coordinate
      else {
        const k0 = (-(2 ** 0.5) * distance * pointerLong + 2 * (nextPixel.y - pixel.y) * midPixel.y) / (2 * (nextPixel.x - pixel.x)) + midPixel.x;
        const k1 = -((nextPixel.y - pixel.y) / (nextPixel.x - pixel.x));
        const a = k1 ** 2 + 1;
        const b = 2 * k1 * (k0 - midPixel.x) - 2 * midPixel.y;
        const c = (k0 - midPixel.x) ** 2 + midPixel.y ** 2 - pointerLong ** 2;
        aPixel.y = (-b + (b * b - 4 * a * c) ** 0.5) / (2 * a);
        bPixel.y = (-b - (b * b - 4 * a * c) ** 0.5) / (2 * a);
        aPixel.x = k1 * aPixel.y + k0;
        bPixel.x = k1 * bPixel.y + k0;
      }
      return {aPixel, bPixel}
    },
    generateBusVehiclePointer_TwoPixel(lineLong, pixel, lastPixel, theta) {
      const aPixel = {};
      const bPixel = {};
      const midPixel = {};
      let angle = Math.atan2(lastPixel.y - pixel.y, lastPixel.x -pixel.x)*180 / Math.PI;
      let angle1 = (angle + theta) * Math.PI / 180;
      let angle2 = (angle - theta) * Math.PI / 180
      midPixel.x = pixel.x - Math.cos(angle * Math.PI / 180)*lineLong/2;
      midPixel.y = pixel.y - Math.sin(angle * Math.PI / 180)*lineLong/2;
      aPixel.x = Math.cos(angle1)*lineLong + midPixel.x;
      aPixel.y = Math.sin(angle1)*lineLong + midPixel.y;
      bPixel.x = Math.cos(angle2)*lineLong + midPixel.x;
      bPixel.y = Math.sin(angle2)*lineLong + midPixel.y;
      return {aPixel, bPixel, midPixel};
    },
    getVehicleColor(weight) {
      if(weight > 45) return 'rgb(23,128,31)'
      else if(weight > 30) return  'rgb(52,186,7)';
      else if(weight > 20) return 'rgb(114,233,23)';
      else if(weight > 10) return 'rgb(255,179,22)';
      // else if (weight > 10) return 'rgb(247,112,42)';
      else if (weight > 5) return 'rgb(238,75,48)';
      else return 'rgb(201,28,28)';
    },
    /**
     *
     * @param tab
     * @param event
     */
    handleClick(tab, event) {
      console.log(tab, event);
    },
    showDetailWindow() {
      this.$refs.detailWindow.style.display = 'block';
    },
    setDetailWindowPosition() {
      //calculate the position
      let curPixel = this.map.pointToPixel(this.curVehicle.curVehiclePoint);
      let detailWindow = document.getElementById("detailWindow");
      let top = curPixel.y - detailWindow.offsetHeight - 30;
      let left = curPixel.x - detailWindow.offsetWidth / 2;
      //set the detailWindow Position
      this.$refs.detailWindow.style.top = (top) +  'px';
      this.$refs.detailWindow.style.left = (left) + 'px';
    },
    hiddenDetailWindow() {
      this.$refs.detailWindow.style.display = 'none';
      this.curVehicle.curVehiclePoint = undefined;
      this.curVehicle.curVehicleInfo = {
            vehicleId: "",
            routeId: "",
            agencyId: "",
            nextStop: "",
            speed: 0.0
      };
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
<style>
/* The container of BaiduMap must be set width & height. */
#baiduMap {
  margin: 0;
  width: 100%;
  height: 100%;
}
#map_container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow:hidden;
}
.el-form-item__label{
  font-weight: bold;
}
.btn {
  margin-top: 20px !important;
}
.toggleButton {
  position: absolute;
  margin-top: 45%;
  padding: 0 !important;
  bottom: 50%;
  height: 50px;
  width: 20px;
  z-index:10;
}
#toggleRight {
  right: 0;
}
.el-main {
  padding: 0 !important;
  Position: relative;
}
#root {
  height: 100%;
}
.el-container {
  height: 100%;
}
.el-aside {
  margin-left: 10px;
  margin-right: 10px;
  height: 100%;
  overflow:hidden;
}
#clockContainer {
  margin-bottom: 20px;
  margin-top: 20px;
}
#lastItem {
  margin-bottom: 0;
  max-height: 200px;
  height: 200px;
  overflow: hidden;
}
#asideRight {
  z-index: 15;
}

/*
baidu map infoWindow
*/
/*替换箭头*/
img[src="http://api.map.baidu.com/images/iw3.png"]{
  opacity:.0;
  margin-top: -692px !important;
  filter:alpha(opacity=70);
}
.BMap_pop .BMap_top{
  border:0!important;
}
.BMap_pop .BMap_center{
  border:0!important;
}
.BMap_pop .BMap_bottom{
  border:0!important;
}
.BMap_pop div:nth-child(3) div{
  border-radius:7px;
  border:0!important;
}
.BMap_pop div:nth-child(1){
  border-radius:7px 0 0 0;
  border:0!important;
}
.BMap_pop div:nth-child(5){
  border-radius:0 0 0 7px;
  background:transparent!important;
  border:0!important;
}
.BMap_pop div:nth-child(5) div{
  border-radius:7px;
}
.BMap_pop div:nth-child(7) div{
  border-radius:7px;
}
.BMap_bubble_content {
  width: 100% !important;
  height: 100% !important;
}
.BMap_bubble_content > div > div:nth-child(1) {
  width: 100% !important;
}
.BMap_bubble_content > div > div:nth-child(1) > canvas {
  width: 100% !important;
  height: 100% !important;
}
#legend {
  background-color: rgba(219, 219, 219, 0.5);
  border-radius: 5px;
  margin: 5px;
  position: absolute;
  bottom: 10px;
  right: 50px;
  height: 170px;
  width: 95px;
  z-index: 10;
}
#detailWindow {
  display: none;
  /*width: 390px;*/
  /*padding: 20px;*/
  background-color: white;
  height: 300px;
  position: absolute;
  /*overflow-y:scroll;*/
  /*overflow-x:hidden;*/
  top: 20px;
}
#infoWindow {
  overflow-y: scroll;
  overflow-x: hidden;
  /*margin: 20px;*/
  padding: 15px 20px 0 20px;
  width: 370px;
  height: 95%;;
}
#detailTail {
  /*display: none;*/
  border-style: solid;
  border-width: 15px 15px 15px 15px;
  border-color: white transparent transparent transparent;
  width: 0;
  height: 0;
  position: absolute;
  left: 45%;
  bottom: -30px;
}
#closeButton {
  position: relative;
  left: 329px;
}
.el-table th.el-table__cell>.cell{
  font-size: 12px;
}
.anchorBL{display:none;}
</style>




