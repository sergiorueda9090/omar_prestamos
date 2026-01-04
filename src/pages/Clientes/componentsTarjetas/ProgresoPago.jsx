import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';

const ProgresoPago = ({ cuotasPagadas, numeroCuotas, progresoPago }) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Progreso de Pago
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              {cuotasPagadas} de {numeroCuotas} cuotas pagadas
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              {progresoPago.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progresoPago}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgresoPago;