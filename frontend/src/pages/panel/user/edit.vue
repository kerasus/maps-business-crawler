<template>
  <entity-edit
    :key="entityEditKey"
    v-model:value="inputs"
    :title="label"
    :api="api"
    :entity-id-key="entityIdKey"
    :entity-param-key="entityParamKey"
    :index-route-name="indexRouteName"
    :show-route-name="showRouteName"
    :show-expand-button="false"
    :after-load-input-data="afterLoadInputData" />
  <q-separator class="q-my-md" />
  <q-card>
    <q-card-section>
      <role-list
        v-if="userData"
        :user="userData"
        :edit-mode="true"
        @change="onChangeUserRole" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import RoleList from 'src/components/roleList.vue'
import { EntityEdit } from 'quasar-crud'
import UserAPI, { type UserType } from 'src/repositories/user'

const route = useRoute()
const userAPI = new UserAPI()
const entityEditKey = ref(Date.now())
const userData = ref<UserType | null>(null)
const userId = computed(() => (route.params.id ? parseInt(route.params.id?.toString()) : 0))
const api = ref(userAPI.endpoints.byId(userId.value))
const label = ref('ویرایش کاربر')
const indexRouteName = ref('Panel.User.List')
const showRouteName = ref('Panel.User.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([
  { type: 'hidden', name: 'id', responseKey: 'id' },
  { type: 'input', name: 'firstname', responseKey: 'firstname', label: 'نام', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'input', name: 'lastname', responseKey: 'lastname', label: 'نام خانوادگی', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'input', name: 'employee_code', responseKey: 'employee_code', label: 'کد پرسنلی', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'separator', name: 'space', size: '0', col: 'col-md-12' },
  { type: 'input', name: 'username', responseKey: 'username', label: 'نام کاربری', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'input', name: 'password', responseKey: 'password', label: 'کلمه عبور جدید', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'input', name: 'mobile', responseKey: 'mobile', label: 'تلفن همراه', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'input', name: 'email', responseKey: 'email', label: 'ایمیل', placeholder: ' ', col: 'col-md-3 col-12' }
])

function afterLoadInputData (data: UserType) {
  userData.value = data
}

function onChangeUserRole () {
  entityEditKey.value = Date.now()
}
</script>
