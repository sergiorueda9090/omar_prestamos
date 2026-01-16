import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { formatMoney } from '../utils/loanCalculations';

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
        Resumen del Préstamo
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Pagado por Cliente
            </Typography>
            <Typography variant="h5" color="success.main" fontWeight={700}>
              ${formatMoney(totalPagado)}
            </Typography>
          </Box>
        </Grid>

        {saldoAplicado > 0 && (
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Saldo a Favor Aplicado
              </Typography>
              <Typography variant="h5" color="info.main" fontWeight={700}>
                ${formatMoney(saldoAplicado)}
              </Typography>
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">
            Capital Actual
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={600}>
            ${formatMoney(capitalNuevo)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">
            Saldo Total
          </Typography>
          <Typography variant="h6" color="error.main" fontWeight={600}>
            ${formatMoney(nuevoSaldoTotal)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">
            Valor Cuota ({numeroCuotasNuevas} cuotas)
          </Typography>
          <Typography variant="h6" color="warning.main" fontWeight={600}>
            ${formatMoney(nuevoValorCuota)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LoanSummary;
