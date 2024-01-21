import { jwtDecode } from 'jwt-decode'
const isRoutePublic = ['/', '/auth/login', 'auth/signup', 'auth/onboarding']

export default function ({ store, redirect, route, app }) {
  const path = route.path
  const query = route.query
  const token =
    store.state.token || JSON.parse(window.localStorage.getItem('token'))
  //   const isRoutePublic = (route.meta || []).every((route) => route.public)
  const onboardedRoutes = (route.meta || []).filter(
    (route) => route.isOnboardedPage,
  )
  const publicRoutes = (route.meta || []).filter((route) => route.public)

  if (token) {
    const { exp } = jwtDecode(token)
    const expiresAt = new Date(exp * 1000)
    const currentTime = new Date()

    if (!isRoutePublic.includes(path)) {
      if (currentTime > expiresAt) {
        localStorage.clear()
        store.commit('setAuthenticated', false)
        store.commit('setUser', [])
        store.commit('setNotifications', 0)
        store.dispatch('logout')
        return redirect('/auth/login')
      }
    }
  } else {
    if (!isRoutePublic.includes(path)) {
      return redirect('/auth/login')
    }
  }

  //   const onboardedPaths = [...publicRoutes, '', ...onboardedRoutes]

  // skip middleware on server
  //   if (process.server) return
  //   // skip middleware on client side entirely
  //   if (process.client) return
  //   // or only skip middleware on initial client load
  //   const nuxtApp = useNuxtApp()
  //   if (process.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered)
  //     return
}
