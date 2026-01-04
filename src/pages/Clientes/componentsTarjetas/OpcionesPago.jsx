import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Paper, Tooltip } from '@mui/material';
import {
  Paid,
  MonetizationOn,
  AttachMoney,
  AccountBalanceWallet,
  EventAvailable
} from '@mui/icons-material';

const ActionButton = ({ icon, title, subtitle, color, onClick, disabled = false }) => (
  <Tooltip title={disabled ? "No hay cuotas pendientes" : ""} arrow>
    <Paper
      elevation={3}
      sx={{
        p: 2.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid ${color}30`,
        borderRadius: 2,
        opacity: disabled ? 0.5 : 1,
        '&:hover': disabled ? {} : {
          transform: 'translateY(-6px)',
          boxShadow: `0 8px 20px ${color}40`,
          border: `2px solid ${color}`,
          backgroundColor: `${color}05`,
        }
      }}
      onClick={disabled ? undefined : onClick}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}60`
          }}
        >
          {icon}
        </Box>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="bold" color="text.primary">
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Paper>
  </Tooltip>
);

const OpcionesPago = ({
  montoPrestamo,
  interesMensual,
  saldoTotalPagar,
  proximaCuota,
  onPagarCapital,
  onPagarInteres,
  onPagarSaldoTotal,
  onPagarProximaCuota
}) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Paid sx={{ color: 'white', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
              Opciones de Pago
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Selecciona el tipo de pago que deseas realizar
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              icon={<MonetizationOn sx={{ color: 'white', fontSize: 28 }} />}
              title="Abonar a Capital"
              subtitle={`Reduce el monto: $${parseFloat(montoPrestamo).toLocaleString('es-CO')}`}
              color="#4caf50"
              onClick={onPagarCapital}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              icon={<AttachMoney sx={{ color: 'white', fontSize: 28 }} />}
              title="Pagar Interés"
              subtitle={`Interés mensual: $${parseFloat(interesMensual).toLocaleString('es-CO')}`}
              color="#ff9800"
              onClick={onPagarInteres}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              icon={<AccountBalanceWallet sx={{ color: 'white', fontSize: 28 }} />}
              title="Liquidar Préstamo"
              subtitle={`Saldo total: $${parseFloat(saldoTotalPagar).toLocaleString('es-CO')}`}
              color="#f44336"
              onClick={onPagarSaldoTotal}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ActionButton
              icon={<EventAvailable sx={{ color: 'white', fontSize: 28 }} />}
              title="Próxima Cuota"
              subtitle={
                proximaCuota 
                  ? `${proximaCuota.fecha_pago} - $${parseFloat(proximaCuota.valor).toLocaleString('es-CO')}`
                  : "Sin cuotas pendientes"
              }
              color="#2196f3"
              onClick={onPagarProximaCuota}
              disabled={!proximaCuota}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OpcionesPago;