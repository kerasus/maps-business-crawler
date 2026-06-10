<template>
  <entity-create
    v-model:value="inputs"
    :title="label"
    :api="api"
    :entity-id-key="entityIdKey"
    :entity-param-key="entityParamKey"
    :index-route-name="indexRouteName"
    :show-route-name="showRouteName"
    :show-expand-button="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EntityCreate } from 'quasar-crud'
import UserAPI from 'src/repositories/user'

const userAPI = new UserAPI()
const api = ref(userAPI.endpoints.base)
const label = ref('کاربر جدید')
const indexRouteName = ref('Panel.User.List')
const showRouteName = ref('Panel.User.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([
  {
    type: 'input',
    name: 'firstname',
    responseKey: 'firstname',
    label: 'نام',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'lastname',
    responseKey: 'lastname',
    label: 'نام خانوادگی',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'employee_code',
    responseKey: 'employee_code',
    label: 'کد پرسنلی',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  { type: 'separator', name: 'space', size: '0', col: 'col-md-12' },
  {
    type: 'input',
    name: 'username',
    responseKey: 'username',
    label: 'نام کاربری',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'password',
    responseKey: 'password',
    label: 'کلمه عبور',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'mobile',
    responseKey: 'mobile',
    label: 'تلفن همراه',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'email',
    responseKey: 'email',
    label: 'ایمیل',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  }
])
</script>
