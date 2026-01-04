// ClientesTest/index.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
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
  Tooltip,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte string formateado a número
 * Ejemplo: "1.000.000" -> 1000000
 */
const parseMoney = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(/\./g, '').replace(/,/g, '.')) || 0;
};

/**
 * Formatea número a string estilo colombiano
 * Ejemplo: 1000000 -> "1.000.000"
 */
const formatMoney = (value) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Calcula interés simple sobre un capital
 */
const calcularInteresSimple = (capital, tasaMensual, numeroCuotas) => {
  const interesMensual = capital * (tasaMensual / 100);
  const totalInteres = interesMensual * numeroCuotas;
  const valorCuota = (capital + totalInteres) / numeroCuotas;
  const saldoTotal = capital + totalInteres;

  return {
    interesMensual,
    totalInteres,
    valorCuota,
    saldoTotal,
  };
};

/**
 * Aplica crédito disponible al cronograma de cuotas
 * Retorna el cronograma actualizado con estados
 */
const applyCreditToSchedule = (cuotas, creditoDisponible) => {
  let creditoRestante = creditoDisponible;
  
  return cuotas.map((cuota) => {
    // Si ya está pagada, no tocar
    if (cuota.estado_pago === 'pagado') {
      return cuota;
    }

    // Si no hay crédito restante, dejar pendiente
    if (creditoRestante <= 0) {
      return { ...cuota, estado_pago: 'pendiente' };
    }

    // Aplicar crédito
    const valorCuota = cuota.valor;
    
    if (creditoRestante >= valorCuota) {
      // Crédito suficiente para pagar toda la cuota
      creditoRestante -= valorCuota;
      return {
        ...cuota,
        estado_pago: 'pagado',
        abonado: valorCuota,
        saldo: 0,
      };
    } else {
      // Crédito parcial
      const saldoPendiente = valorCuota - creditoRestante;
      const cuotaActualizada = {
        ...cuota,
        estado_pago: 'parcial',
        abonado: creditoRestante,
        saldo: saldoPendiente,
      };
      creditoRestante = 0;
      return cuotaActualizada;
    }
  });
};

/**
 * Calcula el total de intereses ganados hasta la fecha
 * basado en las cuotas pagadas
 */
const calcularInteresesGanados = (cuotasPagadas, montoOriginal, tasaMensual, numeroCuotasTotal) => {
  // Interés simple: cada cuota incluye (capital/n + interés mensual)
  const { interesMensual } = calcularInteresSimple(montoOriginal, tasaMensual, numeroCuotasTotal);
  
  // Intereses ganados = número de cuotas pagadas * interés mensual
  return cuotasPagadas.length * interesMensual;
};

/**
 * Calcula número de cuotas según duración y tipo
 */
const calcularNumeroCuotasPorDuracion = (duracion, tipo) => {
  const meses = parseInt(duracion);
  
  switch (tipo) {
    case 'Mensual':
      return meses;
    case 'Quincenal':
      return meses * 2;
    case 'Semanal':
      return meses * 4;
    case 'Diario':
      return meses * 30;
    default:
      return meses;
  }
};

/**
 * Genera fechas de cobro según tipo de préstamo
 */
const calcularFechasCobro = (fechaInicial, numeroCuotas, tipo, dia) => {
  const fechas = [];
  let fechaActual = dayjs(fechaInicial);
  
  for (let i = 0; i < numeroCuotas; i++) {
    if (tipo === 'Mensual') {
      fechaActual = fechaActual.add(1, 'month');
      if (dia) {
        fechaActual = fechaActual.date(parseInt(dia));
      }
    } else if (tipo === 'Quincenal') {
      fechaActual = fechaActual.add(15, 'days');
    } else if (tipo === 'Semanal') {
      fechaActual = fechaActual.add(7, 'days');
    } else if (tipo === 'Diario') {
      fechaActual = fechaActual.add(1, 'day');
    }
    
    fechas.push(fechaActual.format('YYYY-MM-DD'));
  }
  
  return fechas;
};

// ============================================================================
// COMPONENTE: RESUMEN DEL PRÉSTAMO
// ============================================================================

const LoanSummary = ({ datos }) => {
  const {
    totalPagado = 0,
    creditoAplicado = 0,
    nuevoSaldoTotal = 0,
    nuevoValorCuota = 0,
    interesesGanados = 0,
    capitalNuevo = 0,
    numeroCuotasNuevas = 0,
  } = datos;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'success.50' }}>
      <Typography variant="h6" gutterBottom color="success.main">
        📊 Resumen del Préstamo
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Pagado por Cliente
            </Typography>
            <Typography variant="h6" color="success.main">
              ${formatMoney(totalPagado)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Crédito Aplicado a Cuotas
            </Typography>
            <Typography variant="h6" color="primary">
              ${formatMoney(creditoAplicado)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Intereses Ganados
            </Typography>
            <Typography variant="h6" color="info.main">
              ${formatMoney(interesesGanados)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (Sobre cuotas pagadas)
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Capital Total Nuevo
            </Typography>
            <Typography variant="h6">
              ${formatMoney(capitalNuevo)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Nuevo Valor de Cuota
            </Typography>
            <Typography variant="h6" color="secondary.main">
              ${formatMoney(nuevoValorCuota)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Nuevo Saldo Total a Pagar
            </Typography>
            <Typography variant="h6">
              ${formatMoney(nuevoSaldoTotal)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({numeroCuotasNuevas} cuotas)
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

// ============================================================================
// COMPONENTE: GESTOR DE CUOTAS
// ============================================================================

const LoanInstallmentsManager = ({ cuotas, onMarcarPagada }) => {
  const getEstadoChip = (estado) => {
    const configs = {
      pagado: { label: 'Pagado', color: 'success', icon: <CheckCircleIcon /> },
      parcial: { label: 'Parcial', color: 'warning', icon: <WarningIcon /> },
      pendiente: { label: 'Pendiente', color: 'default', icon: <ScheduleIcon /> },
    };
    
    const config = configs[estado] || configs.pendiente;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        📅 Cronograma de Cuotas
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.50' }}>
              <TableCell><strong>N°</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell align="right"><strong>Valor</strong></TableCell>
              <TableCell align="right"><strong>Abonado</strong></TableCell>
              <TableCell align="right"><strong>Saldo</strong></TableCell>
              <TableCell align="center"><strong>Estado</strong></TableCell>
              <TableCell align="center"><strong>Acción</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cuotas.map((cuota, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor:
                    cuota.estado_pago === 'pagado'
                      ? 'rgba(76, 175, 80, 0.1)'
                      : cuota.estado_pago === 'parcial'
                      ? 'rgba(255, 152, 0, 0.1)'
                      : 'inherit',
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {dayjs(cuota.fecha_pago).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell align="right">
                  ${formatMoney(cuota.valor)}
                </TableCell>
                <TableCell align="right">
                  ${formatMoney(cuota.abonado || 0)}
                </TableCell>
                <TableCell align="right">
                  ${formatMoney(cuota.saldo || cuota.valor)}
                </TableCell>
                <TableCell align="center">
                  {getEstadoChip(cuota.estado_pago)}
                </TableCell>
                <TableCell align="center">
                  {cuota.estado_pago !== 'pagado' && (
                    <Tooltip title="Marcar como pagada (simulación)">
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => onMarcarPagada(index)}
                      >
                        Pagar
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// ============================================================================
// COMPONENTE: PANEL DE AMPLIACIÓN
// ============================================================================

const LoanExtensionPanel = ({
  montoOriginal,
  tasaOriginal,
  cuotasRestantes,
  cuotasPagadas,
  onAplicarAmpliacion,
}) => {
  const [montoAdicional, setMontoAdicional] = useState('');
  const [nuevaTasa, setNuevaTasa] = useState(tasaOriginal.toString());
  const [nuevasCuotas, setNuevasCuotas] = useState(cuotasRestantes.toString());

  useEffect(() => {
    setNuevaTasa(tasaOriginal.toString());
    setNuevasCuotas(cuotasRestantes.toString());
  }, [tasaOriginal, cuotasRestantes]);

  const handleAplicar = () => {
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

    onAplicarAmpliacion({
      montoAdicional: monto,
      nuevaTasa: tasa,
      nuevasCuotas: cuotas,
    });

    // Limpiar el campo de monto adicional
    setMontoAdicional('');
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoAdicional(formatMoney(value));
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary">
        <AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Ampliar Préstamo
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Al ampliar el préstamo, el dinero ya pagado se aplicará como crédito a las
        primeras cuotas del nuevo plan.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Monto Adicional"
            value={montoAdicional}
            onChange={handleMontoChange}
            placeholder="0"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
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

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleAplicar}
            startIcon={<AddIcon />}
          >
            Aplicar Ampliación
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Información Actual
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Monto vigente:</strong> ${formatMoney(montoOriginal)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Cuotas pagadas:</strong> {cuotasPagadas}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Cuotas restantes:</strong> {cuotasRestantes}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Tasa actual:</strong> {tasaOriginal}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Paper>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL: ClientesTest
// ============================================================================

const ClientesTest = () => {
  // Estados para el préstamo básico
  const [montoPrestamo, setMontoPrestamo] = useState('1000000');
  const [porcentajeInteres, setPorcentajeInteres] = useState('5');
  const [duracionPrestamo, setDuracionPrestamo] = useState('12');
  const [tipoPrestamo, setTipoPrestamo] = useState('Mensual');
  const [fechaPrestamo, setFechaPrestamo] = useState(dayjs().format('YYYY-MM-DD'));
  const [diaCobro, setDiaCobro] = useState('1');
  
  // Estados para simulación y ampliación
  const [cuotas, setCuotas] = useState([]);
  const [datosPrestamoOriginal, setDatosPrestamoOriginal] = useState(null);
  const [resumenActual, setResumenActual] = useState({});
  const [tabActual, setTabActual] = useState(0);
  const [prestamoGenerado, setPrestamoGenerado] = useState(false);

  // Actualizar resumen
  const actualizarResumen = (
    cuotasActuales,
    capitalActual,
    tasaActual,
    numCuotasActual,
    creditoAplicado = 0,
    interesesGanados = 0
  ) => {
    const cuotasPagadas = cuotasActuales.filter(c => c.estado_pago === 'pagado');
    const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
    
    // Si no se proporcionan intereses ganados, calcularlos
    if (interesesGanados === 0 && cuotasPagadas.length > 0 && datosPrestamoOriginal) {
      interesesGanados = calcularInteresesGanados(
        cuotasPagadas,
        datosPrestamoOriginal.montoOriginal,
        datosPrestamoOriginal.tasaOriginal,
        datosPrestamoOriginal.numeroCuotasOriginal
      );
    }
    
    const { valorCuota, saldoTotal } = calcularInteresSimple(
      capitalActual,
      tasaActual,
      numCuotasActual
    );
    
    setResumenActual({
      totalPagado,
      creditoAplicado,
      nuevoSaldoTotal: saldoTotal,
      nuevoValorCuota: valorCuota,
      interesesGanados,
      capitalNuevo: capitalActual,
      numeroCuotasNuevas: numCuotasActual,
    });
  };

  // Generar plan de cuotas inicial
  const generarPlanCuotas = () => {
    const monto = parseMoney(montoPrestamo);
    const tasa = parseFloat(porcentajeInteres);
    const duracion = parseInt(duracionPrestamo);
    
    if (!monto || !tasa || !duracion) {
      alert('Complete todos los campos del préstamo');
      return;
    }

    const numeroCuotas = calcularNumeroCuotasPorDuracion(duracion, tipoPrestamo);
    const { valorCuota, saldoTotal, totalInteres, interesMensual } = 
      calcularInteresSimple(monto, tasa, numeroCuotas);
    
    const fechas = calcularFechasCobro(fechaPrestamo, numeroCuotas, tipoPrestamo, diaCobro);
    
    const nuevasCuotas = fechas.map((fecha, index) => ({
      numero: index + 1,
      fecha_pago: fecha,
      valor: valorCuota,
      estado_pago: 'pendiente',
      abonado: 0,
      saldo: valorCuota,
    }));
    
    setCuotas(nuevasCuotas);
    
    // Guardar datos originales para referencia
    setDatosPrestamoOriginal({
      montoOriginal: monto,
      tasaOriginal: tasa,
      numeroCuotasOriginal: numeroCuotas,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: interesMensual,
    });
    
    actualizarResumen(nuevasCuotas, monto, tasa, numeroCuotas);
    setPrestamoGenerado(true);
    setTabActual(1); // Cambiar a la pestaña de gestión
  };

  // Marcar una cuota como pagada (simulación)
  const handleMarcarCuotaPagada = (index) => {
    const nuevasCuotas = [...cuotas];
    const cuota = nuevasCuotas[index];
    
    if (cuota.estado_pago === 'pendiente') {
      cuota.estado_pago = 'pagado';
      cuota.abonado = cuota.valor;
      cuota.saldo = 0;
    } else if (cuota.estado_pago === 'parcial') {
      // Si era parcial, completar el pago
      cuota.abonado = cuota.valor;
      cuota.saldo = 0;
      cuota.estado_pago = 'pagado';
    }
    
    setCuotas(nuevasCuotas);
    
    if (datosPrestamoOriginal) {
      actualizarResumen(
        nuevasCuotas,
        datosPrestamoOriginal.montoOriginal,
        datosPrestamoOriginal.tasaOriginal,
        datosPrestamoOriginal.numeroCuotasOriginal
      );
    }
  };

  // Aplicar ampliación de préstamo
  const handleAplicarAmpliacion = ({ montoAdicional, nuevaTasa, nuevasCuotas: numCuotasNuevas }) => {
    if (!datosPrestamoOriginal) {
      alert('Primero debe generar un plan de cuotas');
      return;
    }

    // 1. Calcular cuotas pagadas y crédito disponible
    const cuotasPagadas = cuotas.filter(c => c.estado_pago === 'pagado');
    const creditoDisponible = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
    
    // 2. Calcular capital vigente
    const capitalVigente = datosPrestamoOriginal.montoOriginal;
    const nuevoCapitalTotal = capitalVigente + montoAdicional;
    
    // 3. Calcular intereses ganados hasta ahora
    const interesesGanados = calcularInteresesGanados(
      cuotasPagadas,
      datosPrestamoOriginal.montoOriginal,
      datosPrestamoOriginal.tasaOriginal,
      datosPrestamoOriginal.numeroCuotasOriginal
    );
    
    // 4. Recalcular plan con nuevo capital y parámetros
    const { valorCuota, saldoTotal, totalInteres } = 
      calcularInteresSimple(nuevoCapitalTotal, nuevaTasa, numCuotasNuevas);
    
    // 5. Generar nuevas fechas desde la próxima fecha disponible
    const primeraCuotaPendiente = cuotas.find(c => c.estado_pago !== 'pagado');
    const fechaInicio = primeraCuotaPendiente 
      ? dayjs(primeraCuotaPendiente.fecha_pago) 
      : dayjs().add(1, 'month');
    
    const nuevasFechas = calcularFechasCobro(
      fechaInicio,
      numCuotasNuevas,
      tipoPrestamo,
      diaCobro
    );
    
    // 6. Crear nuevo cronograma
    const nuevoCronograma = nuevasFechas.map((fecha, index) => ({
      numero: index + 1,
      fecha_pago: fecha,
      valor: valorCuota,
      estado_pago: 'pendiente',
      abonado: 0,
      saldo: valorCuota,
    }));
    
    // 7. Aplicar crédito disponible al nuevo cronograma
    const cronogramaConCredito = applyCreditToSchedule(nuevoCronograma, creditoDisponible);
    
    setCuotas(cronogramaConCredito);
    
    // 8. Actualizar datos originales con los nuevos valores
    setDatosPrestamoOriginal({
      montoOriginal: nuevoCapitalTotal,
      tasaOriginal: nuevaTasa,
      numeroCuotasOriginal: numCuotasNuevas,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: (nuevoCapitalTotal * nuevaTasa) / 100,
    });
    
    // 9. Actualizar resumen
    actualizarResumen(
      cronogramaConCredito,
      nuevoCapitalTotal,
      nuevaTasa,
      numCuotasNuevas,
      creditoDisponible,
      interesesGanados
    );
    
    // Actualizar campos del formulario
    setMontoPrestamo(formatMoney(nuevoCapitalTotal));
    setPorcentajeInteres(nuevaTasa.toString());
    setDuracionPrestamo(numCuotasNuevas.toString());
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPrestamo(formatMoney(value));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          🧪 Sistema de Refinanciación de Préstamos - Pruebas
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Simula préstamos, pagos y ampliaciones sin backend
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Tabs value={tabActual} onChange={(e, newValue) => setTabActual(newValue)}>
          <Tab label="1. Configurar Préstamo" />
          <Tab label="2. Gestión y Ampliación" disabled={!prestamoGenerado} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {/* TAB 1: Configuración del Préstamo */}
          {tabActual === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Configure los parámetros del préstamo inicial y haga clic en "Generar Plan de Cuotas"
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Monto del Préstamo"
                    value={montoPrestamo}
                    onChange={handleMontoChange}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Porcentaje de Interés Mensual"
                    type="number"
                    value={porcentajeInteres}
                    onChange={(e) => setPorcentajeInteres(e.target.value)}
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                    }}
                    inputProps={{ step: '0.1', min: '0' }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Duración (meses)"
                    type="number"
                    value={duracionPrestamo}
                    onChange={(e) => setDuracionPrestamo(e.target.value)}
                    inputProps={{ min: '1' }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo de Préstamo"
                    value={tipoPrestamo}
                    onChange={(e) => setTipoPrestamo(e.target.value)}
                  >
                    <MenuItem value="Mensual">Mensual</MenuItem>
                    <MenuItem value="Quincenal">Quincenal</MenuItem>
                    <MenuItem value="Semanal">Semanal</MenuItem>
                    <MenuItem value="Diario">Diario</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Día de Cobro"
                    type="number"
                    value={diaCobro}
                    onChange={(e) => setDiaCobro(e.target.value)}
                    inputProps={{ min: '1', max: '31' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha del Préstamo"
                    value={fechaPrestamo}
                    onChange={(e) => setFechaPrestamo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={generarPlanCuotas}
                    startIcon={<CalculateIcon />}
                  >
                    Generar Plan de Cuotas
                  </Button>
                </Grid>
              </Grid>

              {datosPrestamoOriginal && (
                <Card sx={{ mt: 3, backgroundColor: 'info.50' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resumen del Préstamo Generado
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption">Monto</Typography>
                        <Typography variant="h6">
                          ${formatMoney(datosPrestamoOriginal.montoOriginal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption">Interés Total</Typography>
                        <Typography variant="h6">
                          ${formatMoney(datosPrestamoOriginal.totalInteresOriginal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption">Valor Cuota</Typography>
                        <Typography variant="h6">
                          ${formatMoney(datosPrestamoOriginal.valorCuotaOriginal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption">Total a Pagar</Typography>
                        <Typography variant="h6">
                          ${formatMoney(datosPrestamoOriginal.saldoTotalOriginal)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {/* TAB 2: Gestión y Ampliación */}
          {tabActual === 1 && (
            <Box>
              {cuotas.length > 0 ? (
                <>
                  <LoanSummary datos={resumenActual} />
                  
                  <LoanInstallmentsManager
                    cuotas={cuotas}
                    onMarcarPagada={handleMarcarCuotaPagada}
                  />
                  
                  <LoanExtensionPanel
                    montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
                    tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
                    cuotasRestantes={
                      cuotas.filter(c => c.estado_pago !== 'pagado').length
                    }
                    cuotasPagadas={
                      cuotas.filter(c => c.estado_pago === 'pagado').length
                    }
                    onAplicarAmpliacion={handleAplicarAmpliacion}
                  />
                </>
              ) : (
                <Alert severity="warning">
                  No hay plan de cuotas generado. Vuelva a la pestaña anterior.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Información de ayuda */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'grey.100' }}>
        <Typography variant="h6" gutterBottom>
          📖 Instrucciones de Uso
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>Configure el préstamo inicial (ej: $1.000.000, 5%, 12 meses)</li>
            <li>Genere el plan de cuotas</li>
            <li>En la pestaña "Gestión", marque algunas cuotas como pagadas (ej: cuota 1 y 2)</li>
            <li>Use "Ampliar Préstamo" para agregar capital adicional (ej: +$1.000.000)</li>
            <li>Observe cómo el crédito de las cuotas pagadas se aplica automáticamente al nuevo plan</li>
          </ol>
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary">
          <strong>Fórmulas:</strong> Interés Simple | Crédito = Σ(cuotas pagadas) | 
          Nuevo Capital = Capital Vigente + Monto Adicional | 
          Cuota = (Capital + Interés Total) / N° Cuotas
        </Typography>
      </Paper>
    </Container>
  );
};

export default ClientesTest;
/*
```

Este archivo único contiene:

## ✅ **Características Implementadas:**

1. **Utilidades completas** (parseMoney, formatMoney, cálculos)
2. **Componente LoanSummary** (resumen financiero)
3. **Componente LoanInstallmentsManager** (tabla de cuotas con estados)
4. **Componente LoanExtensionPanel** (panel de ampliación)
5. **Componente principal ClientesTest** con:
   - Sistema de tabs (Configuración / Gestión)
   - Formulario de préstamo inicial
   - Generación de plan de cuotas
   - Simulación de pagos
   - Ampliación de préstamos
   - Aplicación automática de crédito

## 🎯 **Flujo de Uso:**

1. **Tab 1:** Configurar préstamo ($1.000.000, 5%, 12 meses)
2. Generar plan de cuotas
3. **Tab 2:** Aparece el cronograma
4. Marcar cuota 1 y 2 como "Pagadas"
5. Ampliar con +$1.000.000
6. Ver cómo el crédito se aplica automáticamente

## 📊 **Resultado Esperado del Ejemplo:**
```

Préstamo inicial: $1.000.000 / 5% / 12 meses
Cuota: $133.333

Pagar cuota 1 y 2: Crédito = $266.666

Ampliar +$1.000.000:
- Nuevo capital: $2.000.000
- Nuevas cuotas: 10
- Nueva cuota: $260.000

Aplicación de crédito:
- Cuota 1: $260.000 - $260.000 = PAGADO
- Cuota 2: $260.000 - $6.666 = PARCIAL (saldo $253.334)
- Cuotas 3-10: PENDIENTE*/