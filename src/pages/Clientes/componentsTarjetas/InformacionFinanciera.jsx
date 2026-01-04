import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Paper } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const InformacionFinanciera = ({
  montoPrestamo,
  valorCuota,
  saldoTotalPagar,
  interesMensual,
  porcentajeInteres,
  totalInteresPagar
}) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <TrendingUp color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Información Financiera
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Monto del Préstamo
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                ${parseFloat(montoPrestamo).toLocaleString('es-CO')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Valor de Cuota
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="info.main">
                ${parseFloat(valorCuota).toLocaleString('es-CO')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Saldo Total a Pagar
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                ${parseFloat(saldoTotalPagar).toLocaleString('es-CO')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Interés Mensual
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ${parseFloat(interesMensual).toLocaleString('es-CO')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Porcentaje de Interés
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {porcentajeInteres}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Interés a Pagar
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                ${parseFloat(totalInteresPagar).toLocaleString('es-CO')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InformacionFinanciera;