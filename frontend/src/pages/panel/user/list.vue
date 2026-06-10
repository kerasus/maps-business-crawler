<template>
  <entity-index
    ref="entityIndexRef"
    :value="inputs"
    :title="label"
    :api="api"
    :table="table"
    :table-keys="tableKeys"
    :create-route-name="createRouteName"
    :show-route-name="showRouteName"
    :show-close-button="false"
    :show-expand-button="false"
    :show-reload-button="false"
    :show-search-button="true"
    :row-key="itemIdentifyKey">
    <template #entity-index-table-cell="{ inputData }">
      <template v-if="inputData.col.name === 'actions'">
        <div class="action-column-entity-index">
          <delete-btn
            :row="inputData.props.row"
            :api="userAPI"
            :use-flag="false"
            @change="afterRemove" />
          <q-btn
            color="primary"
            flat
            icon="visibility"
            :to="{ name: showRouteName, params: { id: inputData.props.row.id } }" />
        </div>
      </template>
      <template v-else>
        {{ inputData.col.value }}
      </template>
    </template>
  </entity-index>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { EntityIndex } from 'quasar-crud'
import UserAPI from 'src/repositories/user'
import { useDate } from 'src/composables/Date'
import DeleteBtn from 'src/components/controls/deleteBtn.vue'
import { type UserType, getUserRoleLabel, userRoleOptions } from 'src/repositories/user'

const $q = useQuasar()
const userAPI = new UserAPI()
const dateManager = useDate()
const api = ref(userAPI.endpoints.base)
const label = ref('کاربران')
const createRouteName = ref('Panel.User.Create')
const showRouteName = ref('Panel.User.Show')
const itemIdentifyKey = ref('id')
const tableKeys = ref({
  data: 'data',
  total: 'total',
  currentPage: 'current_page',
  perPage: 'per_page',
  pageKey: 'page'
})
const table = ref({
  columns: [
    {
      name: 'employee_code',
      required: true,
      label: 'کد پرسنلی',
      align: 'left',
      field: (row: UserType) => row.employee_code
    },
    {
      name: 'role',
      required: true,
      label: 'نقش',
      align: 'left',
      field: (row: UserType) => getUserRoleLabel(row.roles_list?.[0] ?? '')
    },
    {
      name: 'firstname',
      required: true,
      label: 'نام',
      align: 'left',
      field: (row: UserType) => row.firstname
    },
    {
      name: 'lastname',
      required: true,
      label: 'نام خانوادگی',
      align: 'left',
      field: (row: UserType) => row.lastname
    },
    {
      name: 'username',
      required: true,
      label: 'نام کاربری',
      align: 'left',
      field: (row: UserType) => row.username
    },
    {
      name: 'mobile',
      required: true,
      label: 'موبایل',
      align: 'left',
      field: (row: UserType) => row.mobile
    },
    {
      name: 'email',
      required: true,
      label: 'ایمیل',
      align: 'left',
      field: (row: UserType) => row.email
    },
    {
      name: 'created_at',
      required: true,
      label: 'زمان ایجاد',
      align: 'left',
      field: (row: UserType) => row.created_at ?
        dateManager.miladiToShamsi(row.created_at, 'YYYY-MM-DDThh:mm:ss', 'hh:mm:ss jYYYY/jMM/jDD') : '-'
    },
    {
      name: 'actions',
      required: true,
      label: 'عملیات',
      align: 'left',
      field: () => ''
    }
  ]
})
const inputs = ref([
  {
    type: 'hidden',
    name: 'sortation_field',
    value: 'created_at'
  },
  {
    type: 'hidden',
    name: 'sortation_order',
    value: 'desc'
  },
  {
    type: 'hidden',
    name: 'length',
    value: 30
  },
  {
    type: 'input',
    name: 'employee_code',
    label: 'کد پرسنلی',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'firstname',
    label: 'نام',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'lastname',
    label: 'نام خانوادگی',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'select',
    name: 'role',
    label: 'نقش',
    placeholder: ' ',
    options: userRoleOptions,
    col: 'col-md-3 col-12'
  }
])
const entityIndexRef = ref()

function afterRemove () {
  entityIndexRef.value.reload()
  $q.notify({
    message: 'حذف با موفقیت انجام شد.',
    type: 'positive'
  })
}
</script>
