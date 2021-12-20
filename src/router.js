import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import Options from "../src/components/Options.vue";
import NodeXlsx from "../src/components/node-xlsx.vue";
import BasicGraphic from "./VIEW/basicGraphic.vue";
import ImgDraw from './VIEW/imgDraw.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: Options },
    {
      path: "/astar",
      component: Options,
      children:{
        path: "/astar",
        component: Options,
      }
    },
    {
      path: "/node-xlsx",
      component: NodeXlsx,
    },
    {
      path: "/basicGraphic",
      component: BasicGraphic,
    },
    {
      path: "/imgDraw",
      component: ImgDraw,
    },
    
  ],
});

export default router;
