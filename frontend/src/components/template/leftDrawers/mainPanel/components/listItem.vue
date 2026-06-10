<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch, type ModelRef } from 'vue'

interface ListItem {
  icon: string;
  iconColor?: string;
  title: string;
  mainRouteName?: string;
  route?: { name: string; query?: Record<string, any> };
  child?: ListItem[];
  expanded?: boolean;
}

const items: ModelRef<ListItem[]> = defineModel('items', {
  type: Array,
  default: () => []
})

withDefaults(defineProps<{ mini?: boolean }>(), {
  mini: false
})

const route = useRoute()

function hasChild (item: ListItem | undefined): boolean {
  return !!item?.child && Array.isArray(item.child) && item.child.length > 0
}

function hasActiveChild (item: ListItem): boolean {
  if (!hasChild(item)) {
    return false
  }
  return item.child!.some((item: ListItem) => isActive(item))
}

function isRouteActive (PageRouteName: string, itemRouteName: string): boolean {
  return (
    PageRouteName === itemRouteName ||
    (PageRouteName.startsWith('Panel.InstrumentsManagement.InstrumentsList') &&
      itemRouteName.startsWith('Panel.InstrumentsManagement.InstrumentsList')) ||
    (PageRouteName.startsWith('Panel.OnlineManagement.Commission') &&
      itemRouteName.startsWith('Panel.OnlineManagement.Commission'))
  )
}

function isActive (item: ListItem): boolean {
  if (item.route && isRouteActive(route.name?.toString() || '', item.route.name)) {
    return true
  }
  if (hasChild(item)) {
    return item.child?.some((childItem) => isActive(childItem)) || false
  }
  return false
}

function loadExpandedAttrOfItems (items: ListItem[]): void {
  items.forEach((item) => {
    if (hasChild(item)) {
      item.expanded = hasActiveChild(item)
      loadExpandedAttrOfItems(item.child!)
    }
  })
}

watch(
  () => route.name,
  () => {
    loadExpandedAttrOfItems(items.value)
  },
  {
    immediate: true
  }
)
</script>

<template>
  <template
    v-for="item in items"
    :key="item.title">
    <q-expansion-item
      v-if="hasChild(item)"
      :model-value="item.expanded"
      :label="(item.title)"
      :icon="item.icon"
      class="menu-item">
      <list-item
        :items="item.child"
        :mini="mini" />
    </q-expansion-item>
    <q-item
      v-else
      v-ripple
      :active="isActive(item)"
      :to="item.route"
      clickable
      class="menu-item"
      :class="{ mini: mini }">
      <q-item-section avatar>
        <q-icon
          :name="item.icon"
          :color="item.iconColor" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ (item.title) }}</q-item-label>
      </q-item-section>
    </q-item>
  </template>
</template>

<style scoped lang="scss">
@mixin menu-item(){
  & {
    //color: $neutral-100;
    position: relative;
    padding-top: 0.675rem;
    padding-bottom: 0.675rem;
    color: #67748e;
    @include radius-2;
    .q-item__section--avatar {
      background-color: #fff !important;
      box-shadow:
        0 0.25rem 0.375rem -0.0625rem rgba(20, 20, 20, 0.12),
        0 0.125rem 0.25rem -0.0625rem rgba(20, 20, 20, 0.07) !important;
      padding: 10px;
      border-radius: 0.5rem;
      width: 32px;
      height: 32px;
      min-width: 32px;
      margin-right: $space-2 !important;
      .q-icon {
        font-size: 12px;
        color: #67748e !important;
      }
    }
  }
}

.menu-item {
  @include menu-item;
  &.q-item--active,
  &.q-router-link--active {
    color: #344767;
    font-weight: 600;
    background-color: #fff;
    box-shadow: 0 20px 27px 0 rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
    .q-item__section {
      z-index: 2;
    }
    .q-item__section--avatar {
      background-image: linear-gradient(310deg, #82d616 0%, #82d616 100%);
    }
    .q-icon {
      font-size: 12px;
      color: white !important;
    }
  }
  &:last-child {
    margin-bottom: 0;
  }
  &.q-expansion-item {
    padding: 0;
    :deep(.q-expansion-item__container) {
      & > .q-item {
        @include menu-item;
      }
      .q-expansion-item__content {
        padding-left: $space-2;
      }
    }
  }
  &.mini {
    .q-item__section--avatar {
      margin-right: $spacing-none !important;
      justify-content: center;
      align-content: center;
    }
  }
}
</style>
