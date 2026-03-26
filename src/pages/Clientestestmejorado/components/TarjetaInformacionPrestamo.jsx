import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  NoteAdd as NoteAddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney } from '../utils/loanCalculations';
import { actionCrearNota, actionEliminarNota } from '../../../store/prestamosTestStore/prestamosTestStoreActions';

const TarjetaInformacionPrestamo = ({ datosPrestamo }) => {
  const dispatch = useDispatch();
  const { notas } = useSelector(state => state.prestamosTestStore);
  const [nuevaNota, setNuevaNota] = useState('');

  if (!datosPrestamo) return null;

  const {
    estado = "",
    numeroTarjeta = "",
    nombreCliente = "",
    dineroPrestado = 0,
    plazoPrestamo = 0,
    interes = 0,
    valorCuota = 0,
    fechaPrestamo = "",
    abonoTotalIntereses = 0,
    abonoTotal = 0,
    saldoTotal = 0,
    saldoInversionIntereses = 0,
    interesesPendientes = 0,
    cuotasPagas = 0,
    cuotasPendientes = 0,
    intereses = 0,
    utilidadReal1 = 0,
    utilidadReal2 = 0,
    utilidadReal3 = 0,
  } = datosPrestamo;

  const rows = [
    { label: 'Estado Credito', value: estado, isBold: true, isHighlight: true },
    { label: 'Numero de la tarjeta', value: `# ${numeroTarjeta}`, isBold: true },
    { label: 'Nombre del cliente', value: nombreCliente, isBold: true },
    { label: 'Dinero prestado', value: formatMoney(dineroPrestado), isBold: true },
    { label: 'Plazo prestamo', value: plazoPrestamo, isBold: true },
    { label: '% interes', value: `${interes}%`, isBold: true },
    { label: 'Valor cuota', value: formatMoney(valorCuota), isBold: true },
    { label: 'Fecha del prestamo', value: dayjs(fechaPrestamo).format('YYYY-MM-DD'), isBold: true },
    { label: 'Abono Total + intereses', value: formatMoney(abonoTotalIntereses), isBold: false },
    { label: 'Abono Total', value: formatMoney(abonoTotal), isBold: false },
    { label: 'Saldo Total', value: formatMoney(saldoTotal), isBold: false },
    { label: 'Saldo A Inversion + Intereses', value: formatMoney(saldoInversionIntereses), isBold: false },
    { label: 'Intereses Pendientes', value: formatMoney(interesesPendientes), isBold: false },
    { label: 'Cuotas Pagas', value: cuotasPagas, isBold: false },
    { label: 'Cuotas Pendientes', value: cuotasPendientes, isBold: false },
    { label: 'Intereses', value: formatMoney(intereses), isBold: false },
    { label: 'Utilidad Real 1', value: formatMoney(utilidadReal1), isBold: false },
    { label: 'Utilidad Real 2', value: formatMoney(utilidadReal2), isBold: false },
    { label: 'Utilidad Real 3', value: formatMoney(utilidadReal3), isBold: false },
  ];

  const handleAgregarNota = () => {
    const texto = nuevaNota.trim();
    if (!texto) return;
    dispatch(actionCrearNota(texto));
    setNuevaNota('');
  };

  const handleEliminarNota = (notaId) => {
    dispatch(actionEliminarNota(notaId));
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
      <Box sx={{ backgroundColor: 'primary.main', p: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
          }}
        >
          Información del Préstamo
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '13px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    width: '50%',
                    py: 1,
                  }}
                >
                  {row.label}
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: 'center',
                    fontSize: '13px',
                    borderBottom: '1px solid #dee2e6',
                    py: 1,
                    backgroundColor: row.isHighlight ? '#FFFF00' : 'inherit',
                  }}
                >
                  {row.isBold ? <strong>{row.value}</strong> : row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================ */}
      {/* SECCION DE NOTAS                             */}
      {/* ============================================ */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'warning.dark' }}>
          Notas / Anomalías
        </Typography>

        {/* Input para agregar nueva nota */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={1}
            maxRows={3}
            placeholder="Escribir una nota o anomalía..."
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAgregarNota();
              }
            }}
          />
          <Button
            variant="contained"
            color="warning"
            onClick={handleAgregarNota}
            disabled={!nuevaNota.trim()}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <NoteAddIcon />
          </Button>
        </Box>

        {/* Lista de notas */}
        {notas && notas.length > 0 ? (
          <List dense sx={{ maxHeight: 250, overflowY: 'auto' }}>
            {notas.map((nota) => (
              <ListItem
                key={nota.id}
                sx={{
                  backgroundColor: '#fff8e1',
                  borderRadius: 1,
                  mb: 0.5,
                  border: '1px solid #ffe082',
                  pr: 6,
                }}
              >
                <ListItemText
                  primary={nota.texto}
                  secondary={dayjs(nota.created_at).format('YYYY-MM-DD HH:mm')}
                  primaryTypographyProps={{ fontSize: '13px' }}
                  secondaryTypographyProps={{ fontSize: '11px' }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => handleEliminarNota(nota.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
            Sin notas registradas
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default TarjetaInformacionPrestamo;
