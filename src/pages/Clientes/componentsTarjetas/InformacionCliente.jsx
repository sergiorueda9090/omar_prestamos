import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Paper } from '@mui/material';
import { Person, CreditCard } from '@mui/icons-material';

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

const InformacionCliente = ({ nombre, numeroTarjeta }) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Person color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Información del Cliente
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InfoCard
              icon={<Person color="primary" />}
              title="Nombre del Cliente"
              value={nombre}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard
              icon={<CreditCard color="secondary" />}
              title="Número de Tarjeta"
              value={numeroTarjeta}
              color="secondary"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InformacionCliente;