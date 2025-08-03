import { handleOpenModal, handleCloseModal, handleOpenModalInfo, handleCloseModalInfo } from "./globalStore";

export const actionOpenModal = () => {
    
    return async (dispatch, getState) => {
        await dispatch(handleOpenModal());
    };
    
};

export const actionCloseModal = () => {
    return async (dispatch, getState) => {
        await dispatch(handleCloseModal());
    };
};


export const actionOpenModalInfo = () => {
    
    return async (dispatch, getState) => {
        await dispatch(handleOpenModalInfo());
    };
    
};

export const actionCloseModalInfo = () => {
    return async (dispatch, getState) => {
        await dispatch(handleCloseModalInfo());
    };
};
