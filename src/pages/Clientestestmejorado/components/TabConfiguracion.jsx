import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import TarjetaInformacionPrestamo from './TarjetaInformacionPrestamo';

const TabConfiguracion = ({
  config,
  updateConfig,
  handleMontoChange,
  onGenerarPlan,
  datosPrestamo,
}) => {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure los parámetros del préstamo inicial y haga clic en "Generar Plan de Cuotas"
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Monto del Préstamo"
            value={config.montoPrestamo}
            onChange={handleMontoChange}
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Porcentaje de Interés Mensual"
            type="number"
            value={config.porcentajeInteres}
            onChange={(e) => updateConfig('porcentajeInteres', e.target.value)}
            InputProps={{ endAdornment: <Typography sx={{ ml: 1 }}>%</Typography> }}
            inputProps={{ step: '0.1', min: '0' }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Duración (meses)"
            type="number"
            value={config.duracionPrestamo}
            onChange={(e) => updateConfig('duracionPrestamo', e.target.value)}
            inputProps={{ min: '1' }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Tipo de Préstamo"
            value={config.tipoPrestamo}
            onChange={(e) => updateConfig('tipoPrestamo', e.target.value)}
          >
            <MenuItem value="Mensual">Mensual</MenuItem>
            <MenuItem value="Quincenal">Quincenal</MenuItem>
            <MenuItem value="Semanal">Semanal</MenuItem>
            <MenuItem value="Diario">Diario</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Día de Cobro"
            type="number"
            value={config.diaCobro}
            onChange={(e) => updateConfig('diaCobro', e.target.value)}
            inputProps={{ min: '1', max: '31' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="date"
            label="Fecha del Préstamo"
            value={config.fechaPrestamo}
            onChange={(e) => updateConfig('fechaPrestamo', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={config.prestamoSinCronograma}
                onChange={(e) => updateConfig('prestamoSinCronograma', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  <strong>Préstamo sin cronograma de cuotas</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  No se generarán cuotas mensuales, solo se mostrará el total a pagar
                </Typography>
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={onGenerarPlan}
            startIcon={<CalculateIcon />}
          >
            Generar Plan de Cuotas
          </Button>
        </Grid>
      </Grid>

      {datosPrestamo && (
        <Box sx={{ mt: 4 }}>
          <TarjetaInformacionPrestamo datosPrestamo={datosPrestamo} />
        </Box>
      )}
    </Box>
  );
};

export default TabConfiguracion;
