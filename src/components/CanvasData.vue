<template>
  <div class="container" ref="container" @click="getPosition" @mousedown="mouseDown" @mouseup="mouseUp" @mousemove="getPosInfo">
    <canvas ref="canvasGrid" :width="canvasWidth" :height="canvasWidth"></canvas>
    <canvas ref="canvasDraw" :width="canvasWidth" :height="canvasWidth"></canvas>
    <div class="floatBox" :style="infoBox.sttyle">
      {{ `${infoBox.x}, ${infoBox.y}` }}
    </div>
    <div class="brush-point" :style="brushPointStyle"></div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import { Astar } from "./astar";
import _ from "lodash";
import {NodeTypeValue} from './util';
import { Col } from 'ant-design-vue';

export default {
  name: "CanvasData",
  props: {
    dataRef: Array,
    size: Number,
    sizeWidth: Number,
    step: "drawWall" | "cleanWall" | "start" | "end",
    showMoreInfo: Boolean,
    AStarModel:String,
  },
  emits: ["changeStep"],
  setup(props, { emit }) {
    const { size, sizeWidth } = props;
    /**
     * 'drawWall'|'cleanWall'|'start'|'end'
     */
    const panDown = ref(false);
    const canvasGrid = ref(null);
    const canvasDraw = ref(null);
    const container = ref(null);
    let offsetX = 0,
      offsetY = 0,
      start = null,
      end = null;
    const ctxGrid = ref(null);
    const ctxDraw = ref(null);
    const infoBox = ref({
      x: 0,
      y: 0,
      style: { left: 0, top: 0, display: "none", userSelect: "none" },
    });
    const brushPointStyle = ref({});
    const { dataRef } = props;
    const prevSearchInfo = ref([]);

    onMounted(() => {
      drawPanel();
      offsetX = container.value.offsetLeft;
      offsetY = container.value.offsetTop;
    });
    function getPosition(e) {
      // 减少它的偏移量 计算box是第几个
      const y = Math.floor((e.pageX - offsetX) / sizeWidth);
      const x = Math.floor((e.pageY - offsetY) / sizeWidth);
      if (y > size - 1 || x > size - 1) {
        return;
      }
      switch (props.step) {
        case "drawWall":
          dataRef[x][y].type = NodeTypeValue.WALL;
          drawBox(dataRef[x][y]);
          break;
        case "cleanWall":
          dataRef[x][y].type = NodeTypeValue.OPEN;
          clearBox(dataRef[x][y]);
          break;
        case "start":
          if (dataRef[x][y].type === NodeTypeValue.WALL) {
            break;
          }
          start = dataRef[x][y];
          drawBox(start).then(() => {
            emit("changeStep", "end");
          });
          break;
        case "end":
          end = dataRef[x][y];
          const aStar = new Astar(dataRef, start, end, props.AStarModel === "oppositeAngles");
          //  搜索结果
          aStar.search();
          const searchInfo = props.showMoreInfo ? aStar.getSearchInfo() : [];
          drawSearch(searchInfo)
            .then(() => {
              const result = aStar.getBestResult();
              if (result.length === 0) {
                clearBox(start);
                emit("changeStep", "start");
                return;
              }
              result.push(end);
              drawPathAnimate(result);
              emit("changeStep", "start");
            })
            .catch({});
          break;
        default:
          break;
      }
    }
    function drawSearch(searchInfo) {
      // 看上一次是否存在searchInfo信息
      if (prevSearchInfo.value.length !== 0) {
        prevSearchInfo.value.forEach((item) => clearSearchBox(item));
      }
      // 记录这次的 searchInfo；
      prevSearchInfo.value = _.cloneDeep(searchInfo);
      return new Promise((resolve) => {
        let timeShow = null;
        timeShow = setInterval(() => {
          if (searchInfo.length === 0) {
            clearInterval(timeShow);
            resolve();
            return;
          }
          drawSearchBox(searchInfo.shift());
        }, 40);
      });
    }

    function drawPathAnimate(path) {
      let len = path.length,
        pathShowIndex = 0,
        pathHiddenIndex = 0,
        tiemrShow = null,
        timerHidden = null;
      tiemrShow = setInterval(() => {
        if (pathShowIndex >= len) {
          clearInterval(tiemrShow);
          return;
        }
        drawBox(path[pathShowIndex]);
        pathShowIndex++;
      }, 20);
      setTimeout(() => {
        timerHidden = setInterval(() => {
          if (pathHiddenIndex >= len) {
            clearInterval(timerHidden);
            return;
          }
          clearBox(path[pathHiddenIndex]);
          pathHiddenIndex++;
        }, 20);
      }, 30 * len);
    }

    function drawPanel() {
      const grid = canvasGrid.value.getContext("2d");
      const draw = canvasDraw.value.getContext("2d");
      ctxGrid.value = grid;
      ctxDraw.value = draw;
      for (let x = 0; x < dataRef.length; x++) {
        for (let y = 0; y < dataRef[x].length; y++) {
          if (dataRef[x][y].type === NodeTypeValue.WALL) {
            draw.fillStyle = "blue";
            draw.fillRect(y * sizeWidth, x * sizeWidth, sizeWidth, sizeWidth);
          } else {
            grid.fillStyle = "blue";
            grid.strokeRect(y * sizeWidth, x * sizeWidth, sizeWidth, sizeWidth);
          }
        }
      }
    }

    function drawSearchBox(node) {
      const ctx = ctxGrid.value;
      const boxOffsetX = node.y * sizeWidth;
      const boxOffsetY = node.x * sizeWidth;
      ctx.font = "14px serif";
      ctx.fillText(node.f, boxOffsetX + 2, boxOffsetY + 12);
      ctx.fillText(node.g, boxOffsetX + 2, boxOffsetY + 23);
      ctx.fillText(node.h, boxOffsetX + 14, boxOffsetY + 23);
    }
    
    function clearSearchBox(node) {
      // 数组x轴和y轴，跟页面的XY是相反的。
      const x = node.y;
      const y = node.x;
      ctxGrid.value.clearRect(x * sizeWidth, y * sizeWidth, sizeWidth, sizeWidth);
      ctxGrid.value.strokeRect(x * sizeWidth, y * sizeWidth, sizeWidth, sizeWidth);
    }

    function clearBox(node) {
      // 数组x轴和y轴，跟页面的XY是相反的。
      const x = node.y;
      const y = node.x;
      ctxDraw.value.clearRect(x * sizeWidth, y * sizeWidth, sizeWidth, sizeWidth);
      ctxDraw.value.strokeRect(x * sizeWidth, y * sizeWidth, sizeWidth, sizeWidth);
    }

    function drawBox(node) {
      return new Promise((resolve) => {
        const ctx = ctxDraw.value;
        const x = node.y;
        const y = node.x;
        switch (props.step) {
          case "drawWall":
            ctx.fillStyle = "blue";
            ctx.fillRect(x * sizeWidth, y * sizeWidth, sizeWidth, sizeWidth);

            break;
          case "start":
            brushPointStyle.value = {
              display: "none",
            };
            ctx.fillStyle = "orange";
            ctx.fillRect(x * sizeWidth, y * sizeWidth, sizeWidth, sizeWidth);
            break;
          case "end":
            brushPointStyle.value = {
              display: "none",
            };
            ctx.fillStyle = "red";
            ctx.fillRect(x * sizeWidth, y * sizeWidth, sizeWidth, sizeWidth);
            break;
          default:
            break;
        }
        resolve();
      });
    }
    function mouseDown() {
      panDown.value = true;
    }
    function mouseUp() {
      panDown.value = false;
    }
    function getPosInfo(e) {
      const y = Math.floor((e.clientX - offsetX) / sizeWidth);
      const x = Math.floor((e.clientY - offsetY) / sizeWidth);
      container.value.style.cursor = props.step === "cleanWall" ? "url('src/assets/cursor-erase.svg') 8 8,auto" : "url('src/assets/cursor-add.svg') 8 8, auto";
      if (x > size - 1 || x < 0 || y > size - 1 || y < 0) {
        brushPointStyle.value = {
          display: "none",
        };
        infoBox.value = {
          style: { display: "none" },
        };
        return;
      }
      infoBox.value = {
        x,
        y,
        style: {
          left: e.clientX + "px",
          top: e.clientY + "px",
          userSelect: "none",
        },
      };
      if (props.step === "drawWall" || props.step === "cleanWall") {
        brushPointStyle.value = {
          left: e.pageX - offsetX - 10 + "px",
          top: e.pageY - offsetY - 10 + "px",
          display: "block",
        };
        if (panDown.value) {
          dataRef[x][y].type = props.step === "drawWall" ? NodeTypeValue.WALL : NodeTypeValue.OPEN;
          if (props.step === "drawWall") drawBox(dataRef[x][y]);
          else clearBox(dataRef[x][y]);
        }
      }
    }

    return {
      canvasGrid,
      canvasDraw,
      container,
      canvasWidth: size * sizeWidth,
      infoBox,
      getPosition,
      mouseDown,
      mouseUp,
      brushPointStyle,
      getPosInfo: _.throttle(getPosInfo, 0),
    };
  },
};
</script>

<style scoped>
.row {
  display: flex;
  justify-content: flex-start;
}
.col {
  display: flex;
  justify-content: flex-start;
}
.border {
  border: 1px solid black;
}
.container {
  cursor: url("../assets/cursor-add.svg") 8 8, auto;
  width: 456px;
  position: relative;
}
.container canvas {
  position: absolute;
  left: 0;
  top: 0;
}
.bg {
  background: red;
}
.block {
  width: 10px;
  height: 10px;
}
.floatBox {
  width: 40px;
  height: 20px;
  text-align: center;
  font-size: 12px;
  position: absolute;
  transform: translateY(10px);
  user-select: none;
  border: 1px solid burlywood;
  border-radius: 4px;
  background-color: burlywood;
  line-height: 20px;
}
.brush-point {
  background: #4a47ff;
  position: absolute;
  border-radius: 50%;
  display: none;
  z-index: 10;
  width: 20px;
  height: 20px;
}
</style>
