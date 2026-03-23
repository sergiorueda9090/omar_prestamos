import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  CalendarMonth as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Redux actions
import {
  actionFormStore,
  actionCrearPrestamo,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';

const TabConfiguracion = () => {
  const dispatch = useDispatch();

  // Leer datos del formulario desde Redux
  const config = useSelector(state => state.prestamosTestStore);

  const [errors] = useState({});
  const [porcentajeInteresCheck, setPorcentajeInteresCheck] = useState(true);
  const [mostrarFechasCobro, setMostrarFechasCobro] = useState(true);

  // Valores locales para campos calculados (preview, no se guardan en Redux)
  const [interesMensual, setInteresMensual] = useState('');
  const [numeroCuotas, setNumeroCuotas] = useState('');
  const [valorCuota, setValorCuota] = useState('');
  const [totalInteresPagar, setTotalInteresPagar] = useState('');
  const [saldoTotalPagar, setSaldoTotalPagar] = useState('');

  // --- Funciones de calculo local (preview en UI) ---

  const calcularNumeroCuotasPorDuracionInterno = (tipoPrestamo, duracionEnMeses) => {
    const diasEnMes = 30;
    let numCuotas = 0;
    switch (tipoPrestamo?.toLowerCase()) {
      case 'mensual':    numCuotas = parseInt(duracionEnMeses) || 0; break;
      case 'quincenal':  numCuotas = Math.floor(((parseInt(duracionEnMeses) || 0) * diasEnMes) / 15); break;
      case 'semanal':    numCuotas = Math.floor(((parseInt(duracionEnMeses) || 0) * diasEnMes) / 7); break;
      case 'diario':     numCuotas = (parseInt(duracionEnMeses) || 0) * diasEnMes; break;
      default:           numCuotas = 0;
    }
    return numCuotas;
  };

  const calcularFechasCobro = (fechaInicial, numCuotas, tipoPrestamo) => {
    if (!fechaInicial || !numCuotas || numCuotas <= 0 || !tipoPrestamo) return [];
    const fechas = [];
    let fechaActual = dayjs(fechaInicial);
    for (let i = 0; i < numCuotas; i++) {
      if (i === 0) {
        fechas.push({ numero: i + 1, fecha: fechaActual.format('YYYY-MM-DD'), fechaFormateada: fechaActual.format('DD/MM/YYYY'), diaSemana: fechaActual.format('dddd') });
      } else {
        switch (tipoPrestamo.toLowerCase()) {
          case 'mensual':    fechaActual = dayjs(fechaInicial).add(i, 'month'); break;
          case 'quincenal':  fechaActual = dayjs(fechaInicial).add(i * 15, 'day'); break;
          case 'semanal':    fechaActual = dayjs(fechaInicial).add(i * 7, 'day'); break;
          case 'diario':     fechaActual = dayjs(fechaInicial).add(i, 'day'); break;
          default:           fechaActual = dayjs(fechaInicial).add(i, 'month');
        }
        fechas.push({ numero: i + 1, fecha: fechaActual.format('YYYY-MM-DD'), fechaFormateada: fechaActual.format('DD/MM/YYYY'), diaSemana: fechaActual.format('dddd') });
      }
    }
    return fechas;
  };

  const fechasCobro = useMemo(() => {
    const numCuotasCalculadas = numeroCuotas || calcularNumeroCuotasPorDuracionInterno(config.tipoPrestamo, config.duracionPrestamo);
    return calcularFechasCobro(config.diaCobro, numCuotasCalculadas, config.tipoPrestamo);
  }, [config.diaCobro, config.tipoPrestamo, config.duracionPrestamo, numeroCuotas]);

  const handleCheckboxChange = (event) => {
    setPorcentajeInteresCheck(event.target.checked);
    setInteresMensual(''); setNumeroCuotas(''); setValorCuota(''); setTotalInteresPagar(''); setSaldoTotalPagar('');
  };

  const formatNumber = (val) => {
    const num = String(val).replace(/\./g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const limpiarNumero = (valor) => {
    if (typeof valor === 'string') return parseFloat(valor.replace(/[.,]/g, ''));
    return valor;
  };

  const formatearSinSimbolo = (valor) =>
    new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(valor);

  const calcularPrestamoSimple = (montoPrestamo, interes, meses, frecuenciaPago) => {
    const monto = parseFloat(String(montoPrestamo).replace(/\./g, '').replace(',', '.'));
    const interesVal = parseFloat(interes);
    const tiempo = parseInt(meses);
    if (!monto || !interesVal || !tiempo) return;

    const interesTotal = monto * (interesVal / 100) * tiempo;
    const totalPagar = monto + interesTotal;
    let cuotaMensual = totalPagar / tiempo;
    const interesMensualPesos = interesTotal / tiempo;

    if (porcentajeInteresCheck) {
      switch (frecuenciaPago?.toLowerCase()) {
        case 'quincenal': cuotaMensual /= 2; break;
        case 'semanal':   cuotaMensual /= 4; break;
        case 'diario':    cuotaMensual /= 30; break;
        default: break;
      }
    }

    if (!porcentajeInteresCheck) {
      setSaldoTotalPagar(formatearSinSimbolo(totalPagar));
      setInteresMensual(formatearSinSimbolo(interesMensualPesos));
      setTotalInteresPagar(formatearSinSimbolo(interesTotal));
      return;
    }

    setTotalInteresPagar(formatearSinSimbolo(interesTotal));
    setSaldoTotalPagar(formatearSinSimbolo(totalPagar));
    setValorCuota(formatearSinSimbolo(cuotaMensual));
    setInteresMensual(formatearSinSimbolo(interesMensualPesos));
  };

  const calcularNumeroCuotasPorDuracion = (tipoPrestamo, duracionEnMeses) => {
    const diasEnMes = 30;
    let numCuotas = 0;
    switch (tipoPrestamo?.toLowerCase()) {
      case 'mensual':   numCuotas = duracionEnMeses; break;
      case 'quincenal': numCuotas = Math.floor((duracionEnMeses * diasEnMes) / 15); break;
      case 'semanal':   numCuotas = Math.floor((duracionEnMeses * diasEnMes) / 7); break;
      case 'diario':    numCuotas = duracionEnMeses * diasEnMes; break;
      default:          numCuotas = 0;
    }
    setNumeroCuotas(numCuotas);
    return numCuotas;
  };

  const calcularInteresMensualAproximado = (dp, t, vcm, frecuencia = 'mensual') => {
    if (!dp || !t || !vcm || dp <= 0 || t <= 0 || vcm <= 0) return "0";
    let multiplicador = 1;
    switch (frecuencia?.toLowerCase()) {
      case 'quincenal': multiplicador = 2; break;
      case 'semanal':   multiplicador = 4; break;
      case 'diario':    multiplicador = 30; break;
      default:          multiplicador = 1; break;
    }
    const interesMensualCalc = (((vcm * multiplicador) * t - dp) / (dp * t)) * 100;
    return interesMensualCalc.toFixed(6);
  };

  // --- Manejar cambios en campos del formulario ---
  // Actualiza Redux y recalcula preview

  const handleFieldChange = (name, value) => {
    if (name === 'tipoPrestamo') {
      if (porcentajeInteresCheck) calcularPrestamoSimple(config.montoPrestamo, config.porcentajeInteres, config.duracionPrestamo, value);
      calcularNumeroCuotasPorDuracion(value, config.duracionPrestamo);
      dispatch(actionFormStore({ name, value }));
      return;
    }
    if (name === 'montoPrestamo') {
      const formatted = formatNumber(value);
      dispatch(actionFormStore({ name, value: formatted }));
      if (porcentajeInteresCheck && config.porcentajeInteres && config.duracionPrestamo) calcularPrestamoSimple(formatted, config.porcentajeInteres, config.duracionPrestamo, config.tipoPrestamo);
      return;
    }
    if (name === 'porcentajeInteres') {
      dispatch(actionFormStore({ name, value }));
      if (porcentajeInteresCheck && config.montoPrestamo && config.duracionPrestamo) calcularPrestamoSimple(config.montoPrestamo, value, config.duracionPrestamo, config.tipoPrestamo);
      return;
    }
    if (name === 'duracionPrestamo') {
      dispatch(actionFormStore({ name, value }));
      calcularNumeroCuotasPorDuracion(config.tipoPrestamo, value);
      if (porcentajeInteresCheck && config.montoPrestamo && config.porcentajeInteres) calcularPrestamoSimple(config.montoPrestamo, config.porcentajeInteres, value, config.tipoPrestamo);
      return;
    }
    if (name === 'valorCuota' && !porcentajeInteresCheck) {
      const monto = limpiarNumero(config.montoPrestamo);
      const cuotas = limpiarNumero(config.duracionPrestamo);
      const cuotaMensual = limpiarNumero(value);
      const interes = calcularInteresMensualAproximado(monto, cuotas, cuotaMensual, config.tipoPrestamo);
      dispatch(actionFormStore({ name: 'porcentajeInteres', value: interes }));
      const formatted = formatNumber(value);
      setValorCuota(formatted);
      calcularPrestamoSimple(monto, interes, cuotas, config.tipoPrestamo);
      return;
    }
    dispatch(actionFormStore({ name, value }));
  };

  // --- Generar plan (llamar al backend) ---
  const handleGenerarPlan = () => {
    dispatch(actionCrearPrestamo());
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure los parámetros del préstamo y haga clic en "Generar Plan de Cuotas"
      </Alert>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" color="primary">Datos del Cliente y Préstamo</Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid size={3}>
            <TextField label="Número de Tarjeta" value={config.numeroTarjeta || ''} onChange={(e) => handleFieldChange('numeroTarjeta', e.target.value)} fullWidth error={!!errors.numeroTarjeta} helperText={errors.numeroTarjeta} />
          </Grid>
          <Grid size={9}>
            <TextField label="Nombre completo" value={config.nombre || ''} onChange={(e) => handleFieldChange('nombre', e.target.value)} fullWidth error={!!errors.nombre} helperText={errors.nombre} />
          </Grid>

          <Grid size={4}>
            <FormControlLabel control={<Checkbox checked={porcentajeInteresCheck} onChange={handleCheckboxChange} />} label="Porcentaje de Interés" />
          </Grid>
          <Grid size={4}>
            <TextField label="Monto del Préstamo" value={config.montoPrestamo || ''} onChange={(e) => handleFieldChange('montoPrestamo', e.target.value)} fullWidth error={!!errors.montoPrestamo} helperText={errors.montoPrestamo} />
          </Grid>
          <Grid size={4}>
            <TextField label="Porcentaje de Interés" type="number" value={config.porcentajeInteres || ''} onChange={(e) => handleFieldChange('porcentajeInteres', e.target.value)} fullWidth disabled={!porcentajeInteresCheck} error={!!errors.porcentajeInteres} helperText={errors.porcentajeInteres} />
          </Grid>

          <Grid size={4}>
            <TextField label="Duración del Préstamo (meses)" type="number" value={config.duracionPrestamo || ''} onChange={(e) => handleFieldChange('duracionPrestamo', e.target.value)} fullWidth error={!!errors.duracionPrestamo} helperText={errors.duracionPrestamo} />
          </Grid>
          <Grid size={4}>
            <TextField select label="Tipo de Préstamo" value={config.tipoPrestamo || ''} onChange={(e) => handleFieldChange('tipoPrestamo', e.target.value)} fullWidth error={!!errors.tipoPrestamo} helperText={errors.tipoPrestamo}>
              <MenuItem value="">Selecciona una opción</MenuItem>
              <MenuItem value="Mensual">Mensual</MenuItem>
              <MenuItem value="Quincenal">Quincenal</MenuItem>
              <MenuItem value="Semanal">Semanal</MenuItem>
              <MenuItem value="Diario">Diario</MenuItem>
            </TextField>
          </Grid>
          <Grid size={4}>
            <TextField label="Interés Mensual" value={interesMensual} fullWidth disabled />
          </Grid>

          <Grid size={3}>
            <TextField label="Número de Cuotas" value={numeroCuotas} fullWidth disabled />
          </Grid>
          <Grid size={9}>
            <TextField label="Valor de la Cuota" value={valorCuota} onChange={(e) => handleFieldChange('valorCuota', e.target.value)} fullWidth disabled={porcentajeInteresCheck} />
          </Grid>

          <Grid size={6}>
            <TextField label="Total Intereses a Pagar" value={totalInteresPagar} fullWidth disabled />
          </Grid>
          <Grid size={6}>
            <TextField label="Saldo Total a Pagar" value={saldoTotalPagar} fullWidth disabled />
          </Grid>

          <Grid size={6}>
            <TextField label="Fecha del Préstamo" type="date" value={config.fechaPrestamo || ''} onChange={(e) => handleFieldChange('fechaPrestamo', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} error={!!errors.fechaPrestamo} helperText={errors.fechaPrestamo} />
          </Grid>
          <Grid size={6}>
            <TextField label="Día de Cobro" type="date" value={config.diaCobro || ''} onChange={(e) => handleFieldChange('diaCobro', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} error={!!errors.diaCobro} helperText={errors.diaCobro} />
          </Grid>

          <Grid size={12}>
            <FormControlLabel
              control={<Checkbox checked={config.prestamoSinCronograma || false} onChange={(e) => dispatch(actionFormStore({ name: 'prestamoSinCronograma', value: e.target.checked }))} color="primary" />}
              label={
                <Box>
                  <Typography variant="body1"><strong>Préstamo sin cronograma de cuotas</strong></Typography>
                  <Typography variant="caption" color="text.secondary">No se generarán cuotas mensuales, solo se mostrará el total a pagar</Typography>
                </Box>
              }
            />
          </Grid>

          {/* Vista previa de fechas de cobro */}
          {!config.prestamoSinCronograma && fechasCobro.length > 0 && (
            <Grid size={12}>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)', border: '1px solid', borderColor: 'primary.light' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ cursor: 'pointer' }} onClick={() => setMostrarFechasCobro(!mostrarFechasCobro)}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon color="primary" />
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">Vista Previa de Fechas de Cobro</Typography>
                    <Chip label={`${fechasCobro.length} cuotas`} size="small" color="primary" variant="outlined" />
                  </Box>
                  {mostrarFechasCobro ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
                </Box>

                <Collapse in={mostrarFechasCobro}>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Tipo:</strong> {config.tipoPrestamo} | <strong> Primer cobro:</strong> {fechasCobro[0]?.fechaFormateada} | <strong> Último cobro:</strong> {fechasCobro[fechasCobro.length - 1]?.fechaFormateada}
                    </Alert>

                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Cuota</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Fecha de Cobro</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Día</TableCell>
                            {valorCuota && <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Valor</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fechasCobro.map((fecha, index) => (
                            <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? 'grey.50' : 'white', '&:hover': { backgroundColor: 'primary.50' } }}>
                              <TableCell><Chip label={`#${fecha.numero}`} size="small" color="primary" variant="outlined" /></TableCell>
                              <TableCell><Typography variant="body2" fontWeight="medium">{fecha.fechaFormateada}</Typography></TableCell>
                              <TableCell><Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{fecha.diaSemana}</Typography></TableCell>
                              {valorCuota && <TableCell align="right"><Typography variant="body2" color="success.main" fontWeight="bold">${valorCuota}</Typography></TableCell>}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Total cuotas: ${fechasCobro.length}`} color="primary" size="small" />
                      {saldoTotalPagar && <Chip label={`Total a pagar: $${saldoTotalPagar}`} color="success" size="small" />}
                      {totalInteresPagar && <Chip label={`Intereses: $${totalInteresPagar}`} color="warning" size="small" />}
                    </Box>
                  </Box>
                </Collapse>
              </Paper>
            </Grid>
          )}

          <Grid size={12}>
            <Button fullWidth variant="contained" color="primary" size="large" onClick={handleGenerarPlan} startIcon={<CalculateIcon />}>
              Generar Plan de Cuotas
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TabConfiguracion;
