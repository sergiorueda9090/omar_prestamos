import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
  AccountBalance as LiquidateIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  SwapHoriz as SwapIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  formatMoney,
  parseMoney,
  calcularInteresSimple,
  calcularInteresCuota,
  calcularFechasCobro,
} from '../utils/loanCalculations';
import TarjetaInformacionPrestamo from './TarjetaInformacionPrestamo';
import BotonesPagoRapido from './BotonesPagoRapido';
import BotonesPagoSinCronograma, { DialogoConfirmarCambioPlazo } from './BotonesPagoSinCronograma';

// ============================================================================
// DIÁLOGO: CONFIRMAR ELIMINAR PAGO
// ============================================================================

export const DialogoConfirmarEliminarPago = ({
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
        </Alert>
        <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Cuota:</strong> #{cuota.numero}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Abonado:</strong> ${formatMoney(cuota.abonado || 0)}</Typography>
              </Grid>
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
// DIÁLOGO: EDITAR FECHA
// ============================================================================

export const DialogoEditarFecha = ({
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
        <TextField
          fullWidth
          type="date"
          label="Nueva Fecha de Pago"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="primary">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// DIÁLOGO: PAGO FLEXIBLE
// ============================================================================

export const DialogoPagoFlexible = ({
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
    if (tipo === 'completo') {
      setMontoPago(formatMoney(saldoCuotaActual));
      calcularDistribucion(saldoCuotaActual);
    } else {
      setMontoPago('');
      setDistribucion([]);
    }
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoPago(formatMoney(value));
    if (tipoPago !== 'interes') {
      calcularDistribucion(value);
    }
  };

  const handleConfirmar = () => {
    const monto = parseMoney(montoPago);
    if (!monto || monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    onConfirmarPago(monto, distribucion, tipoPago);
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
          <IconButton onClick={handleCerrar} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Saldo Pendiente:</strong> ${formatMoney(saldoCuotaActual)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Interés Cuota:</strong> ${formatMoney(interesCuota)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={1} sx={{ mb: 3 }}>
          {['completo', 'interes', 'personalizado'].map((tipo) => (
            <Grid item xs={4} key={tipo}>
              <Button
                fullWidth
                variant={tipoPago === tipo ? 'contained' : 'outlined'}
                onClick={() => handleTipoPagoChange(tipo)}
                color={tipo === 'completo' ? 'success' : tipo === 'interes' ? 'warning' : 'primary'}
              >
                {tipo === 'completo' ? 'Pago Completo' : tipo === 'interes' ? 'Pago Interés' : 'Personalizado'}
              </Button>
            </Grid>
          ))}
        </Grid>

        <TextField
          fullWidth
          label="Monto a Pagar"
          value={montoPago}
          onChange={handleMontoChange}
          disabled={tipoPago === 'completo'}
          InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
        />

        {distribucion.length > 0 && tipoPago !== 'interes' && (
          <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'info.50' }}>
            <CardContent>
              <Typography variant="subtitle2" color="info.main" gutterBottom>Distribución del Pago</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cuota</TableCell>
                      <TableCell align="right">Abonar</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distribucion.map((dist, idx) => (
                      <TableRow key={idx}>
                        <TableCell>#{dist.numero}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          ${formatMoney(dist.abonar)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={dist.estado === 'pagado' ? 'Pagado' : 'Parcial'} color={dist.estado === 'pagado' ? 'success' : 'warning'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="success" disabled={!montoPago || parseMoney(montoPago) <= 0}>
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// DIÁLOGO: CALCULAR PAGO SALDO
// ============================================================================

export const DialogoCalcularPagoSaldo = ({
  open,
  onClose,
  onConfirmarPago
}) => {
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

    if (!prestado || prestado <= 0) {
      alert('El dinero prestado debe ser mayor a 0');
      return;
    }

    // plazo es en meses, igual que cuotas para este cálculo
    const { saldoTotal, totalInteres } = calcularInteresSimple(prestado, interes || 0, plazo || 1, plazo || 1);
    const saldoFinal = saldoTotal - (abono || 0);

    setSaldoCalculado({
      dineroPrestado: prestado,
      abonoCliente: abono || 0,
      porcentaje: interes || 0,
      plazo: plazo || 1,
      totalAPagar: saldoTotal,
      saldoFinal: Math.max(0, saldoFinal),
      interesTotal: totalInteres,
    });
  };

  const handleConfirmar = () => {
    if (!saldoCalculado) {
      alert('Primero debe calcular el saldo');
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
    setSaldoCalculado(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Calcular y Pagar Saldo</Typography>
          <IconButton onClick={handleCerrar} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dinero Prestado"
              value={dineroPrestado}
              onChange={(e) => setDineroPrestado(formatMoney(e.target.value.replace(/\D/g, '')))}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Abono del Cliente"
              value={abonoCliente}
              onChange={(e) => setAbonoCliente(formatMoney(e.target.value.replace(/\D/g, '')))}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Porcentaje de Interés"
              type="number"
              value={porcentajeInteres}
              onChange={(e) => setPorcentajeInteres(e.target.value)}
              InputProps={{ endAdornment: <Typography sx={{ ml: 1 }}>%</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tiempo (meses)"
              type="number"
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" color="primary" onClick={calcularSaldo} startIcon={<CalculateIcon />}>
              Calcular Saldo
            </Button>
          </Grid>
        </Grid>

        {saldoCalculado && (
          <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'success.50' }}>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>Resultado del Cálculo</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total a Pagar</Typography>
                  <Typography variant="h6">${formatMoney(saldoCalculado.totalAPagar)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Saldo Final</Typography>
                  <Typography variant="h5" color="success.main" fontWeight="bold">${formatMoney(saldoCalculado.saldoFinal)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCerrar} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="success" disabled={!saldoCalculado}>
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// COMPONENTE: GESTOR DE CUOTAS
// ============================================================================

export const LoanInstallmentsManager = ({
  cuotas,
  onCambiarFecha,
  onEliminarPago,
  pagosIntereses = [],
  onEliminarPagoInteres,
}) => {
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
    return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
  };

  const getRowBackground = (estado) => {
    switch (estado) {
      case 'pagado':
        return 'rgba(76, 175, 80, 0.1)';
      case 'parcial':
        return 'rgba(255, 152, 0, 0.1)';
      default:
        return '#fff';
    }
  };

  const headers = ['N°', 'Fecha', 'Valor', 'Abonado', 'Saldo', 'Estado', 'Acciones'];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>Cronograma de Cuotas</Typography>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          {headers.map((header, idx) => (
            <Box
              key={idx}
              sx={{
                p: 1.5,
                textAlign: 'center',
                borderRight: idx < headers.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                {header}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Body Grid */}
        {cuotas.map((cuota, index) => (
          <Box
            key={index}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              backgroundColor: getRowBackground(cuota.estado_pago),
              borderBottom: index < cuotas.length - 1 ? '1px solid #dee2e6' : 'none',
              '&:hover': {
                backgroundColor: cuota.estado_pago === 'pagado'
                  ? 'rgba(76, 175, 80, 0.15)'
                  : cuota.estado_pago === 'parcial'
                    ? 'rgba(255, 152, 0, 0.15)'
                    : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {/* N° */}
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{index + 1}</Typography>
            </Box>

            {/* Fecha */}
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2">{dayjs(cuota.fecha_pago).format('DD/MM/YYYY')}</Typography>
              <Tooltip title="Editar fecha">
                <IconButton size="small" onClick={() => { setIndexSeleccionado(index); setDialogoFechaAbierto(true); }} sx={{ ml: 0.5 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Valor */}
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2">${formatMoney(cuota.valor)}</Typography>
            </Box>

            {/* Abonado */}
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2" sx={{ color: cuota.abonado > 0 ? 'success.main' : 'inherit', fontWeight: cuota.abonado > 0 ? 'bold' : 'normal' }}>
                ${formatMoney(cuota.abonado || 0)}
              </Typography>
            </Box>

            {/* Saldo */}
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              <Typography variant="body2" sx={{ color: (cuota.saldo || cuota.valor) > 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                ${formatMoney(cuota.saldo || cuota.valor)}
              </Typography>
            </Box>

            {/* Estado */}
            <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
              {getEstadoChip(cuota.estado_pago)}
            </Box>

            {/* Acciones */}
            <Box sx={{ p: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              {cuota.abonado > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => { setIndexSeleccionado(index); setDialogoEliminarAbierto(true); }}
                  sx={{ minWidth: 'auto', px: 1, fontSize: '11px' }}
                  title="Eliminar pago"
                >
                  <CloseIcon fontSize="small" />
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Sección de Pagos de Intereses */}
      {pagosIntereses && pagosIntereses.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
            <MoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Pagos de Intereses
          </Typography>

          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 1fr 100px',
                backgroundColor: 'warning.main',
                color: 'white',
              }}
            >
              {['N°', 'Fecha', 'Tipo', 'Monto', 'Acciones'].map((header, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    borderRight: idx < 4 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                    {header}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Body */}
            {pagosIntereses.map((pago, index) => (
              <Box
                key={pago.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1fr 1fr 100px',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  borderBottom: index < pagosIntereses.length - 1 ? '1px solid #dee2e6' : 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.15)',
                  },
                }}
              >
                {/* N° */}
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>INT-{index + 1}</Typography>
                </Box>

                {/* Fecha */}
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Typography variant="body2">{dayjs(pago.fecha).format('DD/MM/YYYY')}</Typography>
                </Box>

                {/* Tipo */}
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Chip
                    label={pago.tipo === 'liquidacion' ? 'Liquidación' : 'Interés'}
                    color={pago.tipo === 'liquidacion' ? 'error' : 'warning'}
                    size="small"
                    icon={<MoneyIcon />}
                  />
                </Box>

                {/* Monto */}
                <Box sx={{ p: 1.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #dee2e6' }}>
                  <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 'bold' }}>
                    ${formatMoney(pago.monto)}
                  </Typography>
                </Box>

                {/* Acciones */}
                <Box sx={{ p: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tooltip title="Eliminar pago de interés">
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onEliminarPagoInteres && onEliminarPagoInteres(pago.id)}
                      sx={{ minWidth: 'auto', px: 1, fontSize: '11px' }}
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            ))}

            {/* Total de Intereses */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 1fr 100px',
                backgroundColor: 'warning.light',
                borderTop: '2px solid',
                borderColor: 'warning.main',
              }}
            >
              <Box sx={{ p: 1.5, gridColumn: 'span 3', textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Total Intereses Pagados:
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                  ${formatMoney(pagosIntereses.reduce((sum, p) => sum + p.monto, 0))}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5 }} />
            </Box>
          </Paper>
        </Box>
      )}

      <DialogoEditarFecha
        open={dialogoFechaAbierto}
        onClose={() => setDialogoFechaAbierto(false)}
        cuota={cuotas[indexSeleccionado]}
        onConfirmarCambio={(fecha) => onCambiarFecha(indexSeleccionado, fecha)}
      />
      <DialogoConfirmarEliminarPago
        open={dialogoEliminarAbierto}
        onClose={() => setDialogoEliminarAbierto(false)}
        cuota={cuotas[indexSeleccionado]}
        onConfirmarEliminar={() => onEliminarPago(indexSeleccionado)}
      />
    </Box>
  );
};

// ============================================================================
// COMPONENTE: PAGO ANTICIPADO
// ============================================================================

export const PagoAnticipado = ({
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

    // Para pago anticipado, meses = cuotas (se paga mensual)
    const { totalInteres, saldoTotal, valorCuota } = calcularInteresSimple(montoOriginal, tasaOriginal, meses, meses);
    const ahorroInteres = meses < numeroCuotasOriginal
      ? calcularInteresSimple(montoOriginal, tasaOriginal, numeroCuotasOriginal, numeroCuotasOriginal).totalInteres - totalInteres
      : 0;

    setCalculoPago({ meses, totalInteres, totalAPagar: saldoTotal, valorCuota, ahorro: ahorroInteres });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="success.dark">¿En cuántos meses quiere pagar?</Typography>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Meses"
            type="number"
            value={mesesPago}
            onChange={(e) => setMesesPago(e.target.value)}
            inputProps={{ min: '1' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button fullWidth variant="contained" color="success" onClick={calcularPagoAnticipado} startIcon={<CalculateIcon />}>
            Calcular
          </Button>
        </Grid>
      </Grid>

      {calculoPago && (
        <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'success.50', border: 2, borderColor: 'success.main' }}>
          <CardContent>
            <Typography variant="h6" color="success.main" gutterBottom>Resultado</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total a Pagar</Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">${formatMoney(calculoPago.totalAPagar)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Valor Cuota</Typography>
                <Typography variant="h6">${formatMoney(calculoPago.valorCuota)}</Typography>
              </Grid>
            </Grid>
            {calculoPago.ahorro > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>Ahorro:</strong> ${formatMoney(calculoPago.ahorro)}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

// ============================================================================
// COMPONENTE: PANEL DE AMPLIACIÓN
// ============================================================================

export const LoanExtensionPanel = ({
  montoOriginal,
  tasaOriginal,
  cuotasRestantes,
  cuotasPagadas,
  totalAbonado,
  numeroCuotasOriginal,
  onAplicarAmpliacion
}) => {
  const [montoAdicional, setMontoAdicional] = useState('');
  const [nuevaTasa, setNuevaTasa] = useState(tasaOriginal.toString());
  const [nuevasCuotas, setNuevasCuotas] = useState('12');

  // Calcular el interés de liquidación (usando la tasa original y cuotas restantes)
  const { totalInteres: interesLiquidacion } = calcularInteresSimple(
    montoOriginal,
    tasaOriginal,
    cuotasRestantes
  );

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMontoAdicional(formatMoney(value));
  };

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

    onAplicarAmpliacion({ montoAdicional: monto, nuevaTasa: tasa, nuevasCuotas: cuotas });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary">
        <AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Configurar Ampliación del Préstamo
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        Al hacer clic en "Iniciar Ampliación", se abrirá el proceso de liquidación.
        El saldo a favor se aplicará automáticamente a las nuevas cuotas.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Monto Adicional"
            value={montoAdicional}
            onChange={handleMontoChange}
            placeholder="0"
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
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
            Información del Préstamo
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Monto vigente:</strong> ${formatMoney(montoOriginal)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Tasa actual:</strong> {tasaOriginal}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Cuotas totales:</strong> {numeroCuotasOriginal}
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
                <strong>Abono Total:</strong>{' '}
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  ${formatMoney(totalAbonado)}
                </span>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Intereses (Liquidación):</strong>{' '}
                <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  ${formatMoney(interesLiquidacion)}
                </span>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Monto × Tasa × Cuotas restantes)
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Saldo a Favor Estimado:</strong>{' '}
                <span style={{
                  color: totalAbonado - interesLiquidacion >= 0 ? '#2e7d32' : '#d32f2f',
                  fontWeight: 'bold'
                }}>
                  ${formatMoney(totalAbonado - interesLiquidacion)}
                </span>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Abono Total - Intereses)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Paper>
  );
};

// ============================================================================
// COMPONENTE: DIÁLOGO LIQUIDACIÓN
// ============================================================================

export const LiquidacionDialog = ({
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
      const cuotasRestantes = prestamoActual.numeroCuotasOriginal - cuotasConPagos.filter(c => c.estado_pago === 'pagado').length;
      setPlazoLiquidacion(cuotasRestantes.toString());
      setDatosCalculados(null);
    }
  }, [open, prestamoActual, cuotasConPagos]);

  const calcularLiquidacion = () => {
    if (!prestamoActual) return;

    const tasa = parseFloat(tasaLiquidacion);
    const plazo = parseInt(plazoLiquidacion);

    if (!tasa || tasa <= 0 || !plazo || plazo <= 0) {
      alert('Por favor ingrese valores válidos para la tasa y el plazo');
      return;
    }

    // Calcular interés total de liquidación
    const { totalInteres } = calcularInteresSimple(
      prestamoActual.montoOriginal,
      tasa,
      plazo
    );

    // Calcular total pagado por el cliente
    const totalPagado = cuotasConPagos.reduce((sum, c) => sum + (c.abonado || 0), 0);

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
          Para ampliar el crédito, primero debe liquidar el préstamo actual.
          El saldo a favor se aplicará a las primeras cuotas de la ampliación.
        </Alert>

        {/* Información del Préstamo Actual */}
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Información del Préstamo Actual
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
                  <strong>Cuotas Pagadas:</strong> {cuotasConPagos.filter(c => c.estado_pago === 'pagado').length}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Total Pagado:</strong>{' '}
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    ${formatMoney(cuotasConPagos.reduce((sum, c) => sum + (c.abonado || 0), 0))}
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
              helperText="Tasa para calcular el interés de liquidación"
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
                Resultado de la Liquidación
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Interés (Liquidación)
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    ${formatMoney(datosCalculados.totalInteres)}
                  </Typography>
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
                    Este monto se abonará a las primeras cuotas de la ampliación
                  </Typography>
                </Grid>
              </Grid>

              {datosCalculados.saldoFavor < 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  El cliente tiene un saldo negativo. Se debe ajustar la liquidación.
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
// COMPONENTE: HISTORIAL SEGUIMIENTO
// ============================================================================

export const HistorialSeguimiento = ({
  datosPrestamoOriginal,
  historial,
  cuotas,
  cuotasConPagos
}) => {
  if (!datosPrestamoOriginal) {
    return <Alert severity="warning">No hay préstamo generado.</Alert>;
  }

  const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);
  const porcentajePagado = (totalPagado / datosPrestamoOriginal.saldoTotalOriginal) * 100;

  const getIconoEvento = (tipo) => {
    const iconos = {
      creacion: <AddIcon />,
      pago: <MoneyIcon />,
      eliminacion_pago: <CloseIcon />,
      cambio_fecha: <CalendarIcon />,
      ampliacion: <SwapIcon />,
      liquidacion: <LiquidateIcon />,
    };
    return iconos[tipo] || <InfoIcon />;
  };

  const getColorEvento = (tipo) => {
    const colores = {
      creacion: 'primary',
      pago: 'success',
      eliminacion_pago: 'error',
      cambio_fecha: 'warning',
      ampliacion: 'info',
      liquidacion: 'error',
    };
    return colores[tipo] || 'default';
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'info.50' }}>
        <Typography variant="h5" gutterBottom color="primary">Información General del Préstamo</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Capital</Typography>
            <Typography variant="h6">${formatMoney(datosPrestamoOriginal.montoOriginal)}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Total Pagado</Typography>
            <Typography variant="h6" color="success.main">${formatMoney(totalPagado)}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Progreso</Typography>
            <Typography variant="h6">{porcentajePagado.toFixed(1)}%</Typography>
          </Grid>
          <Grid item xs={12}>
            <LinearProgress variant="determinate" value={Math.min(porcentajePagado, 100)} sx={{ height: 10, borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Historial de Eventos</Typography>
        {historial.length === 0 ? (
          <Alert severity="info">No hay eventos registrados.</Alert>
        ) : (
          <List>
            {historial.map((evento, index) => (
              <ListItem key={index} sx={{ borderLeft: 3, borderColor: `${getColorEvento(evento.tipo)}.main`, mb: 1, backgroundColor: 'grey.50' }}>
                <Avatar sx={{ mr: 2, bgcolor: `${getColorEvento(evento.tipo)}.main` }}>
                  {getIconoEvento(evento.tipo)}
                </Avatar>
                <ListItemText
                  primary={evento.titulo}
                  secondary={
                    <>
                      {evento.descripcion}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(evento.fecha).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </>
                  }
                />
                {evento.monto && (
                  <Typography variant="h6" color={getColorEvento(evento.tipo) + '.main'}>
                    ${formatMoney(evento.monto)}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

// ============================================================================
// COMPONENTE: PRÉSTAMO SIN CRONOGRAMA
// ============================================================================

export const PrestamoSinCronograma = ({
  datosPrestamoOriginal,
  plazoEditableSinCronograma,
  setPlazoEditableSinCronograma,
  recalcularPrestamoSinCronograma,
  totalPagadoCuotas,
  interesAcumulado,
  onPagoCuota,
  onPagoInteres,
  iniciarProcesoAmpliacion,
}) => {
  const [dialogoConfirmarPlazoAbierto, setDialogoConfirmarPlazoAbierto] = useState(false);
  const [plazoTemporal, setPlazoTemporal] = useState('');
  const [mostrarFechasCobro, setMostrarFechasCobro] = useState(true);

  const handlePlazoChange = (e) => {
    const nuevoValor = e.target.value;
    if (nuevoValor && parseInt(nuevoValor) > 0 && nuevoValor !== plazoEditableSinCronograma) {
      setPlazoTemporal(nuevoValor);
      setDialogoConfirmarPlazoAbierto(true);
    }
  };

  const handleConfirmarCambioPlazo = (nuevoPlazo) => {
    setPlazoEditableSinCronograma(nuevoPlazo);
    recalcularPrestamoSinCronograma(nuevoPlazo);
    setPlazoTemporal('');
  };

  const handleCancelarCambioPlazo = () => {
    setPlazoTemporal('');
    setDialogoConfirmarPlazoAbierto(false);
  };

  // Calcular saldo pendiente
  const saldoPendiente = (datosPrestamoOriginal?.saldoTotalOriginal || 0) - (totalPagadoCuotas || 0);

  // Calcular fechas de cobro para mostrar el cronograma de referencia
  const fechasCobro = (datosPrestamoOriginal?.fechaPrestamo && datosPrestamoOriginal?.tipoPrestamo)
    ? calcularFechasCobro(
        datosPrestamoOriginal.fechaPrestamo,
        datosPrestamoOriginal.numeroCuotasOriginal,
        datosPrestamoOriginal.tipoPrestamo,
        datosPrestamoOriginal.diaCobro
      )
    : [];

  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Préstamo sin cronograma de cuotas</strong><br />
        Puede ajustar el plazo de pago según las necesidades del cliente.
      </Alert>

      {/* Botones de Pago Rápido */}
      <BotonesPagoSinCronograma
        datosPrestamoOriginal={datosPrestamoOriginal}
        totalPagadoCuotas={totalPagadoCuotas || 0}
        interesAcumulado={interesAcumulado || 0}
        onPagoCuota={onPagoCuota}
        onPagoInteres={onPagoInteres}
        onAplicarAmpliacion={iniciarProcesoAmpliacion}
      />

      <Card sx={{ mb: 3, backgroundColor: 'info.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">Información del Préstamo</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Monto Prestado</Typography>
              <Typography variant="h5" color="primary">${formatMoney(datosPrestamoOriginal.montoOriginal)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Tasa de Interés</Typography>
              <Typography variant="h5" color="warning.main">{datosPrestamoOriginal.tasaOriginal}%</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                label="Plazo en Meses"
                type="number"
                value={plazoEditableSinCronograma}
                onChange={handlePlazoChange}
                inputProps={{ min: '1' }}
                helperText="Cambie el plazo para recalcular (requiere confirmación)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Interés Total</Typography>
              <Typography variant="h6" color="error.main">${formatMoney(datosPrestamoOriginal.totalInteresOriginal)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Total a Pagar</Typography>
              <Typography variant="h6" color="secondary.main">${formatMoney(datosPrestamoOriginal.saldoTotalOriginal)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Valor Cuota</Typography>
              <Typography variant="h6" color="success.main">${formatMoney(datosPrestamoOriginal.valorCuotaOriginal)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Fechas de Cobro */}
      {fechasCobro.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: 'rgba(25, 118, 210, 0.05)',
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer' }}
            onClick={() => setMostrarFechasCobro(!mostrarFechasCobro)}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon color="primary" />
              <Typography variant="subtitle1" color="primary" fontWeight="bold">
                Fechas de Cobro
              </Typography>
              <Chip
                label={`${fechasCobro.length} cuotas`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            {mostrarFechasCobro ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
          </Box>

          <Collapse in={mostrarFechasCobro}>
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              <strong>Tipo:</strong> {datosPrestamoOriginal.tipoPrestamo} |{' '}
              <strong>Primer cobro:</strong> {dayjs(fechasCobro[0]).format('DD/MM/YYYY')} |{' '}
              <strong>Último cobro:</strong> {dayjs(fechasCobro[fechasCobro.length - 1]).format('DD/MM/YYYY')}
            </Alert>

            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                      Cuota
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                      Fecha de Cobro
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                      Día
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                      Valor
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fechasCobro.map((fecha, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                      }}
                    >
                      <TableCell>
                        <Chip label={`#${index + 1}`} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {dayjs(fecha).format('DD/MM/YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {dayjs(fecha).format('dddd')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          ${formatMoney(datosPrestamoOriginal.valorCuotaOriginal)}
                        </Typography>
                      </TableCell>
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
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Pagado en Cuotas</Typography>
              <Typography variant="h6">${formatMoney(totalPagadoCuotas || 0)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Intereses Pagados</Typography>
              <Typography variant="h6">${formatMoney(interesAcumulado || 0)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Total Pagado</Typography>
              <Typography variant="h6" color="success.main">${formatMoney((totalPagadoCuotas || 0) + (interesAcumulado || 0))}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Saldo Pendiente</Typography>
              <Typography variant="h6" color={saldoPendiente > 0 ? 'error.main' : 'success.main'}>
                ${formatMoney(Math.max(0, saldoPendiente))}
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

      {/* Diálogo de confirmación de cambio de plazo */}
      <DialogoConfirmarCambioPlazo
        open={dialogoConfirmarPlazoAbierto}
        onClose={handleCancelarCambioPlazo}
        plazoActual={plazoEditableSinCronograma}
        plazoNuevo={plazoTemporal}
        datosPrestamoOriginal={datosPrestamoOriginal}
        totalPagadoCuotas={totalPagadoCuotas || 0}
        interesAcumulado={interesAcumulado || 0}
        onConfirmar={handleConfirmarCambioPlazo}
      />
    </>
  );
};

// ============================================================================
// COMPONENTE: PRÉSTAMO CON CRONOGRAMA
// ============================================================================

export const PrestamoConCronograma = ({
  datosPrestamoOriginal,
  resumenActual,
  cuotas,
  cuotasCompletamentePagadas,
  handleAplicarPago,
  handleCambiarFecha,
  handleEliminarPago,
  iniciarProcesoAmpliacion,
  onAbrirCalculadora,
  pagosIntereses,
  onEliminarPagoInteres,
}) => {
  return (
    <>
      {/* Botones de Pago Rápido */}
      <BotonesPagoRapido
        cuotas={cuotas}
        datosPrestamoOriginal={datosPrestamoOriginal}
        onAplicarPago={handleAplicarPago}
      />

      <LoanInstallmentsManager
        cuotas={cuotas}
        onCambiarFecha={handleCambiarFecha}
        onEliminarPago={handleEliminarPago}
        pagosIntereses={pagosIntereses}
        onEliminarPagoInteres={onEliminarPagoInteres}
      />
      <PagoAnticipado
        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
        tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
        numeroCuotasOriginal={datosPrestamoOriginal?.numeroCuotasOriginal || 0}
      />
      <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(33, 150, 243, 0.05)' }}>
        <Typography variant="h6" gutterBottom color="primary">Calcular y Pagar Saldo</Typography>
        <Button fullWidth variant="contained" color="primary" size="large" onClick={onAbrirCalculadora} startIcon={<CalculateIcon />}>
          Abrir Calculadora de Saldo
        </Button>
      </Paper>
      <LoanExtensionPanel
        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
        tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
        numeroCuotasOriginal={datosPrestamoOriginal?.numeroCuotasOriginal || 0}
        cuotasRestantes={cuotas.filter(c => c.estado_pago !== 'pagado').length}
        cuotasPagadas={cuotasCompletamentePagadas.length}
        totalAbonado={cuotas.reduce((sum, c) => sum + (c.abonado || 0), 0)}
        onAplicarAmpliacion={iniciarProcesoAmpliacion}
      />
    </>
  );
};

// ============================================================================
// COMPONENTE: TAB DE GESTIÓN
// ============================================================================

export const TabGestion = ({
  datosPrestamoOriginal,
  datosPrestamo,
  cuotasConPagos,
  interesAcumulado,
  plazoEditableSinCronograma,
  setPlazoEditableSinCronograma,
  recalcularPrestamoSinCronograma,
  resumenActual,
  cuotas,
  cuotasCompletamentePagadas,
  handleAplicarPago,
  handleCambiarFecha,
  handleEliminarPago,
  iniciarProcesoAmpliacion,
  onAbrirCalculadora,
  totalPagadoCuotasSinCronograma,
  onPagoCuotaSinCronograma,
  onPagoInteresSinCronograma,
  pagosIntereses,
  onEliminarPagoInteres,
}) => {
  if (!datosPrestamoOriginal) {
    return <Alert severity="warning">No hay préstamo generado. Vuelva a la pestaña anterior.</Alert>;
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Información del Préstamo - size={4} */}
        <Grid size={4}>
          {datosPrestamo && (
            <TarjetaInformacionPrestamo datosPrestamo={datosPrestamo} />
          )}
        </Grid>

        {/* Cronograma de Cuotas - size={8} */}
        <Grid size={8}>
          {datosPrestamoOriginal.sinCronograma ? (
            <PrestamoSinCronograma
              datosPrestamoOriginal={datosPrestamoOriginal}
              plazoEditableSinCronograma={plazoEditableSinCronograma}
              setPlazoEditableSinCronograma={setPlazoEditableSinCronograma}
              recalcularPrestamoSinCronograma={recalcularPrestamoSinCronograma}
              totalPagadoCuotas={totalPagadoCuotasSinCronograma}
              interesAcumulado={interesAcumulado}
              onPagoCuota={onPagoCuotaSinCronograma}
              onPagoInteres={onPagoInteresSinCronograma}
              iniciarProcesoAmpliacion={iniciarProcesoAmpliacion}
            />
          ) : (
            <PrestamoConCronograma
              datosPrestamoOriginal={datosPrestamoOriginal}
              resumenActual={resumenActual}
              cuotas={cuotas}
              cuotasCompletamentePagadas={cuotasCompletamentePagadas}
              handleAplicarPago={handleAplicarPago}
              handleCambiarFecha={handleCambiarFecha}
              handleEliminarPago={handleEliminarPago}
              iniciarProcesoAmpliacion={iniciarProcesoAmpliacion}
              onAbrirCalculadora={onAbrirCalculadora}
              pagosIntereses={pagosIntereses}
              onEliminarPagoInteres={onEliminarPagoInteres}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
