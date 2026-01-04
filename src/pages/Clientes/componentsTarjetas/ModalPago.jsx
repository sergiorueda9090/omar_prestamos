import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Alert,
  IconButton,
  Typography,
  Box,
  Stack,
  Button,
  Paper,
  Divider
} from '@mui/material';
import {
  Close,
  Info,
  CheckCircleOutline,
  MonetizationOn,
  AttachMoney,
  AccountBalanceWallet,
  EventAvailable
} from '@mui/icons-material';

const metodosPago = ['Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Cheque'];

const getIcon = (iconType) => {
  const icons = {
    capital: <MonetizationOn sx={{ fontSize: 32 }} />,
    interes: <AttachMoney sx={{ fontSize: 32 }} />,
    liquidar: <AccountBalanceWallet sx={{ fontSize: 32 }} />,
    cuota: <EventAvailable sx={{ fontSize: 32 }} />
  };
  return icons[iconType] || <MonetizationOn sx={{ fontSize: 32 }} />;
};

const ModalPago = ({
  open,
  onClose,
  title,
  subtitle,
  color,
  iconType,
  form,
  setForm,
  onConfirm,
  montoEditable = true,
  alertMessage,
  alertSeverity = "info",
  clienteInfo
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 5
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 2
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {getIcon(iconType)}
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {alertMessage && (
          <Alert severity={alertSeverity} sx={{ mb: 3 }} icon={<Info />}>
            {alertMessage}
          </Alert>
        )}

        <Stack spacing={3}>
          <TextField
            label="Monto a Pagar"
            type="number"
            fullWidth
            value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            disabled={!montoEditable}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-disabled': {
                  backgroundColor: '#f5f5f5'
                }
              }
            }}
            helperText={!montoEditable ? "Monto predeterminado" : "Ingrese el monto"}
          />

          <FormControl fullWidth required>
            <InputLabel>Método de Pago</InputLabel>
            <Select
              value={form.metodoPago}
              label="Método de Pago"
              onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
            >
              {metodosPago.map((metodo) => (
                <MenuItem key={metodo} value={metodo}>
                  {metodo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Referencia / Comprobante"
            fullWidth
            value={form.referencia}
            onChange={(e) => setForm({ ...form, referencia: e.target.value })}
            placeholder="Ej: Transf-12345, Recibo-ABC"
            helperText="Opcional: Número de referencia o comprobante"
          />

          <TextField
            label="Observaciones"
            fullWidth
            multiline
            rows={3}
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            placeholder="Ingrese detalles adicionales del pago..."
            helperText="Opcional: Información adicional sobre este pago"
          />

          {/* Resumen del pago */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa',
              border: `2px solid ${color}30`
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
              Resumen del Pago
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                <Typography variant="body2" fontWeight="bold">{clienteInfo.nombre}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Tarjeta:</Typography>
                <Typography variant="body2" fontWeight="bold">{clienteInfo.numeroTarjeta}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Fecha:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {new Date().toLocaleDateString('es-CO')}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight="bold">Monto Total:</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: color }}>
                  ${parseFloat(form.monto || 0).toLocaleString('es-CO')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          disabled={!form.monto || !form.metodoPago}
          sx={{ 
            backgroundColor: color,
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            '&:hover': {
              backgroundColor: `${color}dd`
            }
          }}
          startIcon={<CheckCircleOutline />}
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalPago;