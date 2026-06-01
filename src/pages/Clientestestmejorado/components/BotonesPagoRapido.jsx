import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Paper, Typography, TextField, Button, Grid, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert,
} from '@mui/material';
import {
  Payment as PaymentIcon, Close as CloseIcon,
  AccountBalanceWallet as WalletIcon, TrendingUp as InterestIcon,
  Person as PersonIcon, CalendarMonth as CalendarIcon,
  Description as DescriptionIcon, AttachMoney as MoneyIcon,
  Percent as PercentIcon, Schedule as ScheduleIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { formatMoney, parseMoney } from '../utils/loanCalculations';

// Redux actions
import {
  actionPagarCuota,
  actionPagarInteres,
  actionPagarSaldoTotal,
  actionRevertirPagoSaldoTotal,
  actionCambiarFechaCuota,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';


// ============================================================================
// ESTILOS COMPARTIDOS
// ============================================================================

const sxInput = (color = 'primary.main') => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#fff',
    '&.Mui-focused fieldset': { borderColor: color, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color },
});

const SectionLabel = ({ children }) => (
  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.8 }}>
    {children}
  </Typography>
);

const StatCard = ({ label, value, bgColor, borderColor, textColor }) => (
  <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', backgroundColor: bgColor, borderRadius: 2, border: `1px solid ${borderColor}` }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5, display: 'block', mb: 0.3 }}>{label}</Typography>
    <Typography variant="h6" sx={{ fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{value}</Typography>
  </Paper>
);

const DialogHeader = ({ icon, iconBg, title, subtitle, borderColor, bgColor, onClose }) => (
  <DialogTitle sx={{ backgroundColor: bgColor, borderBottom: `2px solid ${borderColor}`, py: 2 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{ backgroundColor: iconBg, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} size="small" sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}><CloseIcon /></IconButton>
    </Box>
  </DialogTitle>
);


// ============================================================================
// BANNER: INFORMACION DEL CLIENTE (reutilizable en todos los modales)
// ============================================================================

const BannerInfoCliente = () => {
  const { nombre, numeroTarjeta, porcentajeInteres, montoPrestamo } = useSelector(state => state.prestamosTestStore);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
      <PersonIcon sx={{ color: 'primary.main', fontSize: 30 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, flex: 1 }}>
        <Chip label={nombre || 'Sin nombre'} size="small" sx={{ fontWeight: 'bold', fontSize: '12px' }} />
        <Chip label={`# ${numeroTarjeta}`} size="small" variant="outlined" />
        <Chip label={`${porcentajeInteres}% interés`} size="small" variant="outlined" color="info" />
        <Chip label={`Capital: $${formatMoney(parseMoney(montoPrestamo))}`} size="small" variant="outlined" color="primary" />
      </Box>
    </Box>
  );
};


// ============================================================================
// DIALOGO: PAGO DE CUOTA PERSONALIZADO
// ============================================================================

const DialogoPagoCuotaPersonalizado = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { cuotas } = useSelector(state => state.prestamosTestStore);
  const [montoPago, setMontoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [fechaProximoPago, setFechaProximoPago] = useState('');
  const [fechaPagoReal, setFechaPagoReal] = useState(dayjs().format('YYYY-MM-DD'));
  const [descripcion, setDescripcion] = useState('');
  const [distribucion, setDistribucion] = useState([]);

  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const saldoTotalPendiente = cuotasPendientes.reduce((sum, c) => sum + parseMoney(c.saldo || c.valor), 0);

  // Cuota en la que sigue debiendo (la pendiente mas antigua). Su fecha_pago
  // es el vencimiento esperado que se usa para calcular la mora.
  const proximaCuotaPendiente = cuotasPendientes[0];
  const fechaVencimientoDefault = proximaCuotaPendiente?.fecha_pago || '';

  useEffect(() => {
    if (open) {
      setMontoPago('');
      setDistribucion([]);
      setFechaPago(dayjs().format('YYYY-MM-DD'));
      // Por defecto: proximo pago = vencimiento de la cuota en mora; pago real = hoy.
      setFechaProximoPago(fechaVencimientoDefault);
      setFechaPagoReal(dayjs().format('YYYY-MM-DD'));
      setDescripcion('');
    }
  }, [open, fechaVencimientoDefault]);

  // Mora de ESTE pago: dias entre el vencimiento esperado y la fecha real de pago.
  const diasMora = (fechaProximoPago && fechaPagoReal)
    ? Math.max(0, dayjs(fechaPagoReal).diff(dayjs(fechaProximoPago), 'day'))
    : 0;
  // Mora acumulada a hoy en esa cuota (cuantos dias lleva de mora si aun no se paga).
  const diasMoraAcumulada = fechaProximoPago
    ? Math.max(0, dayjs().diff(dayjs(fechaProximoPago), 'day'))
    : 0;

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
    dispatch(actionPagarCuota(monto, fechaPago, descripcion, fechaProximoPago, fechaPagoReal));
    onClose();
  };

  const totalAbonar = distribucion.reduce((sum, d) => sum + d.abonar, 0);
  const montoIngresado = parseMoney(montoPago);
  const sobrante = montoIngresado > 0 ? montoIngresado - totalAbonar : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogHeader
        icon={<PaymentIcon sx={{ color: 'white', fontSize: 22 }} />}
        iconBg="success.main" bgColor="#e8f5e9" borderColor="#4caf50"
        title="Pagar Cuota Personalizado"
        subtitle="Distribuye el pago entre cuotas pendientes"
        onClose={onClose}
      />

      <DialogContent dividers sx={{ p: 3 }}>
        <BannerInfoCliente />

        {/* Resumen */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Cuotas Pendientes" value={cuotasPendientes.length} bgColor="#fff3e0" borderColor="#ffe0b2" textColor="#e65100" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Saldo Pendiente" value={`$${formatMoney(saldoTotalPendiente)}`} bgColor="#fce4ec" borderColor="#f8bbd0" textColor="#c62828" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Monto a Pagar" value={`$${montoPago || '0'}`} bgColor="#e8f5e9" borderColor="#c8e6c9" textColor="#2e7d32" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Cuotas a Cubrir" value={distribucion.length} bgColor="#e3f2fd" borderColor="#bbdefb" textColor="#1565c0" />
          </Grid>
        </Grid>

        {/* Formulario */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <SectionLabel>Datos del Pago</SectionLabel>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Monto a Pagar" value={montoPago} onChange={handleMontoChange}
                placeholder="Ej: 500.000"
                InputProps={{ startAdornment: <InputAdornment position="start"><MoneyIcon sx={{ color: 'success.main' }} /></InputAdornment> }}
                sx={sxInput('success.main')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Fecha de Pago" value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Fecha Próximo Pago" value={fechaProximoPago}
                onChange={(e) => setFechaProximoPago(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Fecha Pago Real" value={fechaPagoReal}
                onChange={(e) => setFechaPagoReal(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>

            {/* Indicador de mora calculado entre Fecha Próximo Pago y Fecha Pago Real */}
            <Grid item xs={12}>
              <Alert
                severity={diasMora > 0 ? 'error' : 'success'}
                icon={<ScheduleIcon />}
                sx={{ borderRadius: 2, alignItems: 'center' }}
              >
                {diasMora > 0 ? (
                  <>
                    <strong>{diasMora} día{diasMora === 1 ? '' : 's'} de mora</strong> en este pago
                    {' '}(venció el {dayjs(fechaProximoPago).format('DD/MM/YYYY')}, pagó el {dayjs(fechaPagoReal).format('DD/MM/YYYY')}).
                  </>
                ) : (
                  <>Pago <strong>al día</strong> (sin mora respecto al vencimiento {fechaProximoPago ? `del ${dayjs(fechaProximoPago).format('DD/MM/YYYY')}` : ''}).</>
                )}
                {diasMoraAcumulada > 0 && (
                  <Box component="span" sx={{ display: 'block', fontSize: '0.8rem', mt: 0.5, opacity: 0.9 }}>
                    Esta cuota lleva <strong>{diasMoraAcumulada} día{diasMoraAcumulada === 1 ? '' : 's'}</strong> de mora a hoy.
                  </Box>
                )}
              </Alert>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth multiline rows={3} label="Descripción (opcional)" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Pago parcial, abono anticipado, etc."
                sx={sxInput()}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de distribución */}
        {distribucion.length > 0 && (
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #c8e6c9' }}>
            <Box sx={{ px: 2.5, py: 1.5, backgroundColor: '#e8f5e9', borderBottom: '1px solid #c8e6c9' }}>
              <SectionLabel>Distribución del Pago</SectionLabel>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#43a047' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>Cuota</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>Saldo Antes</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>Abonar</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>Saldo Después</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {distribucion.map((dist, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f1f8e9' }, '&:hover': { backgroundColor: '#dcedc8' } }}>
                      <TableCell><Chip label={`#${dist.numero}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} /></TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>${formatMoney(dist.saldoAntes)}</TableCell>
                      <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 700, fontFamily: 'monospace' }}>${formatMoney(dist.abonar)}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>${formatMoney(dist.saldoDespues)}</TableCell>
                      <TableCell align="center"><Chip label={dist.estado === 'pagado' ? 'Pagado' : 'Parcial'} color={dist.estado === 'pagado' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 600, minWidth: 70 }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ px: 2.5, py: 1.5, backgroundColor: '#e8f5e9', borderTop: '1px solid #c8e6c9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Total Abonado</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>${formatMoney(totalAbonar)}</Typography>
            </Box>
            {sobrante > 0 && (
              <Alert severity="warning" sx={{ borderRadius: 0 }}>
                <strong>Sobrante: ${formatMoney(sobrante)}</strong> — El monto ingresado supera el saldo pendiente.
              </Alert>
            )}
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#fafafa', borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="success" disabled={!montoPago || parseMoney(montoPago) <= 0 || distribucion.length === 0} startIcon={<PaymentIcon />} sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
          Confirmar Pago {totalAbonar > 0 ? `$${formatMoney(totalAbonar)}` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: PAGO DE INTERES PERSONALIZADO
// ============================================================================

const DialogoPagoInteresPersonalizado = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { porcentajeInteres, montoPrestamo } = useSelector(state => state.prestamosTestStore);
  const [montoPago, setMontoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [fechaProximoPago, setFechaProximoPago] = useState('');
  const [fechaPagoReal, setFechaPagoReal] = useState(dayjs().format('YYYY-MM-DD'));
  const [descripcion, setDescripcion] = useState('');

  const capital = parseMoney(montoPrestamo);
  const interesMensualRef = capital * (parseFloat(porcentajeInteres) || 0) / 100;

  useEffect(() => { if (open) { setMontoPago(''); setFechaPago(dayjs().format('YYYY-MM-DD')); setFechaProximoPago(''); setFechaPagoReal(dayjs().format('YYYY-MM-DD')); setDescripcion(''); } }, [open]);

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    if (!monto || monto <= 0) { alert('El monto debe ser mayor a 0'); return; }
    dispatch(actionPagarInteres(monto, fechaPago, descripcion));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogHeader
        icon={<InterestIcon sx={{ color: 'white', fontSize: 22 }} />}
        iconBg="warning.main" bgColor="#fff8e1" borderColor="#ffa000"
        title="Pagar Interés Personalizado"
        subtitle="Se suma directamente a las utilidades"
        onClose={onClose}
      />

      <DialogContent dividers sx={{ p: 3 }}>
        <BannerInfoCliente />

        {/* Referencia */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <StatCard label="Tasa de Interés" value={`${porcentajeInteres}%`} bgColor="#fff8e1" borderColor="#ffe082" textColor="#e65100" />
          </Grid>
          <Grid item xs={6}>
            <StatCard label="Interés Mensual Ref." value={`$${formatMoney(interesMensualRef)}`} bgColor="#fff3e0" borderColor="#ffcc80" textColor="#bf360c" />
          </Grid>
        </Grid>

        <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
          Este pago <strong>no afecta</strong> el saldo de las cuotas. Se registra como ingreso adicional de interés y se refleja en las 3 utilidades.
        </Alert>

        {/* Formulario */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <SectionLabel>Datos del Pago</SectionLabel>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Monto del Interés" value={montoPago}
                onChange={(e) => setMontoPago(formatMoney(e.target.value.replace(/\D/g, '')))}
                placeholder="Ej: 100.000"
                InputProps={{ startAdornment: <InputAdornment position="start"><MoneyIcon sx={{ color: 'warning.main' }} /></InputAdornment> }}
                sx={sxInput('warning.main')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Fecha de Pago" value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Fecha Próximo Pago" value={fechaProximoPago}
                onChange={(e) => setFechaProximoPago(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Fecha Pago Real" value={fechaPagoReal}
                onChange={(e) => setFechaPagoReal(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth multiline rows={3} label="Descripción (opcional)" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Interés por mora, interés adicional, etc."
                sx={sxInput()}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Preview */}
        {parseMoney(montoPago) > 0 && (
          <Paper elevation={0} sx={{ mt: 3, p: 2, textAlign: 'center', backgroundColor: '#fff8e1', borderRadius: 2, border: '2px solid #ffa000' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Interés a Registrar</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#e65100' }}>${montoPago}</Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#fafafa', borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="warning" disabled={!montoPago || parseMoney(montoPago) <= 0} startIcon={<InterestIcon />} sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
          Registrar Interés {parseMoney(montoPago) > 0 ? `$${montoPago}` : ''}
        </Button>
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
  const [fechaProximoPago, setFechaProximoPago] = useState('');
  const [fechaPagoReal, setFechaPagoReal] = useState(dayjs().format('YYYY-MM-DD'));
  const [porcentajeInteres, setPorcentajeInteres] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const dineroPrestado = parseMoney(montoPrestamo);
  const abonoTotal = cuotas.reduce((sum, c) => sum + parseMoney(c.abonado || 0), 0);
  const interes = parseFloat(porcentajeInteres) || 0;
  const meses = parseInt(tiempo) || 0;
  const totalBruto = tiempo !== '' && meses > 0 ? dineroPrestado + (dineroPrestado * (interes / 100) * meses) : 0;
  const totalAPagar = Math.max(0, totalBruto - abonoTotal);

  useEffect(() => { if (open) { setFechaPago(dayjs().format('YYYY-MM-DD')); setFechaProximoPago(''); setFechaPagoReal(dayjs().format('YYYY-MM-DD')); setPorcentajeInteres(''); setTiempo(''); setDescripcion(''); } }, [open]);

  const handleConfirmar = async () => {
    if (totalAPagar <= 0) { alert('Ingrese el interés y el tiempo para calcular el total a pagar'); return; }

    const primera = await Swal.fire({
      title: '¿Pagar saldo total?',
      html:
        `<div style="text-align:left; font-size:14px;">` +
        `<p><strong>Capital prestado:</strong> $${formatMoney(dineroPrestado)}</p>` +
        `<p><strong>Interés:</strong> ${interes}% por ${meses} mes(es)</p>` +
        `<p><strong>Abono previo:</strong> $${formatMoney(abonoTotal)}</p>` +
        `<hr/>` +
        `<p style="font-size:18px; color:#d32f2f;"><strong>Total a pagar: $${formatMoney(totalAPagar)}</strong></p>` +
        `</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });

    if (!primera.isConfirmed) return;

    const segunda = await Swal.fire({
      title: 'Acción irreversible',
      html:
        `<p style="font-size:15px;">Esta operación <strong>marcará el préstamo como PAGADO</strong> y <strong>no se podrá modificar</strong> después.</p>` +
        `<p style="font-size:14px; color:#d32f2f; margin-top:10px;"><strong>¿Está completamente seguro de proceder?</strong></p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Confirmar pago total',
      cancelButtonText: 'No, volver atrás',
    });

    if (!segunda.isConfirmed) return;

    dispatch(actionPagarSaldoTotal(interes, meses, fechaPago, descripcion));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogHeader
        icon={<WalletIcon sx={{ color: 'white', fontSize: 22 }} />}
        iconBg="error.main" bgColor="#ffebee" borderColor="#ef5350"
        title="Pagar Saldo Total"
        subtitle="Liquidación completa del préstamo"
        onClose={onClose}
      />

      <DialogContent dividers sx={{ p: 3 }}>
        <BannerInfoCliente />

        {/* Resumen */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <StatCard label="Capital Prestado" value={`$${formatMoney(dineroPrestado)}`} bgColor="#e3f2fd" borderColor="#bbdefb" textColor="#1565c0" />
          </Grid>
          <Grid item xs={6}>
            <StatCard label="Abono Acumulado" value={`$${formatMoney(abonoTotal)}`} bgColor="#e8f5e9" borderColor="#c8e6c9" textColor="#2e7d32" />
          </Grid>
        </Grid>

        {/* Formulario */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <SectionLabel>Parámetros de Liquidación</SectionLabel>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Interés (%)" type="number" value={porcentajeInteres}
                onChange={(e) => setPorcentajeInteres(e.target.value)}
                placeholder="Ej: 10"
                InputProps={{ startAdornment: <InputAdornment position="start"><PercentIcon sx={{ color: 'error.main' }} /></InputAdornment> }}
                sx={sxInput('error.main')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Tiempo (meses)" type="number" value={tiempo}
                onChange={(e) => setTiempo(e.target.value)}
                placeholder="Ej: 6"
                InputProps={{ startAdornment: <InputAdornment position="start"><ScheduleIcon sx={{ color: 'error.main' }} /></InputAdornment> }}
                sx={sxInput('error.main')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth type="date" label="Fecha de Pago" value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth type="date" label="Fecha Próximo Pago" value={fechaProximoPago}
                onChange={(e) => setFechaProximoPago(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth type="date" label="Fecha Pago Real" value={fechaPagoReal}
                onChange={(e) => setFechaPagoReal(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                sx={sxInput()}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={3} label="Descripción (opcional)" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Liquidación anticipada, pago total, etc."
                sx={sxInput()}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Total a pagar */}
        <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', borderRadius: 2, border: `2px solid ${totalBruto > 0 ? '#ef5350' : '#e0e0e0'}`, backgroundColor: totalBruto > 0 ? '#ffebee' : '#fafafa' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>Total a Pagar</Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: totalBruto > 0 ? '#c62828' : 'text.disabled', lineHeight: 1.3 }}>
            ${formatMoney(totalAPagar)}
          </Typography>
          {totalBruto > 0 && abonoTotal > 0 && (
            <Typography variant="caption" color="text.secondary">
              Bruto: ${formatMoney(totalBruto)} - Abono: ${formatMoney(abonoTotal)}
            </Typography>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#fafafa', borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="error" disabled={totalAPagar <= 0} startIcon={<WalletIcon />} sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
          Pagar ${formatMoney(totalAPagar)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: GESTION DE PROXIMO PAGO Y MORA
// ============================================================================

const DialogoGestionProximoPago = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { cuotas } = useSelector(state => state.prestamosTestStore);

  // Cuota en la que sigue debiendo (la pendiente mas antigua).
  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const proximaCuota = cuotasPendientes[0];
  const fechaVencimientoOriginal = proximaCuota ? dayjs(proximaCuota.fecha_pago).format('YYYY-MM-DD') : '';

  const [fechaProximoPago, setFechaProximoPago] = useState('');
  const [fechaPagoReal, setFechaPagoReal] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    if (open) {
      setFechaProximoPago(fechaVencimientoOriginal);
      setFechaPagoReal(dayjs().format('YYYY-MM-DD'));
    }
  }, [open, fechaVencimientoOriginal]);

  // Mora respecto a la fecha real de pago y mora acumulada a hoy.
  const diasMora = (fechaProximoPago && fechaPagoReal)
    ? Math.max(0, dayjs(fechaPagoReal).diff(dayjs(fechaProximoPago), 'day'))
    : 0;
  const diasMoraHoy = fechaProximoPago
    ? Math.max(0, dayjs().diff(dayjs(fechaProximoPago), 'day'))
    : 0;

  const fechaCambiada = !!proximaCuota && !!fechaProximoPago && fechaProximoPago !== fechaVencimientoOriginal;

  const handleGuardar = () => {
    if (proximaCuota && fechaCambiada) {
      dispatch(actionCambiarFechaCuota(proximaCuota.id, fechaProximoPago));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogHeader
        icon={<CalendarIcon sx={{ color: 'white', fontSize: 22 }} />}
        iconBg="info.main" bgColor="#e3f2fd" borderColor="#42a5f5"
        title="Próximo Pago y Mora"
        subtitle="Consulta y ajusta la fecha del próximo pago"
        onClose={onClose}
      />

      <DialogContent dividers sx={{ p: 3 }}>
        <BannerInfoCliente />

        {!proximaCuota ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            No hay cuotas pendientes. El préstamo está al día.
          </Alert>
        ) : (
          <>
            {/* Resumen de la proxima cuota pendiente */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={4}>
                <StatCard label="Próxima Cuota" value={`#${proximaCuota.numero}`} bgColor="#e3f2fd" borderColor="#bbdefb" textColor="#1565c0" />
              </Grid>
              <Grid item xs={6} sm={4}>
                <StatCard label="Saldo Cuota" value={`$${formatMoney(proximaCuota.saldo || proximaCuota.valor)}`} bgColor="#fce4ec" borderColor="#f8bbd0" textColor="#c62828" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard label="Vencimiento Original" value={dayjs(fechaVencimientoOriginal).format('DD/MM/YYYY')} bgColor="#fff3e0" borderColor="#ffe0b2" textColor="#e65100" />
              </Grid>
            </Grid>

            {/* Fechas editables */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
              <SectionLabel>Fechas</SectionLabel>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth type="date" label="Fecha Próximo Pago" value={fechaProximoPago}
                    onChange={(e) => setFechaProximoPago(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                    helperText="Editable: cambia el vencimiento de esta cuota"
                    sx={sxInput('info.main')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth type="date" label="Fecha Pago Real" value={fechaPagoReal}
                    onChange={(e) => setFechaPagoReal(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
                    helperText="Para calcular los días de mora"
                    sx={sxInput()}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Indicador de mora */}
            <Alert
              severity={diasMora > 0 ? 'error' : 'success'}
              icon={<ScheduleIcon />}
              sx={{ borderRadius: 2, alignItems: 'center' }}
            >
              {diasMora > 0 ? (
                <>
                  <strong>{diasMora} día{diasMora === 1 ? '' : 's'} de mora</strong>
                  {' '}(venció el {dayjs(fechaProximoPago).format('DD/MM/YYYY')}, pago real el {dayjs(fechaPagoReal).format('DD/MM/YYYY')}).
                </>
              ) : (
                <>Sin mora respecto a la fecha de pago real.</>
              )}
              {diasMoraHoy > 0 && (
                <Box component="span" sx={{ display: 'block', fontSize: '0.8rem', mt: 0.5, opacity: 0.9 }}>
                  Esta cuota lleva <strong>{diasMoraHoy} día{diasMoraHoy === 1 ? '' : 's'}</strong> de mora a hoy.
                </Box>
              )}
            </Alert>

            {fechaCambiada && (
              <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                Vas a cambiar el vencimiento de la cuota #{proximaCuota.numero} del
                {' '}<strong>{dayjs(fechaVencimientoOriginal).format('DD/MM/YYYY')}</strong> al
                {' '}<strong>{dayjs(fechaProximoPago).format('DD/MM/YYYY')}</strong>.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#fafafa', borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>Cerrar</Button>
        <Button onClick={handleGuardar} variant="contained" color="info" disabled={!fechaCambiada} startIcon={<CalendarIcon />} sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
          Guardar Fecha
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// COMPONENTE PRINCIPAL: BOTONES DE PAGO RAPIDO
// ============================================================================

const BotonesPagoRapido = () => {
  const dispatch = useDispatch();
  const { cuotas, valorCuota, pagos } = useSelector(state => state.prestamosTestStore);
  const [dialogoCuotaAbierto, setDialogoCuotaAbierto] = useState(false);
  const [dialogoInteresAbierto, setDialogoInteresAbierto] = useState(false);
  const [dialogoSaldoTotalAbierto, setDialogoSaldoTotalAbierto] = useState(false);
  const [dialogoProximoPagoAbierto, setDialogoProximoPagoAbierto] = useState(false);

  const cuotasPendientes = cuotas.filter(c => c.estado_pago !== 'pagado');
  const saldoTotalPendiente = cuotasPendientes.reduce((sum, c) => sum + parseMoney(c.saldo !== undefined ? c.saldo : c.valor), 0);

  // Fecha del proximo pago = vencimiento de la cuota pendiente mas antigua (informativa).
  const proximaCuota = cuotasPendientes[0];
  const fechaProximoPago = proximaCuota ? dayjs(proximaCuota.fecha_pago).format('DD/MM/YYYY') : null;

  // Pago de saldo total mas reciente con snapshot (revertible)
  const pagoSaldoTotalRevertible = (pagos || [])
    .filter(p => p.tipo_pago === 'saldo_total' && p.tiene_snapshot)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  const handleRevertirSaldoTotal = async () => {
    if (!pagoSaldoTotalRevertible) return;

    const primera = await Swal.fire({
      title: '¿Revertir pago de saldo total?',
      html:
        `<div style="text-align:left; font-size:14px;">` +
        `<p>Se restaurará el estado del préstamo y de <strong>todas las cuotas</strong> tal como estaban antes del pago.</p>` +
        `<p><strong>Monto del pago:</strong> $${formatMoney(parseMoney(pagoSaldoTotalRevertible.monto))}</p>` +
        `<p><strong>Fecha:</strong> ${pagoSaldoTotalRevertible.fecha}</p>` +
        `</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Sí, revertir',
      cancelButtonText: 'Cancelar',
    });
    if (!primera.isConfirmed) return;

    const segunda = await Swal.fire({
      title: 'Confirmar reversión',
      html:
        `<p style="font-size:15px;">El préstamo volverá a estado <strong>vigente</strong> y las cuotas recuperarán sus valores y abonos originales.</p>` +
        `<p style="font-size:14px; color:#d32f2f; margin-top:10px;"><strong>¿Continuar?</strong></p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Confirmar reversión',
      cancelButtonText: 'No, volver atrás',
    });
    if (!segunda.isConfirmed) return;

    dispatch(actionRevertirPagoSaldoTotal(pagoSaldoTotalRevertible.id));
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 1 }}>Opciones de Pago Rápido</Typography>

        {/* Fecha del proximo pago (informativa) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ScheduleIcon fontSize="small" sx={{ color: 'info.main' }} />
          <Typography variant="body2" color="text.secondary">
            Próximo pago:{' '}
            <strong style={{ color: fechaProximoPago ? '#0288d1' : '#2e7d32' }}>
              {fechaProximoPago || 'Préstamo al día'}
            </strong>
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="success" size="large" onClick={() => setDialogoCuotaAbierto(true)} startIcon={<PaymentIcon />} disabled={cuotasPendientes.length === 0} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Cuota</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Valor cuota: ${formatMoney(parseMoney(valorCuota))}</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setDialogoInteresAbierto(true)} startIcon={<InterestIcon />} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Interés</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Suma a utilidades</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="error" size="large" onClick={() => setDialogoSaldoTotalAbierto(true)} startIcon={<WalletIcon />} disabled={saldoTotalPendiente <= 0} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Pagar Saldo Total</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>${formatMoney(saldoTotalPendiente)}</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="info" size="large" onClick={() => setDialogoProximoPagoAbierto(true)} startIcon={<ScheduleIcon />} disabled={cuotasPendientes.length === 0} sx={{ py: 2, flexDirection: 'column', '& .MuiButton-startIcon': { mb: 1, mr: 0 } }}>
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>Próximo Pago / Mora</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Ver y ajustar fechas</Typography>
            </Button>
          </Grid>
        </Grid>

        {pagoSaldoTotalRevertible && (
          <Alert
            severity="info"
            sx={{ mt: 2, alignItems: 'center' }}
            action={
              <Button
                color="error"
                variant="outlined"
                size="small"
                startIcon={<UndoIcon />}
                onClick={handleRevertirSaldoTotal}
              >
                Revertir
              </Button>
            }
          >
            Pago de saldo total registrado el {pagoSaldoTotalRevertible.fecha} por
            {' '}<strong>${formatMoney(parseMoney(pagoSaldoTotalRevertible.monto))}</strong>.
            Si fue un error, puede revertirlo y restaurar el estado anterior del préstamo.
          </Alert>
        )}
      </Paper>

      <DialogoPagoCuotaPersonalizado open={dialogoCuotaAbierto} onClose={() => setDialogoCuotaAbierto(false)} />
      <DialogoPagoInteresPersonalizado open={dialogoInteresAbierto} onClose={() => setDialogoInteresAbierto(false)} />
      <DialogoPagarSaldoTotal open={dialogoSaldoTotalAbierto} onClose={() => setDialogoSaldoTotalAbierto(false)} />
      <DialogoGestionProximoPago open={dialogoProximoPagoAbierto} onClose={() => setDialogoProximoPagoAbierto(false)} />
    </>
  );
};

export default BotonesPagoRapido;
