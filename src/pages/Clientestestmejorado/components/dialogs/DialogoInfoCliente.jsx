import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { formatMoney, parseMoney } from '../../utils/loanCalculations';

// Muestra TODA la informacion de la tarjeta en un modal: datos del prestamo,
// todas las cuotas (pagadas / parciales / pendientes) y los intereses pagados.
//
// BORRADO SOLO DE LA VISTA (frontend), NUNCA de la base de datos:
//   - Click en el VALOR de una fila/celda  -> quita SOLO ese valor (esa celda).
//   - Click en el icono de papelera        -> quita la fila/registro completo.
// Al reabrir el modal todo vuelve a aparecer (el estado es local).
const DialogoInfoCliente = ({ open, onClose, cliente }) => {
  const dinero = (valor) => `$${formatMoney(parseMoney(valor))}`;
  const fecha = (valor) => (valor ? dayjs(valor).format('DD/MM/YYYY') : '—');

  // Construye la lista de filas de informacion a partir del cliente.
  const construirFilas = (c) => {
    if (!c) return [];
    const filas = [
      { key: 'monto_prestamo', label: 'Monto del Préstamo', value: dinero(c.monto_prestamo) },
      { key: 'porcentaje_interes', label: '% Interés', value: `${c.porcentaje_interes}%` },
      { key: 'tipo_prestamo', label: 'Tipo de Préstamo', value: c.tipo_prestamo || '—' },
      { key: 'duracion_prestamo', label: 'Duración', value: `${c.duracion_prestamo} meses` },
      { key: 'fecha_prestamo', label: 'Fecha del Préstamo', value: fecha(c.fecha_prestamo) },
      { key: 'dia_cobro', label: 'Día de Cobro', value: fecha(c.dia_cobro) },
      { key: 'numero_cuotas', label: 'N° de Cuotas', value: c.numero_cuotas },
      { key: 'valor_cuota', label: 'Valor Cuota', value: dinero(c.valor_cuota) },
      { key: 'interes_mensual', label: 'Interés Mensual', value: dinero(c.interes_mensual) },
      { key: 'total_interes_pagar', label: 'Total Interés a Pagar', value: dinero(c.total_interes_pagar) },
      { key: 'saldo_total_pagar', label: 'Saldo Total a Pagar', value: dinero(c.saldo_total_pagar) },
      { key: 'interes_acumulado', label: 'Interés Acumulado', value: dinero(c.interes_acumulado) },
    ];
    if (c.prestamo_sin_cronograma) {
      filas.push({
        key: 'sin_cronograma',
        label: 'Préstamo sin cronograma',
        value: `Sí — Pagado: ${dinero(c.total_pagado_cuotas_sin_cronograma)}`,
      });
    }
    return filas;
  };

  // Estado local: filas de info, cuotas e intereses (filas/registros completos).
  const [filas, setFilas] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [pagosIntereses, setPagosIntereses] = useState([]);
  // Celdas individuales ocultas (borrado por valor). Guarda claves tipo "cuota:12:fecha".
  const [celdasOcultas, setCeldasOcultas] = useState(() => new Set());

  // Reconstruye todo cada vez que se abre el modal o cambia el cliente
  // (asi las filas/registros/celdas quitados vuelven a aparecer al reabrir).
  useEffect(() => {
    if (open && cliente) {
      setFilas(construirFilas(cliente));
      setCuotas([...(cliente.cuotas || [])].sort((a, b) => a.numero - b.numero));
      setPagosIntereses([...(cliente.pagos_intereses || [])]);
      setCeldasOcultas(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cliente]);

  if (!cliente) return null;

  // --- Quitar SOLO de la vista (estado local); NO toca la base de datos ---

  // Quita una celda individual (un solo valor).
  const ocultarCelda = (key) => {
    setCeldasOcultas((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };
  const celdaOculta = (key) => celdasOcultas.has(key);

  // Quita una fila/registro completo.
  const quitarFila = (key) => {
    setFilas((prev) => prev.filter((f) => f.key !== key));
  };
  const quitarCuota = (cuota) => {
    setCuotas((prev) => prev.filter((c) => (c.id ?? c.numero) !== (cuota.id ?? cuota.numero)));
  };
  const quitarInteres = (pago) => {
    setPagosIntereses((prev) => prev.filter((p) => p.id !== pago.id));
  };

  const totalPagadas = cuotas.filter((c) => c.estado_pago === 'pagado').length;
  const totalParciales = cuotas.filter((c) => c.estado_pago === 'parcial').length;
  const totalPendientes = cuotas.filter((c) => c.estado_pago === 'pendiente').length;
  const totalIntereses = pagosIntereses.reduce((sum, p) => sum + parseMoney(p.monto), 0);

  const estadoChip = () => {
    if (cliente.estado === 'pagado') return <Chip size="small" label="Pagado" color="success" />;
    if (cliente.estado === 'perdido') return <Chip size="small" label="Perdido" color="error" />;
    return <Chip size="small" label="Vigente" color="primary" />;
  };

  const chipEstadoCuota = (estado) => {
    if (estado === 'pagado') return <Chip size="small" label="Pagado" color="success" />;
    if (estado === 'parcial') return <Chip size="small" label="Parcial" color="warning" />;
    return <Chip size="small" label="Pendiente" color="default" />;
  };

  // Celda de tabla con borrado por valor: al hacer click se oculta SOLO esa celda.
  const CeldaQuitable = ({ ocultaKey, align = 'left', children }) => (
    <TableCell
      align={align}
      onClick={() => ocultarCelda(ocultaKey)}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { backgroundColor: 'error.light', color: 'error.contrastText' },
      }}
    >
      {celdaOculta(ocultaKey) ? '' : children}
    </TableCell>
  );

  const hintBorrado =
    'Haz clic en cualquier valor para quitarlo de la vista (solo frontend). El icono 🗑 quita la fila completa.';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Información del Cliente</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{cliente.nombre || '—'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tarjeta: {cliente.numero_tarjeta || '—'}
            </Typography>
          </Box>
          {estadoChip()}
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>{hintBorrado}</Alert>

        <Divider sx={{ mb: 1 }} />

        {/* === DATOS DEL PRESTAMO === */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Datos del Préstamo
        </Typography>
        {/* Cada fila: click en el VALOR quita solo ese valor; papelera quita la fila */}
        {filas.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No hay información para mostrar.
          </Typography>
        ) : (
          filas.map((fila) => {
            const valorKey = `info:${fila.key}:value`;
            return (
              <Box
                key={fila.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {fila.label}
                  </Typography>
                  <Tooltip title="Clic para quitar este valor de la vista">
                    <Typography
                      variant="body2"
                      onClick={() => ocultarCelda(valorKey)}
                      sx={{
                        fontWeight: 600,
                        cursor: 'pointer',
                        userSelect: 'none',
                        display: 'inline-block',
                        px: 0.5,
                        borderRadius: 1,
                        '&:hover': { backgroundColor: 'error.light', color: 'error.contrastText' },
                      }}
                    >
                      {celdaOculta(valorKey) ? ' ' : fila.value}
                    </Typography>
                  </Tooltip>
                </Box>
                <Tooltip title="Quitar toda la fila de la vista">
                  <IconButton size="small" color="error" onClick={() => quitarFila(fila.key)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })
        )}

        {/* === CUOTAS (pagadas / parciales / pendientes) === */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Cuotas
          </Typography>

          {cliente.prestamo_sin_cronograma ? (
            <Alert severity="info">
              Este préstamo es <strong>sin cronograma</strong>, por lo que no tiene cuotas individuales.
              Total pagado: <strong>{dinero(cliente.total_pagado_cuotas_sin_cronograma)}</strong>.
            </Alert>
          ) : cuotas.length === 0 ? (
            <Alert severity="warning">Este préstamo no tiene cuotas registradas.</Alert>
          ) : (
            <>
              <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip size="small" label={`Total: ${cuotas.length}`} />
                <Chip size="small" color="success" label={`Pagadas: ${totalPagadas}`} />
                <Chip size="small" color="warning" label={`Parciales: ${totalParciales}`} />
                <Chip size="small" label={`Pendientes: ${totalPendientes}`} />
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>#</strong></TableCell>
                      <TableCell><strong>Fecha Pago</strong></TableCell>
                      <TableCell align="right"><strong>Valor</strong></TableCell>
                      <TableCell align="right"><strong>Abonado</strong></TableCell>
                      <TableCell align="right"><strong>Saldo</strong></TableCell>
                      <TableCell align="center"><strong>Estado</strong></TableCell>
                      <TableCell align="center"><strong>Acción</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cuotas.map((cuota) => {
                      const id = cuota.id ?? cuota.numero;
                      return (
                        <TableRow key={id} hover>
                          <CeldaQuitable ocultaKey={`cuota:${id}:numero`}>{cuota.numero}</CeldaQuitable>
                          <CeldaQuitable ocultaKey={`cuota:${id}:fecha`}>{fecha(cuota.fecha_pago)}</CeldaQuitable>
                          <CeldaQuitable ocultaKey={`cuota:${id}:valor`} align="right">{dinero(cuota.valor)}</CeldaQuitable>
                          <CeldaQuitable ocultaKey={`cuota:${id}:abonado`} align="right">{dinero(cuota.abonado)}</CeldaQuitable>
                          <CeldaQuitable ocultaKey={`cuota:${id}:saldo`} align="right">{dinero(cuota.saldo)}</CeldaQuitable>
                          <CeldaQuitable ocultaKey={`cuota:${id}:estado`} align="center">{chipEstadoCuota(cuota.estado_pago)}</CeldaQuitable>
                          <TableCell align="center">
                            <Tooltip title="Quitar toda la fila de la vista">
                              <IconButton size="small" color="error" onClick={() => quitarCuota(cuota)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>

        {/* === INTERESES PAGADOS === */}
        {pagosIntereses.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'warning.main' }}>
              Intereses Pagados
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Chip size="small" color="warning" label={`Registros: ${pagosIntereses.length}`} />
              <Chip size="small" label={`Total: ${dinero(totalIntereses)}`} />
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell align="right"><strong>Monto</strong></TableCell>
                    <TableCell><strong>Descripción</strong></TableCell>
                    <TableCell align="center"><strong>Acción</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagosIntereses.map((p) => (
                    <TableRow key={p.id} hover>
                      <CeldaQuitable ocultaKey={`interes:${p.id}:fecha`}>{fecha(p.fecha)}</CeldaQuitable>
                      <CeldaQuitable ocultaKey={`interes:${p.id}:tipo`}>
                        <Chip
                          size="small"
                          color={p.tipo === 'liquidacion' ? 'error' : 'warning'}
                          label={p.tipo === 'liquidacion' ? 'Liquidación' : 'Interés'}
                        />
                      </CeldaQuitable>
                      <CeldaQuitable ocultaKey={`interes:${p.id}:monto`} align="right">{dinero(p.monto)}</CeldaQuitable>
                      <CeldaQuitable ocultaKey={`interes:${p.id}:descripcion`}>{p.descripcion || '—'}</CeldaQuitable>
                      <TableCell align="center">
                        <Tooltip title="Quitar todo el registro de la vista">
                          <IconButton size="small" color="error" onClick={() => quitarInteres(p)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogoInfoCliente;
