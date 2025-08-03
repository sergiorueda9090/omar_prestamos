import React, {useContext, useEffect, useState} from "react";
import { Button } from "@mui/material"

import { MyContext }    from "../../App";
import { Modal }        from "./components/modal/modal";
import { ModalInfo }    from "./components/modal/modelInfo";

import { BackdropComponent } from "./components/Backdrop/Backdrop";
import { actionOpenModal }   from "../../store/globalStore/globalStoreActions";
import { actionGetAllData, actionClearData }  from "../../store/clientesStore/clientesStoreActions";

import { useSelector, useDispatch } from "react-redux";
import { TableData }    from "./components/table/TableData";
import { FiltrosData }  from "./components/filtros/FiltrosData";


export const Clientes = () => {
        
    const dispatch = useDispatch();
    const context = useContext(MyContext)

    useEffect(() =>{
        context.setIsHideSideBarAndHeader(false)
        window.scrollTo(0,0);
        dispatch(actionGetAllData());
    },[])

    const handleOpenModal = async () => {
        await dispatch(actionClearData());
        await dispatch(actionOpenModal())
    }

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 p-3 mt-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="hd">Clientes</h3>
                        <Button onClick={ (e) => handleOpenModal()} className="btn-blue" variant="contained">Crear Cliente</Button>
                    </div>
                   <FiltrosData />
                   <TableData />
                </div>
            </div>
            {/* COMPONENTE MODAL */}
            <Modal />
            <ModalInfo />
            {/* COMPONENTE BACKDROP */}
            <BackdropComponent />
        </>
        
    )
}