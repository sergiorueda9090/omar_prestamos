import React, { useEffect } from 'react';
import { Button } from "@mui/material";
import { FaEye } from "react-icons/fa";
import { FaRegAddressCard } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { FaChalkboardUser } from "react-icons/fa6";
import Pagination from '@mui/material/Pagination';
import Tooltip from '@mui/material/Tooltip';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdBlockFlipped } from "react-icons/md";
import {
  actionGetAllPrestamos,
  actionObtenerPrestamo,
  actionEliminarPrestamo,
  actionMarcarPerdido,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';
import { setTab } from '../../../store/prestamosTestStore/prestamosTestStore';
import { confirmarEliminacion } from '../../../components/Alerts/AlertasCrud';
import Swal from "sweetalert2";

const TableData = ({ estadoFiltro = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prestamosArray, count, totalPages, currentPage } = useSelector(state => state.prestamosTestStore);

  useEffect(() => {
    dispatch(actionGetAllPrestamos(currentPage, estadoFiltro));
  }, [dispatch, currentPage, estadoFiltro]);

  // Cambiar de pagina
  const handlePageChange = (_, newPage) => {
    dispatch(actionGetAllPrestamos(newPage, estadoFiltro));
  };

  // Ver detalle (carga el prestamo en Redux y cambia al tab de gestion)
  const handleVerDetalle = (clienteId) => {
    dispatch(actionObtenerPrestamo(clienteId));
    dispatch(setTab(1));
  };

  // Ver tarjeta (navegar a la ruta con ID)
  const handleVerTarjeta = (clienteId) => {
    navigate(`/clientes/${clienteId}`);
  };

  // Ver info rapida (carga y va al tab de historial)
  const handleVerInfo = (clienteId) => {
    dispatch(actionObtenerPrestamo(clienteId));
    dispatch(setTab(2));
  };

  // Eliminar prestamo
  const handleDelete = async (clienteId) => {
    const confirmado = await confirmarEliminacion();
    if (confirmado) {
      dispatch(actionEliminarPrestamo(clienteId));
    }
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
            <th style={{ minWidth: '260px' }}>Acciones</th>
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

                    {/* Ver Info (historial) */}
                    <Tooltip title="Ver Detalles">
                      <Button className="success" color="success" onClick={() => handleVerInfo(cliente.id)}>
                        <FaChalkboardUser />
                      </Button>
                    </Tooltip>

                    {/* Ver Detalle (gestion de cuotas) */}
                    <Tooltip title="Ver Gestión">
                      <Button className="secondary" color="secondary" onClick={() => handleVerDetalle(cliente.id)}>
                        <FaEye />
                      </Button>
                    </Tooltip>

                    {/* Ver Tarjeta (pagina completa) */}
                    <Tooltip title="Ver Tarjeta">
                      <Button className="info" color="info" onClick={() => handleVerTarjeta(cliente.id)}>
                        <FaRegAddressCard />
                      </Button>
                    </Tooltip>

                    {/* Marcar como perdido (solo si está vigente) */}
                    {cliente.estado === 'vigente' && (
                      <Tooltip title="Marcar como Perdido">
                        <Button className="warning" color="warning" onClick={() => handleMarcarPerdido(cliente.id)}>
                          <MdBlockFlipped />
                        </Button>
                      </Tooltip>
                    )}

                    {/* Eliminar */}
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
    </div>
  );
};

export default TableData;
