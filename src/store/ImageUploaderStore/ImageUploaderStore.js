import { createSlice } from '@reduxjs/toolkit'

export const ImageUploaderStore = createSlice({
  name: 'ImageUploaderStore',
  initialState: {
    file: null,
  },
  reducers: {
    handleForm:(state , action) => {
      const { name, value } = action.payload; // Obtener el nombre y el valor
      state[name] = value; // Actualizar dinámicamente la propiedad en el estado
    },
    clearForm: (state) => {
      state.file = null;
    }
  }
})

// Action creators are generated for each case reducer function
export const { handleForm, clearForm } = ImageUploaderStore.actions