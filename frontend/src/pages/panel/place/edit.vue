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
      <place-tag-list
        v-if="placeData"
        :place="placeData"
        :edit-mode="true"
        @change="onChangeTags" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import getInputs from './inputs'
import { EntityEdit } from 'quasar-crud'
import TagAPI from 'src/repositories/tag'
import PlaceAPI, { type PlaceType } from 'src/repositories/place'
import PlaceTagList from 'src/components/placeTagList.vue'

const placeAPI = new PlaceAPI()
const tagAPI = new TagAPI()
const route = useRoute()
const placeId = computed(() => (route.params.id ? parseInt(route.params.id.toString()) : 0))

const entityEditKey = ref(Date.now())
const placeData = ref<PlaceType | null>(null)
const api = ref(placeAPI.endpoints.byId(placeId.value))
const label = ref('ویرایش مکان')
const indexRouteName = ref('Panel.Place.List')
const showRouteName = ref('Panel.Place.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([{ type: 'hidden', name: 'id', responseKey: 'id' }, ...getInputs()])

onMounted(async () => {
  const response = await tagAPI.index({ length: 200 })
  inputs.value = [
    { type: 'hidden', name: 'id', responseKey: 'id' },
    ...getInputs(response.data.map((tag) => ({ label: tag.name ?? '', value: tag.id as number })))
  ]
})

function afterLoadInputData (data: PlaceType) {
  placeData.value = data
  const tagIdsInput = inputs.value.find((input) => input.name === 'tag_ids') as { value?: number[] } | undefined
  if (tagIdsInput) {
    tagIdsInput.value = data.tags?.map((tag) => tag.id as number) ?? []
  }
}

function onChangeTags () {
  entityEditKey.value = Date.now()
}

</script>
