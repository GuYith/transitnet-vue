<template>
  <div id = "root">
  <el-container>
    <el-aside :width="isCollapseLeft ? '0px':'350px'" id = "asideLeft">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="Routes Analysis Panel" name="first">
          <el-form label-width="30px" :label-position="labelPosition" id="form">
            <el-form-item label="Time">
              <el-date-picker v-model="timeSpan" type="daterange" start-placeholder = "Start" end-placeholder= "End" :default-time="['00:00:01','23:59:59']" ></el-date-picker>
              <el-button class="btn" @click="clearTimeSpan">clear</el-button>
              <el-button class="btn" @click="displayTripsByTimeSpan">SetTimeSpan</el-button>
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
              <el-button>Deselect</el-button>
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
        <el-tab-pane label="RealTime Panel" name="second">
          <div id="clockContainer">
            <flip-clock/>
          </div>
          <el-form>
            <el-form-item label="Time">
              <el-date-picker v-model="timeSpan" type="daterange" start-placeholder = "Start" end-placeholder= "End" :default-time="['00:00:01','23:59:59']" ></el-date-picker>
              <el-button class="btn" @click="clearTimeSpan2">clear</el-button> <!--TODO realTime set timeSpan -->
              <el-button class="btn" @click="displayTripsByTimeSpan2">SetTimeSpan</el-button>
            </el-form-item>
          </el-form>
          <el-button @click="startDisplayVehicles">start</el-button>
          <el-button @click="stopDisplayVehicles">stop</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-aside>
    <el-container>
      <el-container height="100%">
        <el-main>
          <el-button class="toggleButton" @click="toggleCollapseLeft" :icon="isCollapseLeft ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"> </el-button>
          <div id="map_container">
            <div id="baiduMap" ></div>
              <div id="detailWindow" ref="detailWindow">
                <div id="infoWindow">
                  <i id="closeButton" class="el-icon-close" @click="hiddenDetailWindow"></i>
                  <BusSpeed_Chart v-bind:curVehicleInfo = "curVehicleInfo"></BusSpeed_Chart>
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
import Vue from 'vue'
import {mapStyle} from '../../public/map.js';
import * as zrender from 'zrender';
import FlipClock from 'kuan-vue-flip-clock'
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
      trajectories: [],
      map: {},
      busMk: {},
      vehicleList: [],
      MapMkList: [],
      timeSpan: [],
      stopData: [],
      timesData: [],
      labelPosition: 'top',
      routeIdOptions: [],
      tripIdOptions: [],
      visualVehicle: {},
      mapv_bus_line_light_green: {
        strokeStyle: 'rgb(30,200,81,0.7)',
        shadowColor: 'rgb(32,57,31)',
        shadowBlur: 3,
        lineWidth: 3.0,
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
      },
      lineLayer: undefined,
      //TODO delete animationLayer related code
      animationLayer: undefined,
      //TODO how to match, destory StopLayer
      stopLayer: undefined,
      curRouteId: '',
      curTripId: '',
      timeList: [], //one route's timeList of Points
      weights: [],
      //TODO 统一所有的CanvasLayer 用zrender绘制
      canvasLayerLine: {},
      canvasLayerPointer: {},
      canvasLayerBack: {},
      canvasLayerBusVehicle: {},
      totalPoints: [],
      totoalVehicleInfo: [],
      isCollapseLeft: false,
      isCollapseRight: false,
      timer: undefined,
      //TODO use the real time data
      curVehiclePoint: undefined,
      curVehicleInfo: undefined,
    }
  },
  async mounted() {
    let _this = this;
    await MP(_this.ak);
    _this.$nextTick(() => {
      var timer = setTimeout(() => {
        _this.initMap();
      }, 500);
    });
  },
  computed: {},
  methods: {
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
      if (this.isCollapseLeft == true) {
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
      if (this.isCollapseRight == true) {
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
      _this.trajectories = []; //clear
      _this.curRouteId = ""; //clear
      _this.map = new BMap.Map("baiduMap", {
        enableMapClick: false
      });
      _this.map.setMapStyle({style: "light"});
      _this.map.centerAndZoom(new BMap.Point(-73.88601, 40.880624), 13); //set map center and zoom
      _this.map.enableScrollWheelZoom(true);

      ["dragging", "dragstart", "dragend", "zoomstart", "zoomend"].forEach(
          function (item) {
            _this.map.addEventListener(item, () => {
              if(_this.$refs.detailWindow.style.display == 'block') {
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
      // _this.displayOriginTrips_mapv();  // mapv Layer
      await _this.displayOriginTrips_Canvas(); //canvas Layer
      // _this.timer = setInterval(this.displayAllVehicleIdByTime, 1000);
      await _this.generateVisualVehicle();
      _this.canvasLayerBusVehicle = new CanvasLayer({
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
      let _this = this;
      var routes = [];
      _this.trajectories = [];
      _this.totalPoints = [];
      /**
       * @get, url: /mapv/origin
       * @dataType List<RoutesVo>
       */
      await this.$axios.get('/mapv/origin').then(response => {
        if (response && response.status == 200) {
          routes = response.data;
          //Foreach route
          _this.visualVehicle.vehicleInfos = []
          routes.forEach(route => {
            _this.trajectories.push(route.trajJsonModel);
            _this.visualVehicle.vehicleInfos.push({routeId: route.routeId, agencyId: route.agencyId})
          });
          //CanvasLayer color to display the speed of points
          let maxLength = _this.trajectories.length;
          for (let k = 0; k < maxLength; k++) {
            let pointsList = [];
            let tempList = _this.trajectories[k].geometry.coordinates;
            for (let i = 0; i < tempList.length; i++) {
              let bp = new BMap.Point(tempList[i][0], tempList[i][1]);
              pointsList.push(bp);
            }
            _this.totalPoints.push(pointsList);
            //TODO use real data
            let weightList = [];
            for (let i = 0; i < pointsList.length; i += 1) {
              weightList.push(Math.random() * 100);
            }
            _this.weights.push(weightList);
          }
        }
      }).catch(error => {
        console.log(error);
      });
      //init CanvasLayers
      // _this.canvasLayerBack = new CanvasLayer({
      //   map: _this.map,
      //   update: _this.updateCanvasBack
      // })
      _this.canvasLayerLine = new CanvasLayer({
        map: _this.map,
        update: _this.updateCanvasLine
      });
      // _this.canvasLayerPointer = new CanvasLayer({
      //   map: _this.map,
      //   update: _this.updateCanvasPointer
      // });
    },
    /**
     * @description display origin trajectories of every Route
     * by mapv
     */
    displayOriginTrips_mapv() {
      let _this = this;
      let routes = [];
      _this.trajectories = [];
      /**
       * @get, url: /mapv/origin
       * @dataType List<RoutesVo>
       */
      this.$axios.get('/mapv/origin').then(response => {
        routes = response.data;
        //Foreach route
        routes.forEach(route => {
          _this.trajectories.push(route.trajJsonModel);
        });
        _this.displayMapvLayer();
      }).catch(error => {
        console.log(error);
      });
    },
    /**
     * @description triggered when set timespan, list and display by timespan
     */
    setTimeSpan() {
      this.displayTripsByTimeSpan();
      this.listRoutesIdOptionByTimeSpan();
    },
    /**
     * @description display route's trip by timespan
     */
    displayTripsByTimeSpan() {
      let _this = this;
      _this.clearAll();
      _this.trajectories = [];
      let routes = [];
      /**
       * @get, url = '/mapv/timespan/?startDate={startDate}&endDate={endDate}'
       * @dataType List<RoutesVo>
       */
      this.$axios.get('/mapv/timespan/?startDate=' + _this.timeSpan[0].toLocaleDateString().replaceAll('/', '-')
          + '&endDate=' + _this.timeSpan[1].toLocaleDateString().replaceAll('/', '-')).then(response => {
        routes = response.data;
        //push each Route to trajetories
        routes.forEach(route => {
          _this.trajectories.push(route.trajJsonModel);
        });
        //check the routes
        if (routes.length == 0) {
          this.$message({
            message: 'The Bus Service List In This TimeSpan is Empty',
            type: 'warning'
          });
          return;
        }
        _this.displayMapvLayer();
      }).catch(error => {
        console.log(error);
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
        _this.routeIdOptions = response.data;
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
        _this.routeIdOptions = response.data;
      });
    },
    /**
     * @description list trips options
     * by timespan or not
     */
    listTrips() {
      if (this.timeSpan.length == 0) { // if set timespan
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
        _this.tripIdOptions = response.data;
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
        _this.tripIdOptions = response.data;
      });
    },
    /**
     * @description get one trajectory by routeId and tripId
     */
    getOneTrajectory() {
      let _this = this;
      _this.trajectories = [];
      _this.totalPoints = [];
      _this.stopData = [];
      _this.timesData = [];
      _this.dotData = [];
      //Warning message
      if (_this.curRouteId == "") {
        this.$message({
          message: 'Please Check the RouteId is Selected',
          type: 'warning'
        });
        return;
      }
      if (_this.curTripId == "") {
        this.$message({
          message: 'Please Check the TripId is Selected',
          type: 'warning'
        });
        return;
      }
      /**
       * @get, url = '/mapv/timeList?routeId={routeId}&tripId={tripId}'
       * @dataType List<Double>
       */
      this.$axios.get('/mapv/timeList?routeId=' + _this.curRouteId + "&tripId=" + _this.curTripId).then(response => {
        if (response && response.status == 200) {
          _this.timeList = response.data;
        }
      }).catch(error => {
        console.log(error);
      });
      /**
       * @get, url = '/mapv/?routeId={routeId}&tripId={tripId}'
       * @dataType RoutesVo
       */
      this.$axios.get('/mapv/?routeId=' + _this.curRouteId + "&tripId=" + _this.curTripId).then(response => {
        if (response && response.status == 200) {
          _this.trajectories.push(response.data.trajJsonModel);
          //warning message
          if (_this.trajectories[0].geometry.coordinates.length == 0) {
            this.$message({
              message: 'Please Check Matched RouteId and TripId are selected',
              type: 'error'
            });
            return;
          }
          this.$message({
            message: 'Please be patient, the map is loading',
            type: 'success'
          });
          var dataSet = new mapv.DataSet(_this.trajectories[0]);
          var centerPoint = new BMap.Point(_this.trajectories[0].geometry.coordinates[0][0], _this.trajectories[0].geometry.coordinates[0][1]);
          _this.map.centerAndZoom(centerPoint, 14);
          _this.lineLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapv_bus_line_light_green);
        }
      }).catch((error) => {
        console.log(error);
      });
      /**
       * @get, url = '/stops/?tripId={tripId}'
       * @dataType List<StopsVo>
       */
      this.$axios.get('/stops/?tripId=' + _this.curTripId).then(response => {
        if (response && response.status == 200) {
          _this.stopData = response.data;
          //process stop data to geometry
          for (var i = 0; i < _this.stopData.length; i++) {
            // _this.timesData.push({
            //   geometry: {
            //     type: "Point",
            //     coordinates: [_this.stopData[i].stopLon, _this.stopData[i].stopLat]
            //   },
            //   count: 1,
            //   time: i,
            // })
            _this.dotData.push({
              geometry: {
                type: "Point",
                coordinates: [_this.stopData[i].stopLon, _this.stopData[i].stopLat]
              }
            });
          }
          // var dataSet = new mapv.DataSet(_this.timesData)
          // _this.animationLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapv_option_dot_animation)

          //CanvasLayer color to display the speed of points
          let pointsList = [];
          for (let i = 0; i < _this.trajectories[0].geometry.coordinates.length; i++) {
            let bp = new BMap.Point(_this.trajectories[0].geometry.coordinates[i][0], _this.trajectories[0].geometry.coordinates[i][1]);
            pointsList.push(bp);
          }
          _this.totalPoints.push(pointsList);
          //TODO use real data
          let weightList = [];
          for (let i = 0; i < pointsList.length; i += 1) {
            weightList.push(Math.random() * 100);
          }
          _this.weights.push(weightList);
          //init CanvasLayers
          _this.canvasLayerBack = new CanvasLayer({
            map: _this.map,
            update: _this.updateCanvasBack
          });
          _this.canvasLayerLine = new CanvasLayer({
            map: _this.map,
            update: _this.updateCanvasLine
          });
          _this.canvasLayerPointer = new CanvasLayer({
            map: _this.map,
            update: _this.updateCanvasPointer
          });
          var dataSet = new mapv.DataSet(_this.dotData);
          _this.stopLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapv_option_stop);
        }
        _this.moveMkPoint();
        // _this.updateCanvasLine()
      }).catch((error) => {
        console.log(error);
      });
    },
    /**
     * @description display mapV layers
     * 1. mapV linelayer
     * 2. mapV animationLayer (light)
     */
    displayMapvLayer() {
      let _this = this;
      // let times = [];
      // let num = _this.trajectories.length;
      // for (let k = 0; k < num; k++){
      //   let traj = _this.trajectories[k];
      //   let coordsArr = traj.geometry.coordinates;
      //   let i;
      //   let random1 = _this.getRandomInt(0,20);
      //   let random2 = 10;
      //   if (k < num / 2) {
      //     for (i = 0; i < coordsArr.length; i++) {
      //       times.push({
      //         geometry: {
      //           type: 'Point',
      //           coordinates: [coordsArr[i][0], coordsArr[i][1]]
      //         },
      //         count: 1,
      //         time: i+random1
      //       });
      //     }
      //   }else {
      //     let m = random2;
      //     for (i = coordsArr.length - 1; i >= 0; i--) {
      //       times.push({
      //         geometry: {
      //           type: 'Point',
      //           coordinates: [coordsArr[i][0], coordsArr[i][1]]
      //         },
      //         count: 1,
      //         time: m++
      //       });
      //     }
      //   }
      // }
      var dataSet = new mapv.DataSet(_this.trajectories); //set dataSet
      _this.lineLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapv_bus_line_light_green); // set the layer
      // var dataSet = new mapv.DataSet(times);
      // _this.animationLayer = new mapv.baiduMapLayer(_this.map, dataSet, _this.mapv_option_dot_animation);
    },
    /**
     * @description show one route's trajectory
     * 1. clear the map
     * 2. show the trajectory
     */
    showOneTrajectory() {
      this.clearTraject();
      this.getOneTrajectory();
    },
    /**
     * @description clear all the overlays of map
     */
    clearAll() {
      let _this = this;
      _this.map.clearOverlays();
      if (_this.lineLayer) {
        _this.lineLayer.destroy();
        _this.lineLayer = undefined;
      }
      // if (_this.animationLayer) {
      //   _this.animationLayer.destroy()
      //   _this.animationLayer = undefined
      // }
    },
    //TODO destroy
    /**
     * @description clear trajectories
     */
    clearTraject() {
      let _this = this;
      _this.map.clearOverlays();
      if (_this.lineLayer) {
        _this.lineLayer.destroy();
        _this.lineLayer = undefined;
      }
      // _this.stopLayer.destroy()
      // _this.stopLayer = undefined
      // }
    },
    /**
     * @description animation move the marker Point
     */
    moveMkPoint() {
      this.points = this.trajectories.geometry.coordinates;
      this.busMk = new BMap.Marker(new BMap.Point(this.points[0][this.points.length / 2], this.points[0][this.points.length / 2])); //init the busmarker
      this.map.addOverlay(this.busMk); // add overlay to map
      this.timer_is_on = true;
      this.resetMkPoint(0); // reset the Maker point position
    },
    /**
     * @description reset the Maker point position
     * @param i index of position
     */
    resetMkPoint(i) {
      let _this = this;
      if (!_this.timer_is_on) return; // a stop sign
      var point = new BMap.Point(_this.points[i][0], _this.points[i][1]);
      _this.busMk.setPosition(point);
      // _this.map.setCenter(point);
      if (i < _this.points.length) {
        setTimeout(function () {
          i++
          _this.resetMkPoint(i) //recursion
        }, parseInt(_this.timeList[i]));
      } else {
        _this.timer_is_on = false;
      }
    },
    /**
     * @description display all the vehicle by real time
     * @returns {Promise<void>}
     */
    async displayAllVehicleIdByTime() {
      let _this = this;
      var realTimeData;
      var curTime = new Date().toLocaleTimeString().slice(2);
      var tempVehicleList;
      /**
       * @get, url = '/realTime/vehicle/?recordedTime={YYYY-mm-dd h:m:s}'
       * @dataType String {vehicleId}
       */
      this.$axios.get('/realTime/vehicle/?recordedTime=2022-01-01 ' + curTime).then(response => {
        if (response && response.status == 200) {
          tempVehicleList = response.data;
          tempVehicleList.forEach(function (tempVehicleId) {
            /**
             * @get, url = '/realTime/?vehicleId={vehicleId}&recordedTime={YYYY-mm-dd h-m-s}'
             * @dataType RealTimeDataEntity
             */
            _this.$axios.get("/realTime/?vehicleId=" + tempVehicleId + "&recordedTime=2022-01-01 " + curTime).then(response => {
              realTimeData = response.data;
              var curPoint = new BMap.Point(realTimeData.lon, realTimeData.lat);
              if (_this.vehicleList.indexOf(tempVehicleId) == -1) { //if not exist
                _this.vehicleList.push(tempVehicleId);
                var tempMk = new BMap.Marker(curPoint);
                tempMk.id = tempVehicleId;
                //prepare the infoWindow content
                var Mktext = "Time: 2022-01-01 " + curTime + "\n" +
                    "vehicleId: " + realTimeData.vehicleId + "\n" +
                    "routeId: " + realTimeData.routeId + "\n";
                var infoWindow = new BMap.InfoWindow("<p>" + "Time: 2022-01-01 " + curTime + "</p>" +
                    "<p>" + "routeId: " + realTimeData.routeId + "</p>" +
                    "<p>" + "vehicleId: " + realTimeData.vehicleId + "</p>" +
                    "<el-button></el-button>");
                tempMk.addEventListener("click", function () {
                  this.openInfoWindow(infoWindow)
                }); //add EventListener of Maker
                _this.MapMkList.push(tempMk);
                _this.map.addOverlay(tempMk); // add Overlay
                tempMk.setPosition(curPoint); // set the Maker position
              } else { // already exist
                var tempIdx = _this.vehicleList.indexOf(tempVehicleId);
                _this.MapMkList[tempIdx].setPosition(curPoint); // move the Maker
                if (realTimeData.nextStop == "") {
                  _this.removeMkFun(tempVehicleId); //
                }
              }
            });
          });
        }
      });
    },
    /**
     * @description start the real time display
     */
    startDisplayVehicles() {
      // this.clearAll()
      // this.displayOriginTrips_mapv()
      // this.timer = setInterval(this.displayAllVehicleIdByTime, 1000)

      let _this = this;
      //TODO test
      var curPoint = new BMap.Point(-73.88601, 40.880624);
      var lastPoint = new BMap.Point(-73.88, 40.8);
      var tempMk = new BMap.Marker(curPoint);
      tempMk.id = "testVehicle";
      //prepare the infoWindow content
      tempMk.addEventListener("click", function () {
        let tempChart = Vue.extend({
          render: h => h(BusSpeed_Chart)
        });
        let option = {
          width: 450,
          height: 300,
          title: 'VehicleInfo',
          enableMessage: true,
        };
        let component = new tempChart().$mount();
        var infoWindow = new BMap.InfoWindow(component.$mount().$el, option);
        this.openInfoWindow(infoWindow);
      }) //add EventListener of Maker
      _this.MapMkList.push(tempMk);
      _this.map.addOverlay(tempMk); // add Overlay
      tempMk.setPosition(curPoint); // set the Maker position
    },
    /**
     * @description stop the real time display
     */
    stopDisplayVehicles() {
      clearInterval(this.timer);
    },
    /**
     * @description remove the vehicleId
     * @param vehicleId
     * @returns {boolean}
     */
    removeMkFun(vehicleId) {
      let _this = this;
      var allOverlay = this.map.getOverlay();
      for (let i = 0; i < allOverlay.length - 1; i++) {
        if (allOverlay[i].id == vehicleId) {
          _this.map.removeOverlay(allOverlay[i]); //remove the vehicleId overlay
          return false;
        }
      }
    },
    /**
     * @description updateCanvas Line
     * @for CanvasLayerLine
     */
    updateCanvasLine() {
      let _this = this;
      const ctx = _this.canvasLayerLine.canvas.getContext('2d'); //init
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear
      for (let k = 0; k < _this.totalPoints.length; k++) {
        let pointsList = _this.totalPoints[k];
        let weightList = _this.weights[k];
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
      const ctx = _this.canvasLayerPointer.canvas.getContext('2d'); //init
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear
      for (let k = 0; k < _this.totalPoints.length; k++) {
        let pointsList = _this.totalPoints[k];
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
      const ctx = _this.canvasLayerBack.canvas.getContext('2d'); //init
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear
      for (let k = 0; k < _this.totalPoints.length; k++) {
        let pointsList = _this.totalPoints[k];
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
      if(value > 50) return "#ff8c35";
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
    updateCanvasBusVehicle() {
      let that = this;
      let _this = this.canvasLayerBusVehicle;
      if (!_this.zr) {
        _this.zr = zrender.init(_this.canvas);
      } else {
        _this.zr.clear();
      }
      _this.zr.resize(); //solve the offset caused by dragging or zooming the map
      //data prepare Test
      let points = that.visualVehicle.points;
      let weights = that.visualVehicle.weights;
      let infos = that.visualVehicle.vehicleInfos;
      // let points = [];
      // let weights = [];
      // points.push(new BMap.Point(-73.88, 40.88));
      // points.push(new BMap.Point(-73.88601, 40.880624));
      // weights.push(30);
      for (let k = 0; k < weights.length; k += 2) {
        const pixel = that.map.pointToPixel(points[k + 1]);
        const lastPixel = that.map.pointToPixel(points[k]);
        var circle = new zrender.Circle({
          shape: {
            cx: pixel.x,
            cy: pixel.y,
            r: 10
          },
          style: {
            fill: that.getVehicleColor(weights[k]),
            stroke: '#faf9f9'//'#2e2d2d'
          },
          onclick: function () {
            that.curVehiclePoint = points[k+1];
            that.curVehicleInfo = infos[k];
            that.showDetailWindow();
            that.setDetailWindowPosition();
          }
        });
        _this.zr.add(circle);
        // Render arrows according to render pixel distance
        // Pointer length
        const pointerLong = 8;
        const res = that.generateBusVehiclePointer(pointerLong, pixel, lastPixel, 45);
        const aPixel = res.aPixel; //set arrow point
        const bPixel = res.bPixel;
        const midPixel = res.midPixel;
        var line1 = new zrender.Polyline({
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
    generateBusVehiclePointer(lineLong, pixel, lastPixel, theta) {
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
    /**
     *       let _this = this;
     const ctx = _this.canvasLayerBusVehicle.canvas.getContext('2d'); //init
     if (!ctx) {
        return;
      }
     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear
     //data prepare Test
     var points = [];
     var weights = [];
     var point = new BMap.Point(-73.88601,40.880624);
     points.push(point);
     weights.push(20);
     for(let k = 0; k < points.length; k ++) {
        var pixel = _this.map.pointToPixel(points[k]);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(pixel.x, pixel.y, 20, 0, Math.PI*2, false);
        ctx.fillStyle = _this.getVehiclColor(weights);
        ctx.fill();
        ctx.stroke()
      }
     */
    getVehicleColor(weight) {
      if (weight > 50) {
        return 'rgb(60,'+ (180 + (100-weight)) +',60)';
      }
      else if (weight > 20) return 'rgb('+ (275 - weight) + ',210,4)';
      else return 'rgb(200,'+ (50+weight) + ',38)';
    },
    async generateVisualVehicle() {
      let _this = this;
      let maxLength = _this.trajectories.length;
      _this.visualVehicle.points = []
      _this.visualVehicle.weights = []
      for(let k = 0; k < maxLength; k++) {
        let tempList = _this.trajectories[k].geometry.coordinates;
        let i = Math.floor(Math.random()*(tempList.length-2)) + 1;
        _this.visualVehicle.points.push(new BMap.Point(tempList[i-1][0], tempList[i-1][1]));
        _this.visualVehicle.points.push (new BMap.Point(tempList[i][0], tempList[i][1]));
        _this.visualVehicle.weights.push(Math.floor(Math.random()*100));
      }
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
      let curPixel = this.map.pointToPixel(this.curVehiclePoint);
      let detailWindow = document.getElementById("detailWindow");
      let top = curPixel.y - detailWindow.offsetHeight - 30;
      let left = curPixel.x - detailWindow.offsetWidth / 2;
      //set the detailWindow Position
      this.$refs.detailWindow.style.top = (top) +  'px';
      this.$refs.detailWindow.style.left = (left) + 'px';
    },
    hiddenDetailWindow() {
      this.$refs.detailWindow.style.display = 'none';
      this.curVehiclePoint = undefined;
      this.curVehicleInfo = undefined;
    }
  }
}
</script>
<style>
/* The container of BaiduMap must be set width & height. */
#baiduMap {
  margin: 0px;
  width: 100%;
  height: 100%;
}
#map_container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow:hidden;
}
#form  .el-form-item__label{
  font-weight: bold;
}
.btn {
  margin-top: 20px !important;
}
.toggleButton {
  position: absolute;
  margin-top: 45%;
  padding: 0px !important;
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
  padding: 15px 20px 0px 20px;
  width: 350px;
  height: 95%;;
}
#detailTail {
  /*display: none;*/
  border-style: solid;
  border-width: 15px 15px 15px 15px;
  border-color: white transparent transparent transparent;
  width: 0px;
  height: 0px;
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