<template>
  <div class="auth-component">
    <q-form @submit.prevent="onClickLoginBtn">
      <div class="auth-component__username">
        <q-input
          ref="usernameInput"
          v-model="username"
          label="نام کاربری"
          @keyup.enter="focusNext('passwordInput')" />
      </div>
      <div class="auth-component__password">
        <q-input
          ref="passwordInput"
          v-model="password"
          label="کلمه عبور"
          :type="passwordVisibility ? 'text' : 'password'"
          @keyup.enter="onClickLoginBtn">
          <template #append>
            <q-btn
              flat
              :icon="passwordVisibility ? 'visibility' : 'visibility_off'"
              @click="onClickPasswordVisibility" />
          </template>
        </q-input>
      </div>
      <div class="auth-component__action-area">
        <q-btn
          label="ورود"
          color="primary"
          :loading="loginLoading"
          @click="onClickLoginBtn" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAppConfig } from 'src/stores/appConfig'
import { axiosInstanceManager } from 'src/boot/axios'

const $q = useQuasar()
const router = useRouter()
const appConfigManager = useAppConfig()
const loginLoading = ref(false)
const username = ref<string | null>(null)
const password = ref<string | null>(null)
const passwordVisibility = ref<boolean>(false)
const usernameInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)

const onClickPasswordVisibility = () => {
  passwordVisibility.value = !passwordVisibility.value
}

function isValidAuthPayload () {
  return Boolean(username.value && password.value)
}

async function onClickLoginBtn () {
  if (!isValidAuthPayload()) {
    return
  }

  loginLoading.value = true
  try {
    axiosInstanceManager.setCredentials(username.value ?? '', password.value ?? '')
    await axiosInstanceManager.obtainMainToken()
    const redirectLocation = appConfigManager.redirectAfterLogin || { name: 'Panel.Dashboard' }
    await router.push(redirectLocation)
  } catch {
    $q.notify({
      classes: 'snack--negative snack--inline-action',
      icon: 'info',
      message: 'اطلاعات ورود نادرست است.',
      timeout: 10000
    })
  } finally {
    loginLoading.value = false
  }
}

function focusNext (refName: string) {
  const nextInput = refName === 'passwordInput' ? passwordInput.value : null
  nextInput?.focus()
}
</script>

<style scoped lang="scss">
.auth-component {
  .auth-component__username {
    margin-bottom: $space-8;
  }
  .auth-component__password {
    margin-bottom: $space-10;
  }
  .auth-component__action-area {
    .q-btn {
      width: 100%;
    }
  }
}
</style>
