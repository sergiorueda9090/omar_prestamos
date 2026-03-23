import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Paper, Typography, TextField, Button, Grid, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Divider, Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import {
  Payment as PaymentIcon, Close as CloseIcon,
  AccountBalanceWallet as WalletIcon, TrendingUp as InterestIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney } from '../utils/loanCalculations';

// Redux actions
import {
  actionPagarCuotaSinCronograma,
  actionPagarInteres,
  actionPagarSaldoTotal,
  actionAmpliarPrestamo,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';


// ============================================================================
// DIALOGO: PAGO DE CUOTA SIN CRONOGRAMA
// ============================================================================

const DialogoPagoCuotaSinCronograma = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { saldoTotalPagar, totalPagadoCuotasSinCronograma, valorCuota } = useSelector(state => state.prestamosTestStore);
  const [montoPago, setMontoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));

  const saldoPendiente = parseMoney(saldoTotalPagar) - parseMoney(totalPagadoCuotasSinCronograma);
  const valorCuotaNum = parseMoney(valorCuota);

  useEffect(() => { if (open) { setMontoPago(''); setFechaPago(dayjs().format('YYYY-MM-DD')); } }, [open]);

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    if (!monto || monto <= 0) { alert('El monto debe ser mayor a 0'); return; }
    if (monto > saldoPendiente) { alert(`El monto no puede ser mayor al saldo pendiente ($${formatMoney(saldoPendiente)})`); return; }
    dispatch(actionPagarCuotaSinCronograma(monto, fechaPago));
    onClose();
  };

  const montoIngresado = parseMoney(montoPago) || 0;
  const cuotasEquivalentes = valorCuotaNum > 0 ? (montoIngresado / valorCuotaNum).toFixed(2) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center"><PaymentIcon sx={{ mr: 1, color: 'success.main' }} /><Typography variant="h6">Pagar Cuota - Sin Cronograma</Typography></Box>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}><strong>Pago flexible:</strong> El sistema calculará cuántas cuotas equivalentes representa el pago.</Alert>
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Valor Cuota</Typography><Typography variant="h6">${formatMoney(valorCuotaNum)}</Typography></Grid>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Ya Pagado</Typography><Typography variant="h6" color="success.main">${formatMoney(parseMoney(totalPagadoCuotasSinCronograma))}</Typography></Grid>
              <Grid item xs={4}><Typography variant="body2" color="text.secondary">Saldo Pendiente</Typography><Typography variant="h6" color="error.main">${formatMoney(saldoPendiente)}</Typography></Grid>
            </Grid>
          </CardContent>
        </Card>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Monto a Pagar" value={montoPago} onChange={(e) => setMontoPago(formatMoney(e.target.value.replace(/\D/g, '')))} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Fecha de Pago" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
        </Grid>
        {montoIngresado > 0 && (
          <Card variant="outlined" sx={{ backgroundColor: 'success.50', border: 2, borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="subtitle1" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>Resumen del Pago</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell><strong>Monto a pagar:</strong></TableCell><TableCell align="right"><Typography variant="h6" color="success.main">${formatMoney(montoIngresado)}</Typography></TableCell></TableRow>
                  <TableRow><TableCell><strong>Cuotas equivalentes:</strong></TableCell><TableCell align="right"><Typography variant="h6">{cuotasEquivalentes}</Typography></TableCell></TableRow>
                  <TableRow><TableCell><strong>Nuevo saldo pendiente:</strong></TableCell><TableCell align="right"><Typography variant="h6" color={saldoPendiente - montoIngresado > 0 ? 'error.main' : 'success.main'}>${formatMoney(Math.max(0, saldoPendiente - montoIngresado))}</Typography></TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="success" disabled={!montoPago || parseMoney(montoPago) <= 0 || parseMoney(montoPago) > saldoPendiente} startIcon={<PaymentIcon />}>Confirmar Pago</Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: PAGO DE INTERES SIN CRONOGRAMA
// ============================================================================

const DialogoPagoInteresSinCronograma = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [montoPago, setMontoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => { if (open) { setMontoPago(''); setFechaPago(dayjs().format('YYYY-MM-DD')); setDescripcion(''); } }, [open]);

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    if (!monto || monto <= 0) { alert('El monto debe ser mayor a 0'); return; }
    dispatch(actionPagarInteres(monto, fechaPago, descripcion));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center"><InterestIcon sx={{ mr: 1, color: 'warning.main' }} /><Typography variant="h6">Pagar Interés Personalizado</Typography></Box>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}><strong>Pago de interés:</strong> Se suma directamente a las 3 utilidades. No afecta el saldo del préstamo.</Alert>
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField fullWidth label="Monto del Interés" value={montoPago} onChange={(e) => setMontoPago(formatMoney(e.target.value.replace(/\D/g, '')))} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }} /></Grid>
          <Grid item xs={12}><TextField fullWidth type="date" label="Fecha de Pago" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Interés por mora" /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="warning" disabled={!montoPago || parseMoney(montoPago) <= 0} startIcon={<InterestIcon />}>Registrar Interés</Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: PAGAR SALDO TOTAL SIN CRONOGRAMA
// ============================================================================

const DialogoPagarSaldoTotalSinCronograma = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { montoPrestamo, totalPagadoCuotasSinCronograma } = useSelector(state => state.prestamosTestStore);
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [porcentajeInteres, setPorcentajeInteres] = useState('');
  const [tiempo, setTiempo] = useState('');

  const dineroPrestado = parseMoney(montoPrestamo);
  const abonoTotal = parseMoney(totalPagadoCuotasSinCronograma);
  const interes = parseFloat(porcentajeInteres) || 0;
  const meses = parseInt(tiempo) || 0;
  const totalBruto = tiempo !== '' && meses > 0 ? dineroPrestado + (dineroPrestado * (interes / 100) * meses) : 0;
  const totalAPagar = Math.max(0, totalBruto - abonoTotal);

  useEffect(() => { if (open) { setFechaPago(dayjs().format('YYYY-MM-DD')); setPorcentajeInteres(''); setTiempo(''); } }, [open]);

  const handleConfirmar = () => {
    if (totalAPagar <= 0) { alert('Ingrese el interés y el tiempo'); return; }
    dispatch(actionPagarSaldoTotal(interes, meses, fechaPago));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center"><WalletIcon sx={{ mr: 1, color: 'error.main' }} /><Typography variant="h6">Pagar Saldo Total</Typography></Box>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Dinero Prestado</Typography><Typography variant="h6" color="primary.main">${formatMoney(dineroPrestado)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Abono Total</Typography><Typography variant="h6" color="success.main">${formatMoney(abonoTotal)}</Typography></Grid>
            </Grid>
          </CardContent>
        </Card>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Interés (%)" type="number" value={porcentajeInteres} onChange={(e) => setPorcentajeInteres(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Tiempo (meses)" type="number" value={tiempo} onChange={(e) => setTiempo(e.target.value)} /></Grid>
        </Grid>
        <TextField fullWidth type="date" label="Fecha de Pago" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 3 }} />
        <Card variant="outlined" sx={{ border: 2, borderColor: totalBruto > 0 ? 'error.main' : 'grey.300' }}>
          <CardContent>
            {totalBruto > 0 ? (
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>${formatMoney(totalAPagar)}</Typography>
            ) : (
              <Typography variant="h4" color="text.disabled" sx={{ fontWeight: 'bold' }}>$0</Typography>
            )}
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="error" disabled={totalAPagar <= 0} startIcon={<WalletIcon />}>Pagar ${formatMoney(totalAPagar)}</Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// COMPONENTE PRINCIPAL: BOTONES DE PAGO RAPIDO SIN CRONOGRAMA
// ============================================================================

const BotonesPagoSinCronograma = () => {
  const { saldoTotalPagar, totalPagadoCuotasSinCronograma, valorCuota, interesAcumulado } = useSelector(state => state.prestamosTestStore);
  const [dialogoCuotaAbierto, setDialogoCuotaAbierto] = useState(false);
  const [dialogoInteresAbierto, setDialogoInteresAbierto] = useState(false);
  const [dialogoSaldoTotalAbierto, setDialogoSaldoTotalAbierto] = useState(false);

  const saldoPendiente = parseMoney(saldoTotalPagar) - parseMoney(totalPagadoCuotasSinCronograma);

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>Opciones de Pago Rápido</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="success" size="large" onClick={() => setDialogoCuotaAbierto(true)} startIcon={<PaymentIcon />} disabled={saldoPendiente <= 0} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Cuota</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Valor cuota: ${formatMoney(parseMoney(valorCuota))}</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setDialogoInteresAbierto(true)} startIcon={<InterestIcon />} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Interés</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Acumulado: ${formatMoney(parseMoney(interesAcumulado))}</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="error" size="large" onClick={() => setDialogoSaldoTotalAbierto(true)} startIcon={<WalletIcon />} disabled={saldoPendiente <= 0} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Saldo Total</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>${formatMoney(saldoPendiente)}</Typography>
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <DialogoPagoCuotaSinCronograma open={dialogoCuotaAbierto} onClose={() => setDialogoCuotaAbierto(false)} />
      <DialogoPagoInteresSinCronograma open={dialogoInteresAbierto} onClose={() => setDialogoInteresAbierto(false)} />
      <DialogoPagarSaldoTotalSinCronograma open={dialogoSaldoTotalAbierto} onClose={() => setDialogoSaldoTotalAbierto(false)} />
    </>
  );
};

export default BotonesPagoSinCronograma;
