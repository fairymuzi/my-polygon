<template>
  <div class="home">
    <div class="home_contianer">
      <div class="top">
        <button class="btn" @click="handleOpen()">开始</button>
        <button class="btn" @click="handleRedraw()">重画</button>
        <button class="btn" @click="handleGetAll()">获取所有点</button>
        <button class="btn" @click="handleBack()">回退</button>
        <button class="btn" @click="handleClearAll()">清空</button>
      </div>
      <div class="body">
        <Mypolygon
          v-if="open"
          ref="polygon"
          :polygons="polygons"
          @confirm="confirm"
        ></Mypolygon>
        <!-- 
           model="polygon"
           multiple
         -->
      </div>
    </div>
  </div>
</template>

<script>
import Mypolygon from "@/components/MyPolygon";
export default {
  name: "index-home",
  components: {
    Mypolygon,
  },
  data() {
    return {
      open: false,
      polygons: [],
      polygons1: [
        [
          { x: 88, y: 88 },
          { x: 290, y: 88 },
          { x: 290, y: 226 },
          { x: 88, y: 226 },
        ],
        [
          { x: 400, y: 80 },
          { x: 666, y: 80 },
          { x: 666, y: 222 },
          { x: 400, y: 222 },
        ],
        [
          { x: 788, y: 86 },
          { x: 1164, y: 86 },
          { x: 1164, y: 230 },
          { x: 788, y: 230 },
        ],
        [
          { x: 674, y: 426 },
          { x: 1140, y: 426 },
          { x: 1140, y: 686 },
          { x: 674, y: 686 },
        ],
        [
          { x: 802, y: 328 },
          { x: 1588, y: 356 },
          { x: 1238, y: 952 },
          { x: 274, y: 814 },
          { x: 464, y: 442 },
        ],
      ],
    };
  },
  methods: {
    handleRedraw() {
      this.$refs["polygon"].redraw();
    },
    handleClearAll() {
      this.$refs["polygon"].clearPolygons();
    },
    handleBack() {
      this.$refs["polygon"].backPolygon();
    },
    handleGetAll() {
      const polygons = this.$refs["polygon"].getPolygonsPoints();
      console.log(polygons);
    },
    handleOpen() {
      this.open = true;
    },
    confirm(points) {
      console.log(points);
    },
  },
};
</script>
<style lang="scss" scoped>
.home {
  height: 100%;
  background-color: #e6e5dd;
  .home_contianer {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    .top {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 600px;
      height: 100px;
      margin: 40px 0;
      border-radius: 10px;
    }
    .body {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      width: 960px;
      height: 540px;
    }
  }
}
.btn {
  height: 40px;
  width: 100px;
  border-radius: 4px;
  color: #1890ff;
  background: #e8f4ff;
  border: 1px solid #a3d3ff;
  cursor: pointer;

  &:hover {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;
  }

  &:active {
    background: #1682e6;
    border-color: #1682e6;
    color: #fff;
    outline: 0;
  }
}
</style>