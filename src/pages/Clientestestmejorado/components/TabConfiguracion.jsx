import React, { useState } from 'react';
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
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

const TabConfiguracion = ({
  config,
  updateConfig,
  handleMontoChange,
  onGenerarPlan,
  datosPrestamo,
}) => {
  const [errors, setErrors] = useState({});
  const [porcentajeInteresCheck, setPorcentajeInteresCheck] = useState(true);

  // Valores locales para campos calculados
  const [interesMensual, setInteresMensual] = useState('');
  const [numeroCuotas, setNumeroCuotas] = useState('');
  const [valorCuota, setValorCuota] = useState('');
  const [totalInteresPagar, setTotalInteresPagar] = useState('');
  const [saldoTotalPagar, setSaldoTotalPagar] = useState('');

  const handleCheckboxChange = (event) => {
    setPorcentajeInteresCheck(event.target.checked);
    // Limpiar campos calculados
    setInteresMensual('');
    setNumeroCuotas('');
    setValorCuota('');
    setTotalInteresPagar('');
    setSaldoTotalPagar('');
  };

  const formatNumber = (val) => {
    const num = String(val).replace(/\./g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const limpiarNumero = (valor) => {
    if (typeof valor === 'string') {
      return parseFloat(valor.replace(/[.,]/g, ''));
    }
    return valor;
  };

  const formatearSinSimbolo = (valor) =>
    new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);

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
        case 'quincenal':
          cuotaMensual /= 2;
          break;
        case 'semanal':
          cuotaMensual /= 4;
          break;
        case 'diario':
          cuotaMensual /= 30;
          break;
        default:
          break;
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
      case 'mensual':
        numCuotas = duracionEnMeses;
        break;
      case 'quincenal':
        numCuotas = Math.floor((duracionEnMeses * diasEnMes) / 15);
        break;
      case 'semanal':
        numCuotas = Math.floor((duracionEnMeses * diasEnMes) / 7);
        break;
      case 'diario':
        numCuotas = duracionEnMeses * diasEnMes;
        break;
      default:
        numCuotas = 0;
    }

    setNumeroCuotas(numCuotas);
    return numCuotas;
  };

  const calcularInteresMensualAproximado = (dp, t, vcm, frecuencia = 'mensual') => {
    if (!dp || !t || !vcm || dp <= 0 || t <= 0 || vcm <= 0) {
      return "0";
    }

    let multiplicador = 1;
    switch (frecuencia?.toLowerCase()) {
      case 'quincenal':
        multiplicador = 2;
        break;
      case 'semanal':
        multiplicador = 4;
        break;
      case 'diario':
        multiplicador = 30;
        break;
      default:
        multiplicador = 1;
        break;
    }

    const interesMensualCalc = (((vcm * multiplicador) * t - dp) / (dp * t)) * 100;
    return interesMensualCalc.toFixed(6);
  };

  const handleFieldChange = (name, value) => {
    if (name === 'tipoPrestamo') {
      if (porcentajeInteresCheck) {
        calcularPrestamoSimple(config.montoPrestamo, config.porcentajeInteres, config.duracionPrestamo, value);
      }
      calcularNumeroCuotasPorDuracion(value, config.duracionPrestamo);
      updateConfig(name, value);
      return;
    }

    if (name === 'montoPrestamo') {
      const formatted = formatNumber(value);
      updateConfig(name, formatted);
      if (porcentajeInteresCheck && config.porcentajeInteres && config.duracionPrestamo) {
        calcularPrestamoSimple(formatted, config.porcentajeInteres, config.duracionPrestamo, config.tipoPrestamo);
      }
      return;
    }

    if (name === 'porcentajeInteres') {
      updateConfig(name, value);
      if (porcentajeInteresCheck && config.montoPrestamo && config.duracionPrestamo) {
        calcularPrestamoSimple(config.montoPrestamo, value, config.duracionPrestamo, config.tipoPrestamo);
      }
      return;
    }

    if (name === 'duracionPrestamo') {
      updateConfig(name, value);
      calcularNumeroCuotasPorDuracion(config.tipoPrestamo, value);
      if (porcentajeInteresCheck && config.montoPrestamo && config.porcentajeInteres) {
        calcularPrestamoSimple(config.montoPrestamo, config.porcentajeInteres, value, config.tipoPrestamo);
      }
      return;
    }

    if (name === 'valorCuota' && !porcentajeInteresCheck) {
      const monto = limpiarNumero(config.montoPrestamo);
      const cuotas = limpiarNumero(config.duracionPrestamo);
      const cuotaMensual = limpiarNumero(value);
      const interes = calcularInteresMensualAproximado(monto, cuotas, cuotaMensual, config.tipoPrestamo);
      updateConfig('porcentajeInteres', interes);
      const formatted = formatNumber(value);
      setValorCuota(formatted);
      calcularPrestamoSimple(monto, interes, cuotas, config.tipoPrestamo);
      return;
    }

    updateConfig(name, value);
  };

  const llenarDatosPrueba = () => {
    const nombresPrueba = [
      'Juan Carlos Pérez García',
      'María Fernanda López Ramírez',
      'Carlos Alberto Rodríguez Martínez',
      'Ana Patricia Gómez Hernández',
      'Luis Eduardo Torres Sánchez'
    ];

    const tiposPrestamo = ['Mensual', 'Quincenal', 'Semanal', 'Diario'];
    const tipoSeleccionado = tiposPrestamo[Math.floor(Math.random() * tiposPrestamo.length)];
    const nombreSeleccionado = nombresPrueba[Math.floor(Math.random() * nombresPrueba.length)];

    const datosPrueba = {
      numeroTarjeta: `TC-${Math.floor(Math.random() * 900000) + 100000}`,
      nombre: nombreSeleccionado,
      montoPrestamo: '1.000.000',
      porcentajeInteres: '10',
      duracionPrestamo: '12',
      tipoPrestamo: tipoSeleccionado,
      fechaPrestamo: dayjs().format('YYYY-MM-DD'),
      diaCobro: dayjs().add(1, 'month').format('YYYY-MM-DD')
    };

    updateConfig('numeroTarjeta', datosPrueba.numeroTarjeta);
    updateConfig('nombre', datosPrueba.nombre);
    updateConfig('montoPrestamo', datosPrueba.montoPrestamo);
    updateConfig('porcentajeInteres', datosPrueba.porcentajeInteres);
    updateConfig('duracionPrestamo', datosPrueba.duracionPrestamo);
    updateConfig('tipoPrestamo', datosPrueba.tipoPrestamo);
    updateConfig('fechaPrestamo', datosPrueba.fechaPrestamo);
    updateConfig('diaCobro', datosPrueba.diaCobro);

    setTimeout(() => {
      calcularNumeroCuotasPorDuracion(datosPrueba.tipoPrestamo, datosPrueba.duracionPrestamo);
      calcularPrestamoSimple(
        datosPrueba.montoPrestamo,
        datosPrueba.porcentajeInteres,
        datosPrueba.duracionPrestamo,
        datosPrueba.tipoPrestamo
      );
    }, 100);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure los parámetros del préstamo y haga clic en "Generar Plan de Cuotas"
      </Alert>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" color="primary">
            Datos del Cliente y Préstamo
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={llenarDatosPrueba}
            sx={{ textTransform: 'none' }}
          >
            Llenar Datos de Prueba
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          {/* Fila 1: Número de Tarjeta y Nombre */}
          <Grid size={3}>
            <TextField
              label="Número de Tarjeta"
              value={config.numeroTarjeta || ''}
              onChange={(e) => handleFieldChange('numeroTarjeta', e.target.value)}
              fullWidth
              error={!!errors.numeroTarjeta}
              helperText={errors.numeroTarjeta}
            />
          </Grid>
          <Grid size={9}>
            <TextField
              label="Nombre completo"
              value={config.nombre || ''}
              onChange={(e) => handleFieldChange('nombre', e.target.value)}
              fullWidth
              error={!!errors.nombre}
              helperText={errors.nombre}
            />
          </Grid>

          {/* Fila 2: Checkbox, Monto y Porcentaje */}
          <Grid size={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={porcentajeInteresCheck}
                  onChange={handleCheckboxChange}
                />
              }
              label="Porcentaje de Interés"
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Monto del Préstamo"
              value={config.montoPrestamo || ''}
              onChange={(e) => handleFieldChange('montoPrestamo', e.target.value)}
              fullWidth
              error={!!errors.montoPrestamo}
              helperText={errors.montoPrestamo}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Porcentaje de Interés"
              type="number"
              value={config.porcentajeInteres || ''}
              onChange={(e) => handleFieldChange('porcentajeInteres', e.target.value)}
              fullWidth
              disabled={!porcentajeInteresCheck}
              error={!!errors.porcentajeInteres}
              helperText={errors.porcentajeInteres}
            />
          </Grid>

          {/* Fila 3: Duración y Tipo */}
          <Grid size={4}>
            <TextField
              label="Duración del Préstamo (meses)"
              type="number"
              value={config.duracionPrestamo || ''}
              onChange={(e) => handleFieldChange('duracionPrestamo', e.target.value)}
              fullWidth
              error={!!errors.duracionPrestamo}
              helperText={errors.duracionPrestamo}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              select
              label="Tipo de Préstamo"
              value={config.tipoPrestamo || ''}
              onChange={(e) => handleFieldChange('tipoPrestamo', e.target.value)}
              fullWidth
              error={!!errors.tipoPrestamo}
              helperText={errors.tipoPrestamo}
            >
              <MenuItem value="">Selecciona una opción</MenuItem>
              <MenuItem value="Mensual">Mensual</MenuItem>
              <MenuItem value="Quincenal">Quincenal</MenuItem>
              <MenuItem value="Semanal">Semanal</MenuItem>
              <MenuItem value="Diario">Diario</MenuItem>
            </TextField>
          </Grid>
          <Grid size={4}>
            <TextField
              label="Interés Mensual"
              value={interesMensual}
              fullWidth
              disabled
            />
          </Grid>

          {/* Fila 4: Número de Cuotas y Valor Cuota */}
          <Grid size={3}>
            <TextField
              label="Número de Cuotas"
              value={numeroCuotas}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={9}>
            <TextField
              label="Valor de la Cuota"
              value={valorCuota}
              onChange={(e) => handleFieldChange('valorCuota', e.target.value)}
              fullWidth
              disabled={porcentajeInteresCheck}
            />
          </Grid>

          {/* Fila 5: Totales */}
          <Grid size={6}>
            <TextField
              label="Total Intereses a Pagar"
              value={totalInteresPagar}
              fullWidth
              disabled
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Saldo Total a Pagar"
              value={saldoTotalPagar}
              fullWidth
              disabled
            />
          </Grid>

          {/* Fila 6: Fechas */}
          <Grid size={6}>
            <TextField
              label="Fecha del Préstamo"
              type="date"
              value={config.fechaPrestamo || ''}
              onChange={(e) => handleFieldChange('fechaPrestamo', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.fechaPrestamo}
              helperText={errors.fechaPrestamo}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Día de Cobro"
              type="date"
              value={config.diaCobro || ''}
              onChange={(e) => handleFieldChange('diaCobro', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.diaCobro}
              helperText={errors.diaCobro}
            />
          </Grid>

          {/* Checkbox préstamo sin cronograma */}
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.prestamoSinCronograma || false}
                  onChange={(e) => updateConfig('prestamoSinCronograma', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">
                    <strong>Préstamo sin cronograma de cuotas</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    No se generarán cuotas mensuales, solo se mostrará el total a pagar
                  </Typography>
                </Box>
              }
            />
          </Grid>

          {/* Botón Generar */}
          <Grid size={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={onGenerarPlan}
              startIcon={<CalculateIcon />}
            >
              Generar Plan de Cuotas
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TabConfiguracion;
