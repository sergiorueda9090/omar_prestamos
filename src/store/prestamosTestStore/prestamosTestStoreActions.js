import axios from "axios";
import { handleForm, listData, clearData, showData, setTab } from "./prestamosTestStore";
import { handleShowBackDrop, handleHideBackDrop } from "../globalStore/globalStore";
import { dominio } from "../../constants/constantGlogal";
import { alertaCreado, alertaActualizado, alertaEliminado, alertaError } from "../../components/Alerts/AlertasCrud";

// =============================================================================
// ACTIONS: prestamosTestStoreActions
// =============================================================================
// Todas las acciones siguen el mismo patron de clientesStoreActions.js:
// 1. Mostrar backdrop (loading)
// 2. Llamar al endpoint con axios
// 3. Despachar reducer para actualizar el estado en Redux
// 4. Ocultar backdrop
// 5. Mostrar alerta de exito o error
// =============================================================================

const path = "clientes/api/v2/";


// =============================================================================
// HELPER: Mapear respuesta del backend a formato Redux
// =============================================================================
// El backend retorna nombres en snake_case (ej: numero_tarjeta).
// Redux usa camelCase (ej: numeroTarjeta).
// Esta funcion convierte la respuesta para que Redux la entienda.
// =============================================================================

const mapearRespuestaARedux = (data) => {
  return {
    id                              : data.id,
    numeroTarjeta                   : data.numero_tarjeta || "",
    nombre                          : data.nombre || "",
    montoPrestamo                   : data.monto_prestamo || "",
    porcentajeInteres               : data.porcentaje_interes || "",
    duracionPrestamo                : data.duracion_prestamo || "",
    tipoPrestamo                    : data.tipo_prestamo || "",
    fechaPrestamo                   : data.fecha_prestamo || "",
    diaCobro                        : data.dia_cobro || "",
    prestamoSinCronograma           : data.prestamo_sin_cronograma || false,
    interesMensual                  : data.interes_mensual || "",
    numeroCuotas                    : data.numero_cuotas || "",
    valorCuota                      : data.valor_cuota || "",
    totalInteresPagar               : data.total_interes_pagar || "",
    saldoTotalPagar                 : data.saldo_total_pagar || "",
    estado                          : data.estado || "vigente",
    totalPagadoCuotasSinCronograma  : data.total_pagado_cuotas_sin_cronograma || "0",
    interesAcumulado                : data.interes_acumulado || "0",
    prestamoGenerado                : true,
    cuotas                          : data.cuotas || [],
    pagos                           : data.pagos || [],
    pagosIntereses                  : data.pagos_intereses || [],
    historial                       : data.historial || [],
    ampliaciones                    : data.ampliaciones || [],
    notas                           : data.notas || [],
  };
};


// =============================================================================
// FORMULARIO: Actualizar un campo del formulario
// =============================================================================
// Uso: dispatch(actionFormStore({ name: "nombre", value: "Juan" }))
// =============================================================================

export const actionFormStore = (data) => {
  return async (dispatch) => {
    const { name, value } = data;
    dispatch(handleForm({ name, value }));
  };
};


// =============================================================================
// LISTADO: Obtener todos los prestamos (paginado)
// =============================================================================
// Endpoint: GET /clientes/api/v2/?page=1
// =============================================================================

export const actionGetAllPrestamos = (page = 1, estado = '') => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const params = new URLSearchParams({ page });
    if (estado) params.append("estado", estado);

    const options = {
      method: 'GET',
      url: `${dominio}${path}?${params.toString()}`,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const { results, count, next, previous } = response.data;
        const totalPages = Math.ceil(count / 20);

        await dispatch(listData({
          prestamosArray: results,
          count,
          next,
          previous,
          currentPage: page,
          totalPages
        }));
      }
    } catch (error) {
      console.error("Error al obtener prestamos:", error);
    } finally {
      await dispatch(handleHideBackDrop());
    }
  };
};


// =============================================================================
// CREAR: Crear un nuevo prestamo
// =============================================================================
// Endpoint: POST /clientes/api/v2/crear/
// Lee los datos del formulario desde prestamosTestStore en Redux.
// Despues de crear, carga el detalle completo y cambia al tab 1.
// =============================================================================

export const actionCrearPrestamo = () => {
  return async (dispatch, getState) => {
    const { authStore, prestamosTestStore } = getState();

    // Extraer datos del formulario en Redux
    const {
      numeroTarjeta, nombre, montoPrestamo, porcentajeInteres,
      duracionPrestamo, tipoPrestamo, fechaPrestamo, diaCobro,
      prestamoSinCronograma
    } = prestamosTestStore;

    // Validar campos obligatorios
    if (!montoPrestamo || !porcentajeInteres || !duracionPrestamo) {
      await alertaError("Complete todos los campos del préstamo");
      return false;
    }

    await dispatch(handleShowBackDrop());

    // Preparar datos para enviar al backend
    const bodyData = {
      numero_tarjeta        : numeroTarjeta,
      nombre                : nombre,
      monto_prestamo        : montoPrestamo.replace(/\./g, ''),
      porcentaje_interes    : porcentajeInteres,
      duracion_prestamo     : parseInt(duracionPrestamo),
      tipo_prestamo         : tipoPrestamo,
      fecha_prestamo        : fechaPrestamo,
      dia_cobro             : diaCobro,
      prestamo_sin_cronograma: prestamoSinCronograma,
    };

    const options = {
      method: 'POST',
      url: `${dominio}${path}crear/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data: bodyData,
    };

    try {
      const response = await axios.request(options);

      if (response.status === 201) {
        // Mapear respuesta y cargar en Redux
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));

        // Cambiar al tab de gestion (tab 0 en vista detalle)
        await dispatch(setTab(0));

        // Ocultar backdrop ANTES de la alerta para que no la tape
        await dispatch(handleHideBackDrop());
        await alertaCreado();
        return true;
      }
    } catch (error) {
      console.error("Error al crear prestamo:", error);
      await dispatch(handleHideBackDrop());
      if (error.response && error.response.data) {
        const errores = error.response.data;
        let mensaje = "";
        for (const campo in errores) {
          if (Array.isArray(errores[campo])) {
            errores[campo].forEach(msg => {
              mensaje += `${campo}: ${msg}\n`;
            });
          } else {
            mensaje += `${campo}: ${errores[campo]}\n`;
          }
        }
        await alertaError(mensaje);
      } else {
        await alertaError();
      }
      return false;
    }
  };
};


// =============================================================================
// DETALLE: Obtener detalle completo de un prestamo
// =============================================================================
// Endpoint: GET /clientes/api/v2/<id>/
// Carga toda la info en Redux: cuotas, pagos, historial, etc.
// =============================================================================

export const actionObtenerPrestamo = (clienteId) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'GET',
      url: `${dominio}${path}${clienteId}/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
      }
    } catch (error) {
      console.error("Error al obtener prestamo:", error);
      await dispatch(handleHideBackDrop());
      await alertaError("No se pudo cargar el préstamo");
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// PAGO CUOTA: Registrar pago de cuota (con cronograma)
// =============================================================================
// Endpoint: POST /clientes/api/v2/<id>/pagar/
// El backend distribuye el monto entre cuotas pendientes automaticamente.
// =============================================================================

export const actionPagarCuota = (monto, fechaPago, descripcion = '') => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    const data = { monto: String(monto).replace(/\./g, ''), fecha_pago: fechaPago };
    if (descripcion) data.descripcion = descripcion;

    const options = {
      method: 'POST',
      url: `${dominio}${path}${id}/pagar/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data,
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaCreado();
        return;
      }
    } catch (error) {
      console.error("Error al registrar pago:", error);
      const msg = error.response?.data?.error || "Error al registrar pago";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// PAGO SIN CRONOGRAMA: Registrar pago de cuota sin cronograma
// =============================================================================
// Endpoint: POST /clientes/api/v2/<id>/pagar-sin-cronograma/
// =============================================================================

export const actionPagarCuotaSinCronograma = (monto, fechaPago) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    const options = {
      method: 'POST',
      url: `${dominio}${path}${id}/pagar-sin-cronograma/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data: { monto: String(monto).replace(/\./g, ''), fecha_pago: fechaPago },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaCreado();
        return;
      }
    } catch (error) {
      console.error("Error al registrar pago sin cronograma:", error);
      const msg = error.response?.data?.error || "Error al registrar pago";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// PAGO INTERES: Registrar pago de interes
// =============================================================================
// Endpoint: POST /clientes/api/v2/<id>/pagar-interes/
// Este pago NO reduce cuotas, solo se suma a las utilidades.
// =============================================================================

export const actionPagarInteres = (monto, fecha, descripcion = '') => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    const options = {
      method: 'POST',
      url: `${dominio}${path}${id}/pagar-interes/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data: {
        monto: String(monto).replace(/\./g, ''),
        fecha,
        descripcion,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaCreado();
        return;
      }
    } catch (error) {
      console.error("Error al registrar pago de interés:", error);
      const msg = error.response?.data?.error || "Error al registrar interés";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// ELIMINAR PAGO INTERES: Eliminar un pago de interes
// =============================================================================
// Endpoint: DELETE /clientes/api/v2/pagos-interes/<id>/
// =============================================================================

export const actionEliminarPagoInteres = (pagoId) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'DELETE',
      url: `${dominio}${path}pagos-interes/${pagoId}/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaEliminado("Pago de interés eliminado");
        return;
      }
    } catch (error) {
      console.error("Error al eliminar pago de interés:", error);
      await dispatch(handleHideBackDrop());
      await alertaError("Error al eliminar pago de interés");
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// PAGAR SALDO TOTAL: Pagar el saldo total del prestamo
// =============================================================================
// Endpoint: POST /clientes/api/v2/<id>/pagar-saldo-total/
// Calcula con % interes y tiempo, marca todas las cuotas como pagadas.
// =============================================================================

export const actionPagarSaldoTotal = (porcentajeInteres, tiempo, fechaPago, descripcion = '') => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    const data = {
      porcentaje_interes: porcentajeInteres,
      tiempo: parseInt(tiempo),
      fecha_pago: fechaPago,
    };
    if (descripcion) data.descripcion = descripcion;

    const options = {
      method: 'POST',
      url: `${dominio}${path}${id}/pagar-saldo-total/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data,
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaCreado();
        return;
      }
    } catch (error) {
      console.error("Error al pagar saldo total:", error);
      const msg = error.response?.data?.error || "Error al pagar saldo total";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// REVERTIR PAGO SALDO TOTAL: Restaura estado previo del prestamo
// =============================================================================
// Endpoint: POST /clientes/api/v2/pagos/<id>/revertir-saldo-total/
// Requiere que el Pago tenga snapshot (creado en la version nueva).
// =============================================================================

export const actionRevertirPagoSaldoTotal = (pagoId) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'POST',
      url: `${dominio}${path}pagos/${pagoId}/revertir-saldo-total/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaEliminado("Pago de saldo total revertido");
        return;
      }
    } catch (error) {
      console.error("Error al revertir pago de saldo total:", error);
      const msg = error.response?.data?.error || "Error al revertir pago de saldo total";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// CAMBIAR FECHA CUOTA: Cambiar la fecha de pago de una cuota
// =============================================================================
// Endpoint: PUT /clientes/api/v2/cuotas/<id>/cambiar-fecha/
// =============================================================================

export const actionCambiarFechaCuota = (cuotaId, nuevaFecha) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'PUT',
      url: `${dominio}${path}cuotas/${cuotaId}/cambiar-fecha/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data: { fecha_pago: nuevaFecha },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaActualizado();
        return;
      }
    } catch (error) {
      console.error("Error al cambiar fecha:", error);
      await dispatch(handleHideBackDrop());
      await alertaError("Error al cambiar fecha de cuota");
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// ELIMINAR PAGO CUOTA: Revertir el pago de una cuota (vuelve a pendiente)
// =============================================================================
// Endpoint: POST /clientes/api/v2/cuotas/<id>/eliminar-pago/
// =============================================================================

export const actionEliminarPagoCuota = (cuotaId) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'POST',
      url: `${dominio}${path}cuotas/${cuotaId}/eliminar-pago/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaEliminado("Pago de cuota eliminado");
        return;
      }
    } catch (error) {
      console.error("Error al eliminar pago de cuota:", error);
      await dispatch(handleHideBackDrop());
      await alertaError("Error al eliminar pago de cuota");
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// AMPLIAR PRESTAMO: Ampliar el prestamo con monto adicional
// =============================================================================
// Endpoint: POST /clientes/api/v2/<id>/ampliar/
// Proceso: liquida, calcula saldo a favor, genera nuevo cronograma.
// =============================================================================

export const actionAmpliarPrestamo = (montoAdicional, nuevaTasa, nuevasCuotas, tasaLiquidacion = null, plazoLiquidacion = null) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    const data = {
      monto_adicional: String(montoAdicional).replace(/\./g, ''),
      nueva_tasa: parseFloat(nuevaTasa),
      nuevas_cuotas: parseInt(nuevasCuotas),
    };
    if (tasaLiquidacion !== null && tasaLiquidacion !== undefined && tasaLiquidacion !== '') {
      data.tasa_liquidacion = parseFloat(tasaLiquidacion);
    }
    if (plazoLiquidacion !== null && plazoLiquidacion !== undefined && plazoLiquidacion !== '') {
      data.plazo_liquidacion = parseInt(plazoLiquidacion);
    }

    const options = {
      method: 'POST',
      url: `${dominio}${path}${id}/ampliar/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data,
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaCreado();
        return;
      }
    } catch (error) {
      console.error("Error al ampliar préstamo:", error);
      const msg = error.response?.data?.error || "Error al ampliar préstamo";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// CAMBIAR PLAZO: Cambiar la duracion del prestamo (solo sin cronograma)
// =============================================================================
// Endpoint: PUT /clientes/api/v2/<id>/cambiar-plazo/
// Recalcula cuotas, valor cuota, total interes, saldo total.
// =============================================================================

export const actionCambiarPlazo = (nuevaDuracion) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    const options = {
      method: 'PUT',
      url: `${dominio}${path}${id}/cambiar-plazo/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data: { duracion_prestamo: parseInt(nuevaDuracion) },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const datosRedux = mapearRespuestaARedux(response.data);
        await dispatch(showData(datosRedux));
        await dispatch(handleHideBackDrop());
        await alertaActualizado();
        return;
      }
    } catch (error) {
      console.error("Error al cambiar plazo:", error);
      const msg = error.response?.data?.error || "Error al cambiar plazo";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return;
    }
    await dispatch(handleHideBackDrop());
  };
};


// =============================================================================
// FILTRAR: Obtener prestamos con filtros (busqueda y/o fechas)
// =============================================================================
// Endpoint: GET /clientes/api/v2/?page=1&search=xxx&startDate=xxx&endDate=xxx
// =============================================================================

export const actionGetAllFilterData = (page = 1, filters = {}) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    // Construir query string con los filtros
    const params = new URLSearchParams({ page });
    if (filters.search)    params.append("search",    filters.search);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate)   params.append("endDate",   filters.endDate);
    if (filters.estado)    params.append("estado",    filters.estado);

    const options = {
      method: 'GET',
      url: `${dominio}${path}?${params.toString()}`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const { results, count, next, previous } = response.data;
        const totalPages = Math.ceil(count / 20);

        await dispatch(listData({
          prestamosArray: results,
          count,
          next,
          previous,
          currentPage: page,
          totalPages,
        }));
      }
    } catch (error) {
      console.error("Error al filtrar préstamos:", error);
    } finally {
      await dispatch(handleHideBackDrop());
    }
  };
};


// =============================================================================
// ELIMINAR: Eliminar un prestamo completo
// =============================================================================
// Endpoint: DELETE /clientes/api/delete/<id>/
// Usa el endpoint existente (v1) porque eliminar un cliente es la misma logica.
// =============================================================================

export const actionEliminarPrestamo = (clienteId) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'DELETE',
      url: `${dominio}clientes/api/delete/${clienteId}/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        await dispatch(actionGetAllPrestamos());
        await dispatch(handleHideBackDrop());
        await alertaEliminado(response.data.mensaje);
        return;
      } else {
        await dispatch(handleHideBackDrop());
        await alertaError();
        return;
      }
    } catch (error) {
      console.error("Error al eliminar préstamo:", error);
      await dispatch(handleHideBackDrop());
      await alertaError();
    }
  };
};


// =============================================================================
// LIMPIAR: Resetear todo el estado
// =============================================================================

export const actionClearData = () => {
  return async (dispatch) => {
    await dispatch(clearData());
  };
};


// =============================================================================
// MARCAR COMO PERDIDO
// =============================================================================
// Endpoint: POST /clientes/api/v2/<id>/marcar-perdido/
// =============================================================================

export const actionMarcarPerdido = (clienteId) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'POST',
      url: `${dominio}${path}${clienteId}/marcar-perdido/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        await dispatch(actionGetAllPrestamos());
        await dispatch(handleHideBackDrop());
        await alertaActualizado("Cliente marcado como perdido");
        return;
      } else {
        await dispatch(handleHideBackDrop());
        await alertaError();
        return;
      }
    } catch (error) {
      console.error("Error al marcar como perdido:", error);
      await dispatch(handleHideBackDrop());
      await alertaError();
    }
  };
};


// =============================================================================
// EDITAR INFO BASICA: cambiar SOLO estado y/o fecha del prestamo
// =============================================================================
// Endpoint: PUT /clientes/api/v2/<id>/editar-info/
// cambios = { estado?, fecha_prestamo? } (envia solo lo que cambio)
// Despues recarga el listado en la pagina/filtro actual.
// =============================================================================

export const actionEditarInfoCliente = (clienteId, cambios, page = 1, estado = '') => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'PUT',
      url: `${dominio}${path}${clienteId}/editar-info/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      data: cambios,
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        await dispatch(actionGetAllPrestamos(page, estado));
        await dispatch(handleHideBackDrop());
        await alertaActualizado("Información actualizada");
        return true;
      }
    } catch (error) {
      console.error("Error al editar información del cliente:", error);
      const msg = error.response?.data?.error || "Error al actualizar la información";
      await dispatch(handleHideBackDrop());
      await alertaError(msg);
      return false;
    }
    await dispatch(handleHideBackDrop());
    return false;
  };
};


// =============================================================================
// DESCARGAR REPORTE EXCEL
// =============================================================================
// Endpoint: GET /clientes/api/v2/exportar/
// =============================================================================

export const actionDescargarExcel = (filters = {}) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const params = new URLSearchParams();
    if (filters.estado)    params.append("estado",    filters.estado);
    if (filters.search)    params.append("search",    filters.search);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate)   params.append("endDate",   filters.endDate);

    try {
      const response = await axios({
        method: 'GET',
        url: `${dominio}${path}exportar/?${params.toString()}`,
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_clientes_completo.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      await alertaError();
    } finally {
      await dispatch(handleHideBackDrop());
    }
  };
};


// =============================================================================
// NOTAS: Obtener, crear y eliminar notas de un prestamo
// =============================================================================

export const actionObtenerNotas = () => {
  return async (dispatch, getState) => {
    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    try {
      const response = await axios.request({
        method: 'GET',
        url: `${dominio}${path}${id}/notas/`,
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      dispatch(handleForm({ name: 'notas', value: response.data }));
    } catch (error) {
      console.error("Error al obtener notas:", error);
    }
  };
};

export const actionCrearNota = (texto) => {
  return async (dispatch, getState) => {
    const { authStore, prestamosTestStore } = getState();
    const { id } = prestamosTestStore;

    try {
      const response = await axios.request({
        method: 'POST',
        url: `${dominio}${path}${id}/notas/`,
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
        },
        data: { texto },
      });

      if (response.status === 201) {
        // Agregar la nota al inicio del array existente
        const notasActuales = prestamosTestStore.notas || [];
        dispatch(handleForm({ name: 'notas', value: [response.data, ...notasActuales] }));
        await alertaCreado();
      }
    } catch (error) {
      console.error("Error al crear nota:", error);
      const msg = error.response?.data?.error || "Error al crear nota";
      await alertaError(msg);
    }
  };
};

export const actionEliminarNota = (notaId) => {
  return async (dispatch, getState) => {
    const { authStore, prestamosTestStore } = getState();

    try {
      const response = await axios.request({
        method: 'DELETE',
        url: `${dominio}${path}notas/${notaId}/eliminar/`,
        headers: { Authorization: `Bearer ${authStore.token}` },
      });

      if (response.status === 200) {
        const notasActuales = prestamosTestStore.notas || [];
        dispatch(handleForm({ name: 'notas', value: notasActuales.filter(n => n.id !== notaId) }));
        await alertaEliminado();
      }
    } catch (error) {
      console.error("Error al eliminar nota:", error);
      const msg = error.response?.data?.error || "Error al eliminar nota";
      await alertaError(msg);
    }
  };
};
