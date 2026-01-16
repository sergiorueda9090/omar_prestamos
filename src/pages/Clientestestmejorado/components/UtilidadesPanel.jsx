import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  formatMoney,
  calcularUtilidad1,
  calcularUtilidad2,
  calcularUtilidad3,
  calcularPorcentajeCapitalRecuperado,
} from '../utils/loanCalculations';

const UtilidadesPanel = ({
  datosPrestamoOriginal,
  cuotasPagadas,
  sinCronograma = false,
  interesAcumulado = 0
}) => {
  const [utilidades, setUtilidades] = useState({
    utilidad1: 0,
    utilidad2: 0,
    utilidad3: 0,
    porcentajeCapitalRecuperado: 0,
  });

  useEffect(() => {
    if (!datosPrestamoOriginal) return;

    const montoOriginal = datosPrestamoOriginal.montoOriginal;
    const totalInteres = datosPrestamoOriginal.totalInteresOriginal;
    const totalAPagar = datosPrestamoOriginal.saldoTotalOriginal;
    const numeroCuotas = datosPrestamoOriginal.numeroCuotasOriginal;

    const util1 = calcularUtilidad1(montoOriginal, totalAPagar, interesAcumulado);

    if (sinCronograma) {
      setUtilidades({
        utilidad1: util1,
        utilidad2: interesAcumulado,
        utilidad3: interesAcumulado,
        porcentajeCapitalRecuperado: 0,
      });
      return;
    }

    const util2 = calcularUtilidad2(cuotasPagadas, montoOriginal, totalInteres, numeroCuotas, interesAcumulado);
    const util3 = calcularUtilidad3(cuotasPagadas, montoOriginal, interesAcumulado);
    const porcentaje = calcularPorcentajeCapitalRecuperado(cuotasPagadas, montoOriginal);

    setUtilidades({
      utilidad1: util1,
      utilidad2: util2,
      utilidad3: util3,
      porcentajeCapitalRecuperado: porcentaje,
    });
  }, [datosPrestamoOriginal, cuotasPagadas, sinCronograma, interesAcumulado]);

  if (!datosPrestamoOriginal) return null;

  const montoOriginal = datosPrestamoOriginal.montoOriginal;
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  const capitalRecuperado = Math.min(totalPagado, montoOriginal);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(103, 58, 183, 0.05)' }}>
      <Typography variant="h5" gutterBottom color="primary">
        Panel de Utilidades
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                  <Typography variant="body2" fontWeight={700}>1</Typography>
                </Avatar>
                <Typography variant="subtitle2">Utilidad 1</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                ${formatMoney(utilidades.utilidad1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                Ganancia Total Inmediata
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                  <Typography variant="body2" fontWeight={700}>2</Typography>
                </Avatar>
                <Typography variant="subtitle2">Utilidad 2</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                ${formatMoney(utilidades.utilidad2)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                Ganancia Distribuida
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                  <Typography variant="body2" fontWeight={700}>3</Typography>
                </Avatar>
                <Typography variant="subtitle2">Utilidad 3</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                ${formatMoney(utilidades.utilidad3)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                Ganancia Neta
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {!sinCronograma && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ backgroundColor: 'info.50' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Recuperación de Capital
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      Progreso: {utilidades.porcentajeCapitalRecuperado.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${formatMoney(capitalRecuperado)} / ${formatMoney(montoOriginal)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={utilidades.porcentajeCapitalRecuperado}
                    sx={{
                      height: 10,
                      borderRadius: 2,
                      bgcolor: 'grey.300',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {interesAcumulado > 0 && (
          <Grid item xs={12}>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Interés Acumulado Total:</strong> ${formatMoney(interesAcumulado)}
              </Typography>
              <Typography variant="caption">
                Este monto se ha sumado a las 3 utilidades y proviene de pagos de interés personalizados.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default UtilidadesPanel;
