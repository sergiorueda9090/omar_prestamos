import { configureStore } from '@reduxjs/toolkit'
import { authStore }      from './authStore/authStore'
import { userStore }      from './userStore/userStore'
import { clientesStore }  from './clientesStore/clientesStore'
import { globalStore }    from './globalStore/globalStore'
import { ImageUploaderStore } from './ImageUploaderStore/ImageUploaderStore'
import { prestamosTestStore } from './prestamosTestStore/prestamosTestStore'

export default configureStore({
  reducer: {
    userStore          : userStore.reducer,
    globalStore        : globalStore.reducer,
    authStore          : authStore.reducer,
    ImageUploaderStore : ImageUploaderStore.reducer,
    clientesStore      : clientesStore.reducer,
    prestamosTestStore : prestamosTestStore.reducer,
  }
})