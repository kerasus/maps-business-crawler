<template>
  <entity-show
    :key="entityShowKey"
    v-model:value="inputs"
    :title="label"
    :api="api"
    :entity-id-key="entityIdKey"
    :entity-param-key="entityParamKey"
    :index-route-name="indexRouteName"
    :show-route-name="showRouteName"
    :edit-route-name="editRouteName"
    :show-expand-button="false"
    :after-load-input-data="afterLoadInputData" />
  <q-separator class="q-my-md" />
  <q-card>
    <q-card-section>
      <role-list
        v-if="userData"
        :user="userData"
        :edit-mode="false"
        @change="onChangeUserRole" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { EntityShow } from 'quasar-crud'
import RoleList from 'src/components/roleList.vue'
import UserAPI, { type UserType } from 'src/repositories/user'

const route = useRoute()
const userAPI = new UserAPI()

const userId = computed(() => (route.params.id ? parseInt(route.params.id?.toString()) : 0))


const entityShowKey = ref(Date.now())
const userData = ref<UserType | null>(null)
const api = ref(userAPI.endpoints.byId(userId.value))
const label = ref('مشاهده کاربر')
const indexRouteName = ref('Panel.User.List')
const showRouteName = ref('Panel.User.Show')
const editRouteName = ref('Panel.User.Edit')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([
  {
    type: 'hidden',
    name: 'id',
    responseKey: 'id'
  },
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


function afterLoadInputData (data: UserType) {
  userData.value = data
}

function onChangeUserRole () {
  entityShowKey.value = Date.now()
}
</script>
