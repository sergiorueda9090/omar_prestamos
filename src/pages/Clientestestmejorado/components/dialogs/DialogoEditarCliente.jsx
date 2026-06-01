import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  ManageAccounts as ManageAccountsIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { formatMoney, parseMoney } from '../../utils/loanCalculations';

const ESTADOS = [
  { value: 'vigente', label: 'Vigente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'perdido', label: 'Perdido' },
];

// Muestra TODA la informacion del cliente. Solo se pueden editar el estado y
// la fecha del prestamo; el resto de campos es de solo lectura.
const DialogoEditarCliente = ({ open, onClose, cliente, onGuardar }) => {
  const dinero = (valor) => `$${formatMoney(parseMoney(valor))}`;

  const [estado, setEstado] = useState('');
  const [fechaPrestamo, setFechaPrestamo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [filas, setFilas] = useState([]);

  // Construye la lista de filas de solo lectura a partir del cliente.
  const construirFilas = (c) => {
    if (!c) return [];
    const filasBase = [
      { key: 'monto_prestamo', label: 'Monto del Préstamo', value: dinero(c.monto_prestamo) },
      { key: 'porcentaje_interes', label: '% Interés', value: `${c.porcentaje_interes}%` },
      { key: 'tipo_prestamo', label: 'Tipo de Préstamo', value: c.tipo_prestamo || '—' },
      { key: 'duracion_prestamo', label: 'Duración', value: `${c.duracion_prestamo} meses` },
      { key: 'dia_cobro', label: 'Día de Cobro', value: c.dia_cobro || '—' },
      { key: 'numero_cuotas', label: 'N° de Cuotas', value: c.numero_cuotas },
      { key: 'valor_cuota', label: 'Valor Cuota', value: dinero(c.valor_cuota) },
      { key: 'interes_mensual', label: 'Interés Mensual', value: dinero(c.interes_mensual) },
      { key: 'total_interes_pagar', label: 'Total Interés a Pagar', value: dinero(c.total_interes_pagar) },
      { key: 'saldo_total_pagar', label: 'Saldo Total a Pagar', value: dinero(c.saldo_total_pagar) },
      { key: 'interes_acumulado', label: 'Interés Acumulado', value: dinero(c.interes_acumulado) },
    ];
    if (c.prestamo_sin_cronograma) {
      filasBase.push({
        key: 'sin_cronograma',
        label: 'Préstamo sin cronograma',
        value: `Sí — Pagado: ${dinero(c.total_pagado_cuotas_sin_cronograma)}`,
      });
    }
    return filasBase;
  };

  // Inicializa los campos editables y las filas cada vez que se abre el modal
  // (asi las filas quitadas vuelven a aparecer al reabrir).
  useEffect(() => {
    if (open && cliente) {
      setEstado(cliente.estado || 'vigente');
      setFechaPrestamo(cliente.fecha_prestamo || '');
      setFilas(construirFilas(cliente));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cliente]);

  if (!cliente) return null;

  // Quita una fila solo de la vista (estado local); NO toca la base de datos.
  const quitarFila = (key) => {
    setFilas((prev) => prev.filter((f) => f.key !== key));
  };

  const hayCambios =
    estado !== cliente.estado || fechaPrestamo !== cliente.fecha_prestamo;

  const handleGuardar = async () => {
    if (!hayCambios) return;

    const cambios = {};
    if (estado !== cliente.estado) cambios.estado = estado;
    if (fechaPrestamo !== cliente.fecha_prestamo) cambios.fecha_prestamo = fechaPrestamo;

    setGuardando(true);
    const ok = await onGuardar(cambios);
    setGuardando(false);
    if (ok) onClose();
  };

  // Fila de solo lectura (etiqueta + valor + boton para quitar de la vista).
  const FilaLectura = ({ label, value, onQuitar }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
        <Tooltip title="Quitar de la vista">
          <IconButton size="small" color="error" onClick={onQuitar}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <ManageAccountsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Información Completa del Cliente</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Solo puedes modificar el <strong>Estado</strong> y la <strong>Fecha del Préstamo</strong>.
          Los demás campos son de solo lectura.
        </Alert>

        {/* === Campos EDITABLES === */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Estado del Préstamo"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {ESTADOS.map((op) => (
                <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Fecha del Préstamo"
              value={fechaPrestamo}
              onChange={(e) => setFechaPrestamo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 1 }} />

        {/* === Campos SOLO LECTURA === */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Datos del Préstamo (solo lectura)
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{cliente.nombre || '—'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Tarjeta: {cliente.numero_tarjeta || '—'}
          </Typography>
        </Box>
        {filas.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No hay información para mostrar.
          </Typography>
        ) : (
          filas.map((fila) => (
            <FilaLectura
              key={fila.key}
              label={fila.label}
              value={fila.value}
              onQuitar={() => quitarFila(fila.key)}
            />
          ))
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          color="primary"
          disabled={!hayCambios || guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogoEditarCliente;
