<template>
  <div class="auth-page row">
    <div class="col-12">
      <div class="auth-page__login">
        <div class="row justify-center items-center full-width">
          <div class="col-md-5 col-sm-8 col-12">
            <div class="auth-page__login__head">
              <q-img src="/images/logo.png" />
            </div>
            <div class="auth-page__login__title">Maps Crawler</div>
            <div class="auth-page__login__subtitle">مدیریت اماکن و برچسب‌ها</div>
            <auth-component class="auth-component" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthComponent from 'src/components/AuthComponent.vue'

defineOptions({
  name: 'AuthPage'
})
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  padding: $space-10 $space-7;
  background-color: $color-surface;

  .auth-page__login {
    padding-top: $space-16;

    .auth-page__login__head {
      width: 120px;
      margin: auto;
      margin-bottom: $space-4;
    }

    .auth-page__login__title {
      text-align: center;
      margin-bottom: $space-2;
      color: $color-text1;
      @include typo-title-1;
    }

    .auth-page__login__subtitle {
      text-align: center;
      margin-bottom: $space-10;
      color: $color-text2;
    }
  }
}
</style>
