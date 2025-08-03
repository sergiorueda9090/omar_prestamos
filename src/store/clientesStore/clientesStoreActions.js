import axios from "axios";
import { handleForm, listData, clearData, showData} from "./clientesStore";
import { handleShowBackDrop, handleHideBackDrop, handleCloseModal } from "../globalStore/globalStore";
import { dominio } from "../../constants/constantGlogal";
import { alertaCreado, alertaActualizado, alertaEliminado, alertaError, alertaDescarga } from "../../components/Alerts/AlertasCrud";
import { actionOpenModal, actionOpenModalInfo } from "../globalStore/globalStoreActions";

const path = "clientes/api/";

export const actionFormStore = (data) => {
    return async (dispatch) => {
      const { name, value } = data; // Extraer el nombre y el valor del evento
      console.log("name ",name);
      console.log("value ",value);
      dispatch(handleForm({ name, value })); // Despachar la acción para actualizar el estado
    };
};

export const actionGetAllData = (page = 1) => {

  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'GET',
      url: `${dominio}${path}?page=${page}`,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {

        const { results, count, next, previous } = response.data;
        const totalPages = Math.ceil(count / 20); // 1 es tu page_size
        await dispatch(listData({
          clientesArray: results,
          count,
          next,
          previous,
          currentPage: page,
          totalPages
        }));
        
      }

    } catch (error) {
      console.error("Error fetching paginated data:", error);
    } finally {
      await dispatch(handleHideBackDrop());
    }
  };
};

export const actionGetAllFilterData = (page = 1, filters = {}) => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    // Construir query string
    const params = new URLSearchParams({ page });

    if (filters.search)     params.append("search",     filters.search);
    if (filters.startDate)  params.append("startDate",  filters.startDate);
    if (filters.endDate)    params.append("endDate",    filters.endDate);

    const url = `${dominio}${path}getusersfilter/?${params.toString()}`;

    const options = {
      method: "GET",
      url,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        const { results, count, next, previous } = response.data;
        const totalPages = Math.ceil(count / 20);
        await dispatch(
          listData({
            users: results,
            count,
            next,
            previous,
            currentPage: page,
            totalPages,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching paginated filtered data:", error);
    } finally {
      await dispatch(handleHideBackDrop());
    }
  };
};

export const actionCreateRecord = (userData) => {

    return async (dispatch, getState) => {

        const { authStore, clientesStore } = getState();
        const {
                  id,
                  numeroTarjeta,
                  nombre,
                  montoPrestamo,
                  porcentajeInteres,
                  duracionPrestamo,
                  tipoPrestamo,
                  fechaPrestamo,
                  diaCobro,
                  interesMensual,
                  numeroCuotas,
                  valorCuota,
                  totalInteresPagar,
                  saldoTotalPagar,
                  cuotas,
                } = clientesStore;

        const formData = new FormData();
                
        formData.append("numero_tarjeta"      , numeroTarjeta);
        formData.append("nombre"              , nombre);
        formData.append("monto_prestamo"      , montoPrestamo.replace(/\./g, '')); // quitar puntos si está formateado
        formData.append("porcentaje_interes"  , porcentajeInteres);
        formData.append("duracion_prestamo"   , duracionPrestamo);
        formData.append("tipo_prestamo"       , tipoPrestamo);
        formData.append("fecha_prestamo"      , fechaPrestamo);
        formData.append("dia_cobro"           , diaCobro);
        formData.append("interes_mensual"     , interesMensual);
        formData.append("numero_cuotas"       , numeroCuotas);
        formData.append("valor_cuota"         , valorCuota.replace(/\./g, ''));
        formData.append("total_interes_pagar" , totalInteresPagar.replace(/\./g, ''));
        formData.append("saldo_total_pagar"   , saldoTotalPagar.replace(/\./g, ''));
        formData.append("cuotas"              , JSON.stringify(cuotas));


        await dispatch(handleShowBackDrop());

        const options = {
            method: 'POST',
            url: `${dominio}${path}crear/`,
            headers: {
                Authorization: `Bearer ${authStore.token}`,
                "Content-Type": "multipart/form-data",
            },
            data: formData, // Aquí se pasa el FormData
        };

        try {
            // Hacer la solicitud
            const response = await axios.request(options);
            console.log(" response response ",response)
            if (response.status == 201) {
                
                await dispatch(clearData());
                await dispatch(actionGetAllData());
                await dispatch(handleCloseModal());
                await dispatch(handleHideBackDrop());
                await alertaCreado();

            } else {
               
              await dispatch(actionGetAllData());
              await dispatch(handleCloseModal());
              await dispatch(handleHideBackDrop());
              await alertaError(); 
           
            }

        } catch (error) {

          const errores = error.response.data;
          let mensaje = "";

          for (const campo in errores) {
            errores[campo].forEach(msg => {
               mensaje += `❌ ${campo}: ${msg}\n`;
            });
          }
          await dispatch(handleCloseModal());
          await dispatch(handleHideBackDrop());
          await alertaError(mensaje);

        }
    };
};

export const actionView = (id="", info=false) => {
    console.log(": info : ",info)
    return async (dispatch, getState) => {

    await dispatch(handleShowBackDrop());
    
    const { authStore, categoriesStore } = getState();

    const options = {
      method: 'GET',
      url: `${dominio}${path}${id}/`,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    };

    try {
      
      const response = await axios.request(options);
  
      if(response.status == 200) {

        await dispatch(showData({
            id                : response.data.id,
            numeroTarjeta     : response.data.numero_tarjeta,
            nombre            : response.data.nombre,
            montoPrestamo     : response.data.monto_prestamo,
            porcentajeInteres : response.data.porcentaje_interes,
            duracionPrestamo  : response.data.duracion_prestamo,
            tipoPrestamo      : response.data.tipo_prestamo,
            fechaPrestamo     : response.data.fecha_prestamo,
            diaCobro          : response.data.dia_cobro,
            interesMensual    : response.data.interes_mensual,
            numeroCuotas      : response.data.numero_cuotas,
            valorCuota        : response.data.valor_cuota,
            saldoTotalPagar   : response.data.saldo_total_pagar,
            totalInteresPagar : response.data.total_interes_pagar,
            cuotas            : response.data.cuotas,
          }));
        }

        if(info){
          console.log("QUIEN LLAMA")
          await dispatch(actionOpenModalInfo());
        }else{
          await dispatch(actionOpenModal());
        }

        await dispatch(handleHideBackDrop());

    } catch (error) {
        await dispatch(handleHideBackDrop());
        await alertaError();
    } finally {
      await dispatch(handleHideBackDrop());
    }
  };

}

export const actionUpdateRecord = (userId) => {
  return async (dispatch, getState) => {
    const { authStore, userStore } = getState();
    const { userName, name, password, is_superuser } = userStore;

    const formData = new FormData();
    formData.append('username', userName);
    formData.append('name',     name);
    formData.append('is_superuser', is_superuser === '1' ? '1' : '0');

    // Si deseas permitir cambio de contraseña, verifica si `password` fue modificado
    if (password && password.trim() !== '') {
      formData.append('password', password);
      formData.append('confirmPassword', password);
    }

    await dispatch(handleShowBackDrop());

    const options = {
      method: 'PUT',
      url: `${dominio}${path}updateuser/${userId}`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        await dispatch(clearData());
        await dispatch(actionGetAllData());
        await dispatch(handleCloseModal());
        await dispatch(handleHideBackDrop());
        await alertaActualizado(); // puedes definir este alert personalizado
      } else {
        await dispatch(actionGetAllData());
        await dispatch(handleCloseModal());
        await dispatch(handleHideBackDrop());
        await alertaError();
      }

    } catch (error) {
      await dispatch(handleCloseModal());
      await dispatch(handleHideBackDrop());
      await alertaError();
    }
  };
};

export const actionDelete = (id="") => {

  return async (dispatch, getState) => {

    await dispatch(handleShowBackDrop());

    const { authStore, categoriesStore } = getState();

    const options = {
      method: 'DELETE',
      url: `${dominio}${path}delete/${id}`,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    };

    try {
      const response = await axios.request(options);

      if(response.status == 200) {
      
        dispatch(actionGetAllData())

        await alertaEliminado(response.data.mensaje);


      }else{

        await alertaError();

      }

    } catch (error) {

         await alertaError();

    } finally {

      await dispatch(handleHideBackDrop());

    }

  };
}

export const actionDownload = (params = {}) => {
  return async (dispatch, getState) => {
    const { authStore } = getState();

    // Construir query string si hay filtros
    const queryParams = new URLSearchParams(params).toString();
    const url = `${dominio}${path}exportar/${queryParams ? `?${queryParams}` : ''}`;

    const options = {
      method: 'GET',
      url: url,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      responseType: 'blob', // importante para archivos
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        // Crear y disparar descarga
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clientes_con_cuotas.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        await alertaDescarga();
      } else {
        await alertaError();
      }
    } catch (error) {
      console.error("Error al descargar:", error);
      await alertaError();
    } finally {
      await dispatch(handleHideBackDrop());
    }
  };
};

export const actionClearData = () => {
  return async (dispatch, getState) => {await dispatch(clearData());};
}