import React, { useState, useEffect } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney } from '../../utils/loanCalculations';

// Muestra el cronograma de cuotas del cliente en un modal de solo lectura.
const DialogoDetalleCuotas = ({ open, onClose, cliente }) => {
  const dinero = (valor) => `$${formatMoney(parseMoney(valor))}`;
  const fecha = (valor) => (valor ? dayjs(valor).format('DD/MM/YYYY') : '—');

  // Cuotas e intereses en estado local: se pueden quitar solo de la vista (NO de la base de datos).
  const [cuotas, setCuotas] = useState([]);
  const [pagosIntereses, setPagosIntereses] = useState([]);

  // Reconstruye las listas cada vez que se abre el modal o cambia el cliente
  // (asi los registros quitados vuelven a aparecer al reabrir).
  useEffect(() => {
    if (open && cliente) {
      setCuotas([...(cliente.cuotas || [])].sort((a, b) => a.numero - b.numero));
      setPagosIntereses([...(cliente.pagos_intereses || [])]);
    }
  }, [open, cliente]);

  if (!cliente) return null;

  // Quita una cuota solo de la vista (estado local); NO toca la base de datos.
  const quitarCuota = (cuota) => {
    setCuotas((prev) => prev.filter((c) => (c.id ?? c.numero) !== (cuota.id ?? cuota.numero)));
  };

  // Quita un interés solo de la vista (estado local); NO toca la base de datos.
  const quitarInteres = (pago) => {
    setPagosIntereses((prev) => prev.filter((p) => p.id !== pago.id));
  };

  const totalPagadas = cuotas.filter((c) => c.estado_pago === 'pagado').length;
  const totalParciales = cuotas.filter((c) => c.estado_pago === 'parcial').length;
  const totalPendientes = cuotas.filter((c) => c.estado_pago === 'pendiente').length;

  // Total de intereses dados (segun los visibles).
  const totalIntereses = pagosIntereses.reduce((sum, p) => sum + parseMoney(p.monto), 0);

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
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Chip size="small" label={`Total: ${cuotas.length}`} />
              <Chip size="small" color="success" label={`Pagadas: ${totalPagadas}`} />
              <Chip size="small" color="warning" label={`Parciales: ${totalParciales}`} />
              <Chip size="small" label={`Pendientes: ${totalPendientes}`} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{cliente.nombre || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Tarjeta: {cliente.numero_tarjeta || '—'}
              </Typography>
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
                    <TableCell align="center"><strong>Acción</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cuotas.map((cuota) => (
                    <TableRow key={cuota.id ?? cuota.numero} hover>
                      <TableCell>{cuota.numero}</TableCell>
                      <TableCell>{fecha(cuota.fecha_pago)}</TableCell>
                      <TableCell align="right">{dinero(cuota.valor)}</TableCell>
                      <TableCell align="right">{dinero(cuota.abonado)}</TableCell>
                      <TableCell align="right">{dinero(cuota.saldo)}</TableCell>
                      <TableCell align="center">{chipEstado(cuota.estado_pago)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Quitar de la vista">
                          <IconButton size="small" color="error" onClick={() => quitarCuota(cuota)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Intereses dados (siempre que existan, con o sin cronograma) */}
        {pagosIntereses.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'warning.main' }}>
              Intereses Dados
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Chip size="small" color="warning" label={`Registros: ${pagosIntereses.length}`} />
              <Chip size="small" label={`Total: ${dinero(totalIntereses)}`} />
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell align="right"><strong>Monto</strong></TableCell>
                    <TableCell><strong>Descripción</strong></TableCell>
                    <TableCell align="center"><strong>Acción</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagosIntereses.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{fecha(p.fecha)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={p.tipo === 'liquidacion' ? 'error' : 'warning'}
                          label={p.tipo === 'liquidacion' ? 'Liquidación' : 'Interés'}
                        />
                      </TableCell>
                      <TableCell align="right">{dinero(p.monto)}</TableCell>
                      <TableCell>{p.descripcion || '—'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Quitar de la vista">
                          <IconButton size="small" color="error" onClick={() => quitarInteres(p)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
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
