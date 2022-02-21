<template>
  <div id = 'root'>
    <MapVisual></MapVisual>
  </div>
</template>
<script>
import MapVisual from "@/components/MapVisual";

export default {
  components: { MapVisual},
  data () {
    return{}
  }
}
</script>
<style>
#root {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
