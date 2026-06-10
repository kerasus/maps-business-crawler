import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { boot } from 'quasar/wrappers'
import { useUser } from 'src/stores/user'
import type { AxiosInstance } from 'axios'
import { useAppConfig } from 'src/stores/appConfig'

interface TokenData {
  accessToken: string | null;
}

export interface ResponseErrorDetail {
  loc: string;
  type: string;
}

export interface ValidationError {
  [key: string]: string[];
}

export interface ErrorResponse {
  message: string;
  errors: ValidationError;
}

const apiServer = process.env.FRONTEND_API_BASE || '/api'
export const ServerMessagesPrefix = 'dynamicI18nMessages'
export const tokenDataKeyInLocalstorage = 'tokenData'

function getAxiosInstanceManager (apiServer: string) {
  const frontendApiBase: string = apiServer
  const loginAddress: string = `${frontendApiBase}/auth/login`
  const logoutAddress: string = `${frontendApiBase}/auth/logout`

  const token = ref<TokenData>({
    accessToken: null
  })

  const credentials = ref<{
    username: string | null;
    password: string | null;
  }>({
    username: null,
    password: null
  })

  function saveTokenData (tokenData: TokenData): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(tokenDataKeyInLocalstorage, JSON.stringify(tokenData))
  }

  function getTokenData (): TokenData {
    if (typeof window === 'undefined') return { accessToken: null }
    const data = localStorage.getItem(tokenDataKeyInLocalstorage)
    return data ? JSON.parse(data) : { accessToken: null }
  }

  function setCredentials (username: string, password: string): void {
    credentials.value.username = username
    credentials.value.password = password
  }

  async function getToken (): Promise<string | null> {
    token.value = getTokenData()
    if (!token.value.accessToken) {
      await obtainMainToken()
    }
    return token.value.accessToken
  }

  async function obtainMainToken (): Promise<void> {
    if (!credentials.value.username || !credentials.value.password) {
      throw new Error('Credentials are not set')
    }

    const response = await axios.post(loginAddress, {
      username: credentials.value.username,
      password: credentials.value.password,
      device_name: 'web'
    })

    const newToken: TokenData = {
      accessToken: response.data.token
    }

    token.value = newToken
    saveTokenData(newToken)
    setAuthenticatedUserData(response.data.user)
  }

  function clearToken (): void {
    token.value.accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(tokenDataKeyInLocalstorage)
    }
  }

  function setAuthenticatedUserData (userData: any) {
    const userManager = useUser()
    userManager.setUser(userData)
  }

  async function logout (): Promise<void> {
    try {
      if (token.value.accessToken) {
        await axiosInstance.post(logoutAddress)
      }
    } catch {
      // ignore logout errors
    } finally {
      clearToken()
      credentials.value.username = null
      credentials.value.password = null
      const userManager = useUser()
      userManager.logout(false)
    }
  }

  function goToLoginPage (): void {
    const router = useRouter()
    const appConfigManager = useAppConfig()
    appConfigManager.setCurrentRouteToRedirectAfterLogin()
    clearToken()
    const userManager = useUser()
    userManager.logout(false)
    router.push({ name: 'Auth.Login' })
  }

  function notifyError (message: string) {
    const customEvent = new CustomEvent('axios-interceptors-response-error', {
      detail: { message }
    })
    window.dispatchEvent(customEvent)
  }

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: frontendApiBase
  })

  const axiosInstanceWithoutToken: AxiosInstance = axios.create({
    baseURL: frontendApiBase
  })

  axiosInstance.interceptors.request.use(
    async (config) => {
      token.value = getTokenData()
      if (token.value.accessToken) {
        config.headers.Authorization = `Bearer ${token.value.accessToken}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        goToLoginPage()
      } else if (error.response) {
        const { status, data } = error.response

        if ((status === 422 || status === 400) && data?.errors) {
          const validationErrors = Object.entries(data.errors as ValidationError)
            .flatMap(([, messages]) => messages)
          notifyError(validationErrors.join('<br/>'))
        } else if (typeof data === 'string') {
          notifyError(data)
        } else if (data?.message) {
          notifyError(data.message)
        } else {
          notifyError(`error.${status}`)
        }
      } else {
        notifyError('unknownError')
      }

      return Promise.reject(error)
    }
  )

  return {
    logout,
    getToken,
    setCredentials,
    obtainMainToken,
    clearToken,
    getTokenData,
    axiosInstance,
    axiosInstanceWithoutToken
  }
}

const axiosInstanceManager = getAxiosInstanceManager(apiServer)
const appApi = axiosInstanceManager.axiosInstance

export default boot(({ app }) => {
  app.config.globalProperties.$axios = appApi
})

export { axiosInstanceManager, appApi }
