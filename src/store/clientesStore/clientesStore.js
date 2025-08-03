import { createSlice } from '@reduxjs/toolkit';

export const clientesStore = createSlice({
  name: 'clientesStore',
  initialState: {
    id                 : "",
    numeroTarjeta      : "",
    nombre             : "",
    montoPrestamo      : "",
    porcentajeInteres  : "",
    duracionPrestamo   : "",
    tipoPrestamo       : "",
    fechaPrestamo      : "",
    diaCobro           : "",
    interesMensual     : "",
    numeroCuotas       : "",
    valorCuota         : "",
    totalInteresPagar  : "",
    saldoTotalPagar    : "",
    cuotas             : [],
    count              : 0,
    next               : null,
    previous           : null,
    currentPage        : 1,
    totalPages         : 1,
    clientesArray      : [],
  },
  reducers: {
    listData: (state, action) => {
      state.clientesArray = action.payload.clientesArray;
      state.count = action.payload.count;
      state.next = action.payload.next;
      state.previous = action.payload.previous;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    },
    showData: (state, action) => {
      Object.assign(state, action.payload); // carga todos los campos del cliente
    },
    clearData: (state) => {
      state.id                 = "";
      state.nombre             = "";
      state.montoPrestamo      = "";
      state.porcentajeInteres  = "";
      state.duracionPrestamo   = "";
      state.tipoPrestamo       = "";
      state.fechaPrestamo      = "";
      state.diaCobro           = "";
      state.interesMensual     = "";
      state.numeroCuotas       = "";
      state.valorCuota         = "";
      state.totalInteresPagar  = "";
      state.saldoTotalPagar    = "";
      state.cuotas             = [];
    },
    handleForm: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },
  },
});

export const { listData, showData, clearData, handleForm } = clientesStore.actions;
export default clientesStore.reducer;
