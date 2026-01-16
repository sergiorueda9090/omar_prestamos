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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Stack,
  Badge,
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
  Edit as EditIcon,
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  SwapHoriz as SwapIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  Person as PersonIcon,
  Percent as PercentIcon,
  EventNote as EventNoteIcon,
  AccountBalanceWallet as WalletIcon,
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
      saldoRestante -= valorCuota;
      return {
        ...cuota,
        estado_pago: 'pagado',
        abonado: valorCuota,
        saldo: 0,
      };
    } else {
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
 * FUNCIONES PARA CALCULAR UTILIDADES (ACTUALIZADAS CON INTERÉS ACUMULADO)
 * ============================================================================
 */

/**
 * Calcula la Utilidad 1 - Ganancia total inmediata + intereses pagados
 */
const calcularUtilidad1 = (montoOriginal, totalAPagar, interesAcumulado = 0) => {
  return (totalAPagar - montoOriginal) + interesAcumulado;
};

/**
 * Calcula la Utilidad 2 - Ganancia distribuida por cuotas + intereses pagados
 */
const calcularUtilidad2 = (cuotasPagadas, montoOriginal, totalInteres, numeroCuotasTotal, interesAcumulado = 0) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  const totalAPagar = montoOriginal + totalInteres;
  const proporcionInteres = totalInteres / totalAPagar;
  return (totalPagado * proporcionInteres) + interesAcumulado;
};

/**
 * Calcula la Utilidad 3 - Ganancia después de recuperar el capital + intereses pagados
 */
const calcularUtilidad3 = (cuotasPagadas, montoOriginal, interesAcumulado = 0) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  if (totalPagado <= montoOriginal) {
    return interesAcumulado;
  }
  return (totalPagado - montoOriginal) + interesAcumulado;
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
 * Calcula el interés de una cuota individual
 */
const calcularInteresCuota = (montoOriginal, tasaMensual, numeroCuotas) => {
  const { totalInteres } = calcularInteresSimple(montoOriginal, tasaMensual, numeroCuotas);
  return totalInteres / numeroCuotas;
};

// ============================================================================
// NUEVO COMPONENTE: TARJETA DE INFORMACIÓN DEL PRÉSTAMO (DISEÑO MEJORADO)
// ============================================================================

const TarjetaInformacionPrestamo = ({ datosPrestamo }) => {
  if (!datosPrestamo) return null;

  const {
    estado = "Crédito Vigente",
    numeroTarjeta = "#1",
    nombreCliente = "Omaira Saul",
    dineroPrestado = 34000000,
    plazoPrestamo = 36,
    interes = 2,
    valorCuota = 1700000,
    fechaPrestamo = "2023-12-06",
    abonoTotalIntereses = 39100000,
    abonoTotal = 39100000,
    saldoTotal = 22100000,
    saldoInversionIntereses = 0,
    interesesPendientes = 22100000,
    cuotasPagas = 23,
    cuotasPendientes = 13,
    intereses = 0,
    utilidadReal1 = 27200000,
    utilidadReal2 = 17377788,
    utilidadReal3 = 5100000,
  } = datosPrestamo;

  const porcentajePagado = ((cuotasPagas / (cuotasPagas + cuotasPendientes)) * 100).toFixed(1);

  return (
    <Card 
      elevation={4} 
      sx={{ 
        maxWidth: 1200,
        mx: 'auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
        }
      }}
    >
      {/* Header de la tarjeta */}
      <Box sx={{ p: 3, pb: 2, pt: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CreditCardIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {nombreCliente}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={estado} 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      fontWeight: 600,
                      height: 24,
                    }}
                    icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tarjeta {numeroTarjeta}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box textAlign={{ xs: 'left', md: 'right' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Dinero Prestado
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${formatMoney(dineroPrestado)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Contenido Principal */}
      <CardContent sx={{ p: 3, pt: 2, bgcolor: 'white', color: 'text.primary' }}>
        {/* Sección: Información del Crédito */}
        <Box mb={3}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: 'primary.main',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <EventNoteIcon /> Información del Crédito
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(103, 58, 183, 0.08)',
                  border: '1px solid',
                  borderColor: 'rgba(103, 58, 183, 0.2)',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Plazo
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {plazoPrestamo} meses
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={3}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255, 152, 0, 0.08)',
                  border: '1px solid',
                  borderColor: 'rgba(255, 152, 0, 0.2)',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Interés
                </Typography>
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  {interes}%
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={3}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(76, 175, 80, 0.08)',
                  border: '1px solid',
                  borderColor: 'rgba(76, 175, 80, 0.2)',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Valor Cuota
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  ${formatMoney(valorCuota)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={3}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                  border: '1px solid',
                  borderColor: 'rgba(33, 150, 243, 0.2)',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Fecha Préstamo
                </Typography>
                <Typography variant="body1" fontWeight={600} color="info.main">
                  {dayjs(fechaPrestamo).format('DD/MM/YYYY')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Sección: Estado de Pagos */}
        <Box mb={3}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: 'primary.main',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <WalletIcon /> Estado de Pagos
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.main', borderWidth: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Abono Total + Intereses
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    ${formatMoney(abonoTotalIntereses)}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Abono Total: <strong>${formatMoney(abonoTotal)}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ bgcolor: 'error.50', borderColor: 'error.main', borderWidth: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Saldo Total Pendiente
                  </Typography>
                  <Typography variant="h4" color="error.main" fontWeight={700}>
                    ${formatMoney(saldoTotal)}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Intereses Pendientes: <strong>${formatMoney(interesesPendientes)}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Progreso de Cuotas
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      {porcentajePagado}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(porcentajePagado)} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: 'grey.300',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                      }
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1.5} bgcolor="success.50" borderRadius={2}>
                        <Typography variant="h5" color="success.main" fontWeight={700}>
                          {cuotasPagas}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cuotas Pagas
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1.5} bgcolor="warning.50" borderRadius={2}>
                        <Typography variant="h5" color="warning.main" fontWeight={700}>
                          {cuotasPendientes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cuotas Pendientes
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1.5} bgcolor="info.50" borderRadius={2}>
                        <Typography variant="h5" color="info.main" fontWeight={700}>
                          {cuotasPagas + cuotasPendientes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Cuotas
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Sección: Utilidades Reales */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: 'primary.main',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingUpIcon /> Utilidades Reales
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                      <Typography variant="body2" fontWeight={700}>1</Typography>
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      Utilidad Real 1
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    ${formatMoney(utilidadReal1)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    Ganancia Inmediata
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                      <Typography variant="body2" fontWeight={700}>2</Typography>
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      Utilidad Real 2
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    ${formatMoney(utilidadReal2)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    Ganancia Distribuida
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                      <Typography variant="body2" fontWeight={700}>3</Typography>
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      Utilidad Real 3
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    ${formatMoney(utilidadReal3)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    Ganancia Neta
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Información Adicional */}
        <Box mt={3}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Saldo a Inversión + Intereses
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    ${formatMoney(saldoInversionIntereses)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Intereses
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    ${formatMoney(intereses)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// COMPONENTE: DIÁLOGO CONFIRMAR ELIMINAR PAGO
// ============================================================================

const DialogoConfirmarEliminarPago = ({ 
  open, 
  onClose, 
  cuota,
  onConfirmarEliminar 
}) => {
  if (!cuota) return null;

  const handleConfirmar = () => {
    onConfirmarEliminar();
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
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>¡Atención!</strong> Esta acción revertirá todos los pagos realizados en esta cuota. 
          El cambio quedará registrado en el historial.
        </Alert>

        <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información de la Cuota
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Cuota:</strong> #{cuota.numero}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Valor:</strong> ${formatMoney(cuota.valor)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Abonado:</strong>{' '}
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    ${formatMoney(cuota.abonado || 0)}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Estado:</strong>{' '}
                  {cuota.estado_pago === 'pagado' ? 'Pagado' : 'Parcial'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 2 }}>
          Al confirmar, se eliminarán <strong>${formatMoney(cuota.abonado || 0)}</strong> de pagos 
          y la cuota volverá a estado pendiente.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirmar} 
          variant="contained" 
          color="error"
        >
          Confirmar Eliminación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// COMPONENTE: DIÁLOGO EDITAR FECHA
// ============================================================================

const DialogoEditarFecha = ({ 
  open, 
  onClose, 
  cuota,
  onConfirmarCambio 
}) => {
  const [nuevaFecha, setNuevaFecha] = useState('');

  useEffect(() => {
    if (open && cuota) {
      setNuevaFecha(cuota.fecha_pago);
    }
  }, [open, cuota]);

  if (!cuota) return null;

  const handleConfirmar = () => {
    if (!nuevaFecha) {
      alert('Debe seleccionar una fecha');
      return;
    }

    onConfirmarCambio(nuevaFecha);
    handleCerrar();
  };

  const handleCerrar = () => {
    setNuevaFecha('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Editar Fecha de Pago - Cuota #{cuota.numero}</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Modifique la fecha de vencimiento de esta cuota. El cambio quedará registrado en el historial.
        </Alert>

        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información de la Cuota
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Cuota:</strong> #{cuota.numero}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Valor:</strong> ${formatMoney(cuota.valor)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Fecha Actual:</strong> {dayjs(cuota.fecha_pago).format('DD/MM/YYYY')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TextField
          fullWidth
          type="date"
          label="Nueva Fecha de Pago"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
          InputLabelProps={{ shrink: true }}
          helperText="Seleccione la nueva fecha de vencimiento"
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirmar} 
          variant="contained" 
          color="primary"
        >
          Confirmar Cambio
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// COMPONENTE: DIÁLOGO DE PAGO FLEXIBLE
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
  const [dineroPrestado, setDineroPrestado] = useState('');
  const [abonoCliente, setAbonoCliente] = useState('');
  const [porcentajeInteresSaldo, setPorcentajeInteresSaldo] = useState('');
  const [tiempoSaldo, setTiempoSaldo] = useState('');
  const [fechaPagoSaldo, setFechaPagoSaldo] = useState(dayjs().format('YYYY-MM-DD'));
  const [saldoCalculado, setSaldoCalculado] = useState(null);

  useEffect(() => {
    if (open && cuotas && cuotas.length > indexInicial) {
      const cuotaActual = cuotas[indexInicial];
      setTipoPago('completo');
      setMontoPago(formatMoney(cuotaActual.saldo || cuotaActual.valor));
      calcularDistribucion(cuotaActual.saldo || cuotaActual.valor);
      setDineroPrestado('');
      setAbonoCliente('');
      setPorcentajeInteresSaldo('');
      setTiempoSaldo('');
      setFechaPagoSaldo(dayjs().format('YYYY-MM-DD'));
      setSaldoCalculado(null);
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

    for (let i = indexInicial; i < cuotas.length && montoRestante > 0; i++) {
      const cuota = cuotas[i];
      const saldoCuota = cuota.saldo || cuota.valor;
      
      if (saldoCuota <= 0) continue;

      if (montoRestante >= saldoCuota) {
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
        setSaldoCalculado(null);
        break;
      case 'interes':
        setMontoPago('');
        setDistribucion([]);
        setSaldoCalculado(null);
        break;
      case 'personalizado':
        setMontoPago('');
        setDistribucion([]);
        setSaldoCalculado(null);
        break;
      case 'pagar_saldo':
        setMontoPago('');
        setDistribucion([]);
        setSaldoCalculado(null);
        break;
      default:
        break;
    }
  };

  const calcularSaldoAPagar = () => {
    const prestado = parseMoney(dineroPrestado);
    const abono = parseMoney(abonoCliente);
    const porcentaje = parseFloat(porcentajeInteresSaldo);
    const tiempo = parseInt(tiempoSaldo);

    if (!prestado || prestado <= 0) {
      alert('El dinero prestado debe ser mayor a 0');
      return;
    }

    if (isNaN(porcentaje) || porcentaje < 0) {
      alert('El porcentaje de interés debe ser 0 o mayor');
      return;
    }

    if (!tiempo || tiempo <= 0) {
      alert('El tiempo debe ser mayor a 0');
      return;
    }

    if (isNaN(abono) || abono < 0) {
      alert('El abono del cliente debe ser 0 o mayor');
      return;
    }

    const { saldoTotal } = calcularInteresSimple(prestado, porcentaje, tiempo);
    const saldoFinal = saldoTotal - abono;

    if (saldoFinal < 0) {
      alert('El abono del cliente no puede ser mayor al total a pagar');
      return;
    }

    setSaldoCalculado({
      dineroPrestado: prestado,
      abonoCliente: abono,
      porcentajeInteres: porcentaje,
      tiempo: tiempo,
      totalAPagar: saldoTotal,
      saldoFinal: saldoFinal,
      fechaPago: fechaPagoSaldo,
    });
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPago(formatMoney(value));
    
    if (tipoPago !== 'interes') {
      calcularDistribucion(value);
    } else {
      setDistribucion([]);
    }
  };

  const handleConfirmar = () => {
    if (tipoPago === 'pagar_saldo') {
      if (!saldoCalculado) {
        alert('Primero debe calcular el saldo haciendo clic en "Calcular Saldo"');
        return;
      }

      onConfirmarPago(saldoCalculado.saldoFinal, [], tipoPago, saldoCalculado);
      handleCerrar();
      return;
    }

    const monto = parseMoney(montoPago);
    
    if (!monto || monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    if (tipoPago !== 'interes') {
      const totalPendiente = cuotas.reduce((sum, c) => sum + (c.saldo || c.valor), 0);
      if (monto > totalPendiente) {
        alert(`El monto no puede ser mayor al total pendiente: $${formatMoney(totalPendiente)}`);
        return;
      }
    }

    onConfirmarPago(monto, distribucion, tipoPago);
    handleCerrar();
  };

  const handleCerrar = () => {
    setMontoPago('');
    setTipoPago('completo');
    setDistribucion([]);
    setDineroPrestado('');
    setAbonoCliente('');
    setPorcentajeInteresSaldo('');
    setTiempoSaldo('');
    setFechaPagoSaldo(dayjs().format('YYYY-MM-DD'));
    setSaldoCalculado(null);
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
                  <strong>Interés de esta Cuota (Referencia):</strong> ${formatMoney(interesCuota)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Este es solo un valor de referencia. En "Pago de Interés" puede ingresar cualquier valor.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
          Seleccione el tipo de pago
        </Typography>

        <Grid container spacing={1} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant={tipoPago === 'completo' ? 'contained' : 'outlined'}
              onClick={() => handleTipoPagoChange('completo')}
              color="success"
            >
              Pago Completo
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant={tipoPago === 'interes' ? 'contained' : 'outlined'}
              onClick={() => handleTipoPagoChange('interes')}
              color="warning"
            >
              Pago de Interés
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant={tipoPago === 'personalizado' ? 'contained' : 'outlined'}
              onClick={() => handleTipoPagoChange('personalizado')}
              color="primary"
            >
              Personalizado
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant={tipoPago === 'pagar_saldo' ? 'contained' : 'outlined'}
              onClick={() => handleTipoPagoChange('pagar_saldo')}
              color="secondary"
            >
              Pagar Saldo
            </Button>
          </Grid>
        </Grid>

        {tipoPago === 'pagar_saldo' ? (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Pagar Saldo:</strong><br />
              Ingrese los datos del préstamo para calcular automáticamente el saldo total a pagar.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dinero Prestado"
                  value={dineroPrestado}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setDineroPrestado(formatMoney(value));
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  helperText="Monto inicial del préstamo"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Abono del Cliente"
                  value={abonoCliente}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setAbonoCliente(formatMoney(value));
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  helperText="Monto ya pagado por el cliente"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Porcentaje de Interés"
                  type="number"
                  value={porcentajeInteresSaldo}
                  onChange={(e) => setPorcentajeInteresSaldo(e.target.value)}
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                  }}
                  inputProps={{ step: '0.1', min: '0' }}
                  helperText="Tasa de interés mensual"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tiempo (meses)"
                  type="number"
                  value={tiempoSaldo}
                  onChange={(e) => setTiempoSaldo(e.target.value)}
                  inputProps={{ min: '1' }}
                  helperText="Plazo del préstamo"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Pago"
                  value={fechaPagoSaldo}
                  onChange={(e) => setFechaPagoSaldo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Fecha del pago"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={calcularSaldoAPagar}
                  startIcon={<CalculateIcon />}
                  size="large"
                >
                  Calcular Saldo
                </Button>
              </Grid>
            </Grid>

            {saldoCalculado && (
              <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'secondary.50', border: 2, borderColor: 'secondary.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">
                    💰 Resultado del Cálculo de Saldo
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Dinero Prestado
                      </Typography>
                      <Typography variant="h6">
                        ${formatMoney(saldoCalculado.dineroPrestado)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Abono del Cliente
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ${formatMoney(saldoCalculado.abonoCliente)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Tasa de Interés
                      </Typography>
                      <Typography variant="h6">
                        {saldoCalculado.porcentajeInteres}%
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Plazo
                      </Typography>
                      <Typography variant="h6">
                        {saldoCalculado.tiempo} meses
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Total a Pagar (con interés)
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                        ${formatMoney(saldoCalculado.totalAPagar)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Saldo Final a Pagar
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'secondary.main',
                        }}
                      >
                        ${formatMoney(saldoCalculado.saldoFinal)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Este es el monto que se registrará al confirmar el pago
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Pago
                      </Typography>
                      <Typography variant="body1">
                        {dayjs(saldoCalculado.fechaPago).format('DD/MM/YYYY')}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Alert severity="success" sx={{ mt: 2 }}>
                    ✅ Saldo calculado correctamente. Haga clic en "Confirmar Pago" para registrar el pago del saldo.
                  </Alert>
                </CardContent>
              </Card>
            )}
          </Box>
        ) : (
          <>
            <TextField
              fullWidth
              label="Monto a Pagar"
              value={montoPago}
              onChange={handleMontoChange}
              disabled={tipoPago === 'completo'}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              helperText={
                tipoPago === 'completo' 
                  ? 'Pagará el saldo completo de la cuota actual'
                  : tipoPago === 'interes'
                  ? '💡 Ingrese el monto de interés personalizado. Este valor se sumará a las 3 utilidades.'
                  : 'Ingrese el monto que desea pagar (puede abonar a múltiples cuotas)'
              }
            />

            {tipoPago === 'interes' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Pago de Interés Personalizado:</strong><br />
                El monto que ingrese se registrará como pago de interés y se sumará acumulativamente en:
                <ul style={{ marginBottom: 0, marginTop: 8 }}>
                  <li>Utilidad 1 (Ganancia Total Inmediata)</li>
                  <li>Utilidad 2 (Ganancia Distribuida)</li>
                  <li>Utilidad 3 (Ganancia Neta)</li>
                </ul>
              </Alert>
            )}

            {distribucion.length > 0 && tipoPago !== 'interes' && (
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
          </>
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
          disabled={
            tipoPago === 'pagar_saldo' 
              ? !saldoCalculado 
              : (!montoPago || parseMoney(montoPago) <= 0 || (tipoPago !== 'interes' && distribucion.length === 0))
          }
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// COMPONENTE: DIÁLOGO CALCULAR Y PAGAR SALDO
// ============================================================================

const DialogoCalcularPagoSaldo = ({ 
  open, 
  onClose, 
  onConfirmarPago 
}) => {
  const [dineroPrestado, setDineroPrestado] = useState('');
  const [abonoCliente, setAbonoCliente] = useState('');
  const [porcentajeInteres, setPorcentajeInteres] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [fechaPago, setFechaPago] = useState(dayjs().format('YYYY-MM-DD'));
  const [saldoCalculado, setSaldoCalculado] = useState(null);

  const calcularSaldo = () => {
    const prestado = parseMoney(dineroPrestado);
    const abono = parseMoney(abonoCliente);
    const interes = parseFloat(porcentajeInteres);
    const plazo = parseInt(tiempo);

    if (!prestado || prestado <= 0) {
      alert('El dinero prestado debe ser mayor a 0');
      return;
    }

    if (!abono || abono < 0) {
      alert('El abono del cliente debe ser 0 o mayor');
      return;
    }

    if (!interes || interes < 0) {
      alert('El porcentaje de interés debe ser 0 o mayor');
      return;
    }

    if (!plazo || plazo <= 0) {
      alert('El tiempo debe ser mayor a 0');
      return;
    }

    const { saldoTotal, totalInteres } = calcularInteresSimple(prestado, interes, plazo);
    const saldoFinal = saldoTotal - abono;

    setSaldoCalculado({
      dineroPrestado: prestado,
      abonoCliente: abono,
      interesTotal: totalInteres,
      totalAPagar: saldoTotal,
      saldoFinal: saldoFinal,
      porcentaje: interes,
      plazo: plazo,
      fecha: fechaPago
    });
  };

  const handleConfirmar = () => {
    if (!saldoCalculado) {
      alert('Primero debe calcular el saldo');
      return;
    }

    if (saldoCalculado.saldoFinal <= 0) {
      alert('El saldo final debe ser mayor a 0 para realizar el pago');
      return;
    }

    onConfirmarPago(saldoCalculado);
    handleCerrar();
  };

  const handleCerrar = () => {
    setDineroPrestado('');
    setAbonoCliente('');
    setPorcentajeInteres('');
    setTiempo('');
    setFechaPago(dayjs().format('YYYY-MM-DD'));
    setSaldoCalculado(null);
    onClose();
  };

  const handleDineroPrestadoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setDineroPrestado(formatMoney(value));
  };

  const handleAbonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setAbonoCliente(formatMoney(value));
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <CalculateIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Calcular y Pagar Saldo</Typography>
          </Box>
          <IconButton onClick={handleCerrar} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Método de Cálculo de Saldo:</strong><br />
          Ingrese los datos del préstamo para calcular automáticamente el saldo total a pagar. 
          El sistema aplicará el interés simple sobre el monto prestado según el tiempo definido.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dinero Prestado"
              value={dineroPrestado}
              onChange={handleDineroPrestadoChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              helperText="Monto que se prestó al cliente"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Abono del Cliente"
              value={abonoCliente}
              onChange={handleAbonoChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              helperText="Monto que el cliente ya ha pagado"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Porcentaje de Interés"
              type="number"
              value={porcentajeInteres}
              onChange={(e) => setPorcentajeInteres(e.target.value)}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
              }}
              inputProps={{ step: '0.1', min: '0' }}
              helperText="Interés mensual a aplicar"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tiempo (meses)"
              type="number"
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              inputProps={{ min: '1' }}
              helperText="Plazo del préstamo en meses"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Pago"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Fecha en que se realiza el pago"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={calcularSaldo}
              startIcon={<CalculateIcon />}
            >
              Calcular Saldo
            </Button>
          </Grid>
        </Grid>

        {saldoCalculado && (
          <Card 
            variant="outlined" 
            sx={{ 
              mt: 3, 
              backgroundColor: saldoCalculado.saldoFinal > 0 ? 'success.50' : 'warning.50',
              border: 2,
              borderColor: saldoCalculado.saldoFinal > 0 ? 'success.main' : 'warning.main',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom color={saldoCalculado.saldoFinal > 0 ? 'success.main' : 'warning.main'}>
                ✅ Resultado del Cálculo
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Dinero Prestado
                  </Typography>
                  <Typography variant="h6">
                    ${formatMoney(saldoCalculado.dineroPrestado)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Porcentaje de Interés
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {saldoCalculado.porcentaje}%
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Plazo
                  </Typography>
                  <Typography variant="h6">
                    {saldoCalculado.plazo} meses
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Interés Total
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    ${formatMoney(saldoCalculado.interesTotal)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total a Pagar (Capital + Interés)
                  </Typography>
                  <Typography variant="h6">
                    ${formatMoney(saldoCalculado.totalAPagar)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Abono del Cliente
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${formatMoney(saldoCalculado.abonoCliente)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Saldo Final a Pagar
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: saldoCalculado.saldoFinal > 0 ? 'success.main' : 'warning.main',
                    }}
                  >
                    ${formatMoney(saldoCalculado.saldoFinal)}
                  </Typography>
                </Grid>

                {saldoCalculado.saldoFinal <= 0 && (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      El abono del cliente cubre el total del préstamo. No hay saldo pendiente.
                    </Alert>
                  </Grid>
                )}
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <strong>Fórmula aplicada:</strong><br />
                Saldo Final = (Capital + Interés Total) - Abono del Cliente<br />
                Saldo Final = ${formatMoney(saldoCalculado.totalAPagar)} - ${formatMoney(saldoCalculado.abonoCliente)} = ${formatMoney(saldoCalculado.saldoFinal)}
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
          disabled={!saldoCalculado || saldoCalculado.saldoFinal <= 0}
          startIcon={<PaymentIcon />}
        >
          Pagar Saldo
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
  sinCronograma = false,
  interesAcumulado = 0
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

    const util1 = calcularUtilidad1(montoOriginal, totalAPagar, interesAcumulado);

    if (sinCronograma) {
      setUtilidades({
        utilidad1: util1,
        utilidad2: interesAcumulado,
        utilidad3: interesAcumulado,
        porcentajeCapitalRecuperado: 0,
      });
      return;
    }

    const util2 = calcularUtilidad2(cuotasPagadas, montoOriginal, totalInteres, numeroCuotas, interesAcumulado);
    const util3 = calcularUtilidad3(cuotasPagadas, montoOriginal, interesAcumulado);
    const porcentaje = calcularPorcentajeCapitalRecuperado(cuotasPagadas, montoOriginal);

    setUtilidades({
      utilidad1: util1,
      utilidad2: util2,
      utilidad3: util3,
      porcentajeCapitalRecuperado: porcentaje,
    });
  }, [datosPrestamoOriginal, cuotasPagadas, sinCronograma, interesAcumulado]);

  if (!datosPrestamoOriginal) return null;

  const montoOriginal = datosPrestamoOriginal.montoOriginal;
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  const capitalRecuperado = Math.min(totalPagado, montoOriginal);

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

const LoanInstallmentsManager = ({ 
  cuotas, 
  onAplicarPago,
  onCambiarFecha,
  onEliminarPago,
  montoOriginal,
  tasaMensual,
  numeroCuotas
}) => {
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);
  const [dialogoFechaAbierto, setDialogoFechaAbierto] = useState(false);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
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

  const handleAbrirDialogoPago = (index) => {
    setIndexSeleccionado(index);
    setDialogoPagoAbierto(true);
  };

  const handleAbrirDialogoFecha = (index) => {
    setIndexSeleccionado(index);
    setDialogoFechaAbierto(true);
  };

  const handleAbrirDialogoEliminar = (index) => {
    setIndexSeleccionado(index);
    setDialogoEliminarAbierto(true);
  };

  const handleConfirmarPago = (monto, distribucion, tipoPago) => {
    onAplicarPago(monto, distribucion, tipoPago);
  };

  const handleConfirmarCambioFecha = (nuevaFecha) => {
    onCambiarFecha(indexSeleccionado, nuevaFecha);
  };

  const handleConfirmarEliminar = () => {
    onEliminarPago(indexSeleccionado);
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
              <TableCell align="center"><strong>Acciones</strong></TableCell>
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
                  <Box display="flex" alignItems="center">
                    {dayjs(cuota.fecha_pago).format('DD/MM/YYYY')}
                    <Tooltip title="Editar fecha">
                      <IconButton 
                        size="small" 
                        onClick={() => handleAbrirDialogoFecha(index)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
                  <Box display="flex" gap={1} justifyContent="center">
                    {cuota.estado_pago !== 'pagado' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleAbrirDialogoPago(index)}
                        startIcon={<PaymentIcon />}
                      >
                        Pagar
                      </Button>
                    )}
                    {(cuota.abonado > 0) && (
                      <Tooltip title="Eliminar pagos de esta cuota">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleAbrirDialogoEliminar(index)}
                          startIcon={<CloseIcon />}
                        >
                          Eliminar
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DialogoPagoFlexible
        open={dialogoPagoAbierto}
        onClose={() => setDialogoPagoAbierto(false)}
        cuotas={cuotas}
        indexInicial={indexSeleccionado}
        montoOriginal={montoOriginal}
        tasaMensual={tasaMensual}
        numeroCuotas={numeroCuotas}
        onConfirmarPago={handleConfirmarPago}
      />

      <DialogoEditarFecha
        open={dialogoFechaAbierto}
        onClose={() => setDialogoFechaAbierto(false)}
        cuota={cuotas[indexSeleccionado]}
        onConfirmarCambio={handleConfirmarCambioFecha}
      />

      <DialogoConfirmarEliminarPago
        open={dialogoEliminarAbierto}
        onClose={() => setDialogoEliminarAbierto(false)}
        cuota={cuotas[indexSeleccionado]}
        onConfirmarEliminar={handleConfirmarEliminar}
      />
    </Box>
  );
};

// ============================================================================
// COMPONENTE: TAB DE HISTORIAL Y SEGUIMIENTO
// ============================================================================

const HistorialSeguimiento = ({ 
  datosPrestamoOriginal, 
  historial,
  cuotas,
  cuotasConPagos
}) => {
  if (!datosPrestamoOriginal) {
    return (
      <Alert severity="warning">
        No hay préstamo generado. Vuelva a la pestaña de configuración.
      </Alert>
    );
  }

  const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);
  const totalPendiente = cuotas.reduce((sum, c) => sum + (c.saldo || c.valor), 0);
  const porcentajePagado = (totalPagado / datosPrestamoOriginal.saldoTotalOriginal) * 100;

  const getIconoEvento = (tipo) => {
    switch (tipo) {
      case 'creacion':
        return <AddIcon />;
      case 'pago':
        return <MoneyIcon />;
      case 'eliminacion_pago':
        return <CloseIcon />;
      case 'cambio_fecha':
        return <CalendarIcon />;
      case 'ampliacion':
        return <SwapIcon />;
      case 'liquidacion':
        return <LiquidateIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getColorEvento = (tipo) => {
    switch (tipo) {
      case 'creacion':
        return 'primary';
      case 'pago':
        return 'success';
      case 'eliminacion_pago':
        return 'error';
      case 'cambio_fecha':
        return 'warning';
      case 'ampliacion':
        return 'info';
      case 'liquidacion':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'info.50' }}>
        <Typography variant="h5" gutterBottom color="primary">
          📋 Información General del Préstamo
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Datos del Préstamo
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Monto Original" 
                      secondary={`$${formatMoney(datosPrestamoOriginal.montoOriginal)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tasa de Interés" 
                      secondary={`${datosPrestamoOriginal.tasaOriginal}% mensual`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Número de Cuotas" 
                      secondary={datosPrestamoOriginal.numeroCuotasOriginal}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Valor de Cuota" 
                      secondary={`$${formatMoney(datosPrestamoOriginal.valorCuotaOriginal)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total a Pagar" 
                      secondary={`$${formatMoney(datosPrestamoOriginal.saldoTotalOriginal)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tipo de Préstamo" 
                      secondary={datosPrestamoOriginal.sinCronograma ? 'Sin Cronograma' : 'Con Cronograma'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Estado Actual
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Total Pagado" 
                      secondary={
                        <Typography variant="h6" color="success.main">
                          ${formatMoney(totalPagado)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total Pendiente" 
                      secondary={
                        <Typography variant="h6" color="error.main">
                          ${formatMoney(totalPendiente)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Progreso de Pago" 
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={porcentajePagado} 
                            sx={{ height: 10, borderRadius: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {porcentajePagado.toFixed(1)}% completado
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Cuotas Completamente Pagadas / Total" 
                      secondary={`${cuotasConPagos.filter(c => c.estado_pago === 'pagado').length} / ${datosPrestamoOriginal.numeroCuotasOriginal}`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {!datosPrestamoOriginal.sinCronograma && cuotasConPagos.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'success.50' }}>
          <Typography variant="h6" gutterBottom color="success.main">
            💵 Resumen de Pagos Realizados
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Cuota</strong></TableCell>
                  <TableCell><strong>Fecha de Pago</strong></TableCell>
                  <TableCell align="right"><strong>Valor Cuota</strong></TableCell>
                  <TableCell align="right"><strong>Abonado</strong></TableCell>
                  <TableCell align="right"><strong>Saldo</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cuotasConPagos.map((cuota, idx) => (
                  <TableRow key={idx}>
                    <TableCell>#{cuota.numero}</TableCell>
                    <TableCell>{dayjs(cuota.fecha_pago).format('DD/MM/YYYY')}</TableCell>
                    <TableCell align="right">${formatMoney(cuota.valor)}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      ${formatMoney(cuota.abonado || 0)}
                    </TableCell>
                    <TableCell align="right">${formatMoney(cuota.saldo || 0)}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={cuota.estado_pago === 'pagado' ? 'Pagado' : 'Parcial'} 
                        color={cuota.estado_pago === 'pagado' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          📜 Historial de Movimientos
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {historial.length === 0 ? (
          <Alert severity="info">
            No hay movimientos registrados aún. Todos los cambios y pagos se registrarán aquí.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {historial.map((evento, idx) => (
              <Card 
                key={idx} 
                variant="outlined" 
                sx={{ 
                  borderLeft: 4, 
                  borderLeftColor: `${getColorEvento(evento.tipo)}.main`,
                  '&:hover': {
                    boxShadow: 3,
                    transition: 'all 0.3s'
                  }
                }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar 
                          sx={{ 
                            bgcolor: `${getColorEvento(evento.tipo)}.main`,
                            mb: 1
                          }}
                        >
                          {getIconoEvento(evento.tipo)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                          {dayjs(evento.fecha).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                          {dayjs(evento.fecha).format('HH:mm')}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={10}>
                      <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        {evento.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {evento.descripcion}
                      </Typography>
                      {evento.monto && (
                        <Chip 
                          label={`Monto: $${formatMoney(evento.monto)}`}
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          📊 Estadísticas del Préstamo
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {historial.filter(h => h.tipo === 'pago').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pagos Realizados
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="error.main">
                {historial.filter(h => h.tipo === 'eliminacion_pago').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pagos Eliminados
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="warning.main">
                {historial.filter(h => h.tipo === 'cambio_fecha').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cambios de Fecha
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="success.main">
                ${formatMoney(totalPagado)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Recaudado
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
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

    const { totalInteres, saldoTotal, valorCuota } = calcularInteresSimple(
      montoOriginal,
      tasaOriginal,
      meses
    );

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

    if (isNaN(tasa) || tasa < 0) {
      alert('La tasa de interés debe ser 0 o mayor');
      return;
    }

    if (!plazo || plazo <= 0) {
      alert('El plazo debe ser mayor a 0');
      return;
    }

    const { totalInteres } = calcularInteresSimple(
      prestamoActual.montoOriginal,
      tasa,
      plazo
    );

    const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);
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
  const [montoPrestamo, setMontoPrestamo] = useState('1000000');
  const [porcentajeInteres, setPorcentajeInteres] = useState('10');
  const [duracionPrestamo, setDuracionPrestamo] = useState('10');
  const [tipoPrestamo, setTipoPrestamo] = useState('Mensual');
  const [fechaPrestamo, setFechaPrestamo] = useState(dayjs().format('YYYY-MM-DD'));
  const [diaCobro, setDiaCobro] = useState('1');
  const [prestamoSinCronograma, setPrestamoSinCronograma] = useState(false);
  const [cuotas, setCuotas] = useState([]);
  const [datosPrestamoOriginal, setDatosPrestamoOriginal] = useState(null);
  const [resumenActual, setResumenActual] = useState({});
  const [tabActual, setTabActual] = useState(0);
  const [prestamoGenerado, setPrestamoGenerado] = useState(false);
  const [plazoEditableSinCronograma, setPlazoEditableSinCronograma] = useState('');
  const [historial, setHistorial] = useState([]);
  const [interesAcumulado, setInteresAcumulado] = useState(0);
  const [dialogoLiquidacionAbierto, setDialogoLiquidacionAbierto] = useState(false);
  const [parametrosAmpliacion, setParametrosAmpliacion] = useState(null);
  const [dialogoCalcularPagoAbierto, setDialogoCalcularPagoAbierto] = useState(false);

  const agregarEvento = (tipo, titulo, descripcion, monto = null) => {
    const nuevoEvento = {
      tipo,
      titulo,
      descripcion,
      monto,
      fecha: new Date().toISOString(),
    };
    setHistorial(prev => [nuevoEvento, ...prev]);
  };

  const actualizarResumen = (cuotasActuales, capitalActual, tasaActual, numCuotasActual, saldoAplicado = 0) => {
    const cuotasConPagos = cuotasActuales.filter(c => c.abonado > 0);
    const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);
    const { valorCuota, saldoTotal } = calcularInteresSimple(capitalActual, tasaActual, numCuotasActual);
    setResumenActual({
      totalPagado,
      saldoAplicado,
      nuevoSaldoTotal: saldoTotal,
      nuevoValorCuota: valorCuota,
      capitalNuevo: capitalActual,
      numeroCuotasNuevas: numCuotasActual,
    });
  };

  const recalcularPrestamoSinCronograma = (nuevosPlazo) => {
    if (!datosPrestamoOriginal || !datosPrestamoOriginal.sinCronograma) return;
    const plazo = parseInt(nuevosPlazo);
    if (!plazo || plazo <= 0) return;

    const { valorCuota, saldoTotal, totalInteres, interesMensual } = 
      calcularInteresSimple(datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, plazo);
    
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

  const generarPlanCuotas = () => {
    const monto = parseMoney(montoPrestamo);
    const tasa = parseFloat(porcentajeInteres);
    const duracion = parseInt(duracionPrestamo);
    
    if (!monto || !tasa || !duracion) {
      alert('Complete todos los campos del préstamo');
      return;
    }

    const numeroCuotas = calcularNumeroCuotasPorDuracion(duracion, tipoPrestamo);
    const { valorCuota, saldoTotal, totalInteres, interesMensual } = calcularInteresSimple(monto, tasa, numeroCuotas);
    
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
      agregarEvento('creacion', 'Préstamo Creado (Sin Cronograma)', `Monto: $${formatMoney(monto)}, Tasa: ${tasa}%, Plazo: ${numeroCuotas} meses`, monto);
    } else {
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
      agregarEvento('creacion', 'Préstamo Creado', `Monto: $${formatMoney(monto)}, Tasa: ${tasa}%, ${numeroCuotas} cuotas de $${formatMoney(valorCuota)}`, monto);
    }
    
    setPrestamoGenerado(true);
    setTabActual(1);
  };

  const handleAplicarPago = (monto, distribucion, tipoPago, datosSaldo = null) => {
    if (tipoPago === 'interes') {
      setInteresAcumulado(prev => prev + monto);
      agregarEvento('pago', 'Pago de Interés Registrado', `Pago de interés personalizado: $${formatMoney(monto)}. Se suma a las 3 utilidades.`, monto);
      return;
    }

    if (tipoPago === 'pagar_saldo') {
      agregarEvento('pago', 'Pago de Saldo Registrado', `Saldo pagado: $${formatMoney(monto)}. Dinero prestado: $${formatMoney(datosSaldo.dineroPrestado)}, Abono: $${formatMoney(datosSaldo.abonoCliente)}, Tasa: ${datosSaldo.porcentajeInteres}%, Plazo: ${datosSaldo.tiempo} meses, Fecha: ${dayjs(datosSaldo.fechaPago).format('DD/MM/YYYY')}`, monto);
      return;
    }
    
    const nuevasCuotas = [...cuotas];
    let totalPagadoEnOperacion = 0;
    
    distribucion.forEach(dist => {
      const cuota = nuevasCuotas[dist.index];
      cuota.abonado = (cuota.abonado || 0) + dist.abonar;
      cuota.saldo = dist.saldoDespues;
      totalPagadoEnOperacion += dist.abonar;
      
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
      actualizarResumen(nuevasCuotas, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, datosPrestamoOriginal.numeroCuotasOriginal);
    }

    const cuotasAfectadas = distribucion.map(d => `#${d.numero}`).join(', ');
    agregarEvento('pago', 'Pago Registrado', `Pago de $${formatMoney(totalPagadoEnOperacion)} distribuido en cuota(s): ${cuotasAfectadas}`, totalPagadoEnOperacion);
  };

  const handleCambiarFecha = (index, nuevaFecha) => {
    const nuevasCuotas = [...cuotas];
    const cuota = nuevasCuotas[index];
    const fechaAnterior = cuota.fecha_pago;
    cuota.fecha_pago = nuevaFecha;
    setCuotas(nuevasCuotas);
    agregarEvento('cambio_fecha', `Fecha Modificada - Cuota #${cuota.numero}`, `Fecha anterior: ${dayjs(fechaAnterior).format('DD/MM/YYYY')}, Nueva fecha: ${dayjs(nuevaFecha).format('DD/MM/YYYY')}`);
  };

  const handleEliminarPago = (index) => {
    const nuevasCuotas = [...cuotas];
    const cuota = nuevasCuotas[index];
    const montoEliminado = cuota.abonado || 0;

    if (montoEliminado === 0) {
      alert('Esta cuota no tiene pagos para eliminar');
      return;
    }

    cuota.abonado = 0;
    cuota.saldo = cuota.valor;
    cuota.estado_pago = 'pendiente';
    setCuotas(nuevasCuotas);

    if (datosPrestamoOriginal) {
      actualizarResumen(nuevasCuotas, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, datosPrestamoOriginal.numeroCuotasOriginal);
    }

    agregarEvento('eliminacion_pago', `Pago Eliminado - Cuota #${cuota.numero}`, `Se eliminaron pagos por $${formatMoney(montoEliminado)}. La cuota volvió a estado pendiente.`, montoEliminado);
  };

  const iniciarProcesoAmpliacion = (params) => {
    setParametrosAmpliacion(params);
    setDialogoLiquidacionAbierto(true);
  };

  const confirmarLiquidacionYAmpliar = (datosLiquidacion) => {
    if (!parametrosAmpliacion || !datosPrestamoOriginal) return;

    const { montoAdicional, nuevaTasa, nuevasCuotas: numCuotasNuevas } = parametrosAmpliacion;
    const { saldoFavor } = datosLiquidacion;
    const capitalVigente = datosPrestamoOriginal.montoOriginal;
    const nuevoCapitalTotal = capitalVigente + montoAdicional;
    const { valorCuota, saldoTotal, totalInteres } = calcularInteresSimple(nuevoCapitalTotal, nuevaTasa, numCuotasNuevas);
    const primeraCuotaPendiente = cuotas.find(c => c.estado_pago !== 'pagado');
    const fechaInicio = primeraCuotaPendiente ? dayjs(primeraCuotaPendiente.fecha_pago) : dayjs().add(1, 'month');
    const nuevasFechas = calcularFechasCobro(fechaInicio, numCuotasNuevas, tipoPrestamo, diaCobro);
    const nuevoCronograma = nuevasFechas.map((fecha, index) => ({
      numero: index + 1,
      fecha_pago: fecha,
      valor: valorCuota,
      estado_pago: 'pendiente',
      abonado: 0,
      saldo: valorCuota,
    }));
    
    const cronogramaConSaldo = aplicarSaldoFavorACuotas(nuevoCronograma, saldoFavor);
    setCuotas(cronogramaConSaldo);
    setDatosPrestamoOriginal({
      montoOriginal: nuevoCapitalTotal,
      tasaOriginal: nuevaTasa,
      numeroCuotasOriginal: numCuotasNuevas,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: (nuevoCapitalTotal * nuevaTasa) / 100,
    });
    actualizarResumen(cronogramaConSaldo, nuevoCapitalTotal, nuevaTasa, numCuotasNuevas, saldoFavor);
    setMontoPrestamo(formatMoney(nuevoCapitalTotal));
    setPorcentajeInteres(nuevaTasa.toString());
    setDuracionPrestamo(numCuotasNuevas.toString());
    agregarEvento('liquidacion', 'Liquidación Realizada', `Interés de liquidación: $${formatMoney(datosLiquidacion.totalInteres)}, Saldo a favor: $${formatMoney(saldoFavor)}`, datosLiquidacion.totalInteres);
    agregarEvento('ampliacion', 'Ampliación de Préstamo', `Monto adicional: $${formatMoney(montoAdicional)}, Nuevo total: $${formatMoney(nuevoCapitalTotal)}, ${numCuotasNuevas} cuotas`, montoAdicional);
    setDialogoLiquidacionAbierto(false);
    setParametrosAmpliacion(null);
  };

  const handleConfirmarPagoCalculado = (datosCalculo) => {
    agregarEvento('pago', 'Pago de Saldo Calculado', `Dinero prestado: $${formatMoney(datosCalculo.dineroPrestado)}, Abono: $${formatMoney(datosCalculo.abonoCliente)}, Saldo pagado: $${formatMoney(datosCalculo.saldoFinal)} (${datosCalculo.porcentaje}% interés, ${datosCalculo.plazo} meses)`, datosCalculo.saldoFinal);
    setInteresAcumulado(prev => prev + datosCalculo.interesTotal);
    alert(`✅ Pago de saldo registrado exitosamente!\n\nSaldo pagado: $${formatMoney(datosCalculo.saldoFinal)}\nInterés incluido: $${formatMoney(datosCalculo.interesTotal)}\n\nEl interés se ha sumado a las 3 utilidades.`);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPrestamo(formatMoney(value));
  };

  const cuotasConPagos = cuotas.filter(c => c.abonado > 0);
  const cuotasCompletamentePagadas = cuotas.filter(c => c.estado_pago === 'pagado');

  const datosPrestamo = datosPrestamoOriginal ? {
    estado: "Crédito Vigente",
    numeroTarjeta: "#1",
    nombreCliente: "Omaira Saul",
    dineroPrestado: datosPrestamoOriginal.montoOriginal,
    plazoPrestamo: datosPrestamoOriginal.numeroCuotasOriginal,
    interes: datosPrestamoOriginal.tasaOriginal,
    valorCuota: datosPrestamoOriginal.valorCuotaOriginal,
    fechaPrestamo: fechaPrestamo,
    abonoTotalIntereses: resumenActual.totalPagado + datosPrestamoOriginal.totalInteresOriginal,
    abonoTotal: resumenActual.totalPagado || 0,
    saldoTotal: cuotas.reduce((sum, c) => sum + (c.saldo || c.valor), 0),
    saldoInversionIntereses: 0,
    interesesPendientes: cuotas.reduce((sum, c) => sum + (c.saldo || c.valor), 0),
    cuotasPagas: cuotasCompletamentePagadas.length,
    cuotasPendientes: cuotas.filter(c => c.estado_pago !== 'pagado').length,
    intereses: interesAcumulado,
    utilidadReal1: calcularUtilidad1(datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.saldoTotalOriginal, interesAcumulado),
    utilidadReal2: calcularUtilidad2(cuotasConPagos, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.totalInteresOriginal, datosPrestamoOriginal.numeroCuotasOriginal, interesAcumulado),
    utilidadReal3: calcularUtilidad3(cuotasConPagos, datosPrestamoOriginal.montoOriginal, interesAcumulado),
  } : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          🧪 Sistema Completo de Gestión de Préstamos
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Sistema con utilidades, pagos flexibles, interés personalizado, edición de fechas e historial completo de seguimiento
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Tabs value={tabActual} onChange={(e, newValue) => setTabActual(newValue)}>
          <Tab label="1. Configurar Préstamo" />
          <Tab label="2. Gestión y Ampliación" disabled={!prestamoGenerado} />
          <Tab label="3. Historial y Seguimiento" disabled={!prestamoGenerado} icon={<HistoryIcon />} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {tabActual === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Configure los parámetros del préstamo inicial y haga clic en "Generar Plan de Cuotas"
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Monto del Préstamo" value={montoPrestamo} onChange={handleMontoChange}
                    InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Porcentaje de Interés Mensual" type="number" value={porcentajeInteres}
                    onChange={(e) => setPorcentajeInteres(e.target.value)}
                    InputProps={{ endAdornment: <Typography sx={{ ml: 1 }}>%</Typography> }}
                    inputProps={{ step: '0.1', min: '0' }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Duración (meses)" type="number" value={duracionPrestamo}
                    onChange={(e) => setDuracionPrestamo(e.target.value)} inputProps={{ min: '1' }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth select label="Tipo de Préstamo" value={tipoPrestamo}
                    onChange={(e) => setTipoPrestamo(e.target.value)}>
                    <MenuItem value="Mensual">Mensual</MenuItem>
                    <MenuItem value="Quincenal">Quincenal</MenuItem>
                    <MenuItem value="Semanal">Semanal</MenuItem>
                    <MenuItem value="Diario">Diario</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Día de Cobro" type="number" value={diaCobro}
                    onChange={(e) => setDiaCobro(e.target.value)} inputProps={{ min: '1', max: '31' }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="date" label="Fecha del Préstamo" value={fechaPrestamo}
                    onChange={(e) => setFechaPrestamo(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel control={<Checkbox checked={prestamoSinCronograma}
                      onChange={(e) => setPrestamoSinCronograma(e.target.checked)} color="primary" />}
                    label={<Box><Typography variant="body1"><strong>Préstamo sin cronograma de cuotas</strong></Typography>
                      <Typography variant="caption" color="text.secondary">No se generarán cuotas mensuales, solo se mostrará el total a pagar</Typography></Box>} />
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

              {datosPrestamo && (
                <Box sx={{ mt: 4 }}>
                  <TarjetaInformacionPrestamo datosPrestamo={datosPrestamo} />
                </Box>
              )}
            </Box>
          )}

          {tabActual === 1 && (
            <Box>
              {datosPrestamoOriginal ? (
                <>
                  {datosPrestamo && (
                    <Box sx={{ mb: 3 }}>
                      <TarjetaInformacionPrestamo datosPrestamo={datosPrestamo} />
                    </Box>
                  )}

                  <UtilidadesPanel 
                    datosPrestamoOriginal={datosPrestamoOriginal}
                    cuotasPagadas={cuotasConPagos}
                    sinCronograma={datosPrestamoOriginal.sinCronograma}
                    interesAcumulado={interesAcumulado}
                  />

                  {datosPrestamoOriginal.sinCronograma ? (
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
                    <>
                      <LoanSummary datos={resumenActual} />
                      
                      <LoanInstallmentsManager
                        cuotas={cuotas}
                        onAplicarPago={handleAplicarPago}
                        onCambiarFecha={handleCambiarFecha}
                        onEliminarPago={handleEliminarPago}
                        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
                        tasaMensual={datosPrestamoOriginal?.tasaOriginal || 0}
                        numeroCuotas={datosPrestamoOriginal?.numeroCuotasOriginal || 0}
                      />
                      
                      <PagoAnticipado
                        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
                        tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
                        numeroCuotasOriginal={datosPrestamoOriginal?.numeroCuotasOriginal || 0}
                      />
                      
                      <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(33, 150, 243, 0.05)' }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          🧮 Calcular y Pagar Saldo
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                          <strong>Método de Cálculo Automático:</strong><br />
                          Ingrese el dinero prestado, el abono del cliente, el porcentaje de interés y el tiempo 
                          para calcular automáticamente el saldo total a pagar.
                        </Alert>

                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={() => setDialogoCalcularPagoAbierto(true)}
                          startIcon={<CalculateIcon />}
                        >
                          Abrir Calculadora de Saldo
                        </Button>
                      </Paper>
                      
                      <LoanExtensionPanel
                        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
                        tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
                        cuotasRestantes={
                          cuotas.filter(c => c.estado_pago !== 'pagado').length
                        }
                        cuotasPagadas={cuotasCompletamentePagadas.length}
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

          {tabActual === 2 && (
            <HistorialSeguimiento
              datosPrestamoOriginal={datosPrestamoOriginal}
              historial={historial}
              cuotas={cuotas}
              cuotasConPagos={cuotasConPagos}
            />
          )}
        </Box>
      </Paper>

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

      <DialogoCalcularPagoSaldo
        open={dialogoCalcularPagoAbierto}
        onClose={() => setDialogoCalcularPagoAbierto(false)}
        onConfirmarPago={handleConfirmarPagoCalculado}
      />

    </Container>
  );
};

export default ClientesTest;