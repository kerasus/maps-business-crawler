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
      <template v-if="inputData.col.name === 'name'">
        <span
          v-if="inputData.props.row.color"
          :style="{
            backgroundColor: inputData.props.row.color,
            width: '10px',
            height: '10px',
            display: 'inline-block',
            marginLeft: '5px'
          }" />
        {{ inputData.props.row.name }}
      </template>
      <template v-else-if="inputData.col.name === 'actions'">
        <div class="action-column-entity-index">
          <delete-btn
            :row="inputData.props.row"
            :api="tagAPI"
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
import { useDate } from 'src/composables/Date'
import DeleteBtn from 'src/components/controls/deleteBtn.vue'
import TagAPI, { type TagType } from 'src/repositories/tag'

const $q = useQuasar()
const dateManager = useDate()
const tagAPI = new TagAPI()

const api = ref(tagAPI.endpoints.base)
const label = ref('برچسب‌ها')
const createRouteName = ref('Panel.Tag.Create')
const showRouteName = ref('Panel.Tag.Show')
const itemIdentifyKey = ref('id')
const entityIndexRef = ref()

const tableKeys = ref({
  data: 'data',
  total: 'total',
  currentPage: 'current_page',
  perPage: 'per_page',
  pageKey: 'page'
})

const table = ref({
  columns: [
    { name: 'name', label: 'نام', align: 'left', field: (row: TagType) => row.name },
    { name: 'slug', label: 'اسلاگ', align: 'left', field: (row: TagType) => row.slug },
    {
      name: 'created_at',
      label: 'زمان ایجاد',
      align: 'left',
      field: (row: TagType) =>
        row.created_at
          ? dateManager.miladiToShamsi(row.created_at, 'YYYY-MM-DDThh:mm:ss', 'hh:mm:ss jYYYY/jMM/jDD')
          : '-'
    },
    { name: 'actions', label: 'عملیات', align: 'left', field: () => '' }
  ]
})

const inputs = ref([
  { type: 'hidden', name: 'sortation_field', value: 'created_at' },
  { type: 'hidden', name: 'sortation_order', value: 'desc' },
  { type: 'hidden', name: 'length', value: 30 },
  { type: 'input', name: 'name', label: 'نام', placeholder: ' ', col: 'col-md-4 col-12' },
  { type: 'input', name: 'slug', label: 'اسلاگ', placeholder: ' ', col: 'col-md-4 col-12' }
])

function afterRemove () {
  entityIndexRef.value.reload()
  $q.notify({ message: 'حذف با موفقیت انجام شد.', type: 'positive' })
}
</script>
