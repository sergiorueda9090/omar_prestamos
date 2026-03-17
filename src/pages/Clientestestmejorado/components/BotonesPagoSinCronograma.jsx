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
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Close as CloseIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as InterestIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  AccountBalance as LiquidateIcon,
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
  onAplicarAmpliacion,
}) => {
  const [tabActual, setTabActual] = useState(0);

  // === Estado: Pagar Saldo ===
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [porcentajeInteres, setPorcentajeInteres] = useState('');
  const [tiempo, setTiempo] = useState('');

  // === Estado: Ampliación ===
  const [montoAdicional, setMontoAdicional] = useState('');
  const [nuevaTasa, setNuevaTasa] = useState('');
  const [nuevasCuotas, setNuevasCuotas] = useState('12');

  // Información de solo lectura
  const dineroPrestado = datosPrestamoOriginal?.montoOriginal || 0;
  const tasaOriginal = datosPrestamoOriginal?.tasaOriginal || 0;
  const numeroCuotasOriginal = datosPrestamoOriginal?.numeroCuotasOriginal || 0;
  const abonoTotal = totalPagadoCuotas;

  // Cálculo de cuotas restantes (proporcional para sin cronograma)
  const valorCuotaOriginal = datosPrestamoOriginal?.valorCuotaOriginal || 0;
  const cuotasPagadasProporcional = valorCuotaOriginal > 0
    ? Math.round((totalPagadoCuotas / valorCuotaOriginal) * 10) / 10
    : 0;
  const cuotasRestantes = Math.max(0, Math.ceil(numeroCuotasOriginal - cuotasPagadasProporcional));

  // Interés de liquidación para ampliación
  const interesLiquidacion = cuotasRestantes > 0
    ? calcularInteresSimple(dineroPrestado, tasaOriginal, cuotasRestantes).totalInteres
    : 0;
  const saldoFavorEstimado = abonoTotal - interesLiquidacion;

  // Total a Pagar reactivo
  const interes = parseFloat(porcentajeInteres) || 0;
  const meses = parseInt(tiempo) || 0;
  const totalBruto = tiempo !== '' && meses > 0
    ? dineroPrestado + (dineroPrestado * (interes / 100) * meses)
    : 0;
  const totalAPagar = Math.max(0, totalBruto - abonoTotal);

  useEffect(() => {
    if (open) {
      setTabActual(0);
      setFechaPago(dayjs().format('YYYY-MM-DD'));
      setPorcentajeInteres('');
      setTiempo('');
      setMontoAdicional('');
      setNuevaTasa(tasaOriginal.toString());
      setNuevasCuotas('12');
    }
  }, [open, tasaOriginal]);

  const handleConfirmarPago = () => {
    if (totalAPagar <= 0) {
      alert('Ingrese el interés y el tiempo para calcular el total a pagar');
      return;
    }
    onConfirmarPago(totalAPagar, 'saldo_total_sin_cronograma', {
      fechaPago,
      dineroPrestado,
      abonoCliente: totalAPagar,
      porcentajeInteres: interes,
      tiempo: meses,
      totalBruto,
    });
    handleCerrar();
  };

  const handleMontoAdicionalChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoAdicional(formatMoney(value));
  };

  const handleConfirmarAmpliacion = () => {
    const monto = parseMoney(montoAdicional);
    const tasa = parseFloat(nuevaTasa);
    const cuotas = parseInt(nuevasCuotas);

    if (!monto || monto <= 0) {
      alert('El monto adicional debe ser mayor a 0');
      return;
    }
    if (!tasa || tasa <= 0) {
      alert('La tasa de interés debe ser mayor a 0');
      return;
    }
    if (!cuotas || cuotas <= 0) {
      alert('El número de cuotas debe ser mayor a 0');
      return;
    }

    onAplicarAmpliacion({ montoAdicional: monto, nuevaTasa: tasa, nuevasCuotas: cuotas });
    handleCerrar();
  };

  const handleCerrar = () => {
    setPorcentajeInteres('');
    setTiempo('');
    setMontoAdicional('');
    onClose();
  };

  const puedeConfirmarPago = totalAPagar > 0;

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="md" fullWidth>
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

        <Tabs
          value={tabActual}
          onChange={(e, v) => setTabActual(v)}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<WalletIcon />}
            iconPosition="start"
            label="Pagar Saldo"
          />
          <Tab
            icon={<AddIcon />}
            iconPosition="start"
            label="Ampliación del Crédito"
          />
        </Tabs>

        {/* ==================== TAB 0: PAGAR SALDO ==================== */}
        {tabActual === 0 && (
          <>
            {/* PASO 1: Información de solo lectura */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información del Préstamo
            </Typography>
            <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Dinero Prestado</Typography>
                    <Typography variant="h6" color="primary.main">
                      ${formatMoney(dineroPrestado)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Abono Total</Typography>
                    <Typography variant="h6" color="success.main">
                      ${formatMoney(abonoTotal)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* PASO 2: Inputs editables */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Condiciones del Pago
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Interés (%)"
                  type="number"
                  value={porcentajeInteres}
                  onChange={(e) => setPorcentajeInteres(e.target.value)}
                  placeholder="Ej: 5, 10, 15..."
                  InputProps={{ endAdornment: <Typography sx={{ ml: 1 }}>%</Typography> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tiempo (meses)"
                  type="number"
                  value={tiempo}
                  onChange={(e) => setTiempo(e.target.value)}
                  placeholder="Ej: 1, 6, 9..."
                />
              </Grid>
            </Grid>

            {/* PASO 3: Selector de fecha */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Fecha del Pago
            </Typography>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Pago"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            {/* PASO 4: Total a Pagar (reactivo) */}
            <Card
              variant="outlined"
              sx={{
                border: 2,
                borderColor: totalBruto > 0 ? 'error.main' : 'grey.300',
                backgroundColor: totalBruto > 0 ? 'rgba(211, 47, 47, 0.05)' : 'grey.50',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total a Pagar
                </Typography>

                {totalBruto > 0 ? (
                  <Box>
                    {/* Total Bruto */}
                    <Box display="flex" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Bruto
                        <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                          (${formatMoney(dineroPrestado)} + ${formatMoney(dineroPrestado)} × {interes}% × {meses} {meses === 1 ? 'mes' : 'meses'})
                        </Typography>
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', ml: 2, whiteSpace: 'nowrap' }}>
                        ${formatMoney(totalBruto)}
                      </Typography>
                    </Box>

                    {/* − Abono Total */}
                    <Box display="flex" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="success.main">− Abono Total</Typography>
                      <Typography variant="body1" color="success.main" sx={{ ml: 2 }}>
                        ${formatMoney(abonoTotal)}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    {/* = Total a Pagar */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 'bold' }}>
                        = Total a Pagar
                      </Typography>
                      <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>
                        ${formatMoney(totalAPagar)}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" color="text.disabled" sx={{ fontWeight: 'bold' }}>
                      $0
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Ingrese el interés y el tiempo para ver el total
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ==================== TAB 1: AMPLIACIÓN DEL CRÉDITO ==================== */}
        {tabActual === 1 && (
          <>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Al hacer clic en "Iniciar Ampliación", se abrirá el proceso de liquidación.
              El saldo a favor se aplicará automáticamente a las nuevas cuotas.
            </Alert>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Configurar Ampliación del Préstamo
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Monto Adicional"
                  value={montoAdicional}
                  onChange={handleMontoAdicionalChange}
                  placeholder="0"
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nueva Tasa de Interés (%)"
                  type="number"
                  value={nuevaTasa}
                  onChange={(e) => setNuevaTasa(e.target.value)}
                  inputProps={{ step: '0.1', min: '0' }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Número de Cuotas"
                  type="number"
                  value={nuevasCuotas}
                  onChange={(e) => setNuevasCuotas(e.target.value)}
                  inputProps={{ min: '1' }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Información del Préstamo
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Monto vigente:</strong> ${formatMoney(dineroPrestado)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Tasa actual:</strong> {tasaOriginal}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Cuotas totales:</strong> {numeroCuotasOriginal}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Cuotas pagadas:</strong> {cuotasPagadasProporcional}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Cuotas restantes:</strong> {cuotasRestantes}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Abono Total:</strong>{' '}
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        ${formatMoney(abonoTotal)}
                      </span>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Intereses (Liquidación):</strong>{' '}
                      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        ${formatMoney(interesLiquidacion)}
                      </span>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      (Monto × Tasa × Cuotas restantes)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Saldo a Favor Estimado:</strong>{' '}
                      <span style={{
                        color: saldoFavorEstimado >= 0 ? '#2e7d32' : '#d32f2f',
                        fontWeight: 'bold'
                      }}>
                        ${formatMoney(saldoFavorEstimado)}
                      </span>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      (Abono Total - Intereses)
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        {tabActual === 0 && (
          <Button
            onClick={handleConfirmarPago}
            variant="contained"
            color="error"
            disabled={!puedeConfirmarPago}
            startIcon={<WalletIcon />}
          >
            Pagar ${formatMoney(totalAPagar)}
          </Button>
        )}
        {tabActual === 1 && (
          <Button
            onClick={handleConfirmarAmpliacion}
            variant="contained"
            color="primary"
            startIcon={<LiquidateIcon />}
          >
            Iniciar Ampliación (con Liquidación)
          </Button>
        )}
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
  onAplicarAmpliacion,
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
        onAplicarAmpliacion={onAplicarAmpliacion}
      />
    </>
  );
};

export default BotonesPagoSinCronograma;
