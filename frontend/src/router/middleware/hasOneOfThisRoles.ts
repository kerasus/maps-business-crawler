import { tokenDataKeyInLocalstorage } from 'src/boot/axios'

export default function hasOneOfThisRoles (roleNames: string[]) {
  return ({ sharedStore }) => {
    const loginRouteName = 'Auth.Login'
    const tokenDataRaw = localStorage.getItem(tokenDataKeyInLocalstorage)
    if (!tokenDataRaw) {
      return { name: loginRouteName }
    }

    const userManager = sharedStore.useUser()
    const hasAccess = roleNames.some((role) => userManager.hasRole(userManager.me, role))

    if (!hasAccess) {
      return { name: 'Panel.Dashboard' }
    }

    return null
  }
}
