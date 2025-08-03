import { createSlice } from '@reduxjs/toolkit'

export const globalStore = createSlice({
  name: 'globalStore',
  initialState: {
    openMolda         : false,
    openMoldaInfo     : false,
    openBackDropStore : false,
    openLinearProgress: false,
  },
  reducers: {
    handleOpenModal:(state, action) => {
        state.openMolda = true
    },
    handleCloseModal:(state, action) => {
        state.openMolda = false
    },
    handleOpenModalInfo:(state, action) => {
      state.openMoldaInfo = true
    },
    handleCloseModalInfo:(state, action) => {
      state.openMoldaInfo = false
    },
    handleShowBackDrop:(state) => {
      state.openBackDropStore = true
    },
    handleHideBackDrop:(state) => {
      state.openBackDropStore = false
    },
    handleShowLinearProgress:(state, action) => {
      state.openLinearProgress = true;
    },
    handleHideLinearProgress:(state, action) => {
      state.openLinearProgress = false;
    },
  }
})

// Action creators are generated for each case reducer function
export const { handleOpenModal, handleCloseModal, handleShowBackDrop, handleHideBackDrop, handleOpenModalInfo, handleCloseModalInfo } = globalStore.actions