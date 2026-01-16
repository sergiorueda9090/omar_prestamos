import React from 'react';
import {
  Box,
  Typography,
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
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { formatMoney } from '../../utils/loanCalculations';

const DialogoConfirmarEliminarPago = ({
  open,
  onClose,
  cuota,
  onConfirmarEliminar
}) => {
  if (!cuota) return null;

  const handleConfirmar = () => {
    onConfirmarEliminar();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="h6">Confirmar Eliminación de Pago</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>¡Atención!</strong> Esta acción revertirá todos los pagos realizados en esta cuota.
          El cambio quedará registrado en el historial.
        </Alert>

        <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
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
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Abonado:</strong>{' '}
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    ${formatMoney(cuota.abonado || 0)}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Estado:</strong>{' '}
                  {cuota.estado_pago === 'pagado' ? 'Pagado' : 'Parcial'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 2 }}>
          Al confirmar, se eliminarán <strong>${formatMoney(cuota.abonado || 0)}</strong> de pagos
          y la cuota volverá a estado pendiente.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="error"
        >
          Confirmar Eliminación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogoConfirmarEliminarPago;
