import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  AccountBalance as AccountBalanceIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

// Custom hook
import useLoanManager from './hooks/useLoanManager';

// Components
import TabConfiguracion from './components/TabConfiguracion';
import {
  TabGestion,
  HistorialSeguimiento,
  LiquidacionDialog,
  DialogoCalcularPagoSaldo,
} from './components/OtherComponents';

const ClientesTest = () => {
  const [tabActual, setTabActual] = useState(0);

  const {
    config,
    updateConfig,
    handleMontoChange,
    cuotas,
    datosPrestamoOriginal,
    resumenActual,
    prestamoGenerado,
    plazoEditableSinCronograma,
    setPlazoEditableSinCronograma,
    historial,
    interesAcumulado,
    cuotasConPagos,
    cuotasCompletamentePagadas,
    datosPrestamo,
    dialogos,
    setDialogos,
    cerrarDialogoLiquidacion,
    generarPlanCuotas,
    recalcularPrestamoSinCronograma,
    handleAplicarPago,
    handleCambiarFecha,
    handleEliminarPago,
    iniciarProcesoAmpliacion,
    confirmarLiquidacionYAmpliar,
    handleConfirmarPagoCalculado,
    // Funciones y estados para préstamos sin cronograma
    totalPagadoCuotasSinCronograma,
    handlePagoCuotaSinCronograma,
    handlePagoInteresSinCronograma,
  } = useLoanManager();

  const handleGenerarPlan = () => {
    const success = generarPlanCuotas();
    if (success) {
      setTabActual(1);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabActual(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
          Gestión de Préstamos
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabActual}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label="Configuración"
            />
            <Tab
              icon={<AccountBalanceIcon />}
              iconPosition="start"
              label="Gestión de Cuotas"
              disabled={!prestamoGenerado}
            />
            <Tab
              icon={<HistoryIcon />}
              iconPosition="start"
              label="Historial"
              disabled={!prestamoGenerado}
            />
          </Tabs>
        </Box>

        {tabActual === 0 && (
          <TabConfiguracion
            config={config}
            updateConfig={updateConfig}
            handleMontoChange={handleMontoChange}
            onGenerarPlan={handleGenerarPlan}
            datosPrestamo={datosPrestamo}
          />
        )}

        {tabActual === 1 && (
          <TabGestion
            datosPrestamoOriginal={datosPrestamoOriginal}
            datosPrestamo={datosPrestamo}
            cuotasConPagos={cuotasConPagos}
            interesAcumulado={interesAcumulado}
            plazoEditableSinCronograma={plazoEditableSinCronograma}
            setPlazoEditableSinCronograma={setPlazoEditableSinCronograma}
            recalcularPrestamoSinCronograma={recalcularPrestamoSinCronograma}
            resumenActual={resumenActual}
            cuotas={cuotas}
            cuotasCompletamentePagadas={cuotasCompletamentePagadas}
            handleAplicarPago={handleAplicarPago}
            handleCambiarFecha={handleCambiarFecha}
            handleEliminarPago={handleEliminarPago}
            iniciarProcesoAmpliacion={iniciarProcesoAmpliacion}
            onAbrirCalculadora={() => setDialogos(prev => ({ ...prev, calcularPago: true }))}
            totalPagadoCuotasSinCronograma={totalPagadoCuotasSinCronograma}
            onPagoCuotaSinCronograma={handlePagoCuotaSinCronograma}
            onPagoInteresSinCronograma={handlePagoInteresSinCronograma}
          />
        )}

        {tabActual === 2 && (
          <HistorialSeguimiento
            datosPrestamoOriginal={datosPrestamoOriginal}
            historial={historial}
            cuotas={cuotas}
            cuotasConPagos={cuotasConPagos}
          />
        )}
      </Paper>

      <LiquidacionDialog
        open={dialogos.liquidacion}
        onClose={cerrarDialogoLiquidacion}
        prestamoActual={datosPrestamoOriginal}
        cuotasConPagos={cuotasConPagos}
        onConfirmarLiquidacion={confirmarLiquidacionYAmpliar}
      />

      <DialogoCalcularPagoSaldo
        open={dialogos.calcularPago}
        onClose={() => setDialogos(prev => ({ ...prev, calcularPago: false }))}
        onConfirmarPago={handleConfirmarPagoCalculado}
      />
    </Container>
  );
};

export default ClientesTest;
