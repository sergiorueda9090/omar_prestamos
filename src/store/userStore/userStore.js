import { createSlice } from '@reduxjs/toolkit'

export const userStore = createSlice({
  name: 'userStore',
  initialState: {
    value           : 101,
    idUser          : "",
    userName        : "",
    name            : "",
    password        : "",
    confirmPassword : "",
    is_superuser    : true,
    usersArray      : [],
    count           : 0,
    next            : null,
    previous        : null,
    currentPage     : 1,
    totalPages      : 1
  },
  reducers: {
    listData: (state, action) => {
      state.usersArray = action.payload.users;
      state.count = action.payload.count;
      state.next = action.payload.next;
      state.previous = action.payload.previous;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    },
    showData:(state, action) => {
      state.idUser          = action.payload.idUser
      state.userName        = action.payload.userName
      state.name            = action.payload.name
      state.password        = action.payload.password
      state.confirmPassword = action.payload.confirmPassword
      state.is_superuser    = action.payload.is_superuser
    },
    clearData:(state) => {
      state.idUser          = ""
      state.userName        = ""
      state.name            = ""
      state.password        = ""
      state.confirmPassword = ""
      state.is_superuser    = ""
    },
    handleForm:(state , action) => {
      const { name, value } = action.payload; // Obtener el nombre y el valor
      state[name] = value; // Actualizar dinámicamente la propiedad en el estado
    },

  }
})

// Action creators are generated for each case reducer function
export const { showData, handleForm, listData, clearData } = userStore.actions