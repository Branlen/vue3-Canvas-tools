<template>
  <div class="box-contanier">
    <canvas ref="canvaseRef"></canvas>
  </div>
</template>
<script lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { asyncLoadImg } from "../util/canvas";
import { throttle } from "lodash";
interface drawInfo {
  drawWidth: number;
  drawHeight: number;
  drawY: number;
  drawX: number;
}
export default {
  name: "ImgDraw",
  setup() {
    const cicreRadius = 10; // 选择圈的大小
    const canvaseRef = ref(null);
    const moving = ref(false);
    const canvasCtx = ref<CanvasRenderingContext2D | null>(null);
    const imgObjInfo = ref<HTMLImageElement | null>(null);
    const imgWidth = ref<number>(0);
    const imgHeight = ref<number>(0);
    const posX = ref(100);
    const posY = ref(100);
    const clickInfo = ref<drawInfo | null>(null);
    const movePoint = ref({
      index: 0,
      offsetX: 0,
      offsetY: 0,
      active: false,
    });
    const angleValue = ref(90); // 旋转度数
    const angleInfo = ref({
      active: false,
      angle: angleValue.value,
    });
    const xPos = computed(() => [
      posX.value,
      posX.value + imgWidth.value / 2,
      posX.value + imgWidth.value,
      posX.value,
      posX.value + imgWidth.value,
      posX.value,
      posX.value + imgWidth.value / 2,
      posX.value + imgWidth.value,
    ]);
    const yPos = computed(() => [
      posY.value,
      posY.value,
      posY.value,
      posY.value + imgHeight.value / 2,
      posY.value + imgHeight.value / 2,
      posY.value + imgHeight.value,
      posY.value + imgHeight.value,
      posY.value + imgHeight.value,
    ]);
    const centerPoint = computed(() => ({ x: posX.value + imgWidth.value / 2, y: posY.value + imgHeight.value / 2 }));
    const mouseStart = (e: MouseEvent) => {
      const { offsetY, offsetX } = e;
      console.log(offsetX, offsetY, posX.value, imgObjInfo.value?.width, imgObjInfo.value?.height);
      if (
        posX.value + cicreRadius < offsetX &&
        posX.value + imgWidth.value - cicreRadius > offsetX &&
        posY.value + cicreRadius < offsetY &&
        posY.value + imgHeight.value - cicreRadius > offsetY
      ) {
        moving.value = true;
        console.log("moved");
        //TODO 记录位置在图片偏移量，而不是对半
      }
      const adjustPointInRadius = (x: number, y: number) =>
        offsetY < y + cicreRadius && offsetY > +y - cicreRadius && offsetX < x + cicreRadius && offsetX > +x - cicreRadius;
      // 判断需要增加判断点的旋转后的位置通过向量来计算，通过一个已知向量和一个未知向量的已知夹角计算，并且向量值是一样的???
      // 判断是否点击到八个坐标
      for (let i = 0; i < xPos.value.length; i++) {
        if (adjustPointInRadius(xPos.value[i], yPos.value[i])) {
          console.log("choose", i);
          movePoint.value = { index: i, offsetX: offsetX, offsetY: offsetY, active: true };
          // 记住移动前 posX Y和imgW H的信息
          clickInfo.value = { drawWidth: imgWidth.value, drawHeight: imgHeight.value, drawY: posY.value, drawX: posX.value };
        }
      }
      //   点击到选择按钮
      if (adjustPointInRadius(posX.value + imgWidth.value / 2, posY.value - 40)) {
        console.log("旋转");
        angleInfo.value = { active: true, angle: angleValue.value };
      }
    };
    const move = (e: MouseEvent) => {
      const { offsetY, offsetX } = e;
      if (moving.value) {
        posX.value = offsetX - imgWidth.value / 2;
        posY.value = offsetY - imgHeight.value / 2;
      }
      // 监听旋转
      if (angleInfo.value.active) {
        const calculateDegree = (x: number, y: number, centerX: number, centerY: number) => {
          // 根据当前坐标和中心坐标计算角度
          const radians = Math.atan2(y - centerY, centerX - x);
          return radians * (180 / Math.PI);
        };
        const angle = calculateDegree(offsetY, offsetX, centerPoint.value.x, centerPoint.value.y);
        // deg 0=>360
        angleValue.value = angle < 0 ? angle + 360 : angle;
      }
      // 监听点击之后滑动方向
      if (movePoint.value.active) {
        const inRange = (x1: number, x2: number, x: number) => (x1 > x2 ? x1 > x && x > x2 : x1 < x && x < x2);
        // 各个点的处理
        const clickPointOffsetX = movePoint.value.offsetX;
        const clickPointOffsetY = movePoint.value.offsetY;
        const { drawWidth, drawHeight, drawY, drawX } = clickInfo.value as drawInfo;
        const offsetMount = Math.max(Math.abs(clickPointOffsetX - offsetX), Math.abs(clickPointOffsetY - offsetY)); // 最大偏移量
        // NOTE 比较不是中心点，应该是更远的点，还需要判断他是从那个位置开始，所以需要加入每个位置中
        const isInner = inRange(centerPoint.value.x, clickPointOffsetX, offsetX) || inRange(centerPoint.value.y, clickPointOffsetY, offsetY); //朝内
        console.log(offsetY, clickPointOffsetY);
        console.log(offsetMount);
        console.log(isInner ? "朝内" : "朝外");
        switch (movePoint.value.index) {
          case 0: // left top
            if (isInner) {
              posX.value = drawX + offsetMount;
              posY.value = drawY + offsetMount;
              imgWidth.value = drawWidth - offsetMount;
              imgHeight.value = drawHeight - offsetMount;
            } else {
              posX.value = drawX - offsetMount;
              posY.value = drawY - offsetMount;
              imgWidth.value = drawWidth + offsetMount;
              imgHeight.value = drawHeight + offsetMount;
            }
            break;
          case 7: //right bottom
            imgWidth.value = drawWidth + (isInner ? -offsetMount : offsetMount);
            imgHeight.value = drawHeight + (isInner ? -offsetMount : offsetMount);
            break;
          case 2: //right top
            posY.value = drawY + (isInner ? offsetMount : -offsetMount);
            imgWidth.value = drawWidth + (isInner ? -offsetMount : offsetMount);
            imgHeight.value = drawHeight + (isInner ? -offsetMount : offsetMount);
            break;
          case 5: //left bottom
            posX.value = drawX + (isInner ? offsetMount : -offsetMount);
            imgWidth.value = drawWidth + (isInner ? -offsetMount : offsetMount);
            imgHeight.value = drawHeight + (isInner ? -offsetMount : offsetMount);
            break;
          case 1: //top center
            posY.value = drawY + (isInner ? offsetMount : -offsetMount);
            imgHeight.value = drawHeight + (isInner ? -offsetMount : offsetMount);
            break;
          case 3: //center left
            posX.value = drawX + (isInner ? offsetMount : -offsetMount);
            imgWidth.value = drawWidth + (isInner ? -offsetMount : offsetMount);
            break;
          case 4: //center right
            imgWidth.value = drawWidth + (isInner ? -offsetMount : offsetMount);
            break;
          case 6: //bottom center
            imgHeight.value = drawHeight + (isInner ? -offsetMount : offsetMount);
            break;
          default:
            break;
        }
      }
    };
    const moveEnd = () => {
      moving.value = false;
      movePoint.value = { ...movePoint.value, active: false };
      angleInfo.value.active = false;
      // 删除记住移动前的信息
      clickInfo.value = null;
    };
    onMounted(async () => {
      const canvasHtml = canvaseRef.value! as HTMLCanvasElement;
      const ctx = canvasHtml.getContext("2d");
      const imgObj = (await asyncLoadImg("src/assets/logo.png")) as HTMLImageElement;
      canvasHtml.width = 1000;
      canvasHtml.height = 800;
      canvasCtx.value = ctx;
      imgObjInfo.value = imgObj;
      imgWidth.value = imgObj.width;
      imgHeight.value = imgObj.height;
      ctx?.drawImage(imgObj, posX.value, posY.value);
      canvasHtml.addEventListener("mousedown", mouseStart);
      canvasHtml.addEventListener("mouseup", moveEnd);
      canvasHtml.addEventListener("mousemove", throttle(move, 16, { leading: true, trailing: true }));
      drawFourLine();

      // setInterval(()=>{
      //     angleValue.value=angleValue.value+1;
      //      const centerX = posX.value + imgWidth.value / 2; // 实时更换中心点
      // const centerY = posY.value + imgHeight.value / 2; // 实时更换中心点
      // canvasCtx.value?.clearRect(0, 0, 1000, 800);
      // canvasCtx.value?.translate(centerX, centerY);
      // canvasCtx.value?.rotate((angleValue.value * Math.PI) / 180);
      // canvasCtx.value?.translate(-centerX, -centerY);
      // canvasCtx.value?.drawImage(imgObjInfo.value!, posX.value, posY.value, imgWidth.value, imgHeight.value);
      // drawFourLine();
      // },200)
    });
    const drawFourLine = () => {
      const ctx = canvasCtx.value as CanvasRenderingContext2D;
      ctx.strokeStyle = "#4a47ff";

      ctx.beginPath();
      ctx.moveTo(posX.value, posY.value);
      ctx.lineTo(posX.value + imgWidth.value, posY.value);
      ctx.lineTo(posX.value + imgWidth.value, posY.value + imgHeight.value);
      ctx.lineTo(posX.value, posY.value + imgHeight.value);
      ctx.lineTo(posX.value, posY.value);
      ctx.stroke();
      // 绘制旋转按钮
      ctx.beginPath();
      ctx.moveTo(posX.value + imgWidth.value / 2, posY.value);
      ctx.lineTo(posX.value + imgWidth.value / 2, posY.value - 30);

      ctx.moveTo(posX.value + imgWidth.value / 2 + 10, posY.value - 40);
      ctx.arc(posX.value + imgWidth.value / 2, posY.value - 40, cicreRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      // 绘制九个点
      ctx.beginPath();
      for (let i = 0; i < xPos.value.length; i++) {
        ctx.moveTo(xPos.value[i] + cicreRadius, yPos.value[i]);
        ctx.arc(xPos.value[i], yPos.value[i], cicreRadius, 0, 2 * Math.PI);
      }

      ctx.fillStyle = "white";
      ctx.strokeStyle = "#4a47ff";
      ctx.fill();
      ctx.stroke();
    };
    watch([posX, posY, imgWidth, imgHeight, angleValue], (now, prev) => {
      console.log(now, prev);

      canvasCtx.value?.clearRect(0, 0, 1000, 800);
      canvasCtx.value?.translate(centerPoint.value.x, centerPoint.value.y);
      //这样是增量增加的，其实应该滚到初始位置，或者
      canvasCtx.value?.rotate(((now[4] - prev[4]) * Math.PI) / 180);

      canvasCtx.value?.translate(-centerPoint.value.x, -centerPoint.value.y);
      canvasCtx.value?.drawImage(imgObjInfo.value!, now[0], now[1], now[2], now[3]);
      drawFourLine();
    });
    return { canvaseRef };
  },
};
</script>
<style lang="less">
.box-contanier {
  width: 1000px;
  height: 800px;
  background: #e3e7e9;
  background-image: linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0),
    linear-gradient(45deg, #f6fafc 25%, transparent 0), linear-gradient(45deg, transparent 75%, #f6fafc 0);
  background-position: 0 0, 10px 10px, 10px 10px, 20px 20px;
  background-size: 20px 20px;
}
</style>
