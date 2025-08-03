import axios from "axios";
import { handleForm, listData, clearData, showData} from "./userStore";
import { handleShowBackDrop, handleHideBackDrop, handleCloseModal } from "../globalStore/globalStore";
import { dominio } from "../../constants/constantGlogal";
import { alertaCreado, alertaActualizado, alertaEliminado, alertaError } from "../../components/Alerts/AlertasCrud";
import { actionOpenModal } from "../globalStore/globalStoreActions";

const path = "users/api/";

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
      url: `${dominio}${path}getusers/?page=${page}`,
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
          users: results,
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

        const { authStore, userStore } = getState();
        const { userName, name, password, is_superuser } = userStore;

        const formData = new FormData();
        formData.append('username', userName);
        formData.append('name',     name);
        formData.append('password', password);
        formData.append('confirmPassword', password);

        formData.append('is_superuser', is_superuser === '1' ? '1' : '0');

        await dispatch(handleShowBackDrop());

        const options = {
            method: 'POST',
            url: `${dominio}${path}createuser/`,
            headers: {
                Authorization: `Bearer ${authStore.token}`,
                "Content-Type": "multipart/form-data",
            },
            data: formData, // Aquí se pasa el FormData
        };

        try {
            // Hacer la solicitud
            const response = await axios.request(options);

            if (response.status == 200) {
                
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

          await dispatch(handleCloseModal());
          await dispatch(handleHideBackDrop());
          await alertaError(); 

        }
    };
};

export const actionView = (id="") => {

    return async (dispatch, getState) => {

    await dispatch(handleShowBackDrop());
    
    const { authStore, categoriesStore } = getState();

    const options = {
      method: 'GET',
      url: `${dominio}${path}getuser/${id}`,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    };

    try {
      
      const response = await axios.request(options);
  
      if(response.status === 200) {

        await dispatch(showData({
            idUser          : response.data.id,
            userName        : response.data.username,
            name            : response.data.username,
            password        : response.data.username,
            confirmPassword : response.data.username,
            is_superuser    : response.data.is_superuser ? 1 : 0,
          }));
        }

        await dispatch(actionOpenModal());
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

      if(response.status == 204) {
      
        dispatch(actionGetAllData())

        await alertaCreado();


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


export const actionClearData = () => {
  return async (dispatch, getState) => {await dispatch(clearData());};
}