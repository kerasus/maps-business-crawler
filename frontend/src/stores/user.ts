import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { reactive, computed } from 'vue'
import { type UserType } from 'src/repositories/user'

const userKey = 'user-data'

export const useUser = defineStore('user', () => {
  const router = useRouter()
  const isClient = typeof window !== 'undefined'

  const state = reactive<{
    user: UserType | null;
  }>({
    user: null
  })

  if (isClient) {
    loadUserDataFromLocalstorage()
  }

  const me = computed(() => state.user ?? null)
  const isAdmin = computed(() => hasRole(state.user, 'admin'))
  const isManager = computed(() => hasRole(state.user, 'manager'))
  const isUser = computed(() => hasRole(state.user, 'user'))

  function hasRole (user: UserType | null, role: string): boolean {
    if (!user) {
      return false
    }

    return user.roles_list?.includes(role) ?? false
  }

  function hasPermission (permission: string): boolean {
    return state.user?.permissions_list?.includes(permission) ?? false
  }

  async function logout (redirect = true) {
    if (isClient) {
      sessionStorage.clear()
      localStorage.removeItem(userKey)
      localStorage.removeItem('tokenData')
    }

    state.user = null

    if (redirect) {
      await router.push({ name: 'Auth.Login' })
    }
  }

  function setUser (data: UserType | null) {
    state.user = data
    if (isClient && data) {
      localStorage.setItem(userKey, JSON.stringify(data))
    }
  }

  function loadUserDataFromLocalstorage () {
    const data = localStorage.getItem(userKey)
    if (typeof data === 'string') {
      setUser(JSON.parse(data))
    }
  }

  return {
    state,
    me,
    hasRole,
    hasPermission,
    isAdmin,
    isManager,
    isUser,
    logout,
    setUser,
    loadUserDataFromLocalstorage
  }
})
