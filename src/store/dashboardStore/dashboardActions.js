import axios from "axios";
import { setDashboardData } from "./dashboardStore";
import { handleShowBackDrop, handleHideBackDrop } from "../globalStore/globalStore";
import { dominio } from "../../constants/constantGlogal";

const path = "clientes/api/v2/dashboard/";

export const actionGetDashboardStats = () => {
  return async (dispatch, getState) => {
    await dispatch(handleShowBackDrop());

    const { authStore } = getState();

    const options = {
      method: 'GET',
      url: `${dominio}${path}`,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    };

    try {
      const response = await axios.request(options);

      if (response.status === 200) {
        await dispatch(setDashboardData(response.data));
      }
    } catch (error) {
      console.error("Error al obtener estadísticas del dashboard:", error);
    }
    await dispatch(handleHideBackDrop());
  };
};
