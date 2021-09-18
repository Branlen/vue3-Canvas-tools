<template>
  <div class="box-contanier">
    <canvas ref="canvaseRef"></canvas>
  </div>
</template>
<script lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { asyncLoadImg } from "../util/canvas";
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
    const movePoint = ref({
      index: 0,
      offsetX: 0,
      offsetY: 0,
      active: false,
    });
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
      // 判断是否点击到八个坐标
      for (let i = 0; i < xPos.value.length; i++) {
        if (
          offsetY < yPos.value[i] + cicreRadius &&
          offsetY > +yPos.value[i] - cicreRadius &&
          offsetX < xPos.value[i] + cicreRadius &&
          offsetX > +xPos.value[i] - cicreRadius
        ) {
          console.log("choose", i);
          movePoint.value = { index: i, offsetX: offsetX, offsetY: offsetY, active: true };
          // 记住移动前 posX Y和imgW H的信息
          clickInfo.value = { drawWidth: imgWidth.value, drawHeight: imgHeight.value, drawY: posY.value, drawX: posX.value };
        }
      }
    };
    const move = (e: MouseEvent) => {
      const { offsetY, offsetX } = e;
      if (moving.value) {
        console.log(offsetX, offsetX - imgObjInfo.value!.width / 2);
        console.log(offsetY, offsetY - imgObjInfo.value!.height / 2);
        posX.value = offsetX - imgWidth.value / 2;
        posY.value = offsetY - imgHeight.value / 2;
      }
      // 监听点击之后滑动方向
      if (movePoint.value.active) {
        const centerX = posX.value + imgWidth.value / 2; // 实时更换中心点
        const centerY = posY.value + imgHeight.value / 2; // 实时更换中心点
        const inRange = (x1: number, x2: number, x: number) => (x1 > x2 ? x1 > x && x > x2 : x1 < x && x < x2);
        // 各个点的处理
        const clickPointOffsetX = movePoint.value.offsetX;
        const clickPointOffsetY = movePoint.value.offsetY;
        const { drawWidth, drawHeight, drawY, drawX } = clickInfo.value as drawInfo;
        const offsetMount = Math.max(Math.abs(clickPointOffsetX - offsetX), Math.abs(clickPointOffsetY - offsetY)); // 最大偏移量
        // NOTE 比较不是中心点，应该是更远的点，还需要判断他是从那个位置开始，所以需要加入每个位置中
        const isInner = inRange(centerX, movePoint.value.offsetX, offsetX) || inRange(centerY, movePoint.value.offsetY, offsetY); //朝内 
        console.log(offsetMount);
        console.log(isInner?'朝内':'朝外');
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
      canvasHtml.addEventListener("mousemove", move);
      drawFourLine();
    });
    const drawFourLine = () => {
      const ctx = canvasCtx.value as CanvasRenderingContext2D;
      ctx.strokeStyle = "#4a47ff";

      ctx.beginPath();
      console.log(xPos);
      for (let i = 0; i < xPos.value.length; i++) {
        ctx.moveTo(xPos.value[i] + cicreRadius, yPos.value[i]);
        ctx.arc(xPos.value[i], yPos.value[i], cicreRadius, 0, 2 * Math.PI);
      }

      ctx.fillStyle = "white";
      ctx.strokeStyle = "#4a47ff";
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(posX.value, posY.value);
      ctx.lineTo(posX.value + imgWidth.value, posY.value);
      ctx.lineTo(posX.value + imgWidth.value, posY.value + imgHeight.value);
      ctx.lineTo(posX.value, posY.value + imgHeight.value);
      ctx.lineTo(posX.value, posY.value);
      ctx.stroke();
    };
    watch([posX, posY, imgWidth, imgHeight], (now, prev) => {
      console.log(now, prev);
      canvasCtx.value?.clearRect(0, 0, 1000, 800);
      canvasCtx.value?.drawImage(imgObjInfo.value!, now[0], now[1], now[2], now[3]);
      drawFourLine();
    });
    // watch([posY], (now,prev) => {
    //   console.log(now,prev);
    // });
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
