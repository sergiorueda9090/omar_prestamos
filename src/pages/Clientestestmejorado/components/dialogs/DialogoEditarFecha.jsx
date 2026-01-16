import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney } from '../../utils/loanCalculations';

const DialogoEditarFecha = ({
  open,
  onClose,
  cuota,
  onConfirmarCambio
}) => {
  const [nuevaFecha, setNuevaFecha] = useState('');

  useEffect(() => {
    if (open && cuota) {
      setNuevaFecha(cuota.fecha_pago);
    }
  }, [open, cuota]);

  if (!cuota) return null;

  const handleConfirmar = () => {
    if (!nuevaFecha) {
      alert('Debe seleccionar una fecha');
      return;
    }

    onConfirmarCambio(nuevaFecha);
    handleCerrar();
  };

  const handleCerrar = () => {
    setNuevaFecha('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Editar Fecha de Pago - Cuota #{cuota.numero}</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Modifique la fecha de vencimiento de esta cuota. El cambio quedará registrado en el historial.
        </Alert>

        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información de la Cuota
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Cuota:</strong> #{cuota.numero}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Valor:</strong> ${formatMoney(cuota.valor)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Fecha Actual:</strong> {dayjs(cuota.fecha_pago).format('DD/MM/YYYY')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TextField
          fullWidth
          type="date"
          label="Nueva Fecha de Pago"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
          InputLabelProps={{ shrink: true }}
          helperText="Seleccione la nueva fecha de vencimiento"
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="primary"
        >
          Confirmar Cambio
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogoEditarFecha;
