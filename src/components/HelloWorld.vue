<template>
  <div></div>
</template>
<!--&lt;!&ndash; home &ndash;&gt;-->
<!--<template>-->
<!--  <div class="home">-->
<!--    <div class="width:500px;height:300px">-->
<!--      <span>size</span>-->
<!--      <el-slider v-model="options_heatmap.size" show-input></el-slider>-->
<!--      <span>max</span>-->
<!--      <el-slider v-model="options_heatmap.max" show-input></el-slider>-->
<!--    </div>-->
<!--    <el-button @click="getDataAndAddHeatMapLayer()">添加图层</el-button>-->
<!--    <el-button @click="removeHeatMapLayer()">移除图层</el-button>-->
<!--    <el-button @click="refreshHeatMapData()">刷新图层</el-button>-->

<!--    <div id="map" class="content"></div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  data() {-->
<!--    return {-->
<!--      map: {},-->
<!--      heatMapLayer: {},-->
<!--      heatDataSet: [],-->

<!--      options_heatmap: {-->
<!--        size: 53,-->
<!--        max: 100,-->
<!--      },-->
<!--    };-->
<!--  },-->
<!--  components: {},-->
<!--  created() {},-->
<!--  mounted() {-->
<!--    this.initMap();-->
<!--  },-->
<!--  computed: {},-->
<!--  methods: {-->
<!--    initMap() {-->
<!--      this.map = new BMap.Map("map", {-->
<!--        enableMapClick: false,-->
<!--      });-->
<!--      this.map.centerAndZoom(new BMap.Point(105.403119, 38.028658), 5); // 初始化地图,设置中心点坐标和地图级别-->
<!--      this.map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放-->

<!--      this.map.setMapStyle({-->
<!--        style: "midnight",-->
<!--      });-->
<!--    },-->
<!--    getDataAndAddHeatMapLayer() {-->
<!--      var data = [-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [104.067923, 30.679943], //成都-->
<!--          },-->
<!--          count: 12,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [102.228565, 31.905763], //阿坝州-->
<!--          },-->
<!--          count: 70,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [106.757916, 31.869189], //巴中-->
<!--          },-->
<!--          count: 59,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [107.494973, 31.214199], //达州-->
<!--          },-->
<!--          count: 18,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [104.402398, 31.13114], //德阳-->
<!--          },-->
<!--          count: 39,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [101.969232, 30.055144], //甘孜州-->
<!--          },-->
<!--          count: 76,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [106.63572, 30.463984], //广安-->
<!--          },-->
<!--          count: 5,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [105.819687, 32.44104], //广元-->
<!--          },-->
<!--          count: 66,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [103.760824, 29.600958], //乐山-->
<!--          },-->
<!--          count: 71,-->
<!--        },-->
<!--      ];-->
<!--      this.heatDataSet = new mapv.DataSet(data);-->
<!--      this.addHeatMapLayer();-->
<!--    },-->
<!--    refreshHeatMapData() {-->
<!--      var data = [-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [104.067923, 30.679943], //成都-->
<!--          },-->
<!--          count: 92,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [102.228565, 31.905763], //阿坝州-->
<!--          },-->
<!--          count: 7,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [106.757916, 31.869189], //巴中-->
<!--          },-->
<!--          count: 9,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [107.494973, 31.214199], //达州-->
<!--          },-->
<!--          count: 88,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [104.402398, 31.13114], //德阳-->
<!--          },-->
<!--          count: 9,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [101.969232, 30.055144], //甘孜州-->
<!--          },-->
<!--          count: 6,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [106.63572, 30.463984], //广安-->
<!--          },-->
<!--          count: 95,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [105.819687, 32.44104], //广元-->
<!--          },-->
<!--          count: 6,-->
<!--        },-->
<!--        {-->
<!--          geometry: {-->
<!--            type: "Point",-->
<!--            coordinates: [103.760824, 29.600958], //乐山-->
<!--          },-->
<!--          count: 7,-->
<!--        },-->
<!--      ];-->
<!--      this.heatDataSet.set(data);-->
<!--    },-->
<!--    addHeatMapLayer() {-->
<!--      if (!Object.keys(this.heatMapLayer).length == 0) {-->
<!--        this.removeHeatMapLayer();-->
<!--      }-->
<!--      var options = {-->
<!--        size: this.options_heatmap.size,-->
<!--        gradient: {-->
<!--          0.25: "rgb(0,0,255)",-->
<!--          0.55: "rgb(0,255,0)",-->
<!--          0.85: "yellow",-->
<!--          1.0: "rgb(255,0,0)",-->
<!--        },-->
<!--        max: this.options_heatmap.size,-->
<!--        draw: "heatmap",-->
<!--      };-->
<!--      this.options_heatmap = options;-->
<!--      this.heatMapLayer = new mapv.baiduMapLayer(-->
<!--          this.map,-->
<!--          this.heatDataSet,-->
<!--          this.options_heatmap-->
<!--      );-->
<!--    },-->
<!--    removeHeatMapLayer() {-->
<!--      this.heatMapLayer.destroy();-->
<!--      this.heatMapLayer = {};-->
<!--    },-->
<!--  },-->
<!--  watch: {-->
<!--    options_heatmap: {-->
<!--      handler: function (newVal, oldVal) {-->
<!--        this.heatMapLayer.setOptions({-->
<!--          size: this.options_heatmap.size,-->
<!--          gradient: {-->
<!--            0.25: "rgb(0,0,255)",-->
<!--            0.55: "rgb(0,255,0)",-->
<!--            0.85: "yellow",-->
<!--            1.0: "rgb(255,0,0)",-->
<!--          },-->
<!--          max: this.options_heatmap.max,-->
<!--          draw: "heatmap",-->
<!--        });-->
<!--      },-->
<!--      deep: true,-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.home {-->
<!--  height: 100vh;-->
<!--  border: 1px solid red;-->
<!--  .content {-->
<!--    width: 100%;-->
<!--    height: 100%;-->
<!--    border: 1px solid blue;-->
<!--    margin: auto;-->
<!--  }-->
<!--}-->
<!--</style>-->