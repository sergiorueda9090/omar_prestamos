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
  LinearProgress,
  ButtonGroup,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
  AccountBalance as LiquidateIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
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

/**
 * ============================================================================
 * NUEVAS FUNCIONES PARA CALCULAR UTILIDADES
 * ============================================================================
 */

/**
 * Calcula la Utilidad 1 - Ganancia total inmediata
 * Se calcula al momento de generar el préstamo
 */
const calcularUtilidad1 = (montoOriginal, totalAPagar) => {
  return totalAPagar - montoOriginal;
};

/**
 * Calcula la Utilidad 2 - Ganancia distribuida por cuotas
 * Se acumula conforme se van pagando las cuotas
 */
const calcularUtilidad2 = (cuotasPagadas, montoOriginal, totalInteres, numeroCuotasTotal) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  
  // Proporción de interés por cada peso pagado
  const totalAPagar = montoOriginal + totalInteres;
  const proporcionInteres = totalInteres / totalAPagar;
  
  // Ganancia = Total pagado × proporción de interés
  return totalPagado * proporcionInteres;
};

/**
 * Calcula la Utilidad 3 - Ganancia después de recuperar el capital
 * Solo cuenta lo recibido después de recuperar el monto prestado
 */
const calcularUtilidad3 = (cuotasPagadas, montoOriginal) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  
  // Si aún no se ha recuperado el capital, la utilidad 3 es 0
  if (totalPagado <= montoOriginal) {
    return 0;
  }
  
  // Todo lo que excede el capital es utilidad 3
  return totalPagado - montoOriginal;
};

/**
 * Calcula el porcentaje de capital recuperado
 */
const calcularPorcentajeCapitalRecuperado = (cuotasPagadas, montoOriginal) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  const porcentaje = Math.min((totalPagado / montoOriginal) * 100, 100);
  return porcentaje;
};

/**
 * ============================================================================
 * NUEVA FUNCIÓN PARA CALCULAR INTERÉS DE UNA CUOTA
 * ============================================================================
 */

/**
 * Calcula el interés de una cuota individual
 */
const calcularInteresCuota = (montoOriginal, tasaMensual, numeroCuotas) => {
  const { totalInteres } = calcularInteresSimple(montoOriginal, tasaMensual, numeroCuotas);
  return totalInteres / numeroCuotas;
};

// ============================================================================
// NUEVO COMPONENTE: DIÁLOGO DE PAGO FLEXIBLE
// ============================================================================

const DialogoPagoFlexible = ({ 
  open, 
  onClose, 
  cuotas,
  indexInicial,
  montoOriginal,
  tasaMensual,
  numeroCuotas,
  onConfirmarPago 
}) => {
  const [montoPago, setMontoPago] = useState('');
  const [tipoPago, setTipoPago] = useState('completo');
  const [distribucion, setDistribucion] = useState([]);

  useEffect(() => {
    if (open && cuotas && cuotas.length > indexInicial) {
      const cuotaActual = cuotas[indexInicial];
      setTipoPago('completo');
      setMontoPago(formatMoney(cuotaActual.saldo || cuotaActual.valor));
      calcularDistribucion(cuotaActual.saldo || cuotaActual.valor);
    }
  }, [open, cuotas, indexInicial]);

  if (!cuotas || cuotas.length <= indexInicial) return null;

  const interesCuota = calcularInteresCuota(montoOriginal, tasaMensual, numeroCuotas);
  const cuotaActual = cuotas[indexInicial];
  const saldoCuotaActual = cuotaActual.saldo || cuotaActual.valor;

  const calcularDistribucion = (monto) => {
    const montoNum = typeof monto === 'number' ? monto : parseMoney(monto);
    if (!montoNum || montoNum <= 0) {
      setDistribucion([]);
      return;
    }

    let montoRestante = montoNum;
    const nuevaDistribucion = [];

    // Recorrer cuotas desde la actual
    for (let i = indexInicial; i < cuotas.length && montoRestante > 0; i++) {
      const cuota = cuotas[i];
      const saldoCuota = cuota.saldo || cuota.valor;
      
      if (saldoCuota <= 0) continue; // Saltar cuotas ya pagadas

      if (montoRestante >= saldoCuota) {
        // Paga toda la cuota
        nuevaDistribucion.push({
          index: i,
          numero: cuota.numero,
          abonar: saldoCuota,
          saldoAntes: saldoCuota,
          saldoDespues: 0,
          estado: 'pagado'
        });
        montoRestante -= saldoCuota;
      } else {
        // Pago parcial en esta cuota
        nuevaDistribucion.push({
          index: i,
          numero: cuota.numero,
          abonar: montoRestante,
          saldoAntes: saldoCuota,
          saldoDespues: saldoCuota - montoRestante,
          estado: 'parcial'
        });
        montoRestante = 0;
      }
    }

    setDistribucion(nuevaDistribucion);
  };

  const handleTipoPagoChange = (tipo) => {
    setTipoPago(tipo);
    
    switch (tipo) {
      case 'completo':
        const montoCompleto = saldoCuotaActual;
        setMontoPago(formatMoney(montoCompleto));
        calcularDistribucion(montoCompleto);
        break;
      case 'interes':
        const montoInteres = Math.min(interesCuota, saldoCuotaActual);
        setMontoPago(formatMoney(montoInteres));
        calcularDistribucion(montoInteres);
        break;
      case 'personalizado':
        setMontoPago('');
        setDistribucion([]);
        break;
      default:
        break;
    }
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPago(formatMoney(value));
    calcularDistribucion(value);
  };

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    
    if (!monto || monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    // Validar que no exceda el total pendiente
    const totalPendiente = cuotas.reduce((sum, c) => sum + (c.saldo || c.valor), 0);
    if (monto > totalPendiente) {
      alert(`El monto no puede ser mayor al total pendiente: $${formatMoney(totalPendiente)}`);
      return;
    }

    onConfirmarPago(monto, distribucion);
    handleCerrar();
  };

  const handleCerrar = () => {
    setMontoPago('');
    setTipoPago('completo');
    setDistribucion([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Registrar Pago - Cuota #{cuotaActual.numero}</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Información de la Cuota Actual */}
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              📋 Información de la Cuota Actual
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Cuota:</strong> #{cuotaActual.numero}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Valor Original:</strong> ${formatMoney(cuotaActual.valor)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Abonado:</strong> ${formatMoney(cuotaActual.abonado || 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Saldo Pendiente:</strong>{' '}
                  <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    ${formatMoney(saldoCuotaActual)}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Interés de esta Cuota:</strong> ${formatMoney(interesCuota)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Opciones de Pago */}
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
          Seleccione el tipo de pago
        </Typography>

        <ButtonGroup fullWidth sx={{ mb: 3 }}>
          <Button
            variant={tipoPago === 'completo' ? 'contained' : 'outlined'}
            onClick={() => handleTipoPagoChange('completo')}
            color="success"
          >
            Pago Completo
          </Button>
          <Button
            variant={tipoPago === 'interes' ? 'contained' : 'outlined'}
            onClick={() => handleTipoPagoChange('interes')}
            color="warning"
          >
            Solo Interés
          </Button>
          <Button
            variant={tipoPago === 'personalizado' ? 'contained' : 'outlined'}
            onClick={() => handleTipoPagoChange('personalizado')}
            color="primary"
          >
            Personalizado
          </Button>
        </ButtonGroup>

        {/* Campo de Monto */}
        <TextField
          fullWidth
          label="Monto a Pagar"
          value={montoPago}
          onChange={handleMontoChange}
          disabled={tipoPago !== 'personalizado'}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
          }}
          helperText={
            tipoPago === 'completo' 
              ? 'Pagará el saldo completo de la cuota actual'
              : tipoPago === 'interes'
              ? 'Pagará solo el interés de la cuota'
              : 'Ingrese el monto que desea pagar (puede abonar a múltiples cuotas)'
          }
        />

        {/* Distribución del Pago */}
        {distribucion.length > 0 && (
          <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'info.50' }}>
            <CardContent>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                💳 Distribución del Pago
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Cuota</strong></TableCell>
                      <TableCell align="right"><strong>Saldo Antes</strong></TableCell>
                      <TableCell align="right"><strong>Abonar</strong></TableCell>
                      <TableCell align="right"><strong>Saldo Después</strong></TableCell>
                      <TableCell align="center"><strong>Estado</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distribucion.map((dist, idx) => (
                      <TableRow key={idx}>
                        <TableCell>#{dist.numero}</TableCell>
                        <TableCell align="right">${formatMoney(dist.saldoAntes)}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          ${formatMoney(dist.abonar)}
                        </TableCell>
                        <TableCell align="right">${formatMoney(dist.saldoDespues)}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={dist.estado === 'pagado' ? 'Pagado' : 'Parcial'} 
                            color={dist.estado === 'pagado' ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>Total a pagar:</strong> ${formatMoney(parseMoney(montoPago))} 
                {distribucion.length > 1 && ` distribuido en ${distribucion.length} cuotas`}
              </Alert>
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
          color="success"
          disabled={!montoPago || parseMoney(montoPago) <= 0 || distribucion.length === 0}
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// COMPONENTE: PANEL DE UTILIDADES
// ============================================================================

const UtilidadesPanel = ({ 
  datosPrestamoOriginal, 
  cuotasPagadas,
  sinCronograma = false
}) => {
  const [utilidades, setUtilidades] = useState({
    utilidad1: 0,
    utilidad2: 0,
    utilidad3: 0,
    porcentajeCapitalRecuperado: 0,
  });

  useEffect(() => {
    if (!datosPrestamoOriginal) return;

    const montoOriginal = datosPrestamoOriginal.montoOriginal;
    const totalInteres = datosPrestamoOriginal.totalInteresOriginal;
    const totalAPagar = datosPrestamoOriginal.saldoTotalOriginal;
    const numeroCuotas = datosPrestamoOriginal.numeroCuotasOriginal;

    // Utilidad 1: Ganancia total inmediata (se calcula siempre)
    const util1 = calcularUtilidad1(montoOriginal, totalAPagar);

    // Para préstamos sin cronograma, solo calculamos utilidad 1
    if (sinCronograma) {
      setUtilidades({
        utilidad1: util1,
        utilidad2: 0,
        utilidad3: 0,
        porcentajeCapitalRecuperado: 0,
      });
      return;
    }

    // Utilidad 2: Ganancia distribuida por cuotas pagadas
    const util2 = calcularUtilidad2(cuotasPagadas, montoOriginal, totalInteres, numeroCuotas);

    // Utilidad 3: Ganancia después de recuperar capital
    const util3 = calcularUtilidad3(cuotasPagadas, montoOriginal);

    // Porcentaje de capital recuperado
    const porcentaje = calcularPorcentajeCapitalRecuperado(cuotasPagadas, montoOriginal);

    setUtilidades({
      utilidad1: util1,
      utilidad2: util2,
      utilidad3: util3,
      porcentajeCapitalRecuperado: porcentaje,
    });
  }, [datosPrestamoOriginal, cuotasPagadas, sinCronograma]);

  if (!datosPrestamoOriginal) return null;

  const montoOriginal = datosPrestamoOriginal.montoOriginal;
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  const capitalRecuperado = Math.min(totalPagado, montoOriginal);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main', mr: 1 }} />
        <Typography variant="h5" color="success.main">
          💰 Panel de Utilidades del Préstamo
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* UTILIDAD 1 */}
      <Card variant="outlined" sx={{ mb: 2, backgroundColor: 'primary.50', borderColor: 'primary.main', borderWidth: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary.main" gutterBottom>
            ✅ Utilidad 1 – Ganancia Total Inmediata
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Esta utilidad representa la ganancia total del préstamo. Se calcula en el momento en que se genera el préstamo, sin esperar pagos.
          </Typography>
          
          <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Fórmula: Total a pagar - Monto prestado
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
              ${formatMoney(datosPrestamoOriginal.saldoTotalOriginal)} - ${formatMoney(montoOriginal)} = ${formatMoney(utilidades.utilidad1)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Utilidad 1:
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ${formatMoney(utilidades.utilidad1)}
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            📌 Esta utilidad se registra inmediatamente al crear el préstamo
          </Alert>
        </CardContent>
      </Card>

      {/* UTILIDAD 2 */}
      <Card variant="outlined" sx={{ mb: 2, backgroundColor: 'info.50', borderColor: 'info.main', borderWidth: 2 }}>
        <CardContent>
          <Typography variant="h6" color="info.main" gutterBottom>
            ✅ Utilidad 2 – Ganancia Distribuida por Cuotas
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            La ganancia incluida en cada cuota pagada se acumula como Utilidad 2. Esta utilidad se va generando mes a mes, a medida que el cliente paga las cuotas.
          </Typography>

          {sinCronograma ? (
            <Alert severity="warning">
              Este préstamo no tiene cronograma de cuotas. La Utilidad 2 no aplica.
            </Alert>
          ) : (
            <>
              <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Cuotas Pagadas
                    </Typography>
                    <Typography variant="h6">
                      {cuotasPagadas.length} / {datosPrestamoOriginal.numeroCuotasOriginal}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Recibido
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ${formatMoney(totalPagado)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Utilidad 2 Acumulada:
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                  ${formatMoney(utilidades.utilidad2)}
                </Typography>
              </Box>

              <LinearProgress 
                variant="determinate" 
                value={(utilidades.utilidad2 / utilidades.utilidad1) * 100} 
                sx={{ mt: 2, height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {((utilidades.utilidad2 / utilidades.utilidad1) * 100).toFixed(1)}% de la utilidad total generada
              </Typography>

              <Alert severity="success" sx={{ mt: 2 }}>
                📌 La Utilidad 2 es la ganancia obtenida progresivamente por cada cuota pagada
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* UTILIDAD 3 */}
      <Card variant="outlined" sx={{ mb: 2, backgroundColor: 'success.50', borderColor: 'success.main', borderWidth: 2 }}>
        <CardContent>
          <Typography variant="h6" color="success.main" gutterBottom>
            ✅ Utilidad 3 – Ganancia después de Recuperar el Capital
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Esta utilidad solo empieza a contarse después de recuperar el capital prestado. Todo el dinero recibido después de ese punto se considera Utilidad 3.
          </Typography>

          {sinCronograma ? (
            <Alert severity="warning">
              Este préstamo no tiene cronograma de cuotas. La Utilidad 3 no aplica.
            </Alert>
          ) : (
            <>
              <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Progreso de Recuperación de Capital
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={utilidades.porcentajeCapitalRecuperado} 
                  sx={{ mt: 1, height: 10, borderRadius: 1 }}
                  color={utilidades.porcentajeCapitalRecuperado >= 100 ? 'success' : 'warning'}
                />
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Capital Recuperado
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ${formatMoney(capitalRecuperado)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Capital Prestado
                    </Typography>
                    <Typography variant="body1">
                      ${formatMoney(montoOriginal)}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {utilidades.porcentajeCapitalRecuperado.toFixed(1)}% recuperado
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Utilidad 3 (Ganancia Neta):
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ${formatMoney(utilidades.utilidad3)}
                </Typography>
              </Box>

              {utilidades.porcentajeCapitalRecuperado < 100 ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  ⏳ Aún no se ha recuperado el capital completo. La Utilidad 3 comenzará después de recibir ${formatMoney(montoOriginal)} en pagos.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✅ Capital recuperado completo. Todo lo recibido adicional es ganancia neta (Utilidad 3).
                </Alert>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                📌 La Utilidad 3 representa la ganancia neta real, una vez el préstamo ya se pagó completamente en capital
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* RESUMEN COMPARATIVO */}
      {!sinCronograma && (
        <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Resumen Comparativo de Utilidades
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Utilidad 1 (Inmediata)</TableCell>
                    <TableCell align="right">${formatMoney(utilidades.utilidad1)}</TableCell>
                    <TableCell>
                      <Chip label="Registrada" color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilidad 2 (Por cuotas)</TableCell>
                    <TableCell align="right">${formatMoney(utilidades.utilidad2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${((utilidades.utilidad2 / utilidades.utilidad1) * 100).toFixed(0)}% generada`} 
                        color="info" 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilidad 3 (Neta)</TableCell>
                    <TableCell align="right">${formatMoney(utilidades.utilidad3)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={utilidades.utilidad3 > 0 ? "Generando" : "Pendiente"} 
                        color={utilidades.utilidad3 > 0 ? "success" : "default"} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
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
// COMPONENTE: GESTOR DE CUOTAS CON PAGOS FLEXIBLES
// ============================================================================

const LoanInstallmentsManager = ({ 
  cuotas, 
  onAplicarPago,
  montoOriginal,
  tasaMensual,
  numeroCuotas
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [indexSeleccionado, setIndexSeleccionado] = useState(0);

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

  const handleAbrirDialogo = (index) => {
    setIndexSeleccionado(index);
    setDialogoAbierto(true);
  };

  const handleCerrarDialogo = () => {
    setDialogoAbierto(false);
  };

  const handleConfirmarPago = (monto, distribucion) => {
    onAplicarPago(distribucion);
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
                    <Tooltip title="Registrar pago">
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleAbrirDialogo(index)}
                        startIcon={<PaymentIcon />}
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

      {/* Diálogo de Pago Flexible */}
      <DialogoPagoFlexible
        open={dialogoAbierto}
        onClose={handleCerrarDialogo}
        cuotas={cuotas}
        indexInicial={indexSeleccionado}
        montoOriginal={montoOriginal}
        tasaMensual={tasaMensual}
        numeroCuotas={numeroCuotas}
        onConfirmarPago={handleConfirmarPago}
      />
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
  cuotasConPagos,
  onConfirmarLiquidacion 
}) => {
  const [tasaLiquidacion, setTasaLiquidacion] = useState('');
  const [plazoLiquidacion, setPlazoLiquidacion] = useState('');
  const [datosCalculados, setDatosCalculados] = useState(null);

  useEffect(() => {
    if (open && prestamoActual) {
      setTasaLiquidacion(prestamoActual.tasaOriginal.toString());
      const cuotasRestantes = prestamoActual.numeroCuotasOriginal - cuotasConPagos.length;
      setPlazoLiquidacion(cuotasRestantes.toString());
    }
  }, [open, prestamoActual, cuotasConPagos]);

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
    const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);

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
                  <strong>Cuotas con Pagos:</strong> {cuotasConPagos.length}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Total Pagado:</strong>{' '}
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    ${formatMoney(cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0))}
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
                <strong>Cuotas con pagos:</strong> {cuotasPagadas}
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
  const [porcentajeInteres, setPorcentajeInteres] = useState('10');
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
  const [plazoEditableSinCronograma, setPlazoEditableSinCronograma] = useState('');

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
    const cuotasConPagos = cuotasActuales.filter(c => c.abonado > 0);
    const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);
    
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

  // Recalcular préstamo sin cronograma al cambiar plazo
  const recalcularPrestamoSinCronograma = (nuevosPlazo) => {
    if (!datosPrestamoOriginal || !datosPrestamoOriginal.sinCronograma) return;
    
    const plazo = parseInt(nuevosPlazo);
    if (!plazo || plazo <= 0) return;

    const { valorCuota, saldoTotal, totalInteres, interesMensual } = 
      calcularInteresSimple(
        datosPrestamoOriginal.montoOriginal, 
        datosPrestamoOriginal.tasaOriginal, 
        plazo
      );
    
    setDatosPrestamoOriginal({
      ...datosPrestamoOriginal,
      numeroCuotasOriginal: plazo,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: interesMensual,
    });
    
    actualizarResumen([], datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, plazo);
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
      setPlazoEditableSinCronograma(numeroCuotas.toString());
      
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

  // NUEVA FUNCIÓN: Aplicar pago flexible con distribución
  const handleAplicarPago = (distribucion) => {
    const nuevasCuotas = [...cuotas];
    
    distribucion.forEach(dist => {
      const cuota = nuevasCuotas[dist.index];
      
      // Actualizar abonado
      cuota.abonado = (cuota.abonado || 0) + dist.abonar;
      
      // Actualizar saldo
      cuota.saldo = dist.saldoDespues;
      
      // Actualizar estado
      if (cuota.saldo <= 0) {
        cuota.estado_pago = 'pagado';
        cuota.saldo = 0;
        cuota.abonado = cuota.valor;
      } else if (cuota.abonado > 0) {
        cuota.estado_pago = 'parcial';
      }
    });
    
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

  const cuotasConPagos = cuotas.filter(c => c.abonado > 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          🧪 Sistema de Refinanciación con Pagos Flexibles y Utilidades
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Sistema completo con utilidades, abonos parciales, pago de múltiples cuotas y pago solo de intereses
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
                  {/* Panel de Utilidades */}
                  <UtilidadesPanel 
                    datosPrestamoOriginal={datosPrestamoOriginal}
                    cuotasPagadas={cuotasConPagos}
                    sinCronograma={datosPrestamoOriginal.sinCronograma}
                  />

                  {datosPrestamoOriginal.sinCronograma ? (
                    // Vista para préstamo SIN cronograma
                    <>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <strong>Préstamo sin cronograma de cuotas</strong><br />
                        Este préstamo no tiene cuotas mensuales definidas. 
                        Puede ajustar el plazo de pago según las necesidades del cliente.
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

                            <Grid item xs={12} md={12}>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                ⚙️ Ajustar Plazo de Pago
                              </Typography>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    fullWidth
                                    label="Plazo en Meses"
                                    type="number"
                                    value={plazoEditableSinCronograma}
                                    onChange={(e) => {
                                      setPlazoEditableSinCronograma(e.target.value);
                                      if (e.target.value && parseInt(e.target.value) > 0) {
                                        recalcularPrestamoSinCronograma(e.target.value);
                                      }
                                    }}
                                    inputProps={{ min: '1' }}
                                    helperText="Cambie el plazo para recalcular automáticamente"
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Alert severity="success" sx={{ py: 0.5 }}>
                                    <Typography variant="caption">
                                      <strong>Se recalcula automáticamente al cambiar</strong>
                                    </Typography>
                                  </Alert>
                                </Grid>
                              </Grid>
                              <Divider sx={{ my: 2 }} />
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                Plazo Actual
                              </Typography>
                              <Typography variant="h6">
                                {datosPrestamoOriginal.numeroCuotasOriginal} meses
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                Interés Total
                              </Typography>
                              <Typography variant="h6" color="error.main">
                                ${formatMoney(datosPrestamoOriginal.totalInteresOriginal)}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Typography variant="body2" color="text.secondary">
                                Total a Pagar
                              </Typography>
                              <Typography variant="h6" color="secondary.main">
                                ${formatMoney(datosPrestamoOriginal.saldoTotalOriginal)}
                              </Typography>
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Valor de Cada Cuota (si aplica)
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                ${formatMoney(datosPrestamoOriginal.valorCuotaOriginal)}
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
                        onAplicarPago={handleAplicarPago}
                        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
                        tasaMensual={datosPrestamoOriginal?.tasaOriginal || 0}
                        numeroCuotas={datosPrestamoOriginal?.numeroCuotasOriginal || 0}
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
                        cuotasPagadas={cuotasConPagos.length}
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
        cuotasConPagos={cuotasConPagos}
        onConfirmarLiquidacion={confirmarLiquidacionYAmpliar}
      />

      {/* Información de ayuda */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'grey.100' }}>
        <Typography variant="h6" gutterBottom>
          📖 Sistema de Utilidades y Pagos Flexibles
        </Typography>
        <Typography variant="body2" component="div">
          <strong>✅ 3 Tipos de Utilidades:</strong>
          <ul>
            <li><strong>Utilidad 1:</strong> Ganancia total inmediata (registrada al crear el préstamo)</li>
            <li><strong>Utilidad 2:</strong> Ganancia distribuida por pagos (se acumula con cada pago)</li>
            <li><strong>Utilidad 3:</strong> Ganancia después de recuperar el capital (ganancia neta real)</li>
          </ul>
          
          <strong>💰 Opciones de Pago Flexibles:</strong>
          <ul>
            <li><strong>Pago Completo:</strong> Paga el saldo completo de la cuota actual</li>
            <li><strong>Solo Interés:</strong> Paga únicamente el interés de la cuota</li>
            <li><strong>Personalizado:</strong> Ingresa cualquier monto (puede abonar parcial o pagar múltiples cuotas)</li>
          </ul>

          <strong>Ejemplos de pagos:</strong>
          <ul>
            <li>Cuota $200.000 → Cliente paga $50.000 → Abono parcial, saldo $150.000</li>
            <li>Cuota $200.000 → Cliente paga $500.000 → Paga 2 cuotas completas + $100.000 de la 3ra</li>
            <li>Cuota $200.000 → Cliente paga $100.000 (interés) → Abono de interés, saldo $100.000</li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  );
};

export default ClientesTest;