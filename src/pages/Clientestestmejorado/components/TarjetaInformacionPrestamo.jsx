import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material';
import dayjs from 'dayjs';
import { formatMoney } from '../utils/loanCalculations';

const TarjetaInformacionPrestamo = ({ datosPrestamo }) => {
  if (!datosPrestamo) return null;

  const {
    estado = "Vigente",
    numeroTarjeta = "1",
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

  const rows = [
    { label: 'Estado Credito', value: estado, isBold: true, isHighlight: true },
    { label: 'Numero de la tarjeta', value: `# ${numeroTarjeta}`, isBold: true },
    { label: 'Nombre del cliente', value: nombreCliente, isBold: true },
    { label: 'Dinero prestado', value: formatMoney(dineroPrestado), isBold: true },
    { label: 'Plazo prestamo', value: plazoPrestamo, isBold: true },
    { label: '% interes', value: `${interes}%`, isBold: true },
    { label: 'Valor cuota', value: formatMoney(valorCuota), isBold: true },
    { label: 'Fecha del prestamo', value: dayjs(fechaPrestamo).format('YYYY-MM-DD'), isBold: true },
    { label: 'Abono Total + intereses', value: formatMoney(abonoTotalIntereses), isBold: false },
    { label: 'Abono Total', value: formatMoney(abonoTotal), isBold: false },
    { label: 'Saldo Total', value: formatMoney(saldoTotal), isBold: false },
    { label: 'Saldo A Inversion + Intereses', value: formatMoney(saldoInversionIntereses), isBold: false },
    { label: 'Intereses Pendientes', value: formatMoney(interesesPendientes), isBold: false },
    { label: 'Cuotas Pagas', value: cuotasPagas, isBold: false },
    { label: 'Cuotas Pendientes', value: cuotasPendientes, isBold: false },
    { label: 'Intereses', value: formatMoney(intereses), isBold: false },
    { label: 'Utilidad Real 1', value: formatMoney(utilidadReal1), isBold: false },
    { label: 'Utilidad Real 2', value: formatMoney(utilidadReal2), isBold: false },
    { label: 'Utilidad Real 3', value: formatMoney(utilidadReal3), isBold: false },
  ];

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
      <Box sx={{ backgroundColor: 'primary.main', p: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
          }}
        >
          Información del Préstamo
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '13px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    width: '50%',
                    py: 1,
                  }}
                >
                  {row.label}
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: 'center',
                    fontSize: '13px',
                    borderBottom: '1px solid #dee2e6',
                    py: 1,
                    backgroundColor: row.isHighlight ? '#FFFF00' : 'inherit',
                  }}
                >
                  {row.isBold ? <strong>{row.value}</strong> : row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TarjetaInformacionPrestamo;
