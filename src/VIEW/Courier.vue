<template>
  <div class="app">
    <a-table :columns="columns" :data-source="dataSource" bordered>
      <template v-for="col in ['name', 'phone', 'address', 'info']" #[col]="{ text, record }" :key="col">
        <div>
          <a-input v-if="editableData[record.key]" v-model:value="editableData[record.key][col]" style="margin: -5px 0" />
          <template v-else>
            {{ text }}
          </template>
        </div>
      </template>
      <template #operation="{ record }">
        <div class="editable-row-operations">
          <span v-if="editableData[record.key]">
            <a @click="save(record.key)" style="margin-right: 10px">Save</a>
            <a-popconfirm title="Sure to cancel?" @confirm="cancel(record.key)">
              <a>Cancel</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a @click="edit(record.key)">Edit</a>
            <a-popconfirm v-if="dataSource.length" title="Sure to delete?" @confirm="onDelete(record.key)">
              <a>Delete</a>
            </a-popconfirm>
          </span>
        </div>
      </template>
    </a-table>

    <Textarea placeholder="输入你的快递信息" :value="addressText" @change="addRessTextChange" style="margin-top:10px;margin-bottom: 10px" :rows="4" />
    <a-input-number v-model:value="boxNumber" :min="0" :max="100" :formatter="value => `${value}盒`" :parser="value => value.replace('盒', '')" />
    <p></p>
    <Button type="primary" ghost @click="parseAddress" style="margin-right: 10px">识别</Button>
    <Button type="primary" @click="exportData">导出</Button>
  </div>
</template>

<script>
import 'ant-design-vue/dist/antd.css';
import { Table, Button, Input, InputNumber } from 'ant-design-vue';
import { reactive, ref } from 'vue';
import { cloneDeep } from 'lodash';
import AddressParse from 'address-parse';
import { exportExcel } from '../work.js';
const Textarea = Input.TextArea;
const columns = [
  {
    title: '收货人',
    dataIndex: 'name',
    width: 150,
    slots: { customRender: 'name' },
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 150,
    slots: { customRender: 'phone' },
  },
  {
    title: '地址',
    dataIndex: 'address',
    width: 300,
    slots: { customRender: 'address' },
  },
  {
    title: '备注',
    dataIndex: 'info',
    width: 100,
    slots: { customRender: 'info' },
  },
  {
    title: 'operation',
    dataIndex: 'operation',
    fixed: 'right',
    width: 140,
    slots: { customRender: 'operation' },
  },
];
const data = [];

export default {
  name: 'App',
  components: {
    Table,
    Button,
    Textarea,
    Input,
  },
  setup() {
    const dataSource = ref(data);
    const editableData = reactive({});
    const index = ref(0);
    const edit = key => {
      console.log(dataSource.value);
      editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
    };
    const save = key => {
      Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
      delete editableData[key];
    };
    const cancel = key => {
      delete editableData[key];
    };
    const onDelete = key => {
      dataSource.value = dataSource.value.filter(item => item.key !== key);
    };
    const addressText = ref('');

    const boxNumber = ref(2);
    const addRessTextChange = e => {
      addressText.value = e.target.value;
    };
    const parseAddress = () => {
      //地址解析
      console.log(addressText.value);
      /*判断解析的地址内容不为空*/
      if (addressText.value != '' && boxNumber.value) {
        const result = AddressParse.parse(addressText.value);
        console.log(result);
        const data = {
          key: index.value,
          name: result[0].name,
          phone: result[0].mobile,
          address: `${result[0].province}${result[0].city}${result[0].area}` + result[0].details,
          input: `${result[0].province}-${result[0].city}-${result[0].area}`,
          info: boxNumber.value + '盒',
        };
        index.value++;

        dataSource.value.push(data);
      } else {
        console.log('请输入你要解析的地址');
        this.toast('请输入您要解析的地址信息');
      }
    };
    const exportData = () => {
      const header = [
        { name: '收货人' },
        { phone: '手机号' },
        { address: '地址' },
        { info: '备注' },
        { from: '发件人' },
        { fromPhone: '发件手机号' },
        { fromAddress: '发件地址' },
      ];

      const data = dataSource.value.map(item => ({
        ...item,
        ...{ from: '黄伟才', fromPhone: '13751587777', fromAddress: '广东省广州市白云区长红村双南工业区1号（星银）' },
      }));
      exportExcel(header, data);
    };
    return {
      dataSource,
      columns,
      editingKey: '',
      editableData,
      edit,
      save,
      cancel,
      addressText,
      parseAddress,
      boxNumber,
      onDelete,
      addRessTextChange,
      exportData,
    };
  },
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
