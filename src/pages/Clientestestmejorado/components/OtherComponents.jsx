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
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  formatMoney,
  parseMoney,
  calcularInteresSimple,
  calcularInteresCuota,
} from '../utils/loanCalculations';
import TarjetaInformacionPrestamo from './TarjetaInformacionPrestamo';

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

    const { saldoTotal, totalInteres } = calcularInteresSimple(prestado, interes || 0, plazo || 1);
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
              {cuota.estado_pago !== 'pagado' && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => { setIndexSeleccionado(index); setDialogoPagoAbierto(true); }}
                  sx={{ minWidth: 'auto', px: 1, fontSize: '11px' }}
                >
                  <PaymentIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Pagar
                </Button>
              )}
              {cuota.abonado > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => { setIndexSeleccionado(index); setDialogoEliminarAbierto(true); }}
                  sx={{ minWidth: 'auto', px: 1, fontSize: '11px' }}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Paper>

      <DialogoPagoFlexible
        open={dialogoPagoAbierto}
        onClose={() => setDialogoPagoAbierto(false)}
        cuotas={cuotas}
        indexInicial={indexSeleccionado}
        montoOriginal={montoOriginal}
        tasaMensual={tasaMensual}
        numeroCuotas={numeroCuotas}
        onConfirmarPago={onAplicarPago}
      />
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

    const { totalInteres, saldoTotal, valorCuota } = calcularInteresSimple(montoOriginal, tasaOriginal, meses);
    const ahorroInteres = meses < numeroCuotasOriginal
      ? calcularInteresSimple(montoOriginal, tasaOriginal, numeroCuotasOriginal).totalInteres - totalInteres
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
  onAplicarAmpliacion
}) => {
  const [montoAdicional, setMontoAdicional] = useState('');
  const [nuevaTasa, setNuevaTasa] = useState(tasaOriginal.toString());
  const [nuevasCuotas, setNuevasCuotas] = useState('12');

  const handleAplicar = () => {
    const monto = parseMoney(montoAdicional);
    const tasa = parseFloat(nuevaTasa);
    const cuotas = parseInt(nuevasCuotas);

    if (!monto || monto <= 0) {
      alert('El monto adicional debe ser mayor a 0');
      return;
    }

    onAplicarAmpliacion({ montoAdicional: monto, nuevaTasa: tasa, nuevasCuotas: cuotas });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(33, 150, 243, 0.05)' }}>
      <Typography variant="h6" gutterBottom color="primary">Ampliación de Préstamo</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Agregue más dinero al préstamo actual. Se realizará una liquidación del préstamo vigente.
      </Alert>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Monto Adicional"
            value={montoAdicional}
            onChange={(e) => setMontoAdicional(formatMoney(e.target.value.replace(/\D/g, '')))}
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Nueva Tasa (%)"
            type="number"
            value={nuevaTasa}
            onChange={(e) => setNuevaTasa(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Nuevas Cuotas"
            type="number"
            value={nuevasCuotas}
            onChange={(e) => setNuevasCuotas(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth variant="contained" color="primary" onClick={handleAplicar} startIcon={<SwapIcon />}>
            Aplicar Ampliación
          </Button>
        </Grid>
      </Grid>
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
  const [datosCalculados, setDatosCalculados] = useState(null);

  useEffect(() => {
    if (open && prestamoActual) {
      const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);
      const { totalInteres } = calcularInteresSimple(
        prestamoActual.montoOriginal,
        prestamoActual.tasaOriginal,
        cuotasConPagos.length || 1
      );
      const saldoFavor = Math.max(0, totalPagado - prestamoActual.montoOriginal - totalInteres);

      setDatosCalculados({ totalPagado, totalInteres, saldoFavor });
    }
  }, [open, prestamoActual, cuotasConPagos]);

  if (!prestamoActual) return null;

  const handleConfirmar = () => {
    if (datosCalculados) {
      onConfirmarLiquidacion(datosCalculados);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <LiquidateIcon sx={{ mr: 1, color: 'error.main' }} />
          <Typography variant="h6">Liquidación del Préstamo</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Se liquidará el préstamo actual para aplicar la ampliación.
        </Alert>
        {datosCalculados && (
          <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Pagado</Typography>
                  <Typography variant="h6">${formatMoney(datosCalculados.totalPagado)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Saldo a Favor</Typography>
                  <Typography variant="h6" color="success.main">${formatMoney(datosCalculados.saldoFavor)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirmar} variant="contained" color="error">Confirmar Liquidación</Button>
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
}) => {
  const handlePlazoChange = (e) => {
    setPlazoEditableSinCronograma(e.target.value);
    if (e.target.value && parseInt(e.target.value) > 0) {
      recalcularPrestamoSinCronograma(e.target.value);
    }
  };

  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Préstamo sin cronograma de cuotas</strong><br />
        Puede ajustar el plazo de pago según las necesidades del cliente.
      </Alert>

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
                helperText="Cambie el plazo para recalcular"
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

      <PagoAnticipado
        montoOriginal={datosPrestamoOriginal.montoOriginal}
        tasaOriginal={datosPrestamoOriginal.tasaOriginal}
        numeroCuotasOriginal={datosPrestamoOriginal.numeroCuotasOriginal}
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
}) => {
  return (
    <>
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
        <Typography variant="h6" gutterBottom color="primary">Calcular y Pagar Saldo</Typography>
        <Button fullWidth variant="contained" color="primary" size="large" onClick={onAbrirCalculadora} startIcon={<CalculateIcon />}>
          Abrir Calculadora de Saldo
        </Button>
      </Paper>
      <LoanExtensionPanel
        montoOriginal={datosPrestamoOriginal?.montoOriginal || 0}
        tasaOriginal={datosPrestamoOriginal?.tasaOriginal || 0}
        cuotasRestantes={cuotas.filter(c => c.estado_pago !== 'pagado').length}
        cuotasPagadas={cuotasCompletamentePagadas.length}
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
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
