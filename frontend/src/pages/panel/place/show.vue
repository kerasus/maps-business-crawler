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
      <place-tag-list
        v-if="placeData"
        :place="placeData"
        :edit-mode="false"
        @change="onChangeTags" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import getInputs from './inputs'
import { EntityShow } from 'quasar-crud'
import PlaceAPI, { type PlaceType } from 'src/repositories/place'
import PlaceTagList from 'src/components/placeTagList.vue'

const placeAPI = new PlaceAPI()
const route = useRoute()
const placeId = computed(() => (route.params.id ? parseInt(route.params.id.toString()) : 0))

const entityShowKey = ref(Date.now())
const placeData = ref<PlaceType | null>(null)
const api = ref(placeAPI.endpoints.byId(placeId.value))
const label = ref('مشاهده مکان')
const indexRouteName = ref('Panel.Place.List')
const showRouteName = ref('Panel.Place.Show')
const editRouteName = ref('Panel.Place.Edit')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([{ type: 'hidden', name: 'id', responseKey: 'id' }, ...getInputs()])

function afterLoadInputData (data: PlaceType) {
  placeData.value = data
}

function onChangeTags () {
  entityShowKey.value = Date.now()
}
</script>
