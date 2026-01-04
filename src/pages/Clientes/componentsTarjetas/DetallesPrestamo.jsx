import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Paper } from '@mui/material';
import { AccountBalance, CalendarToday, Receipt, Schedule } from '@mui/icons-material';

const InfoCard = ({ icon, title, value, color = "primary" }) => (
  <Paper
    elevation={2}
    sx={{
      p: 2.5,
      height: '100%',
      borderLeft: 4,
      borderColor: `${color}.main`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      }
    }}
  >
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box
        sx={{
          backgroundColor: `${color}.light`,
          borderRadius: 2,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const DetallesPrestamo = ({ fechaPrestamo, tipoPrestamo, duracionPrestamo, numeroCuotas }) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <AccountBalance color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Detalles del Préstamo
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              icon={<CalendarToday color="info" />}
              title="Fecha del Préstamo"
              value={fechaPrestamo}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              icon={<Receipt color="warning" />}
              title="Tipo de Préstamo"
              value={tipoPrestamo}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              icon={<Schedule color="success" />}
              title="Duración"
              value={`${duracionPrestamo} meses`}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              icon={<Receipt color="error" />}
              title="N° de Cuotas"
              value={numeroCuotas}
              color="error"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetallesPrestamo;