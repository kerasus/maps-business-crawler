import { tokenDataKeyInLocalstorage } from 'src/boot/axios'

export default function Authenticated () {
  const loginRouteName = 'Auth.Login'
  const tokenDataRaw = localStorage.getItem(tokenDataKeyInLocalstorage)
  if (!tokenDataRaw) {
    return { name: loginRouteName }
  }

  // Continue to the route if token is found or already on login page
  return null
}
