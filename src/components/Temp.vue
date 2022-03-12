<template>

</template>

<script>
export default {
  name: "Temp",
  methods: {
    // Methods Abandon
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
  }

}
</script>

<style scoped>

</style>