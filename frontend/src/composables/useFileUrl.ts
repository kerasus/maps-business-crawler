// import { useEnvStore } from 'src/stores/env'

export const useFileUrl = () => {
  // const baseFileAddress = 'https://pre-bourse.asr24.com/admin/api/user'
  // const envStore = useEnvStore()

  function getFullFileUrl (bareUrl: string) {
    // const profileToken = axiosInstanceManager.loadTokenData(mainServiceName, mainScopes)

    // ToDo: handle get token from some audience (client app id)
    // return baseFileAddress + bareUrl + '?accessToken=' + profileToken?.accessToken + '&v=' + Date.now()
    return bareUrl
  }

  return {
    getFullFileUrl
  }
}
