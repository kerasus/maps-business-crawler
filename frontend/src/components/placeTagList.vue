<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TagAPI, { type TagType } from 'src/repositories/tag'
import PlaceAPI, { type PlaceType } from 'src/repositories/place'
import { useUser } from 'src/stores/user'

const props = defineProps<{
  place: PlaceType;
  editMode: boolean;
}>()

const emits = defineEmits(['change'])

const userManager = useUser()
const tagAPI = new TagAPI()
const placeAPI = new PlaceAPI()

const loading = ref(false)
const tagOptions = ref<Array<{ label: string, value: number }>>([])
const selectedTagIds = ref<number[]>([])

onMounted(async () => {
  await loadTagOptions()
  selectedTagIds.value = props.place.tags?.map((tag) => tag.id as number) ?? []
})

async function loadTagOptions () {
  const response = await tagAPI.index({ length: 200 })
  tagOptions.value = response.data.map((tag: TagType) => ({
    label: tag.name ?? '',
    value: tag.id as number
  }))
}

async function syncTags () {
  if (!props.place?.id) {
    return
  }

  try {
    loading.value = true
    await placeAPI.syncTags(props.place.id, selectedTagIds.value)
    emits('change')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-list
    bordered
    separator
    class="place-tag-list">
    <q-item>
      <q-item-section>
        <q-item-label>برچسب‌ها</q-item-label>
      </q-item-section>
      <q-item-section
        v-if="editMode && userManager.hasPermission('places.manage-tags')"
        side>
        <div class="row items-center q-gutter-sm">
          <q-select
            v-model="selectedTagIds"
            :options="tagOptions"
            :loading="loading"
            emit-value
            map-options
            multiple
            use-chips
            label="برچسب"
            style="min-width: 260px" />
          <q-btn
            color="primary"
            flat
            icon="save"
            :loading="loading"
            @click="syncTags" />
        </div>
      </q-item-section>
    </q-item>
    <q-linear-progress
      v-if="loading"
      indeterminate />
    <template v-else>
      <q-item
        v-for="tag in place.tags"
        :key="tag.id ?? tag.slug ?? tag.name">
        <q-item-section avatar>
          <span
            v-if="tag.color"
            :style="{
              backgroundColor: tag.color,
              width: '12px',
              height: '12px',
              display: 'inline-block',
              borderRadius: '50%'
            }" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ tag.name }}</q-item-label>
          <q-item-label caption>{{ tag.slug }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="!place.tags?.length">
        <q-item-section>
          <q-item-label caption>برچسبی ثبت نشده است.</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>
