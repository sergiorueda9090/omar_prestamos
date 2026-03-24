import React, { useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  AccountBalance as AccountBalanceIcon,
  History as HistoryIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

import { MyContext } from "../../App";

// Redux actions
import {
  actionObtenerPrestamo,
  actionClearData,
  actionGetAllPrestamos,
  actionDescargarExcel,
} from '../../store/prestamosTestStore/prestamosTestStoreActions';
import { setTab, clearData } from '../../store/prestamosTestStore/prestamosTestStore';

// Components
import TabConfiguracion from './components/TabConfiguracion';
import TableData from './components/TableData';
import FiltrosData from './components/FiltrosData';
import { BackdropComponent } from "../../components/Backdrop/Backdrop";
import {
  TabGestion,
  HistorialSeguimiento,
  LiquidacionDialog,
  DialogoCalcularPagoSaldo,
} from './components/OtherComponents';

const ClientesTestMejorado = () => {
  const dispatch = useDispatch();
  const context = useContext(MyContext);
  const { id: paramId } = useParams();
  const location = useLocation();

  // Detectar filtro de estado desde la URL
  const getEstadoFromPath = () => {
    if (location.pathname === '/clientes/vigentes') return 'vigente';
    if (location.pathname === '/clientes/perdidos') return 'perdido';
    if (location.pathname === '/clientes/pagos') return 'pagado';
    return '';
  };
  const estadoFiltro = getEstadoFromPath();

  // Estado local: controla si mostramos el formulario de creacion o la lista
  const [modoCrear, setModoCrear] = useState(false);

  // Filtros activos para la descarga Excel
  const [filtrosActivos, setFiltrosActivos] = useState({});

  // Leer estado de Redux
  const { tabActual, prestamoGenerado } = useSelector(state => state.prestamosTestStore);

  useEffect(() => {
    context.setIsHideSideBarAndHeader(false);
    window.scrollTo(0, 0);

    if (paramId) {
      // Si hay ID en la URL, cargar el prestamo y mostrar tab de gestion
      dispatch(actionObtenerPrestamo(paramId));
      dispatch(setTab(0)); // Tab 0 = Gestion (en modo detalle)
    } else {
      // Si no hay ID, cargar la lista (con filtro de estado si aplica)
      dispatch(actionGetAllPrestamos(1, estadoFiltro));
    }

    return () => {
      dispatch(actionClearData());
    };
  }, [paramId, location.pathname]);

  // Abrir formulario de creacion
  const handleCrearNuevo = () => {
    dispatch(clearData());
    setModoCrear(true);
  };

  // Volver a la lista
  const handleVolverALista = () => {
    dispatch(clearData());
    dispatch(actionGetAllPrestamos(1, estadoFiltro));
    setModoCrear(false);
  };

  // =========================================================================
  // DECIDIR QUE VISTA MOSTRAR
  // =========================================================================
  // 1. modoCrear (y NO prestamoGenerado) → formulario de creacion
  // 2. paramId o prestamoGenerado       → detalle (solo Gestion + Historial)
  // 3. ninguno                          → lista de prestamos
  // =========================================================================

  const mostrarFormularioCreacion = modoCrear && !prestamoGenerado;
  const mostrarDetalle = paramId || prestamoGenerado;

  // =========================================================================
  // VISTA 1: LISTADO DE PRESTAMOS (tabla + filtros)
  // =========================================================================
  if (!mostrarFormularioCreacion && !mostrarDetalle) {
    return (
      <>
        <div className="right-content w-100">
          <div className="card shadow border-0 p-3 mt-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="hd">
                {estadoFiltro === 'vigente' ? 'Clientes Vigentes' :
                 estadoFiltro === 'perdido' ? 'Clientes Perdidos' :
                 estadoFiltro === 'pagado'  ? 'Clientes Pagos' :
                 'Gestión de Préstamos'}
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  onClick={() => dispatch(actionDescargarExcel({ estado: estadoFiltro, ...filtrosActivos }))}
                  variant="contained"
                  color="success"
                >
                  Descargar Excel
                </Button>
                <Button onClick={handleCrearNuevo} className="btn-blue" variant="contained">
                  Crear Préstamo
                </Button>
              </div>
            </div>

            <FiltrosData estadoFiltro={estadoFiltro} onFilterChange={setFiltrosActivos} />
            <TableData estadoFiltro={estadoFiltro} />
          </div>
        </div>
        <BackdropComponent />
      </>
    );
  }

  // =========================================================================
  // VISTA 2: FORMULARIO DE CREACION (solo Tab Configuracion)
  // Una vez creado el prestamo, prestamoGenerado=true y pasa a Vista 3.
  // =========================================================================
  if (mostrarFormularioCreacion) {
    return (
      <>
        <div className="right-content w-100">
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleVolverALista}
              sx={{ mb: 2 }}
            >
              Volver al Listado
            </Button>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
                Crear Nuevo Préstamo
              </Typography>
              <TabConfiguracion />
            </Paper>
          </Container>
        </div>
        <BackdropComponent />
      </>
    );
  }

  // =========================================================================
  // VISTA 3: DETALLE DEL PRESTAMO (solo Gestion + Historial, NO editable)
  // Se muestra cuando:
  //   - Se acaba de crear un prestamo (prestamoGenerado=true)
  //   - Se cargo un prestamo existente por URL o desde la tabla
  // =========================================================================
  const handleTabChangeDetalle = (event, newValue) => {
    dispatch(setTab(newValue));
  };

  return (
    <>
      <div className="right-content w-100">
        <Container maxWidth="xl" sx={{ py: 4 }}>

          {/* Boton volver a la lista */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleVolverALista}
            sx={{ mb: 2 }}
          >
            Volver al Listado
          </Button>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
              Gestión de Préstamos
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabActual}
                onChange={handleTabChangeDetalle}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab
                  icon={<AccountBalanceIcon />}
                  iconPosition="start"
                  label="Gestión de Cuotas"
                />
                <Tab
                  icon={<HistoryIcon />}
                  iconPosition="start"
                  label="Historial"
                />
              </Tabs>
            </Box>

            {tabActual === 0 && <TabGestion />}
            {tabActual === 1 && <HistorialSeguimiento />}
          </Paper>
        </Container>
      </div>

      <LiquidacionDialog />
      <DialogoCalcularPagoSaldo />
      <BackdropComponent />
    </>
  );
};

export default ClientesTestMejorado;
