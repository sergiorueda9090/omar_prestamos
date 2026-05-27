import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney } from '../../utils/loanCalculations';

// Muestra el cronograma de cuotas del cliente en un modal de solo lectura.
const DialogoDetalleCuotas = ({ open, onClose, cliente }) => {
  if (!cliente) return null;

  const dinero = (valor) => `$${formatMoney(parseMoney(valor))}`;
  const fecha = (valor) => (valor ? dayjs(valor).format('DD/MM/YYYY') : '—');

  const cuotas = [...(cliente.cuotas || [])].sort((a, b) => a.numero - b.numero);

  const totalPagadas = cuotas.filter((c) => c.estado_pago === 'pagado').length;
  const totalParciales = cuotas.filter((c) => c.estado_pago === 'parcial').length;
  const totalPendientes = cuotas.filter((c) => c.estado_pago === 'pendiente').length;

  const chipEstado = (estado) => {
    if (estado === 'pagado') return <Chip size="small" label="Pagado" color="success" />;
    if (estado === 'parcial') return <Chip size="small" label="Parcial" color="warning" />;
    return <Chip size="small" label="Pendiente" color="default" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Detalle de Cuotas — {cliente.nombre}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {cliente.prestamo_sin_cronograma ? (
          <Alert severity="info">
            Este préstamo es <strong>sin cronograma</strong>, por lo que no tiene cuotas individuales.
            Total pagado: <strong>{dinero(cliente.total_pagado_cuotas_sin_cronograma)}</strong>.
          </Alert>
        ) : cuotas.length === 0 ? (
          <Alert severity="warning">Este préstamo no tiene cuotas registradas.</Alert>
        ) : (
          <>
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip size="small" label={`Total: ${cuotas.length}`} />
              <Chip size="small" color="success" label={`Pagadas: ${totalPagadas}`} />
              <Chip size="small" color="warning" label={`Parciales: ${totalParciales}`} />
              <Chip size="small" label={`Pendientes: ${totalPendientes}`} />
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Fecha Pago</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell align="right"><strong>Abonado</strong></TableCell>
                    <TableCell align="right"><strong>Saldo</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cuotas.map((cuota) => (
                    <TableRow key={cuota.id} hover>
                      <TableCell>{cuota.numero}</TableCell>
                      <TableCell>{fecha(cuota.fecha_pago)}</TableCell>
                      <TableCell align="right">{dinero(cuota.valor)}</TableCell>
                      <TableCell align="right">{dinero(cuota.abonado)}</TableCell>
                      <TableCell align="right">{dinero(cuota.saldo)}</TableCell>
                      <TableCell align="center">{chipEstado(cuota.estado_pago)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogoDetalleCuotas;
