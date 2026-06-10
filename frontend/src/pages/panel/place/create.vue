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
import { onMounted, ref } from 'vue'
import getInputs from './inputs'
import { EntityCreate } from 'quasar-crud'
import TagAPI from 'src/repositories/tag'
import PlaceAPI from 'src/repositories/place'

const placeAPI = new PlaceAPI()
const tagAPI = new TagAPI()

const api = ref(placeAPI.endpoints.base)
const label = ref('مکان جدید')
const indexRouteName = ref('Panel.Place.List')
const showRouteName = ref('Panel.Place.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref(getInputs())

onMounted(async () => {
  const response = await tagAPI.index({ length: 200 })
  inputs.value = getInputs(
    response.data.map((tag) => ({ label: tag.name ?? '', value: tag.id as number }))
  )
})

</script>
