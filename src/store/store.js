import { configureStore } from '@reduxjs/toolkit'
import { authStore }      from './authStore/authStore'
import { userStore }      from './userStore/userStore'
import { globalStore }    from './globalStore/globalStore'
import { prestamosTestStore } from './prestamosTestStore/prestamosTestStore'
import { dashboardStore } from './dashboardStore/dashboardStore'

export default configureStore({
  reducer: {
    userStore          : userStore.reducer,
    globalStore        : globalStore.reducer,
    authStore          : authStore.reducer,
    prestamosTestStore : prestamosTestStore.reducer,
    dashboardStore: dashboardStore.reducer
  }
})