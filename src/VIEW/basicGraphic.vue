<template>
  <div class="draw " ref="container" @mousedown="mouseDownG" @mousemove="mouseOverG" @mouseup="mouseUpG">
    <div id="word" class="square" :style="styleObject" @dragstart="drapStart" @dragend="dragend">
      <div class="center">

        <svg t="1621856560280" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="701" :width="width" :height="height">
          <path d="M960.031235 159.921913v703.656418c0 52.974134-42.979014 95.953148-95.953148 95.953148h-703.656418c-52.974134 0-95.953148-42.979014-95.953148-95.953148v-703.656418c0-52.974134 42.979014-95.953148 95.953148-95.953148h703.656418c52.974134 0 95.953148 42.979014 95.953148 95.953148z m-831.593949-159.921913C57.771791 0 0.499756 57.272035 0.499756 127.937531v767.625183c0 70.665495 57.272035 127.937531 127.93753 127.93753h767.625183c70.665495 0 127.937531-57.272035 127.937531-127.93753v-767.625183c0-70.665495-57.272035-127.937531-127.937531-127.937531h-767.625183z" p-id="702" style="user-select: auto;"></path>
        </svg>
      </div>
      <div class="guangguang">
        <span class="tr"></span>
        <span class="tl"></span>
        <span class="bl"></span>
        <span class="br"></span>
      </div>
      div
    </div>
  </div>

  <div @drop="drop" @dragover="allowDrag" class="div"></div>
  <canvas></canvas>
  <canvas ref="star"></canvas>
  <canvas ref="triangle"></canvas>
</template>

<script lang='ts'>
import _ from "lodash";
import { onMounted, ref } from "vue";
export default {
  name: "basicGraphic",
  setup() {
    const width = ref(50);
    const height = ref(50);
    const styleObject = ref({ top: "0px", left: "10px" });
    const container = ref(null);
    const star = ref(null);
    const triangle = ref(null);

    window.addEventListener("mousemove", (e) => {
      // console.log(e.clientX, e.clientY)
    });
    function drapStart(ev) {
      ev.dataTransfer.setData("text", ev.target.id);
      ev.dataTransfer.effectAllowed = "copy";
    }
    function dragend(e) {
      // e.
    }
    onMounted(() => {
      drawFiveStar();
      drawTriangle();
    });
    function drawFiveStar() {
      const canvas = star.value as HTMLCanvasElement;
      console.log(canvas);
      canvas.width = 500;
      canvas.height = 600;
      if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        let horn = 5;
        let angle = 360 / horn;
        let R = 200;
        const r = 80;
        const x = 200,
          y = 200;
        for (let i = 0; i < horn; i++) {
          // 外圆点坐标
          ctx.lineTo(
            Math.cos(((18 + i * angle) / 180) * Math.PI) * R + x,
            -Math.sin(((18 + i * angle) / 180) * Math.PI) * R + y
          );
          // 内圆点坐标
          ctx.lineTo(
            Math.cos(((54 + i * angle) / 180) * Math.PI) * r + x,
            -Math.sin(((54 + i * angle) / 180) * Math.PI) * r + y
          );
        }
        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.fillStyle = "#e4ef00";
        ctx.strokeStyle = "red";
        ctx.fill();
        ctx.stroke();
      }
    }

    function drawTriangle() {
      const canvas = triangle.value as HTMLCanvasElement;
      if (canvas.getContext) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        const r = 50;
        canvas.width = 500;
        canvas.height = 575;
        ctx.beginPath();
        const x = 50,
          y = 50;
        for (let i = 0; i < 3; i++) {
          ctx.lineTo(
            Math.cos(((90 + i * 120) / 180) * Math.PI) * r + x,
            -Math.sin(((90 + i * 120) / 180) * Math.PI) * r + y
          );
        }
        ctx.closePath()
        ctx.fillStyle = 'blue';
        ctx.strokeStyle ='red';
        ctx.fill();
        ctx.stroke();
      }
      function drawDashedLine(pattern) {
  ctx.beginPath();
  ctx.setLineDash(pattern);
  ctx.moveTo(0, y);
  ctx.lineTo(300, y);
  ctx.stroke();
  y += 20;
  
}

const ctx = canvas.getContext('2d');
let y = 100;

drawDashedLine([]);
drawDashedLine([1, 1,11,1]);
drawDashedLine([10, 10]);
drawDashedLine([20, 5]);
drawDashedLine([15, 3, 3, 3]);
drawDashedLine([20, 3, 3, 3, 3, 3, 3, 3]);
drawDashedLine([12, 3, 3]);  // Equals [12, 3, 3, 12, 3, 3]
// Create a linear gradient
// The start gradient point is at x=20, y=0
// The end gradient point is at x=220, y=0
var gradient = ctx.createLinearGradient(20,0, 150,0);

// Add three color stops
gradient.addColorStop(0, 'green');
gradient.addColorStop(.5, 'cyan');
gradient.addColorStop(1, 'green');

// Set the fill style and draw a rectangle
ctx.fillStyle = gradient;
ctx.fillRect(20, 20, 250, 100);
    }

    function drop(ev) {
      console.log(
        "drop: dropEffect = " +
          ev.dataTransfer.dropEffect +
          " ; effectAllowed = " +
          ev.dataTransfer.effectAllowed
      );
      ev.preventDefault();

      // Get the id of the target and add the moved element to the target's DOM
      var data = ev.dataTransfer.getData("text");
      const node = document.getElementById(data);
      ev.target.appendChild(node);
    }
    function allowDrag(ev) {
      console.log(
        "dragOver: dropEffect = " +
          ev.dataTransfer.dropEffect +
          " ; effectAllowed = " +
          ev.dataTransfer.effectAllowed
      );
      ev.preventDefault();
      // Set the dropEffect to move
      ev.dataTransfer.dropEffect = "copy";
    }
    const start = ref(false);
    function mouseDownG(ev) {
      start.value = true;
    }
    function mouseOverG(ev) {
      const { offsetLeft, offsetTop } = container.value;
      if (start.value) {
        styleObject.value = {
          top: ev.pageY - offsetTop - 30 + "px",
          left: ev.pageX - offsetLeft - 30 + "px",
        };
      }
    }
    function mouseUpG(ev) {
      start.value = false;
    }
    return {
      drapStart,
      drop,
      allowDrag,
      dragend,
      width,
      height,
      styleObject,
      mouseDownG,
      mouseOverG,
      mouseUpG,
      container,
      star,
      triangle
    };
  },
};
</script>

<style>
.div {
  width: 100px;
  height: 100px;
  border: 1px solid black;
}
.square {
  width: 60px;
  height: 60px;
  transition: all 0s;
  position: absolute;
}
.center {
  padding: 5px;
}
.draw {
  width: 50vh;
  height: 400px;
  background-color: darkgrey;
  position: relative;
}
.guangguang {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgb(197, 32, 32);
  top: 0;
  left: 0;
  cursor: move;
}
.tl {
  top: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  background-color: chartreuse;
  position: absolute;
  cursor: se-resize;
}
.tr {
  top: -3px;
  right: -3px;
  width: 6px;
  height: 6px;
  background-color: chartreuse;
  position: absolute;
  cursor: sw-resize;
}
.bl {
  bottom: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  background-color: chartreuse;
  position: absolute;
  cursor: sw-resize;
}
.br {
  bottom: -3px;
  right: -3px;
  width: 6px;
  height: 6px;
  background-color: chartreuse;
  position: absolute;
  cursor: se-resize;
}
</style>