import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Tooltip,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { actionCloseModalInfo } from '../../../../store/globalStore/globalStoreActions';

import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaidIcon from '@mui/icons-material/Paid';
import PercentIcon from '@mui/icons-material/Percent';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const ModalInfo = () => {
  const dispatch = useDispatch();

  const { openMoldaInfo } = useSelector((state) => state.globalStore);
  const {
    id,
    numeroTarjeta,
    nombre,
    montoPrestamo,
    porcentajeInteres,
    duracionPrestamo,
    tipoPrestamo,
    fechaPrestamo,
    diaCobro,
    interesMensual,
    numeroCuotas,
    valorCuota,
    totalInteresPagar,
    saldoTotalPagar,
  } = useSelector((state) => state.clientesStore);

  const [camposVisibles, setCamposVisibles] = useState({
    nombre: true,
    numeroTarjeta: true,
    tipoPrestamo: true,
    diaCobro: true,
    montoPrestamo: true,
    interesMensual: true,
    numeroCuotas: true,
    valorCuota: true,
    saldoTotalPagar: true,
  });

  const ocultarCampo = (campo) => {
    setCamposVisibles((prev) => ({
      ...prev,
      [campo]: false,
    }));
  };

  return (
    <Dialog open={openMoldaInfo} fullWidth maxWidth="sm">
      <DialogTitle>🧾 Información del Cliente</DialogTitle>

      <DialogContent>
        {id && (
          <Card variant="outlined" sx={{ mb: 2, boxShadow: 3 }}>
            <CardContent>
              <List>
                {camposVisibles.nombre && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem
                      onClick={() => ocultarCampo('nombre')}
                      sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: '#f0f0f0' } }}
                    >
                      <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={`👤 Nombre: ${nombre}`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.numeroTarjeta && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('numeroTarjeta')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><CreditCardIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={`💳 Número de Tarjeta: ${numeroTarjeta}`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.tipoPrestamo && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('tipoPrestamo')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><EventNoteIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={`📄 Tipo de Préstamo: ${tipoPrestamo}`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.diaCobro && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('diaCobro')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><CalendarTodayIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={`📆 Día de Cobro: ${diaCobro}`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.montoPrestamo && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('montoPrestamo')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><PaidIcon color="success" /></ListItemIcon>
                      <ListItemText primary={`💰 Monto Préstamo: $${parseInt(montoPrestamo).toLocaleString('es-CO')}`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.interesMensual && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('interesMensual')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><PercentIcon color="warning" /></ListItemIcon>
                      <ListItemText primary={`📈 Interés Mensual: ${interesMensual}%`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.numeroCuotas && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('numeroCuotas')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><FormatListNumberedIcon color="info" /></ListItemIcon>
                      <ListItemText primary={`🧾 Número de Cuotas: ${numeroCuotas}`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.valorCuota && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('valorCuota')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><MonetizationOnIcon color="success" /></ListItemIcon>
                      <ListItemText primary={`💸 Valor Cuota: $${parseInt(valorCuota).toLocaleString('es-CO')}`} />
                    </ListItem>
                  </Tooltip>
                )}
                {camposVisibles.saldoTotalPagar && (
                  <Tooltip title="Haz clic para ocultar">
                    <ListItem onClick={() => ocultarCampo('saldoTotalPagar')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <ListItemIcon><AccountBalanceWalletIcon color="secondary" /></ListItemIcon>
                      <ListItemText primary={`💼 Saldo Total a Pagar: $${parseInt(saldoTotalPagar).toLocaleString('es-CO')}`} />
                    </ListItem>
                  </Tooltip>
                )}
              </List>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => dispatch(actionCloseModalInfo())} color="secondary" variant="outlined">
          ❌ Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
