import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Paper, Typography, TextField, Button, Grid, Divider, Alert,
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, List, ListItem,
  ListItemText, Avatar, Collapse,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon,
  Warning as WarningIcon, Add as AddIcon, Calculate as CalculateIcon,
  AccountBalance as LiquidateIcon, Close as CloseIcon,
  AttachMoney as MoneyIcon, Payment as PaymentIcon, Edit as EditIcon,
  CalendarToday as CalendarIcon, SwapHoriz as SwapIcon, Info as InfoIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney, calcularInteresSimple, calcularInteresCuota, calcularFechasCobro, calcularUtilidad1, calcularUtilidad2, calcularUtilidad3 } from '../utils/loanCalculations';
import TarjetaInformacionPrestamo from './TarjetaInformacionPrestamo';
import BotonesPagoRapido from './BotonesPagoRapido';
import BotonesPagoSinCronograma from './BotonesPagoSinCronograma';

// Redux actions
import {
  actionCambiarFechaCuota,
  actionEliminarPagoCuota,
  actionEliminarPagoInteres,
  actionAmpliarPrestamo,
  actionCambiarPlazo,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';


// ============================================================================
// DIALOGO: EDITAR FECHA
// ============================================================================

export const DialogoEditarFecha = ({ open, onClose, cuota }) => {
  const dispatch = useDispatch();
  const [nuevaFecha, setNuevaFecha] = useState('');

  useEffect(() => {
    if (open && cuota) setNuevaFecha(cuota.fecha_pago);
  }, [open, cuota]);

  if (!cuota) return null;

  const handleConfirmar = () => {
    if (!nuevaFecha) { alert('Debe seleccionar una fecha'); return; }
    dispatch(actionCambiarFechaCuota(cuota.id, nuevaFecha));
    setNuevaFecha('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Editar Fecha - Cuota #{cuota.numero}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <TextField fullWidth type="date" label="Nueva Fecha de Pago" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} InputLabelProps={{ shrink: true }} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="primary">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: CONFIRMAR ELIMINAR PAGO
// ============================================================================

export const DialogoConfirmarEliminarPago = ({ open, onClose, cuota }) => {
  const dispatch = useDispatch();
  if (!cuota) return null;

  const handleConfirmar = () => {
    dispatch(actionEliminarPagoCuota(cuota.id));
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
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>¡Atención!</strong> Esta acción revertirá todos los pagos realizados en esta cuota.
        </Alert>
        <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2"><strong>Cuota:</strong> #{cuota.numero}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Abonado:</strong> ${formatMoney(cuota.abonado || 0)}</Typography></Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="error">Confirmar Eliminación</Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: CALCULAR PAGO SALDO
// ============================================================================

export const DialogoCalcularPagoSaldo = () => {
  const { prestamoGenerado } = useSelector(state => state.prestamosTestStore);
  const [open, setOpen] = useState(false);
  const [dineroPrestado, setDineroPrestado] = useState('');
  const [abonoCliente, setAbonoCliente] = useState('');
  const [porcentajeInteres, setPorcentajeInteres] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [saldoCalculado, setSaldoCalculado] = useState(null);

  const calcularSaldo = () => {
    const prestado = parseMoney(dineroPrestado);
    const abono = parseMoney(abonoCliente);
    const interes = parseFloat(porcentajeInteres);
    const plazo = parseInt(tiempo);
    if (!prestado || prestado <= 0) { alert('El dinero prestado debe ser mayor a 0'); return; }
    const { saldoTotal, totalInteres } = calcularInteresSimple(prestado, interes || 0, plazo || 1, plazo || 1);
    const saldoFinal = saldoTotal - (abono || 0);
    setSaldoCalculado({ dineroPrestado: prestado, abonoCliente: abono || 0, porcentaje: interes || 0, plazo: plazo || 1, totalAPagar: saldoTotal, saldoFinal: Math.max(0, saldoFinal), interesTotal: totalInteres });
  };

  const handleCerrar = () => {
    setDineroPrestado(''); setAbonoCliente(''); setPorcentajeInteres(''); setTiempo(''); setSaldoCalculado(null); setOpen(false);
  };

  if (!prestamoGenerado) return null;
  return null; // This dialog is available but not actively used in the Redux version — kept for compatibility
};


// ============================================================================
// GESTOR DE CUOTAS (CRONOGRAMA)
// ============================================================================

export const LoanInstallmentsManager = ({ cuotas, pagosIntereses = [] }) => {
  const dispatch = useDispatch();
  const pagos = useSelector(state => state.prestamosTestStore.pagos) || [];
  const [dialogoFechaAbierto, setDialogoFechaAbierto] = useState(false);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);

  // Si existe un pago de saldo total activo (con snapshot), las cuotas fueron
  // marcadas como pagadas en bloque. No se deben poder eliminar pagos
  // individuales hasta que se revierta el saldo total.
  const hayPagoSaldoTotalActivo = pagos.some(
    (p) => p.tipo_pago === 'saldo_total' && p.tiene_snapshot,
  );

  // Pagos de cuota ordenados por fecha real (historial de mora).
  const pagosCuota = pagos
    .filter((p) => p.tipo_pago === 'cuota')
    .slice()
    .sort((a, b) => new Date(a.fecha_pago_real || a.fecha) - new Date(b.fecha_pago_real || b.fecha));

  const getEstadoChip = (estado) => {
    const configs = {
      pagado: { label: 'Pagado', color: 'success', icon: <CheckCircleIcon /> },
      parcial: { label: 'Parcial', color: 'warning', icon: <WarningIcon /> },
      pendiente: { label: 'Pendiente', color: 'default', icon: <ScheduleIcon /> },
    };
    const config = configs[estado] || configs.pendiente;
    return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
  };

  const getRowBackground = (estado) => {
    switch (estado) {
      case 'pagado': return 'rgba(76, 175, 80, 0.1)';
      case 'parcial': return 'rgba(255, 152, 0, 0.1)';
      default: return '#fff';
    }
  };

  // Mora historica registrada por vencimiento: cada pago guarda el vencimiento
  // de la cuota en la que se debia (fecha_proximo_pago) y sus dias de mora.
  const moraRegistradaPorVencimiento = {};
  pagosCuota.forEach((p) => {
    if (p.fecha_proximo_pago) {
      const k = dayjs(p.fecha_proximo_pago).format('YYYY-MM-DD');
      moraRegistradaPorVencimiento[k] = Math.max(moraRegistradaPorVencimiento[k] || 0, p.dias_mora || 0);
    }
  });

  // Dias de mora de una cuota:
  // - Si hay un pago registrado para su vencimiento, usa la mora historica.
  // - Si sigue pendiente/parcial y ya vencio, calcula la mora acumulada a hoy.
  const getMoraCuota = (cuota) => {
    const venc = cuota.fecha_pago ? dayjs(cuota.fecha_pago).format('YYYY-MM-DD') : null;
    if (venc && moraRegistradaPorVencimiento[venc] !== undefined) {
      return { dias: moraRegistradaPorVencimiento[venc], enCurso: false };
    }
    if (venc && cuota.estado_pago !== 'pagado') {
      return { dias: Math.max(0, dayjs().diff(dayjs(venc), 'day')), enCurso: true };
    }
    return { dias: 0, enCurso: false };
  };

  const headers = ['N°', 'Fecha', 'Valor', 'Abonado', 'Saldo', 'Estado', 'Mora', 'Descripción', 'Acciones'];
  // Plantilla compartida por encabezado y filas (la columna Descripción es mas ancha).
  const gridTemplate = '0.6fr 1.1fr 1fr 1fr 1fr 1fr 0.9fr 1.6fr 0.9fr';

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>Cronograma de Cuotas</Typography>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: gridTemplate, backgroundColor: 'primary.main', color: 'white' }}>
          {headers.map((header, idx) => (
            <Box key={idx} sx={{ p: 1.5, textAlign: 'center', borderRight: idx < headers.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>{header}</Typography>
            </Box>
          ))}
        </Box>

        {cuotas.map((cuota, index) => {
          const mora = getMoraCuota(cuota);
          return (
          <Box key={cuota.id || index} sx={{ display: 'grid', gridTemplateColumns: gridTemplate, backgroundColor: getRowBackground(cuota.estado_pago), borderBottom: index < cuotas.length - 1 ? '1px solid #dee2e6' : 'none', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{cuota.numero}</Typography>
            </Box>
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2">{dayjs(cuota.fecha_pago).format('DD/MM/YYYY')}</Typography>
              <Tooltip title="Editar fecha">
                <IconButton size="small" onClick={() => { setCuotaSeleccionada(cuota); setDialogoFechaAbierto(true); }} sx={{ ml: 0.5 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2">${formatMoney(cuota.valor)}</Typography>
            </Box>
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2" sx={{ color: parseFloat(cuota.abonado) > 0 ? 'success.main' : 'inherit', fontWeight: parseFloat(cuota.abonado) > 0 ? 'bold' : 'normal' }}>
                ${formatMoney(cuota.abonado || 0)}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2" sx={{ color: parseFloat(cuota.saldo || cuota.valor) > 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                ${formatMoney(cuota.saldo || cuota.valor)}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              {getEstadoChip(cuota.estado_pago)}
            </Box>
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              {mora.dias > 0 ? (
                <Tooltip title={mora.enCurso ? 'Mora acumulada a hoy (cuota aún sin pagar)' : 'Días de mora registrados al pagar esta cuota'}>
                  <Chip
                    label={`${mora.dias} día${mora.dias === 1 ? '' : 's'}`}
                    color={mora.enCurso ? 'warning' : 'error'}
                    size="small"
                    variant={mora.enCurso ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Tooltip>
              ) : (
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>0</Typography>
              )}
            </Box>
            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              {cuota.descripcion ? (
                <Tooltip title={cuota.descripcion}>
                  <Typography variant="body2" sx={{ fontSize: '12px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left', width: '100%' }}>
                    {cuota.descripcion}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
              )}
            </Box>
            <Box sx={{ p: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {parseFloat(cuota.abonado) > 0 && (
                hayPagoSaldoTotalActivo ? (
                  <Tooltip title="Primero revierta el pago de saldo total para modificar cuotas individuales">
                    <span>
                      <Button size="small" variant="outlined" color="error" disabled sx={{ minWidth: 'auto', px: 1, fontSize: '11px' }}>
                        <CloseIcon fontSize="small" />
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Button size="small" variant="outlined" color="error" onClick={() => { setCuotaSeleccionada(cuota); setDialogoEliminarAbierto(true); }} sx={{ minWidth: 'auto', px: 1, fontSize: '11px' }}>
                    <CloseIcon fontSize="small" />
                  </Button>
                )
              )}
            </Box>
          </Box>
          );
        })}
      </Paper>

      {/* Pagos de Intereses */}
      {pagosIntereses && pagosIntereses.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
            <MoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Pagos de Intereses
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 100px', backgroundColor: 'warning.main', color: 'white' }}>
              {['N°', 'Fecha', 'Tipo', 'Monto', 'Acciones'].map((header, idx) => (
                <Box key={idx} sx={{ p: 1.5, textAlign: 'center', borderRight: idx < 4 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>{header}</Typography>
                </Box>
              ))}
            </Box>
            {pagosIntereses.map((pago, index) => (
              <Box key={pago.id} sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 100px', backgroundColor: 'rgba(255, 152, 0, 0.1)', borderBottom: index < pagosIntereses.length - 1 ? '1px solid #dee2e6' : 'none' }}>
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>INT-{index + 1}</Typography>
                </Box>
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Typography variant="body2">{dayjs(pago.fecha).format('DD/MM/YYYY')}</Typography>
                </Box>
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Chip label={pago.tipo === 'liquidacion' ? 'Liquidación' : 'Interés'} color={pago.tipo === 'liquidacion' ? 'error' : 'warning'} size="small" icon={<MoneyIcon />} />
                </Box>
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 'bold' }}>${formatMoney(pago.monto)}</Typography>
                </Box>
                <Box sx={{ p: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tooltip title="Eliminar pago de interés">
                    <Button size="small" variant="outlined" color="error" onClick={() => dispatch(actionEliminarPagoInteres(pago.id))} sx={{ minWidth: 'auto', px: 1, fontSize: '11px' }}>
                      <CloseIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      )}

      <DialogoEditarFecha open={dialogoFechaAbierto} onClose={() => setDialogoFechaAbierto(false)} cuota={cuotaSeleccionada} />
      <DialogoConfirmarEliminarPago open={dialogoEliminarAbierto} onClose={() => setDialogoEliminarAbierto(false)} cuota={cuotaSeleccionada} />
    </Box>
  );
};


// ============================================================================
// PAGO ANTICIPADO
// ============================================================================

export const PagoAnticipado = ({ montoOriginal, tasaOriginal, numeroCuotasOriginal }) => {
  const [mesesPago, setMesesPago] = useState('3');
  const [calculoPago, setCalculoPago] = useState(null);

  const calcularPagoAnticipado = () => {
    const meses = parseInt(mesesPago);
    if (!meses || meses <= 0) { alert('El número de meses debe ser mayor a 0'); return; }
    const { totalInteres, saldoTotal, valorCuota } = calcularInteresSimple(montoOriginal, tasaOriginal, meses, meses);
    const ahorroInteres = meses < numeroCuotasOriginal ? calcularInteresSimple(montoOriginal, tasaOriginal, numeroCuotasOriginal, numeroCuotasOriginal).totalInteres - totalInteres : 0;
    setCalculoPago({ meses, totalInteres, totalAPagar: saldoTotal, valorCuota, ahorro: ahorroInteres });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="success.dark">¿En cuántos meses quiere pagar?</Typography>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} md={6}><TextField fullWidth label="Meses" type="number" value={mesesPago} onChange={(e) => setMesesPago(e.target.value)} inputProps={{ min: '1' }} /></Grid>
        <Grid item xs={12} md={6}><Button fullWidth variant="contained" color="success" onClick={calcularPagoAnticipado} startIcon={<CalculateIcon />}>Calcular</Button></Grid>
      </Grid>
      {calculoPago && (
        <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'success.50', border: 2, borderColor: 'success.main' }}>
          <CardContent>
            <Typography variant="h6" color="success.main" gutterBottom>Resultado</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Total a Pagar</Typography><Typography variant="h5" color="success.main" fontWeight="bold">${formatMoney(calculoPago.totalAPagar)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Valor Cuota</Typography><Typography variant="h6">${formatMoney(calculoPago.valorCuota)}</Typography></Grid>
            </Grid>
            {calculoPago.ahorro > 0 && <Alert severity="success" sx={{ mt: 2 }}><strong>Ahorro:</strong> ${formatMoney(calculoPago.ahorro)}</Alert>}
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};


// ============================================================================
// PANEL DE AMPLIACION
// ============================================================================

export const LoanExtensionPanel = ({
  montoOriginal,
  tasaOriginal,
  numeroCuotasOriginal,
  cuotasRestantes,
  cuotasPagadas = 0,
  totalAbonado = 0,
  cuotas = [],
  pagosIntereses = [],
}) => {
  const [montoAdicional, setMontoAdicional] = useState('');
  const [nuevaTasa, setNuevaTasa] = useState(tasaOriginal.toString());
  const [nuevasCuotas, setNuevasCuotas] = useState('12');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [parametrosAmpliacion, setParametrosAmpliacion] = useState(null);

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoAdicional(formatMoney(value));
  };

  const handleAplicar = () => {
    const monto = parseMoney(montoAdicional);
    const tasa = parseFloat(nuevaTasa);
    const cuotas = parseInt(nuevasCuotas);
    if (!monto || monto <= 0) { alert('El monto adicional debe ser mayor a 0'); return; }
    if (!tasa || tasa <= 0) { alert('La tasa de interés debe ser mayor a 0'); return; }
    if (!cuotas || cuotas <= 0) { alert('El número de cuotas debe ser mayor a 0'); return; }
    setParametrosAmpliacion({ montoAdicional: monto, nuevaTasa: tasa, nuevasCuotas: cuotas });
    setDialogoAbierto(true);
  };

  const handleCerrarDialogo = () => {
    setDialogoAbierto(false);
    setParametrosAmpliacion(null);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary"><AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Configurar Ampliación del Préstamo</Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>Al hacer clic en "Iniciar Ampliación", se abrirá el proceso de liquidación. El saldo a favor se aplicará automáticamente a las nuevas cuotas.</Alert>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><TextField fullWidth label="Monto Adicional" value={montoAdicional} onChange={handleMontoChange} placeholder="0" InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Nueva Tasa de Interés (%)" type="number" value={nuevaTasa} onChange={(e) => setNuevaTasa(e.target.value)} inputProps={{ step: '0.1', min: '0' }} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Número de Cuotas" type="number" value={nuevasCuotas} onChange={(e) => setNuevasCuotas(e.target.value)} inputProps={{ min: '1' }} /></Grid>
        <Grid item xs={12}><Button fullWidth variant="contained" color="primary" size="large" onClick={handleAplicar} startIcon={<LiquidateIcon />}>Iniciar Ampliación (con Liquidación)</Button></Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Información del Préstamo
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Monto vigente:</strong> ${formatMoney(montoOriginal)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Tasa actual:</strong> {tasaOriginal}%</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Cuotas totales:</strong> {numeroCuotasOriginal}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Cuotas restantes:</strong> {cuotasRestantes}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Cuotas pagadas:</strong> {cuotasPagadas}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Total abonado:</strong> ${formatMoney(totalAbonado)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DialogoLiquidacion
        open={dialogoAbierto}
        onClose={handleCerrarDialogo}
        parametrosAmpliacion={parametrosAmpliacion}
        montoOriginal={montoOriginal}
        tasaOriginal={tasaOriginal}
        numeroCuotasOriginal={numeroCuotasOriginal}
        cuotasRestantes={cuotasRestantes}
        cuotasPagadas={cuotasPagadas}
        cuotas={cuotas}
        pagosIntereses={pagosIntereses}
      />
    </Paper>
  );
};


// ============================================================================
// DIALOGO: LIQUIDACION
// ============================================================================
// Paso intermedio antes de ampliar: el usuario ingresa la tasa y plazo de
// liquidacion personalizados, ve el calculo de interes/saldo a favor, y
// confirma. Solo en ese momento se despacha actionAmpliarPrestamo.

export const DialogoLiquidacion = ({
  open,
  onClose,
  parametrosAmpliacion,
  montoOriginal,
  tasaOriginal,
  numeroCuotasOriginal,
  cuotasRestantes,
  cuotasPagadas,
  cuotas = [],
  pagosIntereses = [],
}) => {
  const dispatch = useDispatch();
  const [tasaLiquidacion, setTasaLiquidacion] = useState('');
  const [plazoLiquidacion, setPlazoLiquidacion] = useState('');
  const [datosCalculados, setDatosCalculados] = useState(null);

  useEffect(() => {
    if (open) {
      setTasaLiquidacion(tasaOriginal ? tasaOriginal.toString() : '');
      setPlazoLiquidacion(cuotasRestantes ? cuotasRestantes.toString() : '');
      setDatosCalculados(null);
    }
  }, [open, tasaOriginal, cuotasRestantes]);

  const totalPagadoCuotas = cuotas.reduce((sum, c) => sum + parseMoney(c.abonado || 0), 0);
  // Solo pagos de interes manuales (tipo='interes'); los de tipo='liquidacion' son
  // registros automaticos de ampliaciones previas y ya estan reflejados en el estado.
  const totalPagadoIntereses = pagosIntereses
    .filter((p) => p.tipo === 'interes')
    .reduce((sum, p) => sum + parseMoney(p.monto || 0), 0);
  const totalPagado = totalPagadoCuotas + totalPagadoIntereses;

  const handleCalcular = () => {
    const tasa = parseFloat(tasaLiquidacion);
    const plazo = parseInt(plazoLiquidacion);
    if (!tasa || tasa <= 0 || !plazo || plazo <= 0) {
      alert('Por favor ingrese valores válidos para la tasa y el plazo de liquidación');
      return;
    }
    const { totalInteres: totalInteresNuevo } = calcularInteresSimple(montoOriginal, tasa, plazo);
    // En el resultado de la liquidacion mostramos solo el cargo nuevo y los abonos
    // a cuotas: los intereses ya pagados son historicos y no deben inflar ninguna
    // de las dos cifras. El saldo a favor es matematicamente identico al esquema
    // anterior (abonos + int_pag) - (nuevo + int_pag) == abonos - nuevo.
    const saldoFavor = totalPagadoCuotas - totalInteresNuevo;
    setDatosCalculados({
      totalInteres: totalInteresNuevo,
      totalInteresNuevo,
      totalPagado: totalPagadoCuotas,
      totalPagadoCuotas,
      totalPagadoIntereses,
      saldoFavor,
      tasaUtilizada: tasa,
      plazoUtilizado: plazo,
    });
  };

  const handleConfirmar = () => {
    if (!datosCalculados) {
      alert('Primero debe calcular la liquidación');
      return;
    }
    if (!parametrosAmpliacion) {
      alert('Faltan parámetros de la ampliación');
      return;
    }
    const { montoAdicional, nuevaTasa, nuevasCuotas } = parametrosAmpliacion;
    dispatch(actionAmpliarPrestamo(
      montoAdicional,
      nuevaTasa,
      nuevasCuotas,
      datosCalculados.tasaUtilizada,
      datosCalculados.plazoUtilizado,
    ));
    handleCerrar();
  };

  const handleCerrar = () => {
    setTasaLiquidacion('');
    setPlazoLiquidacion('');
    setDatosCalculados(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <LiquidateIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Liquidación del Préstamo</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Para ampliar el crédito, primero debe liquidar el préstamo actual.
          El saldo a favor se aplicará a las primeras cuotas de la ampliación.
        </Alert>

        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información del Préstamo Actual
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2"><strong>Monto Original:</strong> ${formatMoney(montoOriginal)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Tasa Original:</strong> {tasaOriginal}%</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Cuotas Totales:</strong> {numeroCuotasOriginal}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Cuotas Pagadas:</strong> {cuotasPagadas}</Typography></Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Abonado a Cuotas:</strong>{' '}
                  <span style={{ color: '#2e7d32' }}>${formatMoney(totalPagadoCuotas)}</span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Intereses Pagados:</strong>{' '}
                  <span style={{ color: '#ed6c02' }}>${formatMoney(totalPagadoIntereses)}</span>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Total Pagado:</strong>{' '}
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>${formatMoney(totalPagado)}</span>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 2 }}>
          Parámetros de Liquidación
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tasa de Interés (%)"
              type="number"
              value={tasaLiquidacion}
              onChange={(e) => setTasaLiquidacion(e.target.value)}
              inputProps={{ step: '0.1', min: '0' }}
              helperText="Tasa para calcular el interés de liquidación"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Plazo (cuotas)"
              type="number"
              value={plazoLiquidacion}
              onChange={(e) => setPlazoLiquidacion(e.target.value)}
              inputProps={{ min: '1' }}
              helperText="Número de cuotas para calcular el interés"
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="outlined" color="primary" onClick={handleCalcular} startIcon={<CalculateIcon />}>
              Calcular Liquidación
            </Button>
          </Grid>
        </Grid>

        {datosCalculados && (
          <Card
            variant="outlined"
            sx={{
              mt: 3,
              backgroundColor: datosCalculados.saldoFavor >= 0 ? 'success.50' : 'error.50',
              border: 2,
              borderColor: datosCalculados.saldoFavor >= 0 ? 'success.main' : 'error.main',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom color={datosCalculados.saldoFavor >= 0 ? 'success.main' : 'error.main'}>
                Resultado de la Liquidación
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Interés de Liquidación</Typography>
                  <Typography variant="h6" color="error.main">${formatMoney(datosCalculados.totalInteres)}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Total Pagado</Typography>
                  <Typography variant="h6">${formatMoney(datosCalculados.totalPagado)}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Saldo a Favor</Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: datosCalculados.saldoFavor >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                  >
                    ${formatMoney(datosCalculados.saldoFavor)}
                  </Typography>
                </Grid>
              </Grid>
              {datosCalculados.saldoFavor < 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  El saldo a favor es negativo. Las nuevas cuotas quedarán todas pendientes.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color="primary"
          disabled={!datosCalculados}
          startIcon={<LiquidateIcon />}
        >
          Confirmar Liquidación y Ampliar
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// ============================================================================
// DIALOGO: LIQUIDACION (stub legacy - se mantiene exportado por index.jsx)
// ============================================================================

export const LiquidacionDialog = () => {
  // Stub legado: la liquidacion ahora ocurre dentro de DialogoLiquidacion,
  // que se monta dentro del propio LoanExtensionPanel.
  return null;
};


// ============================================================================
// PRESTAMO CON CRONOGRAMA
// ============================================================================

export const PrestamoConCronograma = () => {
  const { cuotas, pagosIntereses, montoPrestamo, porcentajeInteres, numeroCuotas } = useSelector(state => state.prestamosTestStore);
  const montoOriginal = parseMoney(montoPrestamo);
  const tasaOriginal = parseFloat(porcentajeInteres) || 0;
  const numCuotas = parseInt(numeroCuotas) || 0;

  return (
    <>
      <BotonesPagoRapido />
      <LoanInstallmentsManager cuotas={cuotas} pagosIntereses={pagosIntereses} />
      <PagoAnticipado montoOriginal={montoOriginal} tasaOriginal={tasaOriginal} numeroCuotasOriginal={numCuotas} />
      <LoanExtensionPanel
        montoOriginal={montoOriginal}
        tasaOriginal={tasaOriginal}
        numeroCuotasOriginal={numCuotas}
        cuotasRestantes={cuotas.filter(c => c.estado_pago !== 'pagado').length}
        cuotasPagadas={cuotas.filter(c => c.estado_pago === 'pagado').length}
        totalAbonado={cuotas.reduce((sum, c) => sum + parseMoney(c.abonado || 0), 0)}
        cuotas={cuotas}
        pagosIntereses={pagosIntereses}
      />
    </>
  );
};


// ============================================================================
// PRESTAMO SIN CRONOGRAMA
// ============================================================================

export const PrestamoSinCronograma = () => {
  const dispatch = useDispatch();
  const store = useSelector(state => state.prestamosTestStore);
  const {
    montoPrestamo, porcentajeInteres, numeroCuotas, valorCuota,
    totalInteresPagar, saldoTotalPagar, duracionPrestamo,
    totalPagadoCuotasSinCronograma, interesAcumulado,
    fechaPrestamo, tipoPrestamo, diaCobro,
  } = store;

  const montoOriginal = parseMoney(montoPrestamo);
  const tasaOriginal = parseFloat(porcentajeInteres) || 0;
  const numCuotas = parseInt(numeroCuotas) || 0;
  const totalPagado = parseMoney(totalPagadoCuotasSinCronograma);
  const interesAcum = parseMoney(interesAcumulado);
  const saldoPendiente = parseMoney(saldoTotalPagar) - totalPagado;

  const [mostrarFechasCobro, setMostrarFechasCobro] = useState(true);

  // Calcular fechas de cobro para referencia
  const fechasCobro = (fechaPrestamo && tipoPrestamo)
    ? calcularFechasCobro(fechaPrestamo, numCuotas, tipoPrestamo, diaCobro)
    : [];

  const handlePlazoChange = (e) => {
    const nuevoValor = e.target.value;
    if (nuevoValor && parseInt(nuevoValor) > 0 && nuevoValor !== String(duracionPrestamo)) {
      dispatch(actionCambiarPlazo(nuevoValor));
    }
  };

  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}><strong>Préstamo sin cronograma de cuotas</strong><br />Puede ajustar el plazo de pago según las necesidades del cliente.</Alert>

      <BotonesPagoSinCronograma />

      <Card sx={{ mb: 3, backgroundColor: 'info.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">Información del Préstamo</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Monto Prestado</Typography><Typography variant="h5" color="primary">${formatMoney(montoOriginal)}</Typography></Grid>
            <Grid item xs={12} md={6}><Typography variant="body2" color="text.secondary">Tasa de Interés</Typography><Typography variant="h5" color="warning.main">{tasaOriginal}%</Typography></Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <TextField fullWidth label="Plazo en Meses" type="number" defaultValue={duracionPrestamo} onBlur={handlePlazoChange} inputProps={{ min: '1' }} helperText="Cambie el plazo para recalcular" />
            </Grid>
            <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Interés Total</Typography><Typography variant="h6" color="error.main">${formatMoney(parseMoney(totalInteresPagar))}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Total a Pagar</Typography><Typography variant="h6" color="secondary.main">${formatMoney(parseMoney(saldoTotalPagar))}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="body2" color="text.secondary">Valor Cuota</Typography><Typography variant="h6" color="success.main">${formatMoney(parseMoney(valorCuota))}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Fechas de Cobro */}
      {fechasCobro.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)', border: '1px solid', borderColor: 'primary.light' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ cursor: 'pointer' }} onClick={() => setMostrarFechasCobro(!mostrarFechasCobro)}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon color="primary" />
              <Typography variant="subtitle1" color="primary" fontWeight="bold">Fechas de Cobro</Typography>
              <Chip label={`${fechasCobro.length} cuotas`} size="small" color="primary" variant="outlined" />
            </Box>
            {mostrarFechasCobro ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
          </Box>
          <Collapse in={mostrarFechasCobro}>
            <TableContainer sx={{ mt: 2, maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Cuota</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Fecha</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fechasCobro.map((fecha, index) => (
                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? 'grey.50' : 'white' }}>
                      <TableCell><Chip label={`#${index + 1}`} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell>{dayjs(fecha).format('DD/MM/YYYY')}</TableCell>
                      <TableCell align="right"><Typography variant="body2" color="success.main" fontWeight="bold">${formatMoney(parseMoney(valorCuota))}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Paper>
      )}

      {/* Resumen de Pagos */}
      <Card sx={{ mb: 3, backgroundColor: 'success.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="success.main">Resumen de Pagos</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Pagado en Cuotas</Typography><Typography variant="h6">${formatMoney(totalPagado)}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Intereses Pagados</Typography><Typography variant="h6">${formatMoney(interesAcum)}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Total Pagado</Typography><Typography variant="h6" color="success.main">${formatMoney(totalPagado + interesAcum)}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Saldo Pendiente</Typography><Typography variant="h6" color={saldoPendiente > 0 ? 'error.main' : 'success.main'}>${formatMoney(Math.max(0, saldoPendiente))}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      <PagoAnticipado montoOriginal={montoOriginal} tasaOriginal={tasaOriginal} numeroCuotasOriginal={numCuotas} />
    </>
  );
};


// ============================================================================
// TAB GESTION
// ============================================================================

export const TabGestion = () => {
  const store = useSelector(state => state.prestamosTestStore);
  const { prestamoGenerado, prestamoSinCronograma } = store;

  if (!prestamoGenerado) {
    return <Alert severity="warning">No hay préstamo generado. Vuelva a la pestaña anterior.</Alert>;
  }

  // Calcular datosPrestamo para la tarjeta (misma logica que antes)
  const datosPrestamo = calcularDatosPrestamo(store);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={4}>
          {datosPrestamo && <TarjetaInformacionPrestamo datosPrestamo={datosPrestamo} />}
        </Grid>
        <Grid size={8}>
          {prestamoSinCronograma ? <PrestamoSinCronograma /> : <PrestamoConCronograma />}
        </Grid>
      </Grid>
    </Box>
  );
};


// ============================================================================
// HISTORIAL DE SEGUIMIENTO
// ============================================================================

export const HistorialSeguimiento = () => {
  const { prestamoGenerado, historial, montoPrestamo, saldoTotalPagar, cuotas } = useSelector(state => state.prestamosTestStore);

  if (!prestamoGenerado) {
    return <Alert severity="warning">No hay préstamo generado.</Alert>;
  }

  const totalPagado = cuotas.reduce((sum, c) => sum + parseMoney(c.abonado || 0), 0);
  const saldoTotal = parseMoney(saldoTotalPagar) || 1;
  const porcentajePagado = (totalPagado / saldoTotal) * 100;

  const getIconoEvento = (tipo) => {
    const iconos = { creacion: <AddIcon />, pago: <MoneyIcon />, eliminacion_pago: <CloseIcon />, cambio_fecha: <CalendarIcon />, ampliacion: <SwapIcon />, liquidacion: <LiquidateIcon />, cambio_plazo: <InfoIcon />, cambio_estado: <InfoIcon /> };
    return iconos[tipo] || <InfoIcon />;
  };

  const getColorEvento = (tipo) => {
    const colores = { creacion: 'primary', pago: 'success', eliminacion_pago: 'error', cambio_fecha: 'warning', ampliacion: 'info', liquidacion: 'error', cambio_plazo: 'info', cambio_estado: 'warning' };
    return colores[tipo] || 'default';
  };

  const getEtiquetaTipo = (tipo) => {
    const etiquetas = { creacion: 'Creación', pago: 'Pago', eliminacion_pago: 'Pago Eliminado', cambio_fecha: 'Cambio Fecha', ampliacion: 'Ampliación', liquidacion: 'Liquidación', cambio_plazo: 'Cambio Plazo', cambio_estado: 'Cambio Estado' };
    return etiquetas[tipo] || tipo;
  };

  // Separa la descripcion automatica de la nota del usuario (separadas por ". ")
  const parsearDescripcion = (descripcion) => {
    if (!descripcion) return { detalle: '', nota: '' };
    // Patrones que indican inicio de la parte automatica
    const partes = descripcion.split(/\.\s+(?=[A-ZÁÉÍÓÚ])/);
    if (partes.length <= 1) return { detalle: descripcion, nota: '' };

    // La ultima parte que NO empiece con patron automatico es la nota del usuario
    const patronesAuto = ['Pago de', 'Saldo total', 'Pago distribuido', 'Se suma', 'Interés:', 'Fecha:'];
    const ultimaParte = partes[partes.length - 1];
    const esAutomatica = patronesAuto.some(p => ultimaParte.startsWith(p));

    if (!esAutomatica) {
      return { detalle: partes.slice(0, -1).join('. '), nota: ultimaParte };
    }
    return { detalle: descripcion, nota: '' };
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'info.50' }}>
        <Typography variant="h5" gutterBottom color="primary">Información General del Préstamo</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Capital</Typography><Typography variant="h6">${formatMoney(parseMoney(montoPrestamo))}</Typography></Grid>
          <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Total Pagado</Typography><Typography variant="h6" color="success.main">${formatMoney(totalPagado)}</Typography></Grid>
          <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Progreso</Typography><Typography variant="h6">{porcentajePagado.toFixed(1)}%</Typography></Grid>
          <Grid item xs={12}><LinearProgress variant="determinate" value={Math.min(porcentajePagado, 100)} sx={{ height: 10, borderRadius: 2 }} /></Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Historial de Eventos</Typography>
        {historial.length === 0 ? (
          <Alert severity="info">No hay eventos registrados.</Alert>
        ) : (
          <Box sx={{ position: 'relative', pl: 4, '&::before': { content: '""', position: 'absolute', left: 18, top: 0, bottom: 0, width: 2, backgroundColor: 'grey.300' } }}>
            {historial.map((evento, index) => {
              const color = getColorEvento(evento.tipo);
              const { detalle, nota } = parsearDescripcion(evento.descripcion);

              return (
                <Box key={evento.id || index} sx={{ position: 'relative', mb: 2 }}>
                  {/* Icono en la linea del timeline */}
                  <Avatar
                    sx={{
                      width: 36, height: 36,
                      bgcolor: `${color}.main`,
                      position: 'absolute',
                      left: -34, top: 8,
                      border: '3px solid white',
                      boxShadow: 1,
                    }}
                  >
                    {getIconoEvento(evento.tipo)}
                  </Avatar>

                  {/* Card del evento */}
                  <Card
                    variant="outlined"
                    sx={{
                      ml: 1,
                      borderLeft: 4,
                      borderLeftColor: `${color}.main`,
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 3 },
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      {/* Header: titulo + chip tipo + monto */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{evento.titulo}</Typography>
                          <Chip label={getEtiquetaTipo(evento.tipo)} color={color} size="small" variant="outlined" sx={{ height: 22, fontSize: '11px' }} />
                        </Box>
                        {evento.monto && (
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
                            ${formatMoney(evento.monto)}
                          </Typography>
                        )}
                      </Box>

                      {/* Descripcion automatica */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: nota ? 0.5 : 0 }}>
                        {detalle}
                      </Typography>

                      {/* Nota del usuario (si existe) */}
                      {nota && (
                        <Box sx={{
                          mt: 1, p: 1, pl: 1.5,
                          backgroundColor: '#fff8e1',
                          borderLeft: 3,
                          borderLeftColor: 'warning.main',
                          borderRadius: 1,
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'warning.dark', display: 'block', mb: 0.25 }}>
                            Nota:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            {nota}
                          </Typography>
                        </Box>
                      )}

                      {/* Fecha */}
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        {dayjs(evento.fecha).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};


// ============================================================================
// HELPER: Calcular datos del prestamo para la tarjeta
// ============================================================================
// Esta funcion calcula los campos derivados (utilidades, saldos, etc.)
// a partir de los datos persistidos en Redux.
// Se ejecuta en el frontend, NO se guarda en BD.
// ============================================================================

function calcularDatosPrestamo(store) {
  const {
    estado, numeroTarjeta, nombre, montoPrestamo, numeroCuotas,
    porcentajeInteres, valorCuota, fechaPrestamo, saldoTotalPagar,
    totalInteresPagar, interesAcumulado, prestamoSinCronograma,
    totalPagadoCuotasSinCronograma, cuotas,
  } = store;

  const montoOriginal = parseMoney(montoPrestamo);
  const tasaOriginal = parseFloat(porcentajeInteres) || 0;
  const numCuotas = parseInt(numeroCuotas) || 0;
  const valorCuotaNum = parseMoney(valorCuota);
  const saldoTotalNum = parseMoney(saldoTotalPagar);
  const totalInteresNum = parseMoney(totalInteresPagar);
  const interesAcum = parseMoney(interesAcumulado);

  const esSinCronograma = prestamoSinCronograma;
  const totalPagadoEfectivo = esSinCronograma ? parseMoney(totalPagadoCuotasSinCronograma) : cuotas.reduce((sum, c) => sum + parseMoney(c.abonado || 0), 0);
  const saldoTotalEfectivo = esSinCronograma
    ? Math.max(0, saldoTotalNum - parseMoney(totalPagadoCuotasSinCronograma))
    : cuotas.reduce((sum, c) => sum + parseMoney(c.saldo || c.valor), 0);

  const cuotasPagas = esSinCronograma
    ? Math.round((parseMoney(totalPagadoCuotasSinCronograma) / valorCuotaNum) * 10) / 10
    : Math.round(cuotas.reduce((sum, c) => sum + (parseMoney(c.abonado || 0) / parseMoney(c.valor)), 0) * 10) / 10;

  const cuotasPendientes = esSinCronograma
    ? Math.round((numCuotas - (parseMoney(totalPagadoCuotasSinCronograma) / valorCuotaNum)) * 10) / 10
    : Math.round((cuotas.length - cuotas.reduce((sum, c) => sum + (parseMoney(c.abonado || 0) / parseMoney(c.valor)), 0)) * 10) / 10;

  const cuotasConPagos = esSinCronograma
    ? [{ abonado: parseMoney(totalPagadoCuotasSinCronograma) }]
    : cuotas.filter(c => parseMoney(c.abonado) > 0).map(c => ({ abonado: parseMoney(c.abonado) }));

  return {
    estado: saldoTotalEfectivo <= 0 ? "Crédito Pagado" : (estado === 'pagado' ? "Crédito Pagado" : "Crédito Vigente"),
    numeroTarjeta: numeroTarjeta || "",
    nombreCliente: nombre || "",
    dineroPrestado: montoOriginal,
    plazoPrestamo: numCuotas,
    interes: tasaOriginal,
    valorCuota: valorCuotaNum,
    fechaPrestamo: fechaPrestamo,
    abonoTotalIntereses: totalPagadoEfectivo + interesAcum,
    abonoTotal: totalPagadoEfectivo,
    saldoTotal: saldoTotalEfectivo,
    saldoInversionIntereses: Math.max(0, montoOriginal - totalPagadoEfectivo - interesAcum),
    interesesPendientes: totalInteresNum - Math.max(0, totalPagadoEfectivo - montoOriginal),
    cuotasPagas: isNaN(cuotasPagas) ? 0 : cuotasPagas,
    cuotasPendientes: isNaN(cuotasPendientes) ? 0 : cuotasPendientes,
    intereses: interesAcum,
    utilidadReal1: calcularUtilidad1(totalInteresNum, interesAcum),
    utilidadReal2: calcularUtilidad2(cuotasConPagos, montoOriginal, totalInteresNum, numCuotas, interesAcum),
    utilidadReal3: calcularUtilidad3(cuotasConPagos, montoOriginal, interesAcum),
  };
}
