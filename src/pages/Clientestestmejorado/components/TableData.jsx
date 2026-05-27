import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { FaInfoCircle, FaUserEdit } from "react-icons/fa";
import { FaRegAddressCard } from "react-icons/fa6";
import { MdReceiptLong } from "react-icons/md";
import Pagination from '@mui/material/Pagination';
import Tooltip from '@mui/material/Tooltip';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdBlockFlipped } from "react-icons/md";
import DialogoInfoCliente from './dialogs/DialogoInfoCliente';
import DialogoDetalleCuotas from './dialogs/DialogoDetalleCuotas';
import DialogoEditarCliente from './dialogs/DialogoEditarCliente';
import {
  actionGetAllPrestamos,
  actionMarcarPerdido,
  actionEditarInfoCliente,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';
import Swal from "sweetalert2";

const TableData = ({ estadoFiltro = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prestamosArray, count, totalPages, currentPage } = useSelector(state => state.prestamosTestStore);

  // Modales de vista rapida (info del cliente / detalle de cuotas / editar)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openCuotas, setOpenCuotas] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);

  const handleVerInfoCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenInfo(true);
  };

  const handleVerDetalleCuotas = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenCuotas(true);
  };

  const handleVerEditarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenEditar(true);
  };

  // Guarda los cambios (estado / fecha) y recarga el listado en la pagina y filtro actuales.
  const handleGuardarEdicion = (cambios) => {
    return dispatch(actionEditarInfoCliente(clienteSeleccionado.id, cambios, currentPage, estadoFiltro));
  };

  useEffect(() => {
    dispatch(actionGetAllPrestamos(currentPage, estadoFiltro));
  }, [dispatch, currentPage, estadoFiltro]);

  // Cambiar de pagina
  const handlePageChange = (_, newPage) => {
    dispatch(actionGetAllPrestamos(newPage, estadoFiltro));
  };

  // Ver tarjeta (navegar a la ruta con ID)
  const handleVerTarjeta = (clienteId) => {
    navigate(`/clientes/${clienteId}`);
  };

  // Formatear moneda colombiana
  const formatCurrency = (value) => {
    const num = parseInt(value);
    return isNaN(num) ? '0' : num.toLocaleString('es-CO');
  };

  // Chip de estado
  const getEstadoBadge = (estado) => {
    if (estado === 'pagado') return <span className="badge bg-success">Pagado</span>;
    if (estado === 'perdido') return <span className="badge bg-danger">Perdido</span>;
    return <span className="badge bg-primary">Vigente</span>;
  };

  // Marcar como perdido
  const handleMarcarPerdido = async (clienteId) => {
    const result = await Swal.fire({
      title: "¿Marcar como perdido?",
      text: "Este cliente será marcado como perdido.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, marcar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      dispatch(actionMarcarPerdido(clienteId));
    }
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
            <th>Estado</th>
            <th>Fecha Préstamo</th>
            <th># Cuotas</th>
            <th>Valor Cuota</th>
            <th>Saldo Total</th>
            <th style={{ minWidth: '240px' }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {prestamosArray.length > 0 ? (
            prestamosArray.map((cliente, index) => (
              <tr key={cliente.id}>
                <td>{(currentPage - 1) * 20 + index + 1}</td>
                <td>{cliente.numero_tarjeta}</td>
                <td>{cliente.nombre}</td>
                <td>${formatCurrency(cliente.monto_prestamo)}</td>
                <td>{cliente.porcentaje_interes}%</td>
                <td>{cliente.duracion_prestamo} meses</td>
                <td>{cliente.tipo_prestamo}</td>
                <td>{getEstadoBadge(cliente.estado)}</td>
                <td>{new Date(cliente.fecha_prestamo).toLocaleDateString('es-CO')}</td>
                <td>{cliente.numero_cuotas}</td>
                <td>${formatCurrency(cliente.valor_cuota)}</td>
                <td>${formatCurrency(cliente.saldo_total_pagar)}</td>
                <td>
                  <div className="actions d-flex align-items-center gap-2" style={{ flexWrap: 'nowrap' }}>

                    {/* Ver toda la info del cliente + editar estado/fecha (modal) */}
                    <Tooltip title="Ver / Editar Cliente">
                      <Button className="edit" color="inherit" onClick={() => handleVerEditarCliente(cliente)}>
                        <FaUserEdit />
                      </Button>
                    </Tooltip>

                    {/* Ver Tarjeta (pagina completa) */}
                    <Tooltip title="Ver Tarjeta">
                      <Button className="info" color="info" onClick={() => handleVerTarjeta(cliente.id)}>
                        <FaRegAddressCard />
                      </Button>
                    </Tooltip>

                    {/* Información del cliente (modal) */}
                    <Tooltip title="Información del Cliente">
                      <Button className="primary" color="primary" onClick={() => handleVerInfoCliente(cliente)}>
                        <FaInfoCircle />
                      </Button>
                    </Tooltip>

                    {/* Detalle de cuotas (modal) */}
                    <Tooltip title="Detalle de Cuotas">
                      <Button className="primary" color="primary" onClick={() => handleVerDetalleCuotas(cliente)}>
                        <MdReceiptLong />
                      </Button>
                    </Tooltip>

                    {/* Marcar como perdido (solo si está vigente). Si no aplica,
                        se reserva el espacio para mantener alineadas las columnas. */}
                    {cliente.estado === 'vigente' ? (
                      <Tooltip title="Marcar como Perdido">
                        <Button className="warning" color="warning" onClick={() => handleMarcarPerdido(cliente.id)}>
                          <MdBlockFlipped />
                        </Button>
                      </Tooltip>
                    ) : (
                      <span style={{ width: 32, flex: '0 0 auto', display: 'inline-block' }} aria-hidden="true" />
                    )}

                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13" className="text-center">No hay registros</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center tableFooter">
        <p>
          Mostrando <b>{prestamosArray.length}</b> de <b>{count}</b> resultados
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

      {/* Modales de vista rapida */}
      <DialogoInfoCliente
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        cliente={clienteSeleccionado}
      />
      <DialogoDetalleCuotas
        open={openCuotas}
        onClose={() => setOpenCuotas(false)}
        cliente={clienteSeleccionado}
      />
      <DialogoEditarCliente
        open={openEditar}
        onClose={() => setOpenEditar(false)}
        cliente={clienteSeleccionado}
        onGuardar={handleGuardarEdicion}
      />
    </div>
  );
};

export default TableData;
