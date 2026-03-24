import { createSlice } from '@reduxjs/toolkit'

export const dashboardStore = createSlice({
  name: 'dashboardStore',
  initialState: {
    totalInversion: 0,
    totalSaldo: 0,
    totalClientes: 0,
    mensual:    { clientes: 0, saldo_inversion: 0, saldo_total: 0 },
    quincenal:  { clientes: 0, saldo_inversion: 0, saldo_total: 0 },
    semanal:    { clientes: 0, saldo_inversion: 0, saldo_total: 0 },
    diario:     { clientes: 0, saldo_inversion: 0, saldo_total: 0 },
    perdidos:   { clientes: 0, saldo_inversion: 0 },
    pagados:    { clientes: 0, saldo_inversion: 0, saldo_total: 0 },
    resumenMensual: [],
    loaded: false,
  },
  reducers: {
    setDashboardData: (state, action) => {
      const d = action.payload;
      state.totalInversion = d.total_inversion;
      state.totalSaldo     = d.total_saldo;
      state.totalClientes  = d.total_clientes;
      state.mensual        = d.mensual;
      state.quincenal      = d.quincenal;
      state.semanal        = d.semanal;
      state.diario         = d.diario;
      state.perdidos       = d.perdidos;
      state.pagados        = d.pagados;
      state.resumenMensual = d.resumen_mensual;
      state.loaded         = true;
    },
  }
})

export const { setDashboardData } = dashboardStore.actions
