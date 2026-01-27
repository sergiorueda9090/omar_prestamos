import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Close as CloseIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as InterestIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney } from '../utils/loanCalculations';

// ============================================================================
// DIÁLOGO: PAGO DE CUOTA PERSONALIZADO
// ============================================================================

export const DialogoPagoCuotaPersonalizado = ({
  open,
  onClose,
  cuotas,
  onConfirmarPago,
}) => {
  const [montoPago, setMontoPago] = useState('');
  const [distribucion, setDistribucion] = useState([]);
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));

  // Calcular cuotas pendientes
  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const saldoTotalPendiente = cuotasPendientes.reduce((sum, c) => sum + (c.saldo || c.valor), 0);

  useEffect(() => {
    if (open) {
      setMontoPago('');
      setDistribucion([]);
      setFechaPago(dayjs().format('YYYY-MM-DD'));
    }
  }, [open]);

  const calcularDistribucion = (monto) => {
    const montoNum = typeof monto === 'number' ? monto : parseMoney(monto);
    if (!montoNum || montoNum <= 0) {
      setDistribucion([]);
      return;
    }

    let montoRestante = montoNum;
    const nuevaDistribucion = [];

    // Recorrer todas las cuotas en orden para distribuir el pago
    for (let i = 0; i < cuotas.length && montoRestante > 0; i++) {
      const cuota = cuotas[i];
      const saldoCuota = cuota.saldo !== undefined ? cuota.saldo : cuota.valor;

      // Saltar cuotas ya pagadas
      if (saldoCuota <= 0 || cuota.estado_pago === 'pagado') continue;

      if (montoRestante >= saldoCuota) {
        nuevaDistribucion.push({
          index: i,
          numero: cuota.numero,
          abonar: saldoCuota,
          saldoAntes: saldoCuota,
          saldoDespues: 0,
          estado: 'pagado'
        });
        montoRestante -= saldoCuota;
      } else {
        nuevaDistribucion.push({
          index: i,
          numero: cuota.numero,
          abonar: montoRestante,
          saldoAntes: saldoCuota,
          saldoDespues: saldoCuota - montoRestante,
          estado: 'parcial'
        });
        montoRestante = 0;
      }
    }

    setDistribucion(nuevaDistribucion);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPago(formatMoney(value));
    calcularDistribucion(value);
  };

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    if (!monto || monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    if (distribucion.length === 0) {
      alert('No hay cuotas pendientes para pagar');
      return;
    }
    onConfirmarPago(monto, distribucion, 'cuota', { fechaPago });
    handleCerrar();
  };

  const handleCerrar = () => {
    setMontoPago('');
    setDistribucion([]);
    onClose();
  };

  const totalAbonar = distribucion.reduce((sum, d) => sum + d.abonar, 0);
  const cuotasCompletasPagadas = distribucion.filter(d => d.estado === 'pagado').length;
  const cuotasParciales = distribucion.filter(d => d.estado === 'parcial').length;

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PaymentIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="h6">Pagar Cuota Personalizado</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Pago flexible:</strong> El cliente puede pagar cualquier monto. Si paga más de una cuota,
          el sistema distribuirá automáticamente el pago entre las cuotas pendientes en orden.
        </Alert>

        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Cuotas Pendientes</Typography>
                <Typography variant="h6">{cuotasPendientes.length}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Saldo Total Pendiente</Typography>
                <Typography variant="h6" color="error.main">${formatMoney(saldoTotalPendiente)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monto a Pagar"
              value={montoPago}
              onChange={handleMontoChange}
              placeholder="Ingrese el monto"
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Pago"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {distribucion.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Card variant="outlined" sx={{ backgroundColor: 'success.50' }}>
              <CardContent>
                <Typography variant="subtitle1" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Distribución del Pago
                </Typography>

                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<CheckIcon />}
                    label={`${cuotasCompletasPagadas} cuota(s) completa(s)`}
                    color="success"
                    variant="outlined"
                  />
                  {cuotasParciales > 0 && (
                    <Chip
                      label={`${cuotasParciales} cuota(s) parcial(es)`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'success.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cuota</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Saldo Antes</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Abonar</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Saldo Después</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {distribucion.map((dist, idx) => (
                        <TableRow key={idx} sx={{ backgroundColor: dist.estado === 'pagado' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)' }}>
                          <TableCell><strong>#{dist.numero}</strong></TableCell>
                          <TableCell align="right">${formatMoney(dist.saldoAntes)}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            ${formatMoney(dist.abonar)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: dist.saldoDespues > 0 ? 'warning.main' : 'success.main' }}>
                            ${formatMoney(dist.saldoDespues)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={dist.estado === 'pagado' ? 'Pagado' : 'Parcial'}
                              color={dist.estado === 'pagado' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: 'grey.200' }}>
                        <TableCell colSpan={2}><strong>TOTAL</strong></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '16px' }}>
                          ${formatMoney(totalAbonar)}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="success"
          disabled={!montoPago || parseMoney(montoPago) <= 0 || distribucion.length === 0}
          startIcon={<PaymentIcon />}
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// DIÁLOGO: PAGO DE INTERÉS PERSONALIZADO
// ============================================================================

export const DialogoPagoInteresPersonalizado = ({
  open,
  onClose,
  onConfirmarPago,
}) => {
  const [montoPago, setMontoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (open) {
      setMontoPago('');
      setFechaPago(dayjs().format('YYYY-MM-DD'));
      setDescripcion('');
    }
  }, [open]);

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPago(formatMoney(value));
  };

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    if (!monto || monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    onConfirmarPago(monto, [], 'interes', { fechaPago, descripcion });
    handleCerrar();
  };

  const handleCerrar = () => {
    setMontoPago('');
    setDescripcion('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <InterestIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6">Pagar Interés Personalizado</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Pago de interés:</strong> Este pago se registra como interés y se suma directamente
          a las 3 utilidades. No afecta el saldo de las cuotas.
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Monto del Interés"
              value={montoPago}
              onChange={handleMontoChange}
              placeholder="Ingrese el monto"
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Pago"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Descripción (opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Interés por mora, interés adicional, etc."
            />
          </Grid>
        </Grid>

        {montoPago && parseMoney(montoPago) > 0 && (
          <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'warning.50', border: 2, borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                Resumen del Pago de Interés
              </Typography>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                ${montoPago}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Este monto se sumará a las utilidades del préstamo
              </Typography>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="warning"
          disabled={!montoPago || parseMoney(montoPago) <= 0}
          startIcon={<InterestIcon />}
        >
          Registrar Interés
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// DIÁLOGO: PAGAR SALDO TOTAL PENDIENTE
// ============================================================================

export const DialogoPagarSaldoTotal = ({
  open,
  onClose,
  cuotas,
  datosPrestamoOriginal,
  onConfirmarPago,
}) => {
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [confirmado, setConfirmado] = useState(false);

  // Calcular saldo total pendiente
  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const saldoTotalPendiente = cuotasPendientes.reduce((sum, c) => sum + (c.saldo !== undefined ? c.saldo : c.valor), 0);

  useEffect(() => {
    if (open) {
      setFechaPago(dayjs().format('YYYY-MM-DD'));
      setConfirmado(false);
    }
  }, [open]);

  const handleConfirmar = () => {
    if (saldoTotalPendiente <= 0) {
      alert('No hay saldo pendiente para pagar');
      return;
    }

    // Crear distribución para todas las cuotas pendientes
    const distribucion = [];
    for (let i = 0; i < cuotas.length; i++) {
      const cuota = cuotas[i];
      const saldoCuota = cuota.saldo !== undefined ? cuota.saldo : cuota.valor;

      if (saldoCuota > 0 && cuota.estado_pago !== 'pagado') {
        distribucion.push({
          index: i,
          numero: cuota.numero,
          abonar: saldoCuota,
          saldoAntes: saldoCuota,
          saldoDespues: 0,
          estado: 'pagado'
        });
      }
    }

    onConfirmarPago(saldoTotalPendiente, distribucion, 'pagar_saldo', {
      fechaPago,
      dineroPrestado: datosPrestamoOriginal?.montoOriginal || 0,
      abonoCliente: saldoTotalPendiente,
      porcentajeInteres: datosPrestamoOriginal?.tasaOriginal || 0,
      tiempo: datosPrestamoOriginal?.numeroCuotasOriginal || 0,
    });
    handleCerrar();
  };

  const handleCerrar = () => {
    setConfirmado(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <WalletIcon sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="h6">Pagar Saldo Total Pendiente</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Liquidación total:</strong> Esta acción pagará todas las cuotas pendientes
          y liquidará completamente el préstamo.
        </Alert>

        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'error.50', border: 2, borderColor: 'error.main' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Cuotas Pendientes</Typography>
                <Typography variant="h5">{cuotasPendientes.length}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Saldo Total a Pagar</Typography>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  ${formatMoney(saldoTotalPendiente)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {cuotasPendientes.length > 0 && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Detalle de Cuotas a Pagar</Typography>
              <TableContainer sx={{ maxHeight: 200 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cuota</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cuotasPendientes.map((cuota, idx) => (
                      <TableRow key={idx}>
                        <TableCell>#{cuota.numero}</TableCell>
                        <TableCell align="right">${formatMoney(cuota.saldo !== undefined ? cuota.saldo : cuota.valor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        <TextField
          fullWidth
          type="date"
          label="Fecha de Pago"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Confirme que desea pagar el saldo total de ${formatMoney(saldoTotalPendiente)}</strong>
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="error"
          disabled={saldoTotalPendiente <= 0}
          startIcon={<WalletIcon />}
        >
          Pagar ${formatMoney(saldoTotalPendiente)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL: BOTONES DE PAGO RÁPIDO
// ============================================================================

const BotonesPagoRapido = ({
  cuotas,
  datosPrestamoOriginal,
  onAplicarPago,
}) => {
  const [dialogoCuotaAbierto, setDialogoCuotaAbierto] = useState(false);
  const [dialogoInteresAbierto, setDialogoInteresAbierto] = useState(false);
  const [dialogoSaldoTotalAbierto, setDialogoSaldoTotalAbierto] = useState(false);

  // Calcular valores para mostrar en los botones
  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const saldoTotalPendiente = cuotasPendientes.reduce((sum, c) => sum + (c.saldo !== undefined ? c.saldo : c.valor), 0);
  const valorCuota = datosPrestamoOriginal?.valorCuotaOriginal || 0;

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
          Opciones de Pago Rápido
        </Typography>

        <Grid container spacing={2}>
          {/* Botón Pagar Cuota Personalizado */}
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              onClick={() => setDialogoCuotaAbierto(true)}
              startIcon={<PaymentIcon />}
              disabled={cuotasPendientes.length === 0}
              sx={{
                py: 2,
                flexDirection: 'column',
                '& .MuiButton-startIcon': { mb: 1, mr: 0 }
              }}
            >
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                Pagar Cuota
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Valor cuota: ${formatMoney(valorCuota)}
              </Typography>
            </Button>
          </Grid>

          {/* Botón Pagar Interés */}
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              size="large"
              onClick={() => setDialogoInteresAbierto(true)}
              startIcon={<InterestIcon />}
              sx={{
                py: 2,
                flexDirection: 'column',
                '& .MuiButton-startIcon': { mb: 1, mr: 0 }
              }}
            >
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                Pagar Interés
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Suma a utilidades
              </Typography>
            </Button>
          </Grid>

          {/* Botón Pagar Saldo Total */}
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              onClick={() => setDialogoSaldoTotalAbierto(true)}
              startIcon={<WalletIcon />}
              disabled={saldoTotalPendiente <= 0}
              sx={{
                py: 2,
                flexDirection: 'column',
                '& .MuiButton-startIcon': { mb: 1, mr: 0 }
              }}
            >
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                Pagar Saldo Total
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                ${formatMoney(saldoTotalPendiente)}
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Diálogos */}
      <DialogoPagoCuotaPersonalizado
        open={dialogoCuotaAbierto}
        onClose={() => setDialogoCuotaAbierto(false)}
        cuotas={cuotas}
        onConfirmarPago={onAplicarPago}
      />

      <DialogoPagoInteresPersonalizado
        open={dialogoInteresAbierto}
        onClose={() => setDialogoInteresAbierto(false)}
        onConfirmarPago={onAplicarPago}
      />

      <DialogoPagarSaldoTotal
        open={dialogoSaldoTotalAbierto}
        onClose={() => setDialogoSaldoTotalAbierto(false)}
        cuotas={cuotas}
        datosPrestamoOriginal={datosPrestamoOriginal}
        onConfirmarPago={onAplicarPago}
      />
    </>
  );
};

export default BotonesPagoRapido;
