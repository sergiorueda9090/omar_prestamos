import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';

import { actionCloseModal } from '../../../../store/globalStore/globalStoreActions';
import { actionFormStore, actionCreateRecord, actionUpdateRecord } from '../../../../store/userStore/userStoreActions';
import { useSelector, useDispatch } from 'react-redux';

export const Modal = () => {

  const dispatch = useDispatch();

  const { openMolda } = useSelector((state) => state.globalStore);
  const { idUser, userName, name, password, confirmPassword, is_superuser } = useSelector((state) => state.userStore);

  const [errors, setErrors] = useState({});
  const validateForm = () => {
  const newErrors = {};

  if (!userName.trim()) newErrors.userName = 'Campo requerido';
  if (!name.trim()) newErrors.name = 'Campo requerido';
  if (!password) newErrors.password = 'Campo requerido';
  if (!confirmPassword) newErrors.confirmPassword = 'Campo requerido';
  if (!is_superuser) newErrors.is_superuser = 'Campo requerido';
  if (password && confirmPassword && password !== confirmPassword)
    newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    dispatch(actionFormStore(e.target));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(actionCreateRecord());
  };

  const handlEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(actionUpdateRecord(idUser));
  };

  const handleOpenModal = async () => {
    dispatch(actionCloseModal())
  }

  return (
    <>
      <Dialog open={openMolda} fullWidth maxWidth="sm">
        <DialogTitle> { idUser != "" ? "Editar Usuario": "Crear usuario"}</DialogTitle>
        <form onSubmit={idUser !== "" ? handlEditSubmit : handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Usuario"
                name="userName"
                value={userName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.userName}
                helperText={errors.userName}
              />
              <TextField
                label="Nombre"
                name="name"
                value={name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password}
              />
              <TextField
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
              <TextField
                label="Rol"
                name="is_superuser"
                value={is_superuser}
                onChange={handleChange}
                select
                fullWidth
                required
                error={!!errors.is_superuser}
                helperText={errors.is_superuser}
              >
                <MenuItem value="1">Administrador</MenuItem>
                <MenuItem value="0">Usuario</MenuItem>
              </TextField>

              {/*<ImageUploader />*/}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleOpenModal}>Cancelar</Button>
            <Button type="submit" className='btn-blue' variant="contained">{ idUser != "" ? "Editar Usuario": "Crear usuario"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
