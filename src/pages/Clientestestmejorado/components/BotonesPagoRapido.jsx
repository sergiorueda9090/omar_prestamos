import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Paper, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Divider,
} from '@mui/material';
import {
  Payment as PaymentIcon, Close as CloseIcon,
  AccountBalanceWallet as WalletIcon, TrendingUp as InterestIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney } from '../utils/loanCalculations';

// Redux actions
import {
  actionPagarCuota,
  actionPagarInteres,
  actionPagarSaldoTotal,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';


// ============================================================================
// DIALOGO: PAGO DE CUOTA PERSONALIZADO
// ============================================================================

const DialogoPagoCuotaPersonalizado = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { cuotas } = useSelector(state => state.prestamosTestStore);
  const [montoPago, setMontoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [distribucion, setDistribucion] = useState([]);

  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const saldoTotalPendiente = cuotasPendientes.reduce((sum, c) => sum + parseMoney(c.saldo || c.valor), 0);

  useEffect(() => {
    if (open) { setMontoPago(''); setDistribucion([]); setFechaPago(dayjs().format('YYYY-MM-DD')); }
  }, [open]);

  const calcularDistribucion = (monto) => {
    const montoNum = typeof monto === 'number' ? monto : parseMoney(monto);
    if (!montoNum || montoNum <= 0) { setDistribucion([]); return; }
    let montoRestante = montoNum;
    const nuevaDist = [];
    for (let i = 0; i < cuotas.length && montoRestante > 0; i++) {
      const cuota = cuotas[i];
      const saldoCuota = parseMoney(cuota.saldo !== undefined ? cuota.saldo : cuota.valor);
      if (saldoCuota <= 0 || cuota.estado_pago === 'pagado') continue;
      if (montoRestante >= saldoCuota) {
        nuevaDist.push({ numero: cuota.numero, abonar: saldoCuota, saldoAntes: saldoCuota, saldoDespues: 0, estado: 'pagado' });
        montoRestante -= saldoCuota;
      } else {
        nuevaDist.push({ numero: cuota.numero, abonar: montoRestante, saldoAntes: saldoCuota, saldoDespues: saldoCuota - montoRestante, estado: 'parcial' });
        montoRestante = 0;
      }
    }
    setDistribucion(nuevaDist);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPago(formatMoney(value));
    calcularDistribucion(value);
  };

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    if (!monto || monto <= 0) { alert('El monto debe ser mayor a 0'); return; }
    dispatch(actionPagarCuota(monto, fechaPago));
    onClose();
  };

  const totalAbonar = distribucion.reduce((sum, d) => sum + d.abonar, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center"><PaymentIcon sx={{ mr: 1, color: 'success.main' }} /><Typography variant="h6">Pagar Cuota Personalizado</Typography></Box>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}><strong>Pago flexible:</strong> El sistema distribuirá automáticamente el pago entre las cuotas pendientes en orden.</Alert>
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Cuotas Pendientes</Typography><Typography variant="h6">{cuotasPendientes.length}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Saldo Total Pendiente</Typography><Typography variant="h6" color="error.main">${formatMoney(saldoTotalPendiente)}</Typography></Grid>
            </Grid>
          </CardContent>
        </Card>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Monto a Pagar" value={montoPago} onChange={handleMontoChange} placeholder="Ingrese el monto" InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Fecha de Pago" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
        </Grid>
        {distribucion.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Card variant="outlined" sx={{ backgroundColor: 'success.50' }}>
              <CardContent>
                <Typography variant="subtitle1" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>Distribución del Pago</Typography>
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
                        <TableRow key={idx}>
                          <TableCell><strong>#{dist.numero}</strong></TableCell>
                          <TableCell align="right">${formatMoney(dist.saldoAntes)}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>${formatMoney(dist.abonar)}</TableCell>
                          <TableCell align="right">${formatMoney(dist.saldoDespues)}</TableCell>
                          <TableCell align="center"><Chip label={dist.estado === 'pagado' ? 'Pagado' : 'Parcial'} color={dist.estado === 'pagado' ? 'success' : 'warning'} size="small" /></TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: 'grey.200' }}>
                        <TableCell colSpan={2}><strong>TOTAL</strong></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '16px' }}>${formatMoney(totalAbonar)}</TableCell>
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
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="success" disabled={!montoPago || parseMoney(montoPago) <= 0 || distribucion.length === 0} startIcon={<PaymentIcon />}>Confirmar Pago</Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: PAGO DE INTERES PERSONALIZADO
// ============================================================================

const DialogoPagoInteresPersonalizado = ({ open, onClose }) => {
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
        <Alert severity="warning" sx={{ mb: 3 }}><strong>Pago de interés:</strong> Se suma directamente a las 3 utilidades. No afecta el saldo de las cuotas.</Alert>
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
// DIALOGO: PAGAR SALDO TOTAL
// ============================================================================

const DialogoPagarSaldoTotal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { montoPrestamo, cuotas } = useSelector(state => state.prestamosTestStore);
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [porcentajeInteres, setPorcentajeInteres] = useState('');
  const [tiempo, setTiempo] = useState('');

  const dineroPrestado = parseMoney(montoPrestamo);
  const abonoTotal = cuotas.reduce((sum, c) => sum + parseMoney(c.abonado || 0), 0);
  const interes = parseFloat(porcentajeInteres) || 0;
  const meses = parseInt(tiempo) || 0;
  const totalBruto = tiempo !== '' && meses > 0 ? dineroPrestado + (dineroPrestado * (interes / 100) * meses) : 0;
  const totalAPagar = Math.max(0, totalBruto - abonoTotal);

  useEffect(() => { if (open) { setFechaPago(dayjs().format('YYYY-MM-DD')); setPorcentajeInteres(''); setTiempo(''); } }, [open]);

  const handleConfirmar = () => {
    if (totalAPagar <= 0) { alert('Ingrese el interés y el tiempo para calcular el total a pagar'); return; }
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
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total a Pagar</Typography>
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
// COMPONENTE PRINCIPAL: BOTONES DE PAGO RAPIDO
// ============================================================================

const BotonesPagoRapido = () => {
  const { cuotas, valorCuota } = useSelector(state => state.prestamosTestStore);
  const [dialogoCuotaAbierto, setDialogoCuotaAbierto] = useState(false);
  const [dialogoInteresAbierto, setDialogoInteresAbierto] = useState(false);
  const [dialogoSaldoTotalAbierto, setDialogoSaldoTotalAbierto] = useState(false);

  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const saldoTotalPendiente = cuotasPendientes.reduce((sum, c) => sum + parseMoney(c.saldo !== undefined ? c.saldo : c.valor), 0);

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>Opciones de Pago Rápido</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="success" size="large" onClick={() => setDialogoCuotaAbierto(true)} startIcon={<PaymentIcon />} disabled={cuotasPendientes.length === 0} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Cuota</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Valor cuota: ${formatMoney(parseMoney(valorCuota))}</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setDialogoInteresAbierto(true)} startIcon={<InterestIcon />} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Interés</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Suma a utilidades</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="error" size="large" onClick={() => setDialogoSaldoTotalAbierto(true)} startIcon={<WalletIcon />} disabled={saldoTotalPendiente <= 0} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Saldo Total</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>${formatMoney(saldoTotalPendiente)}</Typography>
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <DialogoPagoCuotaPersonalizado open={dialogoCuotaAbierto} onClose={() => setDialogoCuotaAbierto(false)} />
      <DialogoPagoInteresPersonalizado open={dialogoInteresAbierto} onClose={() => setDialogoInteresAbierto(false)} />
      <DialogoPagarSaldoTotal open={dialogoSaldoTotalAbierto} onClose={() => setDialogoSaldoTotalAbierto(false)} />
    </>
  );
};

export default BotonesPagoRapido;
