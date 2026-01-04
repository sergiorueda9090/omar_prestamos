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
  Chip
} from '@mui/material';
import { Receipt, CalendarToday, CheckCircle, Schedule } from '@mui/icons-material';

const TablaCuotas = ({ cuotas }) => {
  if (!cuotas || cuotas.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Receipt color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Cuotas Programadas
            </Typography>
          </Box>
          <Box textAlign="center" py={4}>
            <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No hay cuotas registradas.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Receipt color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Cuotas Programadas
          </Typography>
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
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  N° Cuota
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Fecha de Pago
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Valor
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Estado
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cuotas.map((cuota, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell align="center">
                    <Chip label={`#${index + 1}`} size="small" color="default" />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {cuota.fecha_pago}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold" color="text.primary">
                      ${parseFloat(cuota.valor).toLocaleString('es-CO')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={cuota.estado_pago === "pagado" ? <CheckCircle /> : <Schedule />}
                      label={cuota.estado_pago.toUpperCase()}
                      color={cuota.estado_pago === "pagado" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TablaCuotas;