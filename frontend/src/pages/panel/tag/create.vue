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
import getInputs from './inputs'
import { EntityCreate } from 'quasar-crud'
import TagAPI from 'src/repositories/tag'

const tagAPI = new TagAPI()
const api = ref(tagAPI.endpoints.base)
const label = ref('برچسب جدید')
const indexRouteName = ref('Panel.Tag.List')
const showRouteName = ref('Panel.Tag.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([...getInputs()])
</script>
