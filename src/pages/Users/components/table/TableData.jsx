import React, { useEffect } from 'react';
import { Button } from "@mui/material"
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from '@mui/material/Pagination';
import { useSelector, useDispatch } from "react-redux";
import { actionGetAllData, actionView, actionDelete } from "../../../../store/userStore/userStoreActions";
import { confirmarEliminacion } from '../../../../components/Alerts/AlertasCrud';

export const TableData = () => {
  const dispatch = useDispatch();
  const { usersArray, count, totalPages, currentPage } = useSelector(state => state.userStore);

  useEffect(() => {
    dispatch(actionGetAllData(currentPage));
  }, [dispatch, currentPage]);

  const handlePageChange = (_, newPage) => {
    dispatch(actionGetAllData(newPage));
  };

  const handleShow = ( id= "") => {
      dispatch(actionView(id))
  }

  const handleDelete = async (id = "") => {
    const confirmado = await confirmarEliminacion();

    if (confirmado) {
      dispatch(actionDelete(id));
    }
  };

  return (
    <div className="table-responsive mt-3">
      <table className="table table-bordered v-align">
        <thead className="thead-dark">
          <tr>
            <th>#</th>
            <th style={{ width: '300px' }}>Usuario</th>
            <th>Nombre</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usersArray.length === 0 ? (
            <tr><td colSpan="4" className="text-center">No hay usuarios</td></tr>
          ) : (
            usersArray.map((user, index) => (
              <tr key={user.id}>
                <td>{(currentPage - 1) * totalPages + index + 1}</td>
                <td>{user.email || 'No especificado'}</td>
                <td>{user.username}</td>
                <td>
                    {new Date(user.created_at).toLocaleString('sv-SE', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }).replace('T', ' ')}
                </td>
                <td>
                  <div className="actions d-flex align-items-center gap-2">
                    {/*<Button className="secondary" color="secondary"><FaEye /></Button>*/}
                    <Button className="success" color="success" onClick={() => handleShow(user.id)}><FaPencilAlt /></Button>
                    <Button className="error" color="error"     onClick={() => handleDelete(user.id)}><MdDelete /></Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center tableFooter">
        <p>
          Mostrando <b>{usersArray.length}</b> de <b>{count}</b> resultados
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

/**
 *                 <div className="d-flex tableFooter">
                    <p>showing <b>12</b> of <b>60</b> result </p>
                    <Pagination className="pagination" 
                                count={10} 
                                color="primary"
                                showFirstButton
                                showLastButton />
                </div>
 */