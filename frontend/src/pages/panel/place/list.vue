<template>
  <div class="q-mb-md row q-gutter-sm">
    <q-select
      v-model="importProvider"
      :options="providerOptions"
      emit-value
      map-options
      label="سرویس برای import"
      style="min-width: 200px"
      clearable />
    <q-btn
      color="primary"
      icon="cloud_download"
      label="Import از فایل کراولر"
      :loading="importLoading"
      @click="importPlaces" />
  </div>

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
      <template v-if="inputData.col.name === 'tags'">
        <q-chip
          v-for="tag in inputData.props.row.tags"
          :key="tag.id"
          dense
          size="sm"
          :style="tag.color ? { backgroundColor: tag.color } : {}">
          {{ tag.name }}
        </q-chip>
      </template>
      <template v-else-if="inputData.col.name === 'actions'">
        <div class="action-column-entity-index">
          <delete-btn
            :row="inputData.props.row"
            :api="placeAPI"
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
import PlaceAPI, { type PlaceType, providerOptions, getProviderLabel } from 'src/repositories/place'
import TagAPI from 'src/repositories/tag'

const $q = useQuasar()
const dateManager = useDate()
const placeAPI = new PlaceAPI()
const tagAPI = new TagAPI()

const importProvider = ref<string | null>(null)
const importLoading = ref(false)
const entityIndexRef = ref()

const api = ref(placeAPI.endpoints.base)
const label = ref('اماکن')
const createRouteName = ref('Panel.Place.Create')
const showRouteName = ref('Panel.Place.Show')
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
    { name: 'name', label: 'نام', align: 'left', field: (row: PlaceType) => row.name ?? '-' },
    {
      name: 'provider',
      label: 'سرویس',
      align: 'left',
      field: (row: PlaceType) => getProviderLabel(row.provider)
    },
    { name: 'phone', label: 'تلفن', align: 'left', field: (row: PlaceType) => row.phone ?? '-' },
    { name: 'address', label: 'آدرس', align: 'left', field: (row: PlaceType) => row.address ?? '-' },
    { name: 'tags', label: 'برچسب‌ها', align: 'left', field: () => '' },
    {
      name: 'created_at',
      label: 'زمان ایجاد',
      align: 'left',
      field: (row: PlaceType) =>
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
  { type: 'input', name: 'name', label: 'نام', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'input', name: 'phone', label: 'تلفن', placeholder: ' ', col: 'col-md-3 col-12' },
  { type: 'input', name: 'address', label: 'آدرس', placeholder: ' ', col: 'col-md-3 col-12' },
  {
    type: 'select',
    name: 'provider',
    label: 'سرویس',
    placeholder: ' ',
    options: providerOptions,
    col: 'col-md-3 col-12'
  }
])

async function loadTagFilterOptions () {
  const response = await tagAPI.index({ length: 200 })
  inputs.value.push({
    type: 'select',
    name: 'tag_ids',
    label: 'برچسب',
    placeholder: ' ',
    multiple: true,
    emitValue: true,
    mapOptions: true,
    options: response.data.map((tag) => ({ label: tag.name ?? '', value: tag.id })),
    col: 'col-md-4 col-12'
  } as never)
}

loadTagFilterOptions()

async function importPlaces () {
  importLoading.value = true
  try {
    const result = await placeAPI.import(importProvider.value ?? undefined)
    $q.notify({
      type: 'positive',
      message: `${result.message} (جدید: ${result.imported} / بروز: ${result.updated})`
    })
    entityIndexRef.value?.reload()
  } catch {
    $q.notify({ type: 'negative', message: 'خطا در import داده‌ها' })
  } finally {
    importLoading.value = false
  }
}

function afterRemove () {
  entityIndexRef.value.reload()
  $q.notify({ message: 'حذف با موفقیت انجام شد.', type: 'positive' })
}
</script>
