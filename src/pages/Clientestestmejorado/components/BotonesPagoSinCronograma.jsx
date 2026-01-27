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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Close as CloseIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as InterestIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney, calcularInteresSimple } from '../utils/loanCalculations';

// ============================================================================
// DIÁLOGO: PAGO DE CUOTA PERSONALIZADO (SIN CRONOGRAMA)
// ============================================================================

export const DialogoPagoCuotaSinCronograma = ({
  open,
  onClose,
  datosPrestamoOriginal,
  totalPagadoCuotas,
  onConfirmarPago,
}) => {
  const [montoPago, setMontoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));

  const saldoTotalPendiente = (datosPrestamoOriginal?.saldoTotalOriginal || 0) - totalPagadoCuotas;
  const valorCuota = datosPrestamoOriginal?.valorCuotaOriginal || 0;

  useEffect(() => {
    if (open) {
      setMontoPago('');
      setFechaPago(dayjs().format('YYYY-MM-DD'));
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
    if (monto > saldoTotalPendiente) {
      alert(`El monto no puede ser mayor al saldo pendiente ($${formatMoney(saldoTotalPendiente)})`);
      return;
    }
    onConfirmarPago(monto, 'cuota_sin_cronograma', { fechaPago });
    handleCerrar();
  };

  const handleCerrar = () => {
    setMontoPago('');
    onClose();
  };

  const montoIngresado = parseMoney(montoPago) || 0;
  const cuotasEquivalentes = valorCuota > 0 ? (montoIngresado / valorCuota).toFixed(2) : 0;
  const nuevoSaldo = saldoTotalPendiente - montoIngresado;

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PaymentIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="h6">Pagar Cuota - Sin Cronograma</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Pago flexible:</strong> El cliente puede pagar cualquier monto. El sistema calculará
          cuántas cuotas equivalentes representa el pago.
        </Alert>

        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Valor Cuota</Typography>
                <Typography variant="h6">${formatMoney(valorCuota)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Ya Pagado</Typography>
                <Typography variant="h6" color="success.main">${formatMoney(totalPagadoCuotas)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Saldo Pendiente</Typography>
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

        {montoIngresado > 0 && (
          <Card variant="outlined" sx={{ backgroundColor: 'success.50', border: 2, borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="subtitle1" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
                Resumen del Pago
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Monto a pagar:</strong></TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="success.main">${formatMoney(montoIngresado)}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Cuotas equivalentes:</strong></TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">{cuotasEquivalentes}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Nuevo saldo pendiente:</strong></TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color={nuevoSaldo > 0 ? 'error.main' : 'success.main'}>
                        ${formatMoney(Math.max(0, nuevoSaldo))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="success"
          disabled={!montoPago || parseMoney(montoPago) <= 0 || parseMoney(montoPago) > saldoTotalPendiente}
          startIcon={<PaymentIcon />}
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// DIÁLOGO: PAGO DE INTERÉS PERSONALIZADO (SIN CRONOGRAMA)
// ============================================================================

export const DialogoPagoInteresSinCronograma = ({
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
    onConfirmarPago(monto, 'interes', { fechaPago, descripcion });
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
          a las 3 utilidades. No afecta el saldo del préstamo.
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
// DIÁLOGO: PAGAR SALDO TOTAL (SIN CRONOGRAMA)
// ============================================================================

export const DialogoPagarSaldoTotalSinCronograma = ({
  open,
  onClose,
  datosPrestamoOriginal,
  totalPagadoCuotas,
  onConfirmarPago,
}) => {
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));

  const saldoTotalPendiente = (datosPrestamoOriginal?.saldoTotalOriginal || 0) - totalPagadoCuotas;

  useEffect(() => {
    if (open) {
      setFechaPago(dayjs().format('YYYY-MM-DD'));
    }
  }, [open]);

  const handleConfirmar = () => {
    if (saldoTotalPendiente <= 0) {
      alert('No hay saldo pendiente para pagar');
      return;
    }
    onConfirmarPago(saldoTotalPendiente, 'saldo_total_sin_cronograma', { fechaPago });
    handleCerrar();
  };

  const handleCerrar = () => {
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
          <strong>Liquidación total:</strong> Esta acción pagará el saldo total pendiente
          y liquidará completamente el préstamo.
        </Alert>

        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'error.50', border: 2, borderColor: 'error.main' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total del Préstamo</Typography>
                <Typography variant="h6">${formatMoney(datosPrestamoOriginal?.saldoTotalOriginal || 0)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Ya Pagado</Typography>
                <Typography variant="h6" color="success.main">${formatMoney(totalPagadoCuotas)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">Saldo a Pagar</Typography>
                <Typography variant="h3" color="error.main" sx={{ fontWeight: 'bold' }}>
                  ${formatMoney(saldoTotalPendiente)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
// DIÁLOGO: CONFIRMAR CAMBIO DE PLAZO
// ============================================================================

export const DialogoConfirmarCambioPlazo = ({
  open,
  onClose,
  plazoActual,
  plazoNuevo,
  datosPrestamoOriginal,
  totalPagadoCuotas,
  interesAcumulado,
  onConfirmar,
}) => {
  if (!datosPrestamoOriginal) return null;

  // Calcular con el nuevo plazo (para sin cronograma, plazo = meses = cuotas)
  const plazoMeses = parseInt(plazoNuevo) || 1;
  const { valorCuota: nuevaValorCuota, saldoTotal: nuevoSaldoTotal, totalInteres: nuevoTotalInteres } =
    calcularInteresSimple(datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, plazoMeses, plazoMeses);

  // Calcular el nuevo saldo pendiente considerando pagos previos
  const nuevoSaldoPendiente = nuevoSaldoTotal - totalPagadoCuotas;

  const handleConfirmar = () => {
    onConfirmar(plazoNuevo);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6">Confirmar Cambio de Plazo</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Atención:</strong> Al cambiar el plazo se recalculará el préstamo. Los pagos realizados se mantendrán.
        </Alert>

        <Grid container spacing={3}>
          {/* Datos Actuales */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ backgroundColor: 'grey.100', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  PLAZO ACTUAL: {plazoActual} meses
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Valor Cuota:</TableCell>
                      <TableCell align="right">${formatMoney(datosPrestamoOriginal.valorCuotaOriginal)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Interés:</TableCell>
                      <TableCell align="right">${formatMoney(datosPrestamoOriginal.totalInteresOriginal)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total a Pagar:</TableCell>
                      <TableCell align="right">${formatMoney(datosPrestamoOriginal.saldoTotalOriginal)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* Datos Nuevos */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ backgroundColor: 'primary.50', border: 2, borderColor: 'primary.main', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  NUEVO PLAZO: {plazoNuevo} meses
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Valor Cuota:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        ${formatMoney(nuevaValorCuota)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Interés:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        ${formatMoney(nuevoTotalInteres)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total a Pagar:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        ${formatMoney(nuevoSaldoTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Resumen de pagos */}
        <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'success.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
              Pagos Realizados (se mantienen)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Pagos de Cuotas:</Typography>
                <Typography variant="h6">${formatMoney(totalPagadoCuotas)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Pagos de Interés:</Typography>
                <Typography variant="h6">${formatMoney(interesAcumulado)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Nuevo Saldo Pendiente:</Typography>
                <Typography variant="h6" color={nuevoSaldoPendiente > 0 ? 'error.main' : 'success.main'}>
                  ${formatMoney(Math.max(0, nuevoSaldoPendiente))}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="primary">
          Confirmar Cambio
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL: BOTONES DE PAGO RÁPIDO SIN CRONOGRAMA
// ============================================================================

const BotonesPagoSinCronograma = ({
  datosPrestamoOriginal,
  totalPagadoCuotas,
  interesAcumulado,
  onPagoCuota,
  onPagoInteres,
}) => {
  const [dialogoCuotaAbierto, setDialogoCuotaAbierto] = useState(false);
  const [dialogoInteresAbierto, setDialogoInteresAbierto] = useState(false);
  const [dialogoSaldoTotalAbierto, setDialogoSaldoTotalAbierto] = useState(false);

  const saldoTotalPendiente = (datosPrestamoOriginal?.saldoTotalOriginal || 0) - totalPagadoCuotas;
  const valorCuota = datosPrestamoOriginal?.valorCuotaOriginal || 0;

  const handleConfirmarPago = (monto, tipoPago, datos) => {
    if (tipoPago === 'interes') {
      onPagoInteres(monto, datos);
    } else {
      onPagoCuota(monto, tipoPago, datos);
    }
  };

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
              disabled={saldoTotalPendiente <= 0}
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
                Acumulado: ${formatMoney(interesAcumulado)}
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
      <DialogoPagoCuotaSinCronograma
        open={dialogoCuotaAbierto}
        onClose={() => setDialogoCuotaAbierto(false)}
        datosPrestamoOriginal={datosPrestamoOriginal}
        totalPagadoCuotas={totalPagadoCuotas}
        onConfirmarPago={handleConfirmarPago}
      />

      <DialogoPagoInteresSinCronograma
        open={dialogoInteresAbierto}
        onClose={() => setDialogoInteresAbierto(false)}
        onConfirmarPago={handleConfirmarPago}
      />

      <DialogoPagarSaldoTotalSinCronograma
        open={dialogoSaldoTotalAbierto}
        onClose={() => setDialogoSaldoTotalAbierto(false)}
        datosPrestamoOriginal={datosPrestamoOriginal}
        totalPagadoCuotas={totalPagadoCuotas}
        onConfirmarPago={handleConfirmarPago}
      />
    </>
  );
};

export default BotonesPagoSinCronograma;
