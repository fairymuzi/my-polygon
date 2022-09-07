
<template>
  <div class="drawing-container" :style="containerStyle">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import { prototypefabric } from "./fabric.js";
export default {
  name: "my-polygon",
  props: {
    imgUrl: {
      type: String,
      default: "",
    },
    width: {
      type: [String, Number],
      default: 960,
    },
    height: {
      type: [String, Number],
      default: 540,
    },
    polygons: {
      type: Array,
      default() {
        return [];
      },
    },
    model: {
      type: String,
      /*
        model
           polygon 多边形
           rectangle 矩形
      */
      default: "rectangle",
    },
    //是否可以创建多个图形
    multiple: {
      type: Boolean,
      default: false,
    },
    //是否可以一直画
    continuity: {
      type: Boolean,
      default: false,
    },
    initParams: {
      type: Object,
      default() {
        return {
          strokeWidth: 2, //描边宽度
          stroke: "red", //连接时的线颜色
          dotColor: "#ffffff", //点的颜色
          firstDotColor: "red", //第一个点的颜色
          fill: "#00000000", //选择后圈起来的背景颜色
          opacity: "0.6", //选择后圈起来的背景颜色的透明度
        };
      },
    },
  },
  computed: {
    containerStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    },
    //图片的缩放，根据像素点算
    imageScale() {
      const scale =
        (this.imgInfo.width * this.imgInfo.height) / (this.width * this.height);
      return this.scale / scale;
    },
  },
  data() {
    return {
      imgInfo: {
        width: 0,
        height: 0,
      },
      // 例如，默认高度是540，传入1080分辨率图片，坐标缩放为2
      scale: 2,
      myPoints: [],
    };
  },
  mounted() {
    //重置js数据
    prototypefabric.polygon.resetPolygonData();
    this.loadImage(this.imgUrl)
      .then(() => {
        this.$emit("imgLoad");
        this.handleInit();
      })
      .catch((e) => {
        this.$emit("error", e);
        this.handleInit();
      });
  },
  methods: {
    redraw() {
      prototypefabric.polygon.redraw();
    },
    clearPolygons() {
      prototypefabric.polygon.clearPolygons();
    },
    getPolygonsPoints() {
      return this.handlePoints(
        prototypefabric.polygon.getPolygonsPoints(),
        true,
        true
      );
    },
    handleInit() {
      const elParams = {
        el: "canvas",
        model: this.model,
        width: this.width,
        height: this.height,
        polygons: this.handlePoints(this.polygons, true, false),
        imgUrl: this.imgUrl,
        scale: this.scale,
        imgScale: this.imageScale,
        multiple: this.multiple,
        continuity: this.continuity,
      };
      //合并初始化参数
      const init = Object.assign(elParams, this.initParams);
      //初始化
      prototypefabric.polygon.initCanvas(init);
      //注册勾选完成后的回调函数
      prototypefabric.polygon.addCompleteListener(this.completeDrawing);
    },
    setScale(width) {
      return (width / this.width).toFixed(2);
    },
    loadImage(imgUrl) {
      return new Promise((resolve, reject) => {
        let image = new Image();
        image.src = imgUrl;
        image.onload = () => {
          this.$set(this.imgInfo, "width", image.width);
          this.$set(this.imgInfo, "height", image.height);

          this.$set(this, "scale", this.setScale(image.width));
          //image对象已经被浏览器缓存了，用url地址也一样。
          resolve(image);
          image = null;
        };
        image.onerror = (e) => {
          reject(e);
          console.error("图片加载失败");
        };
      });
    },
    handleCalc(begin, flag, end) {
      if (flag) {
        return begin * end;
      } else {
        return begin / end;
      }
    },
    //获取最终的点位，可能会包含缩放。
    handlePoints(_points, flag, calcFlag) {
      if (flag) {
        return _points.map((polygon) => {
          if (polygon && polygon.length) {
            return polygon.map((e) => {
              return {
                x: this.handleCalc(e.x, calcFlag, this.scale),
                y: this.handleCalc(e.y, calcFlag, this.scale),
              };
            });
          }
        });
      } else {
        return _points.map((e) => {
          return {
            x: this.handleCalc(e.x, calcFlag, this.scale),
            y: this.handleCalc(e.y, calcFlag, this.scale),
          };
        });
      }
    },
    completeDrawing(points) {
      this.myPoints = this.handlePoints(points, false, true);

      this.$emit("confirm", this.myPoints);

      //如果是多图形，则继续开始下个图形绘制
      // if (this.multiple && this.model === "polygon") {
      //   prototypefabric.polygon.drawPolygon();
      // }
    },
    //在保留原有多边形的基础上，再画多边形
    createDot() {
      prototypefabric.polygon.drawPolygon();
    },
    //回退上一步
    backPolygon() {
      prototypefabric.polygon.backPolygon();
    },
  },
};
</script>

<style lang="scss" scoped>
.drawing-container {
  position: relative;
  & > canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
