<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <q-card class="card-component">
    <q-card-section class="card-component-header">
      <div class="card-component-title">
        {{ title }}
      </div>
      <div class="card-component-actions">
        <slot name="actions" />
      </div>
    </q-card-section>
    <q-card-section class="card-component-body">
      <div class="full-width">
        <slot name="default" />
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped lang="scss">
.card-component {
  .card-component-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: $space-2;
    .card-component-title {
      background-image: linear-gradient(-310deg, #17ad37 0%, #98ec2d 100%);
      display: inline-block;
      padding: 0.55em 0.9em;
      font-size: 1.2em;
      font-weight: 700;
      line-height: 1;
      color: #fff;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: 0.45rem;
      margin-left: -24px;
    }
    .card-component-actions {

    }
  }
  .card-component-body  {
    padding: $space-2;
  }
}
</style>
