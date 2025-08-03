import React, { useEffect } from 'react';
import { Button } from "@mui/material"
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { FaRegAddressCard } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import Pagination from '@mui/material/Pagination';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actionGetAllData, actionView, actionDelete } from "../../../../store/clientesStore/clientesStoreActions";
import { confirmarEliminacion } from '../../../../components/Alerts/AlertasCrud';
import { FaChalkboardUser } from "react-icons/fa6";
import Tooltip from '@mui/material/Tooltip';

export const TableData = () => {
  const dispatch = useDispatch();
  const { clientesArray, count, totalPages, currentPage } = useSelector(state => state.clientesStore);

  useEffect(() => {
    dispatch(actionGetAllData(currentPage));
  }, [dispatch, currentPage]);

  const handlePageChange = (_, newPage) => {
    dispatch(actionGetAllData(newPage));
  };

  const handleShow = ( id= "", info=false) => {
    console.log("info ",info)
    dispatch(actionView(id, info))
  }

  const handleDelete = async (id = "") => {
    const confirmado = await confirmarEliminacion();

    if (confirmado) {
      dispatch(actionDelete(id));
    }
  };

  const navigate = useNavigate();

  const handleTarjeta = (clienteId) => {
    dispatch(actionView(clienteId))
    navigate(`/clientes/${clienteId}`);
  };

  return (
    <div className="table-responsive mt-3">
      <table className="table table-bordered v-align">
        <thead className="thead-dark">
          <tr>
            <th>#</th>
            <th>Tarjeta</th>
            <th>Nombre</th>
            <th>Monto</th>
            <th>% Interés</th>
            <th>Duración</th>
            <th>Tipo</th>
            <th>Fecha Préstamo</th>
            <th>Día Cobro</th>
            <th>Interés Mensual</th>
            <th># Cuotas</th>
            <th>Valor Cuota</th>
            <th>Total Interés</th>
            <th>Saldo Total</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
            {clientesArray.length > 0 ? (
              clientesArray.map((cliente, index) => (
                <tr key={cliente.id}>
                  <td>{index + 1}</td>
                  <td>{cliente.numero_tarjeta}</td>
                  <td>{cliente.nombre}</td>
                  <td>{parseInt(cliente.monto_prestamo).toLocaleString('es-CO')}</td>
                  <td>{cliente.porcentaje_interes}%</td>
                  <td>{cliente.duracion_prestamo} meses</td>
                  <td>{cliente.tipo_prestamo}</td>
                  <td>{new Date(cliente.fecha_prestamo).toLocaleDateString('es-CO')}</td>
                  <td>{new Date(cliente.dia_cobro).toLocaleDateString('es-CO')}</td>
                  <td>{parseInt(cliente.interes_mensual).toLocaleString('es-CO')} %</td>
                  <td>{cliente.numero_cuotas}</td>
                  <td>{parseInt(cliente.valor_cuota).toLocaleString('es-CO')}</td>
                  <td>{parseInt(cliente.total_interes_pagar).toLocaleString('es-CO')}</td>
                  <td>{parseInt(cliente.saldo_total_pagar).toLocaleString('es-CO')}</td>
                  <td>
                    <div className="actions d-flex align-items-center gap-2">
                      {/*<Button className="secondary" color="secondary"><FaEye /></Button>*/}
                      <Tooltip title="Ver Detalles">
                        <Button className="success" color="success" onClick={() => handleShow(cliente.id, true)}>
                          <FaChalkboardUser />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Ver Tarjeta">
                        <Button className="secondary" color="secondary" onClick={() => handleTarjeta(cliente.id)}>
                          <FaRegAddressCard />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Editar Cliente">
                        <Button className="success" color="success" onClick={() => handleShow(cliente.id, false)}>
                          <FaPencilAlt />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Eliminar Cliente">
                        <Button className="error" color="error" onClick={() => handleDelete(cliente.id)}>
                          <MdDelete />
                        </Button>
                      </Tooltip>
                    </div>
                   </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="text-center">No hay registros</td>
              </tr>
            )}
          </tbody>

      </table>

      <div className="d-flex justify-content-between align-items-center tableFooter">
        <p>
          Mostrando <b>{clientesArray.length}</b> de <b>{count}</b> resultados
        </p>

         <Pagination
            className="pagination"
            count={totalPages}
            page={currentPage}
            color="primary"
            showFirstButton
            showLastButton
            onChange={handlePageChange}
        />
      </div>
    </div>
  );
};
