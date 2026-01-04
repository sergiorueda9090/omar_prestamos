import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Tooltip
} from '@mui/material';
import {
  History,
  CalendarToday,
  Person,
  Description,
  MonetizationOn,
  AttachMoney,
  AccountBalanceWallet,
  EventAvailable,
  Payment
} from '@mui/icons-material';

const getColorTipoPago = (tipoPago) => {
  switch(tipoPago) {
    case "Abonar a Capital":
      return "#4caf50";
    case "Pagar Interés":
      return "#ff9800";
    case "Liquidar Préstamo":
      return "#f44336";
    case "Próxima Cuota":
      return "#2196f3";
    default:
      return "#757575";
  }
};

const getIconoTipoPago = (tipoPago) => {
  switch(tipoPago) {
    case "Abonar a Capital":
      return <MonetizationOn sx={{ fontSize: 16 }} />;
    case "Pagar Interés":
      return <AttachMoney sx={{ fontSize: 16 }} />;
    case "Liquidar Préstamo":
      return <AccountBalanceWallet sx={{ fontSize: 16 }} />;
    case "Próxima Cuota":
      return <EventAvailable sx={{ fontSize: 16 }} />;
    default:
      return <Payment sx={{ fontSize: 16 }} />;
  }
};

const HistorialPagos = ({ historial, totalPagado }) => {
  if (!historial || historial.length === 0) {
    return (
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <History color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h6" fontWeight="bold">
              Historial de Pagos
            </Typography>
          </Box>
          <Box textAlign="center" py={4}>
            <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No hay pagos registrados en el historial.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <History color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Historial de Pagos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registro detallado de todas las transacciones realizadas
              </Typography>
            </Box>
          </Box>
          <Paper 
            elevation={2} 
            sx={{ 
              px: 2.5, 
              py: 1, 
              backgroundColor: '#4caf50',
              borderRadius: 2
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
              Total Pagado
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
              ${totalPagado.toLocaleString('es-CO')}
            </Typography>
          </Paper>
        </Box>

        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#667eea' }}>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  ID
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Fecha
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Tipo de Pago
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Monto
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Método
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Referencia
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Usuario
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Observaciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historial.map((pago) => (
                <TableRow
                  key={pago.id}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell align="center">
                    <Chip 
                      label={`#${pago.id}`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#e0e0e0',
                        fontWeight: 'bold'
                      }} 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {pago.fecha}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={getIconoTipoPago(pago.tipoPago)}
                      label={pago.tipoPago}
                      size="small"
                      sx={{
                        backgroundColor: getColorTipoPago(pago.tipoPago),
                        color: 'white',
                        fontWeight: 'bold',
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold" color="success.main" variant="body2">
                      ${parseFloat(pago.monto).toLocaleString('es-CO')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={pago.metodoPago}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {pago.referencia}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {pago.usuario}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={pago.observaciones} arrow>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {pago.observaciones}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell colSpan={3} align="right">
                  <Typography variant="body1" fontWeight="bold">
                    TOTAL PAGADO:
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ${totalPagado.toLocaleString('es-CO')}
                  </Typography>
                </TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default HistorialPagos;