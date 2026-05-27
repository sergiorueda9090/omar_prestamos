import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney } from '../../utils/loanCalculations';

// Muestra la informacion principal del cliente/prestamo en un modal de solo lectura.
// El usuario puede quitar filas que no necesita: solo se ocultan en el modal
// (estado local), NO se borra nada de la base de datos.
const DialogoInfoCliente = ({ open, onClose, cliente }) => {
  const dinero = (valor) => `$${formatMoney(parseMoney(valor))}`;
  const fecha = (valor) => (valor ? dayjs(valor).format('DD/MM/YYYY') : '—');

  // Construye la lista de filas a mostrar a partir del cliente.
  const construirFilas = (c) => {
    if (!c) return [];
    const filas = [
      { key: 'monto_prestamo', label: 'Monto del Préstamo', value: dinero(c.monto_prestamo) },
      { key: 'porcentaje_interes', label: '% Interés', value: `${c.porcentaje_interes}%` },
      { key: 'tipo_prestamo', label: 'Tipo de Préstamo', value: c.tipo_prestamo || '—' },
      { key: 'duracion_prestamo', label: 'Duración', value: `${c.duracion_prestamo} meses` },
      { key: 'fecha_prestamo', label: 'Fecha del Préstamo', value: fecha(c.fecha_prestamo) },
      { key: 'dia_cobro', label: 'Día de Cobro', value: fecha(c.dia_cobro) },
      { key: 'numero_cuotas', label: 'N° de Cuotas', value: c.numero_cuotas },
      { key: 'valor_cuota', label: 'Valor Cuota', value: dinero(c.valor_cuota) },
      { key: 'interes_mensual', label: 'Interés Mensual', value: dinero(c.interes_mensual) },
      { key: 'total_interes_pagar', label: 'Total Interés a Pagar', value: dinero(c.total_interes_pagar) },
      { key: 'saldo_total_pagar', label: 'Saldo Total a Pagar', value: dinero(c.saldo_total_pagar) },
      { key: 'interes_acumulado', label: 'Interés Acumulado', value: dinero(c.interes_acumulado) },
    ];
    if (c.prestamo_sin_cronograma) {
      filas.push({
        key: 'sin_cronograma',
        label: 'Préstamo sin cronograma',
        value: `Sí — Pagado: ${dinero(c.total_pagado_cuotas_sin_cronograma)}`,
      });
    }
    return filas;
  };

  const [filas, setFilas] = useState([]);

  // Reconstruye las filas cada vez que se abre el modal o cambia el cliente
  // (asi las filas quitadas vuelven a aparecer al reabrir).
  useEffect(() => {
    if (open && cliente) {
      setFilas(construirFilas(cliente));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cliente]);

  if (!cliente) return null;

  const quitarFila = (key) => {
    setFilas((prev) => prev.filter((f) => f.key !== key));
  };

  const estadoChip = () => {
    if (cliente.estado === 'pagado') return <Chip size="small" label="Pagado" color="success" />;
    if (cliente.estado === 'perdido') return <Chip size="small" label="Perdido" color="error" />;
    return <Chip size="small" label="Vigente" color="primary" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Información del Cliente</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{cliente.nombre || '—'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tarjeta: {cliente.numero_tarjeta || '—'}
            </Typography>
          </Box>
          {estadoChip()}
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Filas de informacion: una debajo de la otra, cada una se puede quitar */}
        {filas.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No hay información para mostrar.
          </Typography>
        ) : (
          filas.map((fila) => (
            <Box
              key={fila.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {fila.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {fila.value}
                </Typography>
              </Box>
              <Tooltip title="Quitar de la vista">
                <IconButton size="small" color="error" onClick={() => quitarFila(fila.key)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))
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

export default DialogoInfoCliente;
