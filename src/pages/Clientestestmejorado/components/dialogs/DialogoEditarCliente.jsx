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
} from '@mui/material';
import {
  ManageAccounts as ManageAccountsIcon,
  Close as CloseIcon,
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
  const [estado, setEstado] = useState('');
  const [fechaPrestamo, setFechaPrestamo] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Inicializa los campos editables cada vez que se abre el modal.
  useEffect(() => {
    if (open && cliente) {
      setEstado(cliente.estado || 'vigente');
      setFechaPrestamo(cliente.fecha_prestamo || '');
    }
  }, [open, cliente]);

  if (!cliente) return null;

  const dinero = (valor) => `$${formatMoney(parseMoney(valor))}`;

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

  // Fila de solo lectura (etiqueta + valor, una debajo de la otra).
  const FilaLectura = ({ label, value }) => (
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
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{cliente.nombre || '—'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Tarjeta: {cliente.numero_tarjeta || '—'}
          </Typography>
        </Box>

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
        <FilaLectura label="Monto del Préstamo" value={dinero(cliente.monto_prestamo)} />
        <FilaLectura label="% Interés" value={`${cliente.porcentaje_interes}%`} />
        <FilaLectura label="Tipo de Préstamo" value={cliente.tipo_prestamo || '—'} />
        <FilaLectura label="Duración" value={`${cliente.duracion_prestamo} meses`} />
        <FilaLectura label="Día de Cobro" value={cliente.dia_cobro || '—'} />
        <FilaLectura label="N° de Cuotas" value={cliente.numero_cuotas} />
        <FilaLectura label="Valor Cuota" value={dinero(cliente.valor_cuota)} />
        <FilaLectura label="Interés Mensual" value={dinero(cliente.interes_mensual)} />
        <FilaLectura label="Total Interés a Pagar" value={dinero(cliente.total_interes_pagar)} />
        <FilaLectura label="Saldo Total a Pagar" value={dinero(cliente.saldo_total_pagar)} />
        <FilaLectura label="Interés Acumulado" value={dinero(cliente.interes_acumulado)} />
        {cliente.prestamo_sin_cronograma && (
          <FilaLectura
            label="Préstamo sin cronograma"
            value={`Sí — Pagado: ${dinero(cliente.total_pagado_cuotas_sin_cronograma)}`}
          />
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
