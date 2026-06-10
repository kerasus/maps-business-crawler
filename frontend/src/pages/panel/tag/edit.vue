<template>
  <entity-edit
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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import getInputs from './inputs'
import { EntityEdit } from 'quasar-crud'
import TagAPI from 'src/repositories/tag'

const tagAPI = new TagAPI()
const route = useRoute()
const tagId = computed(() => (route.params.id ? parseInt(route.params.id.toString()) : 0))

const api = ref(tagAPI.endpoints.byId(tagId.value))
const label = ref('ویرایش برچسب')
const indexRouteName = ref('Panel.Tag.List')
const showRouteName = ref('Panel.Tag.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([{ type: 'hidden', name: 'id', responseKey: 'id' }, ...getInputs()])
</script>
