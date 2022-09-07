# 安装fabric

```
npm install fabric --save
```

# 二开文档参考

http://fabricjs.com/

# 组件的使用

```
<Polygon
      ref="drawingRange"
      :points="points"
      imgUrl="https://w.wallhaven.cc/full/m9/wallhaven-m9jjp9.jpg"
      @confirm="confirm"
      @error="error"
 />

// ref:组件中的ref
// points:组成多边形的点，用于回显。顺序为顺时针，（左上、右上、右下、左下）。
// imgUrl:背景图片，最好为16:9比例的图片
// confirm:完成一个图形后的回调函数，会按照points格式返回对应的点
// error:图片加载出错的回调
// model:polygon/rectangle 多边形或矩形
// multiple:是否可以创建多个图形
// initParams:见组件内配置
```

