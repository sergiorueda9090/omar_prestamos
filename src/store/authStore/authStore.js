import { createSlice } from '@reduxjs/toolkit'

const savedInfoUser = JSON.parse(localStorage.getItem("infoUser")) || {};

export const authStore = createSlice({
  name: 'authStore',
  initialState: {
    infoUser  : {},
    isLogin   : savedInfoUser.isLogin == true ? true : false,
    token     : savedInfoUser.access,
    idrol     : savedInfoUser.idrol,
    name_user : '',
    email     : '',
    username  : '',
    password  : ''
  },
  reducers: {
    handleLoginSuccess:(state,action) => {
      state.isLogin   = action.payload.islogin == false ? false : true
      state.token     = action.payload.token
      state.name_user = action.payload.name_user
      state.email     = action.payload.email
    },
    handleLoginFail:(state,action) => {
      localStorage.removeItem("infoUser");
      state.infoUser  = {};
      state.isLogin   = false;
      state.token     = "";
      state.name_user = "";
      state.email     = "";
      state.idrol     = "";
      state.username  = "";
      state.password  = "";
    },
    handleAuthenticated:(state, action) => {
      state.token     = action.payload.access

      let local = {"access"   : action.payload.access, 
                   "isLogin"  : action.payload.islogin,
                   "idrol"    : action.payload.idrol,
                   "username" : action.payload.username};

      localStorage.setItem("infoUser",JSON.stringify(local));

      state.isLogin  = action.payload.islogin == true ? true : false;
      state.username = action.payload.username;
    },
    handleLogout:(state,action) => {
      localStorage.removeItem("infoUser");
      state.infoUser  = {};
      state.isLogin   = false;
      state.token     = "";
      state.name_user = "";
      state.email     = "";
      state.idrol     = "";
      state.username  = "";
      state.password  = "";
    },
    handleForm:(state , action) => {
      const { name, value } = action.payload; // Obtener el nombre y el valor
      state[name] = value; // Actualizar dinámicamente la propiedad en el estado
    },
  }
})

// Action creators are generated for each case reducer function
export const { handleAuthenticated, loginSuccess,  loginFail, handleForm, handleLogout } = authStore.actions;