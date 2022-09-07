import { fabric } from "fabric";
const prototypefabric = {};
let _this = null;
let params = {};//初始化时传入的参数
let callbacks = [];//执行的回调函数
let polygons = [];//所有多边形的对象
let mouseDownObj = { flag: false };//鼠标是否按下
let min = 99;
let max = 999999;
let polygonMode = true;
let pointArray = new Array();
let lineArray = new Array();
let activeLine;
let activeShape = false;
let canvas;
let line;
prototypefabric.polygon = {
  clearFinishDraw() {
    mouseDownObj.finish = null;
    _this.handleCursor();
  },
  //完成画图形的动作后，设置鼠标样式
  finishDraw() {
    mouseDownObj.finish = true;
    _this.setCursor('default');
  },
  redraw() {
    _this.backPolygon(1);
    _this.clearFinishDraw();
  },
  //处理在多图形情况下，一个图形绘制结束后。
  handleDrawMultiplePolygons() {
    if (params.multiple) {
      _this.drawPolygon();
    }
  },
  //处理鼠标指针样式
  handleCursor() {
    if (params.model === 'rectangle') {
      _this.setCursor('crosshair');
    } else if (params.model === 'polygon') {
      _this.setCursor('default');
    }
  },
  //清空所有图形
  clearPolygons() {
    while (polygons.length) {
      _this.backPolygon();
    }
    _this.clearFinishDraw();
  },
  //处理多个图形情况
  handlePolygons() {
    if (params.polygons && params.polygons.length) {
      const p_polygons = params.polygons;
      p_polygons && p_polygons.length && p_polygons.forEach(polygon => {
        _this.initPolygon(polygon);
      })
      //设置不可再画，只能重置或者其它情况
      mouseDownObj.finish = true;
    }
  },
  getPolygonsPoints() {
    return polygons.map(polygon => {
      return JSON.parse(JSON.stringify(polygon.points || {}));
    })
  },
  getPolygons() {
    return polygons;
  },
  setCursor(str = 'default') {
    canvas.setCursor(str);
  },
  //初始化前清空参数
  resetPolygonData() {
    params = {};
    callbacks = [];
    polygons = [];
    mouseDownObj = { flag: false };
    polygonMode = true;
    pointArray = new Array();
    lineArray = new Array();
    activeLine = null;
    activeShape = false;
    canvas = null;
    line = null;
  },
  //执行注册的回调函数
  executeCallback(params) {
    callbacks.forEach(fun => {
      fun(params);
    })
  },
  //添加监听事件
  addCompleteListener(callback) {
    callbacks.push(callback);
  },
  //开始画
  drawPolygon() {
    queueMicrotask(() => {
      polygonMode = true;
      pointArray = new Array();
      lineArray = new Array();
      activeLine;
    })
  },
  addPoint(options) {
    console.log(options);
    let random = Math.floor(Math.random() * (max - min + 1)) + min;
    let id = new Date().getTime() + random;
    let circle = new fabric.Circle({
      radius: 5,
      fill: `${params.dotColor}`,//点的颜色
      stroke: `${params.dotColor}`,
      strokeWidth: 0.5,
      left: (options.e.layerX / canvas.getZoom()),
      top: (options.e.layerY / canvas.getZoom()),
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      id: id
    });
    if (pointArray.length == 0) {
      circle.set({
        fill: `${params.firstDotColor}` //第一个点的颜色
      })
    }
    let points = [
      (options.e.layerX / canvas.getZoom()),
      (options.e.layerY / canvas.getZoom()),
      (options.e.layerX / canvas.getZoom()),
      (options.e.layerY / canvas.getZoom())
    ];
    line = new fabric.Line(points, {
      strokeWidth: 2,
      fill: `${params.fill}`,//线的颜色
      stroke: `${params.stroke}`,
      class: 'line',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false
    });
    if (activeShape) {
      let pos = canvas.getPointer(options.e);
      let points = activeShape.get("points");
      points.push({
        x: pos.x,
        y: pos.y
      });
      let polygon = new fabric.Polygon(points, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.1,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false
      });
      canvas.remove(activeShape);
      canvas.add(polygon);
      activeShape = polygon;
      canvas.renderAll();
    }
    else {
      let polyPoint = [{ x: (options.e.layerX / canvas.getZoom()), y: (options.e.layerY / canvas.getZoom()) }];
      let polygon = new fabric.Polygon(polyPoint, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.1,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false
      });
      activeShape = polygon;
      canvas.add(polygon);
    }
    activeLine = line;

    pointArray.push(circle);
    lineArray.push(line);

    canvas.add(line);
    canvas.add(circle);
    canvas.selection = false;
  },
  //连接起点，完成圈图
  generatePolygon(pointArray) {
    let points = new Array();
    pointArray.forEach((e) => {
      points.push({
        x: e.left,
        y: e.top
      });
      canvas.remove(e);
    })

    lineArray.forEach(e => {
      canvas.remove(e);
    })

    canvas.remove(activeShape).remove(activeLine);

    _this.initPolygon(points);

    //点连接完成后，关闭
    polygonMode = false;

    //画完后，执行回调
    _this.executeCallback(points);

    //画完后，完成当前图形的
    _this.finishDraw();

    //判断是否可以画多个图形
    _this.handleDrawMultiplePolygons();
  },
  //根据points画多边形
  initPolygon(points) {
    let polygon = new fabric.Polygon(points, {
      stroke: params.stroke,
      strokeWidth: params.strokeWidth,
      fill: `${params.fill}`,//勾选完成后，圈起来的背景色
      opacity: `${params.opacity}`,
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false
    });

    canvas.add(polygon);

    //将当前图形加入数组
    polygons.push(polygon);
    activeLine = null;
    activeShape = null;
    canvas.selection = true;
  },
  initImage(url) {
    fabric.Image.fromURL(url, (img) => {
      img.scale(params.imgScale);
      //设置为背景
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
    })
  },
  //清除上一步的图形
  backPolygon(flag) {
    let polygon = null;
    if (flag) {
      polygon = polygons.shift();
    } else {
      polygon = polygons.pop();
    }
    //如果 polygons 没有值了，则设置finish为false，可继续画
    if (!polygons.length) {
      mouseDownObj.finish = null;
    }
    //清除一个图形时，重置参数
    polygon && canvas.remove(polygon);
  },
  polygonMouseEvent(options) {
    //回到了初始点位，完成图形
    if (options.target && pointArray[0] && options.target.id == pointArray[0].id) {
      prototypefabric.polygon.generatePolygon(pointArray);
    }
    //继续画点
    if (polygonMode) {
      prototypefabric.polygon.addPoint(options);

      _this.clearFinishDraw();
    }
  },
  //创建多边形
  createPoylgon(points, _options) {
    const options = {
      stroke: '#333333',
      strokeWidth: 1,
      fill: '#cccccc',
      opacity: 0.1,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false
    };
    const polygonOptions = Object.assign(options, _options);
    const polygon = new fabric.Polygon(points, polygonOptions);
    return polygon;
  },
  rectangleMouseEvent(options) {
    //画点
    const circle = prototypefabric.polygon.createDoto(options);
    // canvas.add(circle);

    _this.clearFinishDraw();

    //缓存开始点位
    mouseDownObj.beginCircle = circle;

  },

  initCanvas(initParams) {
    if (!(initParams && JSON.stringify(initParams) !== '{}')) {
      throw Error("请传入初始化参数！")
    }
    params = initParams;
    canvas = window._canvas = new fabric.Canvas(params.el);
    canvas.setWidth(params.width);
    canvas.setHeight(params.height);

    //如果 polygons 有值
    _this.handlePolygons();

    //如果有 imageUrl
    if (params.imgUrl) {
      _this.initImage(params.imgUrl);
    }

    canvas.on("mouse:down", function (options) {

      //按下前，判断是否可以连续画
      if (_this.isDisContinuity()) {
        return
      }
      //鼠标按下
      mouseDownObj.flag = true;

      //需要判断下模式，如果是多边形
      if (params.model === 'polygon') {
        _this.polygonMouseEvent(options);
      } else if (params.model === 'rectangle') {
        _this.rectangleMouseEvent(options);
      }

    });

    canvas.on("mouse:up", function (options) {

      mouseDownObj.flag = false;

      if (_this.isDisContinuity()) {
        return
      }

      //如果是矩形
      if (params.model === 'rectangle') {
        _this.rectangleOnMouseUp(options);
      } else if (params.model === 'polygon') {
        if (polygonMode) {
          // _this.handleDrawMultiplePolygons();
        }
      }
    });

    canvas.on("mouse:move", function (options) {

      //鼠标按下再移动的情况
      if (params.model === 'rectangle' && mouseDownObj.flag) {
        _this.rectangleOnMouseMove(options);
      }

      if (activeLine && activeLine.class == "line") {
        let pointer = canvas.getPointer(options.e);
        activeLine.set({ x2: pointer.x, y2: pointer.y });

        let points = activeShape.get("points");
        points[pointArray.length] = {
          x: pointer.x,
          y: pointer.y,
        };
        activeShape.set({
          points: points,
        });
        canvas.renderAll();
      }
      canvas.renderAll();
    });
  },
  //只能画一个 吗
  isDisContinuity() {
    //是否可以连续画 且 图形动作是否结束 且 是否可以画多个，
    //如果可以画多个，则忽略连续画功能
    return !params.multiple && !params.continuity && mouseDownObj.finish;
  },
  //画矩形时，鼠标按下并移动事件
  rectangleOnMouseMove(options) {
    //开始点
    const begin = mouseDownObj.beginCircle;
    //当前点
    const pointer = canvas.getPointer(options.e);

    //根据开始点坐标，算出四条线的终点坐标
    mouseDownObj['points'] = _this.getXYFromPointer({ x: begin.left, y: begin.top }, pointer);

    const { topLeft, topRight, bottomRight, bottomLeft } = mouseDownObj['points'];

    //是否已经存在矩形，存在就更新矩形点位
    if (mouseDownObj['polygon']) {
      canvas.remove(mouseDownObj['polygon']);
    }
    mouseDownObj['polygon'] = _this.createPoylgon([topLeft, topRight, bottomRight, bottomLeft],
      {
        strokeWidth: params.strokeWidth,
        stroke: params.stroke,
        fill: params.fill,
        opacity: params.opacity,
      });

    // polygons.push(mouseDownObj['polygon']);
    canvas.add(mouseDownObj['polygon']);
  },
  getXYFromPointer(begin, end) {
    const finalEnd = this.handleEndPoint(end);
    //四个点
    const topLeft = begin;
    const topRight = { x: finalEnd.x, y: begin.y };
    const bottomLeft = { x: begin.x, y: finalEnd.y };
    const bottomRight = { x: finalEnd.x, y: finalEnd.y };
    return { topLeft, topRight, bottomRight, bottomLeft };
  },
  handleEndPoint(endParam) {
    //获取canvas画布的四个点坐标
    const topLeft = { x: 0, y: 0 };
    const topRight = { x: params.width, y: 0 };
    const bottomRight = { x: params.width, y: params.height };
    const bottomLeft = { x: 0, y: params.height };
    const end = JSON.parse(JSON.stringify(endParam));
    // 左上
    if (end.x < topLeft.x) {
      end.x = topLeft.x;
    }
    if (end.y < topLeft.y) {
      end.y = topLeft.y;
    }

    //右上
    if (end.x > topRight.x) {
      end.x = topRight.x;
    }
    if (end.y < topRight.y) {
      end.y = topRight.y;
    }

    //右下
    if (end.x > bottomRight.x) {
      end.x = bottomRight.x;
    }
    if (end.y > bottomRight.y) {
      end.y = bottomRight.y;
    }
    //左下
    if (end.x < bottomLeft.x) {
      end.x = bottomLeft.x;
    }
    if (end.y > bottomLeft.y) {
      end.y = bottomLeft.y;
    }
    return end;
  },
  //画矩形时，鼠标弹起事件
  rectangleOnMouseUp(options) {
    //误差6像素
    const number = 6;

    //判断是否在开始点，如果是，则需要移除
    const { left, top } = mouseDownObj.beginCircle;
    const x = options.e.layerX;
    const y = options.e.layerY;
    //鼠标松开时判断是否还是当前点位，若是，则删除。
    if (Math.abs(x - left) < number && Math.abs(y - top) < number) {
      canvas.remove(mouseDownObj.beginCircle);
    } else {
      //判断是否可以画多个
      _this.handleMultiple();

      //结束点位和多边形绘制。获取四个点位信息
      const _points = mouseDownObj['points'];
      _this.executeCallback([_points['topLeft'], _points['topRight'], _points['bottomRight'], _points['bottomLeft']])
    }

  },
  handleMultiple() {
    //清空缓存的多边形，防止下一个操作时此图形被误删
    polygons.push(mouseDownObj['polygon']);
    mouseDownObj['polygon'] = null;

    //设置矩形完成后，设置完成标志
    _this.finishDraw();

    //如果是单个图形，且缓存数组中只有一个时，则不删除
    if (!params.multiple && polygons.length > 1) {
      //清空并移除上一个图形
      _this.backPolygon(1);
    }
  },
  createDoto(options) {
    let random = Math.floor(Math.random() * (max - min + 1)) + min;
    let id = new Date().getTime() + random;
    let circle = new fabric.Circle({
      radius: 5,
      fill: `${params.dotColor}`,//点的颜色
      stroke: `${params.dotColor}`,
      strokeWidth: 0.5,
      left: (options.e.layerX / canvas.getZoom()),
      top: (options.e.layerY / canvas.getZoom()),
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      id: id
    });

    return circle;
  },
  createLine({ x, y }) {
    let points = [
      (x / canvas.getZoom()),
      (y / canvas.getZoom()),
      (x / canvas.getZoom()),
      (y / canvas.getZoom())
    ];
    const line = new fabric.Line(points, {
      strokeWidth: 2,
      fill: `${params.fill}`,
      stroke: `${params.stroke}`,
      class: 'line',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false
    });

    return line;
  }
};
_this = prototypefabric.polygon;
export {
  prototypefabric
};
