<template>
  <div class="app">
    <div class="top">
      <Menu v-model="current" mode="horizontal">
        <MenuItem key="nodeXlsx">
        <RouterLink to="/node-xlsx">
          <Icon type="appstore" /> NodeXlsx
        </RouterLink>
        </MenuItem>
        <MenuItem key="astar">
        <RouterLink to="/astar">
          <Icon type="appstore" /> Astar
        </RouterLink>
        </MenuItem>
        <MenuItem key="basicGraphic">
        <RouterLink to="/basicGraphic">
          <Icon type="appstore" /> BasicGraphic
        </RouterLink>
        </MenuItem>
        <MenuItem key="ImgDraw">
        <RouterLink to="/imgDraw">
          <Icon type="appstore" /> ImgDraw
        </RouterLink>
        </MenuItem>
      </Menu>

    </div>
    <RouterView />
  </div>

</template>

<script>
import "ant-design-vue/dist/antd.css";
import { Button, Menu, Icon } from "ant-design-vue";
import { ref } from 'vue';
const MenuItem = Menu.Item;
export default {
  name: "App",
  components: {
    Button,
    Menu,
    MenuItem,
    Icon,
  },
  setup() {
    const current = ref(['astar']);
    return { current }
  }
};
</script>
<style scoped>
.app {
  padding: 10px;
}
.top {
  padding: 10px 0;
}
</style>