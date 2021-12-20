<template>
  <Row>
    <Col>
      <Checkbox v-model:checked="showMoreInfo">展示搜索信息</Checkbox>
    </Col>
  </Row>
  <Row>
    <Col span="2">
      <Button @click="() => changeStep('drawWall')" type="primary"> 绘制障碍 </Button>
    </Col>
    <Col span="2">
      <Button @click="() => changeStep('cleanWall')" type="primary"> 清除障碍 </Button>
    </Col>
    <Col span="2">
      <Button @click="saveData" type="primary">保存障碍</Button>
    </Col>
  </Row>
  <Row>
    <RadioGroup v-model:value="algorithm">
      <Radio value="aStar">A*算法</Radio>
      <Radio value="deep">深度遍历算法</Radio>
      <Radio value="breadth">广度遍历算法</Radio>
    </RadioGroup>
  </Row>
  <Row>
    <RadioGroup v-model:value="AStarModel">
      <Radio value="manhattan">曼哈顿距离</Radio>
      <Radio value="oppositeAngles">对角距离</Radio>
    </RadioGroup>
  </Row>
  
  <CanvasData :dataRef="dataRef" :size="size" :sizeWidth="sizeWidth" :AStarModel="AStarModel" :step="step" :showMoreInfo="showMoreInfo" @changeStep="changeStep"></CanvasData>
</template>

<script>
import { ref } from "vue";
import CanvasData from "./CanvasData.vue";
import { Button, Radio, Row, Col, Checkbox } from "ant-design-vue";
import _ from "lodash";
import {NodeTypeValue} from './util';
const RadioGroup = Radio.Group;
import {useRoute, useRouter} from 'vue-router';

export default {
  name: "Options",
  props: {},
  components: {
    Button,
    Radio,
    RadioGroup,
    CanvasData,
    Row,
    Col,
    Checkbox,
  },
  setup() {
    console.log(useRoute().matched);
    // const 
    const size = 40;
    const sizeWidth = 25;
    const AStarModel = ref("manhattan");
    const showMoreInfo = ref(false);
    const step = ref("start");
    /**
     * 'drawWall'|'cleanWall'|'start'|'end'
     */
    const dataRef = JSON.parse(window.localStorage.getItem("data")) || initData();
    function initData() {
      let nodes = [];
      for (var x = 0; x < size; x++) {
        nodes[x] = [];

        for (var y = 0; y < size; y++) {
          // type : open、wall
          nodes[x][y] = new Object({ x, y, type: NodeTypeValue.OPEN });
        }
      }
      return nodes;
    }

    function changeStep(stepName) {
      console.log(stepName);
      step.value = stepName;
    }
    function saveData() {
      window.localStorage.setItem("data", JSON.stringify(dataRef));
      changeStep("start");
      alert("保存成功");
    }
    return {
      AStarModel,
      showMoreInfo,
      dataRef,
      step,
      changeStep,
      size,
      sizeWidth,
      saveData,
    };
  },
};
</script>

<style scoped></style>
