import axios from "axios";
import { handleAuthenticated, handleLogout, handleForm } from "./authStore.js";
import { handleShowBackDrop, handleHideBackDrop } from "../globalStore/globalStore.js";
import { dominio, TOKEN } from "../../constants/constantGlogal.js";

const path = 'users/api/';

export const actionFormStore = (data) => {
    return async (dispatch) => {
      const { name, value } = data; // Extraer el nombre y el valor del evento
      dispatch(handleForm({ name, value })); // Despachar la acción para actualizar el estado
    };
};

export const getAuth = (username,password, navigate) => {

    return async (dispatch, getState) => {
        
        const state = getState();
        
        // Iniciar la carga
        await dispatch(handleShowBackDrop());

        const options = {
            method: 'POST',
            url:    `${dominio}${path}token/`,
            headers: {
                'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
            },
            data: {
                username: username,
                password: password
            }
        };

        try {
            // Hacer la solicitud
            const response = await axios.request(options);
            
            if(response.status === 200){

                let data = response.data;

                // Obtener la información del usuario autenticado
                const userResponse = await axios.get(`${dominio}${path}infouser/`, {
                    headers: {
                        Authorization: `Bearer ${data.access}`
                    }
                });

                const userData = userResponse.data;

                await dispatch(handleAuthenticated({"access":data.access, "islogin":true, "idrol":userData.idrol, "username":userData.username}));
              
                navigate('/');

                await dispatch(handleHideBackDrop());
            }
            await dispatch(handleHideBackDrop());
            // Despachar la acción setAuthenticated con la respuesta de la solicitud
        } catch (error) {
            // Manejar errores
            await dispatch(handleHideBackDrop());
            console.error(error);

        }
    };
};

export const logout = (navigate) => {
    return async (dispatch) => {
        await dispatch(handleShowBackDrop());
        await dispatch(handleLogout());
        await dispatch(handleAuthenticated({"access":null, "islogin":false, "idrol":null, "username":null}));
        await dispatch(handleHideBackDrop());
        navigate('/');
    };
};
