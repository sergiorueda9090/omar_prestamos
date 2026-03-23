import { createSlice } from '@reduxjs/toolkit';

// =============================================================================
// STORE: prestamosTestStore
// =============================================================================
// Maneja todo el estado de la pagina ClientesTestMejorado.
// Sigue el mismo patron de clientesStore.js
// =============================================================================

export const prestamosTestStore = createSlice({
  name: 'prestamosTestStore',
  initialState: {

    // === DATOS DEL FORMULARIO (Tab Configuracion) ===
    id                              : "",
    numeroTarjeta                   : "",
    nombre                          : "",
    montoPrestamo                   : "",
    porcentajeInteres               : "",
    duracionPrestamo                : "",
    tipoPrestamo                    : "",
    fechaPrestamo                   : "",
    diaCobro                        : "",
    prestamoSinCronograma           : false,

    // === CAMPOS CALCULADOS ===
    interesMensual                  : "",
    numeroCuotas                    : "",
    valorCuota                      : "",
    totalInteresPagar               : "",
    saldoTotalPagar                 : "",

    // === ESTADO DEL PRESTAMO (viene del backend) ===
    estado                          : "",
    totalPagadoCuotasSinCronograma  : "0",
    interesAcumulado                : "0",
    prestamoGenerado                : false,

    // === DATOS RELACIONADOS (vienen del backend) ===
    cuotas                          : [],
    pagos                           : [],
    pagosIntereses                  : [],
    historial                       : [],
    ampliaciones                    : [],

    // === PAGINACION (listado de prestamos) ===
    count                           : 0,
    next                            : null,
    previous                        : null,
    currentPage                     : 1,
    totalPages                      : 1,
    prestamosArray                  : [],

    // === TAB ACTIVO ===
    tabActual                       : 0,
  },

  reducers: {

    // -----------------------------------------------------------------
    // Cargar listado paginado de prestamos
    // Se usa en: actionGetAllPrestamos
    // -----------------------------------------------------------------
    listData: (state, action) => {
      state.prestamosArray = action.payload.prestamosArray;
      state.count          = action.payload.count;
      state.next           = action.payload.next;
      state.previous       = action.payload.previous;
      state.currentPage    = action.payload.currentPage;
      state.totalPages     = action.payload.totalPages;
    },

    // -----------------------------------------------------------------
    // Cargar TODOS los datos de un prestamo (detalle completo del backend)
    // Se usa en: actionCrearPrestamo, actionObtenerPrestamo, y despues
    //            de cada accion que modifica el prestamo.
    // -----------------------------------------------------------------
    showData: (state, action) => {
      Object.assign(state, action.payload);
    },

    // -----------------------------------------------------------------
    // Limpiar todos los campos (volver al estado inicial)
    // Se usa en: actionClearData
    // -----------------------------------------------------------------
    clearData: (state) => {
      state.id                              = "";
      state.numeroTarjeta                   = "";
      state.nombre                          = "";
      state.montoPrestamo                   = "";
      state.porcentajeInteres               = "";
      state.duracionPrestamo                = "";
      state.tipoPrestamo                    = "";
      state.fechaPrestamo                   = "";
      state.diaCobro                        = "";
      state.prestamoSinCronograma           = false;
      state.interesMensual                  = "";
      state.numeroCuotas                    = "";
      state.valorCuota                      = "";
      state.totalInteresPagar               = "";
      state.saldoTotalPagar                 = "";
      state.estado                          = "";
      state.totalPagadoCuotasSinCronograma  = "0";
      state.interesAcumulado                = "0";
      state.prestamoGenerado                = false;
      state.cuotas                          = [];
      state.pagos                           = [];
      state.pagosIntereses                  = [];
      state.historial                       = [];
      state.ampliaciones                    = [];
      state.tabActual                       = 0;
    },

    // -----------------------------------------------------------------
    // Actualizar UN campo del formulario
    // Se usa en: actionFormStore({ name: "nombre", value: "Juan" })
    // -----------------------------------------------------------------
    handleForm: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },

    // -----------------------------------------------------------------
    // Cambiar tab activo
    // -----------------------------------------------------------------
    setTab: (state, action) => {
      state.tabActual = action.payload;
    },
  },
});

// Exportar actions
export const {
  listData,
  showData,
  clearData,
  handleForm,
  setTab,
} = prestamosTestStore.actions;

// Exportar reducer
export default prestamosTestStore.reducer;
