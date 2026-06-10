<template>
  <div class="no-data-component">
    <q-img src="/panel/images/no-data.svg" />
    <div class="no-data-message">
      {{ $t('noDataMessage') }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.no-data-component{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-4;
    padding-top: $space-20;
    .q-img{
        width: 110px;
    }
    .no-data-message{
        color: $color-text2;
        @include typo-label-2
    }
}
</style>
