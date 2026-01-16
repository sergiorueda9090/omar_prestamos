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

  // Estilos comunes
  const headerCellStyle = {
    fontWeight: 'bold',
    fontSize: '16px',
    fontFamily: "'Open Sans', sans-serif",
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    width: '50%',
  };

  const valueCellStyle = {
    textAlign: 'center',
    fontSize: '16px',
    fontFamily: "'Open Sans', sans-serif",
    borderBottom: '1px solid #dee2e6',
  };

  const successCellStyle = {
    ...valueCellStyle,
    backgroundColor: '#198754',
    color: 'white',
  };

  // Filas de la tabla
  const rows = [
    {
      label: 'Estado Credito',
      value: estado,
      valueStyle: {
        ...valueCellStyle,
        backgroundColor: '#FFFF00',
        fontWeight: 'bold',
      },
    },
    {
      label: 'Numero de la tarjeta',
      value: numeroTarjeta,
      valueStyle: successCellStyle,
      bold: true,
    },
    {
      label: 'Nombre del cliente',
      value: nombreCliente,
      valueStyle: successCellStyle,
      bold: true,
    },
    {
      label: 'Dinero prestado',
      value: `$${formatMoney(dineroPrestado)}`,
      valueStyle: successCellStyle,
      bold: true,
    },
    {
      label: 'Plazo prestamo',
      value: plazoPrestamo,
      valueStyle: successCellStyle,
      bold: true,
    },
    {
      label: '% interes',
      value: `${interes}%`,
      valueStyle: successCellStyle,
      bold: true,
    },
    {
      label: 'Valor cuota',
      value: `$${formatMoney(valorCuota)}`,
      valueStyle: successCellStyle,
      bold: true,
    },
    {
      label: 'Fecha del prestamo',
      value: dayjs(fechaPrestamo).format('YYYY-MM-DD'),
      valueStyle: successCellStyle,
      bold: true,
    },
    {
      label: 'Abono Total + intereses',
      value: `$${formatMoney(abonoTotalIntereses)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Abono Total',
      value: `$${formatMoney(abonoTotal)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Saldo Total',
      value: `$${formatMoney(saldoTotal)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Saldo A Inversion + Intereses',
      value: `$${formatMoney(saldoInversionIntereses)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Intereses Pendientes',
      value: `$${formatMoney(interesesPendientes)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Cuotas Pagas',
      value: cuotasPagas,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Cuotas Pendientes',
      value: cuotasPendientes,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Intereses',
      value: `$${formatMoney(intereses)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Utilidad Real 1',
      value: `$${formatMoney(utilidadReal1)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Utilidad Real 2',
      value: `$${formatMoney(utilidadReal2)}`,
      valueStyle: valueCellStyle,
    },
    {
      label: 'Utilidad Real 3',
      value: `$${formatMoney(utilidadReal3)}`,
      valueStyle: valueCellStyle,
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center',
        }}
      >
        Información del Préstamo
      </Typography>

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: 400 }}>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <TableCell component="th" scope="row" sx={headerCellStyle}>
                  {row.label}
                </TableCell>
                <TableCell sx={row.valueStyle}>
                  {row.bold ? (
                    <strong>{row.value}</strong>
                  ) : (
                    row.value
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

export default TarjetaInformacionPrestamo;
