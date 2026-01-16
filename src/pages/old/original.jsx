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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
  AccountBalance as LiquidateIcon,
  Close as CloseIcon,
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

/**
 * Aplica saldo a favor a las cuotas de un nuevo cronograma
 */
const aplicarSaldoFavorACuotas = (cuotas, saldoFavor) => {
  let saldoRestante = saldoFavor;
  
  return cuotas.map((cuota) => {
    if (saldoRestante <= 0) {
      return { ...cuota, estado_pago: 'pendiente', abonado: 0, saldo: cuota.valor };
    }

    const valorCuota = cuota.valor;
    
    if (saldoRestante >= valorCuota) {
      // Saldo suficiente para pagar toda la cuota
      saldoRestante -= valorCuota;
      return {
        ...cuota,
        estado_pago: 'pagado',
        abonado: valorCuota,
        saldo: 0,
      };
    } else {
      // Saldo parcial
      const saldoPendiente = valorCuota - saldoRestante;
      const cuotaActualizada = {
        ...cuota,
        estado_pago: 'parcial',
        abonado: saldoRestante,
        saldo: saldoPendiente,
      };
      saldoRestante = 0;
      return cuotaActualizada;
    }
  });
};

// ============================================================================
// COMPONENTE: RESUMEN DEL PRÉSTAMO
// ============================================================================

const LoanSummary = ({ datos }) => {
  const {
    totalPagado = 0,
    saldoAplicado = 0,
    nuevoSaldoTotal = 0,
    nuevoValorCuota = 0,
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
              Saldo a Favor Aplicado
            </Typography>
            <Typography variant="h6" color="primary">
              ${formatMoney(saldoAplicado)}
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

        <Grid item xs={12}>
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
// COMPONENTE: PANEL DE PAGO ANTICIPADO
// ============================================================================

const PagoAnticipado = ({ 
  montoOriginal, 
  tasaOriginal, 
  numeroCuotasOriginal 
}) => {
  const [mesesPago, setMesesPago] = useState('3');
  const [calculoPago, setCalculoPago] = useState(null);

  const calcularPagoAnticipado = () => {
    const meses = parseInt(mesesPago);
    
    if (!meses || meses <= 0) {
      alert('El número de meses debe ser mayor a 0');
      return;
    }

    // Calcular el total a pagar con el plazo elegido
    const { totalInteres, saldoTotal, valorCuota } = calcularInteresSimple(
      montoOriginal,
      tasaOriginal,
      meses
    );

    // Calcular ahorro solo si el plazo es menor
    const ahorroInteres = meses < numeroCuotasOriginal 
      ? calcularInteresSimple(montoOriginal, tasaOriginal, numeroCuotasOriginal).totalInteres - totalInteres
      : 0;

    setCalculoPago({
      meses,
      totalInteres,
      totalAPagar: saldoTotal,
      valorCuota,
      ahorro: ahorroInteres,
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="success.dark">
        💰 ¿En cuántos meses quiere pagar?
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Ingrese el número de meses en que el cliente desea liquidar el préstamo 
        para calcular el total a pagar con su interés correspondiente.
      </Alert>

      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="¿En cuántos meses quiere pagar?"
            type="number"
            value={mesesPago}
            onChange={(e) => setMesesPago(e.target.value)}
            inputProps={{ min: '1' }}
            helperText="Ingrese el plazo deseado por el cliente"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={calcularPagoAnticipado}
            startIcon={<CalculateIcon />}
          >
            Calcular Total a Pagar
          </Button>
        </Grid>
      </Grid>

      {calculoPago && (
        <Card 
          variant="outlined" 
          sx={{ 
            mt: 3, 
            backgroundColor: 'success.50',
            border: 2,
            borderColor: 'success.main',
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              ✅ Resultado del Pago Anticipado
            </Typography>
            
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Monto del Préstamo
                </Typography>
                <Typography variant="h6">
                  ${formatMoney(montoOriginal)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Plazo de Pago
                </Typography>
                <Typography variant="h6">
                  {calculoPago.meses} meses
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Interés a Pagar
                </Typography>
                <Typography variant="h6" color="warning.main">
                  ${formatMoney(calculoPago.totalInteres)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Valor de cada Cuota
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  ${formatMoney(calculoPago.valorCuota)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Total a Pagar en {calculoPago.meses} meses
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'success.main',
                  }}
                >
                  ${formatMoney(calculoPago.totalAPagar)}
                </Typography>
              </Grid>

              {calculoPago.ahorro > 0 && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <strong>Ahorro en intereses:</strong> ${formatMoney(calculoPago.ahorro)} 
                    {' '}comparado con el plazo original de {numeroCuotasOriginal} meses
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Información del Préstamo Original
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Monto:</strong> ${formatMoney(montoOriginal)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Tasa:</strong> {tasaOriginal}% mensual
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Plazo original:</strong> {numeroCuotasOriginal} meses
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Total original:</strong> ${formatMoney(
                  calcularInteresSimple(montoOriginal, tasaOriginal, numeroCuotasOriginal).saldoTotal
                )}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Paper>
  );
};

// ============================================================================
// COMPONENTE: DIÁLOGO DE LIQUIDACIÓN
// ============================================================================

const LiquidacionDialog = ({ 
  open, 
  onClose, 
  prestamoActual,
  cuotasPagadas,
  onConfirmarLiquidacion 
}) => {
  const [tasaLiquidacion, setTasaLiquidacion] = useState('');
  const [plazoLiquidacion, setPlazoLiquidacion] = useState('');
  const [datosCalculados, setDatosCalculados] = useState(null);

  useEffect(() => {
    if (open && prestamoActual) {
      setTasaLiquidacion(prestamoActual.tasaOriginal.toString());
      const cuotasRestantes = prestamoActual.numeroCuotasOriginal - cuotasPagadas.length;
      setPlazoLiquidacion(cuotasRestantes.toString());
    }
  }, [open, prestamoActual, cuotasPagadas]);

  const calcularLiquidacion = () => {
    if (!prestamoActual) return;

    const tasa = parseFloat(tasaLiquidacion);
    const plazo = parseInt(plazoLiquidacion);

    // Validar que la tasa sea 0 o mayor (permitir 0)
    if (isNaN(tasa) || tasa < 0) {
      alert('La tasa de interés debe ser 0 o mayor');
      return;
    }

    if (!plazo || plazo <= 0) {
      alert('El plazo debe ser mayor a 0');
      return;
    }

    // Calcular interés total de liquidación (puede ser 0)
    const { totalInteres } = calcularInteresSimple(
      prestamoActual.montoOriginal,
      tasa,
      plazo
    );

    // Calcular total pagado por el cliente
    const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);

    // Calcular saldo a favor (dinero pagado - interés de liquidación)
    const saldoFavor = totalPagado - totalInteres;

    setDatosCalculados({
      totalInteres,
      totalPagado,
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

    onConfirmarLiquidacion(datosCalculados);
    handleCerrar();
  };

  const handleCerrar = () => {
    setTasaLiquidacion('');
    setPlazoLiquidacion('');
    setDatosCalculados(null);
    onClose();
  };

  if (!prestamoActual) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleCerrar}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <LiquidateIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Liquidación del Préstamo</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Proceso de Liquidación:</strong><br />
          Antes de ampliar el crédito, debe liquidar el préstamo actual. El sistema calculará 
          el total de intereses de liquidación y lo restará del dinero que el cliente ha pagado. 
          El resultado se abonará a la primera cuota de la ampliación del crédito.
        </Alert>

        {/* Información del Préstamo Actual */}
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              📋 Información del Préstamo Actual
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Monto Original:</strong> ${formatMoney(prestamoActual.montoOriginal)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Tasa Original:</strong> {prestamoActual.tasaOriginal}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Cuotas Totales:</strong> {prestamoActual.numeroCuotasOriginal}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Cuotas Pagadas:</strong> {cuotasPagadas.length}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Total Pagado:</strong>{' '}
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    ${formatMoney(cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0))}
                  </span>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Formulario de Liquidación */}
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
              helperText="Puede ingresar 0% si no desea cobrar intereses de liquidación"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Plazo (meses)"
              type="number"
              value={plazoLiquidacion}
              onChange={(e) => setPlazoLiquidacion(e.target.value)}
              inputProps={{ min: '1' }}
              helperText="Número de meses para el cálculo"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={calcularLiquidacion}
              startIcon={<CalculateIcon />}
            >
              Calcular Liquidación
            </Button>
          </Grid>
        </Grid>

        {/* Resultados de la Liquidación */}
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
                ✅ Resultado de la Liquidación
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Interés (Liquidación)
                  </Typography>
                  <Typography variant="h6" color={datosCalculados.totalInteres > 0 ? "error.main" : "success.main"}>
                    ${formatMoney(datosCalculados.totalInteres)}
                  </Typography>
                  {datosCalculados.totalInteres === 0 && (
                    <Typography variant="caption" color="success.main">
                      Sin cobro de intereses
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Pagado por Cliente
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${formatMoney(datosCalculados.totalPagado)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Saldo a Favor del Cliente
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: datosCalculados.saldoFavor >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    ${formatMoney(datosCalculados.saldoFavor)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Este monto se abonará a la primera cuota de la ampliación
                  </Typography>
                </Grid>
              </Grid>

              {datosCalculados.saldoFavor < 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <strong>Error:</strong> El interés de liquidación (${formatMoney(datosCalculados.totalInteres)}) 
                  es mayor al total pagado por el cliente (${formatMoney(datosCalculados.totalPagado)}). 
                  Debe ajustar la tasa o el plazo de liquidación.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirmar} 
          variant="contained" 
          color="primary"
          disabled={!datosCalculados || datosCalculados.saldoFavor < 0}
        >
          Confirmar y Continuar con Ampliación
        </Button>
      </DialogActions>
    </Dialog>
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
  const [nuevasCuotas, setNuevasCuotas] = useState('12');

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoAdicional(formatMoney(value));
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary">
        <AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Configurar Ampliación del Préstamo
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Importante:</strong> Al hacer clic en "Iniciar Ampliación", se abrirá el proceso de liquidación del préstamo actual. 
        El saldo a favor calculado se aplicará automáticamente a la primera cuota del nuevo préstamo.
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
            onClick={() => {
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
            }}
            startIcon={<LiquidateIcon />}
          >
            Iniciar Ampliación (con Liquidación)
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
  const [duracionPrestamo, setDuracionPrestamo] = useState('10');
  const [tipoPrestamo, setTipoPrestamo] = useState('Mensual');
  const [fechaPrestamo, setFechaPrestamo] = useState(dayjs().format('YYYY-MM-DD'));
  const [diaCobro, setDiaCobro] = useState('1');
  const [prestamoSinCronograma, setPrestamoSinCronograma] = useState(false);
  
  // Estados para simulación y ampliación
  const [cuotas, setCuotas] = useState([]);
  const [datosPrestamoOriginal, setDatosPrestamoOriginal] = useState(null);
  const [resumenActual, setResumenActual] = useState({});
  const [tabActual, setTabActual] = useState(0);
  const [prestamoGenerado, setPrestamoGenerado] = useState(false);

  // Estados para el diálogo de liquidación
  const [dialogoLiquidacionAbierto, setDialogoLiquidacionAbierto] = useState(false);
  const [parametrosAmpliacion, setParametrosAmpliacion] = useState(null);

  // Actualizar resumen
  const actualizarResumen = (
    cuotasActuales,
    capitalActual,
    tasaActual,
    numCuotasActual,
    saldoAplicado = 0
  ) => {
    const cuotasPagadas = cuotasActuales.filter(c => c.estado_pago === 'pagado');
    const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
    
    const { valorCuota, saldoTotal } = calcularInteresSimple(
      capitalActual,
      tasaActual,
      numCuotasActual
    );
    
    setResumenActual({
      totalPagado,
      saldoAplicado,
      nuevoSaldoTotal: saldoTotal,
      nuevoValorCuota: valorCuota,
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
    
    // Si es préstamo sin cronograma, no generar cuotas
    if (prestamoSinCronograma) {
      setCuotas([]);
      
      setDatosPrestamoOriginal({
        montoOriginal: monto,
        tasaOriginal: tasa,
        numeroCuotasOriginal: numeroCuotas,
        valorCuotaOriginal: valorCuota,
        saldoTotalOriginal: saldoTotal,
        totalInteresOriginal: totalInteres,
        interesMensualOriginal: interesMensual,
        sinCronograma: true,
      });
      
      actualizarResumen([], monto, tasa, numeroCuotas);
    } else {
      // Generar cronograma normal
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
      
      setDatosPrestamoOriginal({
        montoOriginal: monto,
        tasaOriginal: tasa,
        numeroCuotasOriginal: numeroCuotas,
        valorCuotaOriginal: valorCuota,
        saldoTotalOriginal: saldoTotal,
        totalInteresOriginal: totalInteres,
        interesMensualOriginal: interesMensual,
        sinCronograma: false,
      });
      
      actualizarResumen(nuevasCuotas, monto, tasa, numeroCuotas);
    }
    
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

  // Iniciar proceso de ampliación (abre diálogo de liquidación)
  const iniciarProcesoAmpliacion = (params) => {
    setParametrosAmpliacion(params);
    setDialogoLiquidacionAbierto(true);
  };

  // Confirmar liquidación y aplicar ampliación
  const confirmarLiquidacionYAmpliar = (datosLiquidacion) => {
    if (!parametrosAmpliacion || !datosPrestamoOriginal) return;

    const { montoAdicional, nuevaTasa, nuevasCuotas: numCuotasNuevas } = parametrosAmpliacion;
    const { saldoFavor } = datosLiquidacion;

    // 1. Calcular el nuevo capital total
    const capitalVigente = datosPrestamoOriginal.montoOriginal;
    const nuevoCapitalTotal = capitalVigente + montoAdicional;
    
    // 2. Calcular el nuevo plan de pagos
    const { valorCuota, saldoTotal, totalInteres } = 
      calcularInteresSimple(nuevoCapitalTotal, nuevaTasa, numCuotasNuevas);
    
    // 3. Generar nuevas fechas desde la próxima fecha disponible
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
    
    // 4. Crear nuevo cronograma
    const nuevoCronograma = nuevasFechas.map((fecha, index) => ({
      numero: index + 1,
      fecha_pago: fecha,
      valor: valorCuota,
      estado_pago: 'pendiente',
      abonado: 0,
      saldo: valorCuota,
    }));
    
    // 5. Aplicar saldo a favor al nuevo cronograma
    const cronogramaConSaldo = aplicarSaldoFavorACuotas(nuevoCronograma, saldoFavor);
    
    setCuotas(cronogramaConSaldo);
    
    // 6. Actualizar datos originales
    setDatosPrestamoOriginal({
      montoOriginal: nuevoCapitalTotal,
      tasaOriginal: nuevaTasa,
      numeroCuotasOriginal: numCuotasNuevas,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: (nuevoCapitalTotal * nuevaTasa) / 100,
    });
    
    // 7. Actualizar resumen
    actualizarResumen(
      cronogramaConSaldo,
      nuevoCapitalTotal,
      nuevaTasa,
      numCuotasNuevas,
      saldoFavor
    );
    
    // 8. Actualizar campos del formulario
    setMontoPrestamo(formatMoney(nuevoCapitalTotal));
    setPorcentajeInteres(nuevaTasa.toString());
    setDuracionPrestamo(numCuotasNuevas.toString());

    // Cerrar el diálogo
    setDialogoLiquidacionAbierto(false);
    setParametrosAmpliacion(null);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPrestamo(formatMoney(value));
  };

  const cuotasPagadas = cuotas.filter(c => c.estado_pago === 'pagado');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          🧪 Sistema de Refinanciación con Liquidación
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Sistema mejorado que requiere liquidación antes de ampliar el préstamo
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prestamoSinCronograma}
                        onChange={(e) => setPrestamoSinCronograma(e.target.checked)}
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
              {datosPrestamoOriginal ? (
                <>
                  {datosPrestamoOriginal.sinCronograma ? (
                    // Vista para préstamo SIN cronograma
                    <>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <strong>Préstamo sin cronograma de cuotas</strong><br />
                        Este préstamo no tiene cuotas mensuales definidas. 
                        El cliente puede liquidar el préstamo cuando lo desee.
                      </Alert>

                      <Card sx={{ mb: 3, backgroundColor: 'info.50' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom color="primary">
                            📋 Información del Préstamo
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary">
                                Monto Prestado
                              </Typography>
                              <Typography variant="h5" color="primary">
                                ${formatMoney(datosPrestamoOriginal.montoOriginal)}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary">
                                Tasa de Interés Mensual
                              </Typography>
                              <Typography variant="h5" color="warning.main">
                                {datosPrestamoOriginal.tasaOriginal}%
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                Plazo Máximo
                              </Typography>
                              <Typography variant="h6">
                                {datosPrestamoOriginal.numeroCuotasOriginal} meses
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                Interés Total (plazo máximo)
                              </Typography>
                              <Typography variant="h6" color="error.main">
                                ${formatMoney(datosPrestamoOriginal.totalInteresOriginal)}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                Total a Pagar (plazo máximo)
                              </Typography>
                              <Typography variant="h6" color="secondary.main">
                                ${formatMoney(datosPrestamoOriginal.saldoTotalOriginal)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>

                      <PagoAnticipado
                        montoOriginal={datosPrestamoOriginal.montoOriginal}
                        tasaOriginal={datosPrestamoOriginal.tasaOriginal}
                        numeroCuotasOriginal={datosPrestamoOriginal.numeroCuotasOriginal}
                      />
                    </>
                  ) : (
                    // Vista para préstamo CON cronograma (normal)
                    <>
                      <LoanSummary datos={resumenActual} />
                      
                      <LoanInstallmentsManager
                        cuotas={cuotas}
                        onMarcarPagada={handleMarcarCuotaPagada}
                      />
                      
                      <PagoAnticipado
                        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
                        tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
                        numeroCuotasOriginal={datosPrestamoOriginal?.numeroCuotasOriginal || 0}
                      />
                      
                      <LoanExtensionPanel
                        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
                        tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
                        cuotasRestantes={
                          cuotas.filter(c => c.estado_pago !== 'pagado').length
                        }
                        cuotasPagadas={cuotasPagadas.length}
                        onAplicarAmpliacion={iniciarProcesoAmpliacion}
                      />
                    </>
                  )}
                </>
              ) : (
                <Alert severity="warning">
                  No hay préstamo generado. Vuelva a la pestaña anterior.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Diálogo de Liquidación */}
      <LiquidacionDialog
        open={dialogoLiquidacionAbierto}
        onClose={() => {
          setDialogoLiquidacionAbierto(false);
          setParametrosAmpliacion(null);
        }}
        prestamoActual={datosPrestamoOriginal}
        cuotasPagadas={cuotasPagadas}
        onConfirmarLiquidacion={confirmarLiquidacionYAmpliar}
      />

      {/* Información de ayuda */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'grey.100' }}>
        <Typography variant="h6" gutterBottom>
          📖 Instrucciones de Uso
        </Typography>
        <Typography variant="body2" component="div">
          <strong>Tipo 1: Préstamo con cronograma de cuotas (checkbox NO marcado)</strong>
          <ol>
            <li>Configure el préstamo (ej: $1.000.000, 5%, 10 meses)</li>
            <li>Genere el plan de cuotas → Se creará cronograma completo</li>
            <li>Gestione pagos, calcule pagos anticipados o amplíe el crédito</li>
          </ol>
          
          <strong>Tipo 2: Préstamo sin cronograma (checkbox MARCADO)</strong>
          <ol>
            <li>Marque "Préstamo sin cronograma de cuotas"</li>
            <li>Configure el préstamo (ej: $1.000.000, 5%, 10 meses máximo)</li>
            <li>Genere el préstamo → NO se crean cuotas mensuales</li>
            <li>Solo se muestra: monto, plazo máximo, interés total y total a pagar</li>
            <li>Use "¿En cuántos meses quiere pagar?" para calcular diferentes escenarios</li>
          </ol>
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary">
          <strong>Ejemplo sin cronograma:</strong> Préstamo $1.000.000 al 5%. Cliente dice "lo pago en 3 meses" 
          → Sistema calcula: $1.150.000 total ($150.000 de interés)
        </Typography>
      </Paper>
    </Container>
  );
};

export default ClientesTest;
