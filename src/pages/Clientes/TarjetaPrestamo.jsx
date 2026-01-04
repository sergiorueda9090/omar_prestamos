import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { Box } from '@mui/material';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Header from "./componentsTarjetas/Header";
import OpcionesPago from "./componentsTarjetas/OpcionesPago";
import ModalPago from "./componentsTarjetas/ModalPago";
import InformacionCliente from "./componentsTarjetas/InformacionCliente";
import DetallesPrestamo from "./componentsTarjetas/DetallesPrestamo";
import InformacionFinanciera from "./componentsTarjetas/InformacionFinanciera";
import AnalisisUtilidades from "./componentsTarjetas/AnalisisUtilidades";
import HistorialPagos from "./componentsTarjetas/HistorialPagos";
import ProgresoPago from "./componentsTarjetas/ProgresoPago";
import TablaCuotas from "./componentsTarjetas/TablaCuotas";

export const TarjetaPrestamo = () => {
  const {
    id,
    numeroTarjeta,
    nombre,
    montoPrestamo,
    porcentajeInteres,
    duracionPrestamo,
    tipoPrestamo,
    fechaPrestamo,
    diaCobro,
    interesMensual,
    numeroCuotas,
    valorCuota,
    totalInteresPagar,
    saldoTotalPagar,
    cuotas,
  } = useSelector((state) => state.clientesStore);

  const context = useContext(MyContext);
  const navigate = useNavigate();

  const utilidad1 = 10;
  const utilidad2 = 11;
  const utilidad3 = 12;

  // Estados para los modales
  //Crea una suma
  const [openModalCapital, setOpenModalCapital] = useState(false);
  const [openModalInteres, setOpenModalInteres] = useState(false);
  const [openModalLiquidar, setOpenModalLiquidar] = useState(false);
  const [openModalProximaCuota, setOpenModalProximaCuota] = useState(false);

  // Estados para los formularios
  const [formCapital, setFormCapital] = useState({
    monto: '',
    metodoPago: '',
    referencia: '',
    observaciones: ''
  });

  const [formInteres, setFormInteres] = useState({
    monto: interesMensual,
    metodoPago: '',
    referencia: '',
    observaciones: ''
  });

  const [formLiquidar, setFormLiquidar] = useState({
    monto: saldoTotalPagar,
    metodoPago: '',
    referencia: '',
    observaciones: ''
  });

  const [formProximaCuota, setFormProximaCuota] = useState({
    monto: valorCuota,
    metodoPago: '',
    referencia: '',
    observaciones: ''
  });

  // Historial de pagos
  const [historialPagos, setHistorialPagos] = useState([
    {
      id: 1,
      fecha: "2024-12-01",
      tipoPago: "Próxima Cuota",
      monto: 150000,
      metodoPago: "Efectivo",
      referencia: "REF-001",
      usuario: "Admin",
      observaciones: "Pago de cuota #1"
    },
    {
      id: 2,
      fecha: "2024-12-05",
      tipoPago: "Abonar a Capital",
      monto: 50000,
      metodoPago: "Transferencia",
      referencia: "REF-002",
      usuario: "Admin",
      observaciones: "Abono extraordinario"
    },
    {
      id: 3,
      fecha: "2024-12-10",
      tipoPago: "Pagar Interés",
      monto: 25000,
      metodoPago: "Efectivo",
      referencia: "REF-003",
      usuario: "Admin",
      observaciones: "Pago de intereses del mes"
    },
  ]);

  // Calcular estadísticas
  const cuotasPagadas = cuotas?.filter(c => c.estado_pago === "pagado").length || 0;
  const progresoPago = (cuotasPagadas / (numeroCuotas || 1)) * 100;
  const utilidadTotal = utilidad1 + utilidad2 + utilidad3;
  const proximaCuota = cuotas?.find(c => c.estado_pago !== "pagado");
  const totalPagado = historialPagos.reduce((sum, pago) => sum + pago.monto, 0);

  useEffect(() => {
    context.setIsHideSideBarAndHeader(false);
    window.scrollTo(0, 0);
  }, []);

  const handleDevolver = () => {
    navigate(`/clientes`);
  };

  // Handlers para abrir modales
  const handlePagarCapital = () => setOpenModalCapital(true);
  const handlePagarInteres = () => {
    setFormInteres({ ...formInteres, monto: interesMensual });
    setOpenModalInteres(true);
  };
  const handlePagarSaldoTotal = () => {
    setFormLiquidar({ ...formLiquidar, monto: saldoTotalPagar });
    setOpenModalLiquidar(true);
  };
  const handlePagarProximaCuota = () => {
    if (proximaCuota) {
      setFormProximaCuota({ ...formProximaCuota, monto: proximaCuota.valor });
      setOpenModalProximaCuota(true);
    }
  };

  // Handlers para cerrar modales
  const handleCloseModalCapital = () => {
    setOpenModalCapital(false);
    setFormCapital({ monto: '', metodoPago: '', referencia: '', observaciones: '' });
  };
  const handleCloseModalInteres = () => setOpenModalInteres(false);
  const handleCloseModalLiquidar = () => setOpenModalLiquidar(false);
  const handleCloseModalProximaCuota = () => setOpenModalProximaCuota(false);

  // Handlers para confirmar pagos
  const agregarPago = (tipoPago, form) => {
    const nuevoPago = {
      id: historialPagos.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      tipoPago,
      monto: parseFloat(form.monto),
      metodoPago: form.metodoPago,
      referencia: form.referencia || `REF-${Date.now()}`,
      usuario: "Admin",
      observaciones: form.observaciones || `Pago de ${tipoPago.toLowerCase()}`
    };
    
    setHistorialPagos([...historialPagos, nuevoPago]);
    return nuevoPago;
  };

  const handleConfirmarCapital = () => {
    agregarPago("Abonar a Capital", formCapital);
    handleCloseModalCapital();
  };

  const handleConfirmarInteres = () => {
    agregarPago("Pagar Interés", formInteres);
    handleCloseModalInteres();
  };

  const handleConfirmarLiquidar = () => {
    agregarPago("Liquidar Préstamo", formLiquidar);
    handleCloseModalLiquidar();
  };

  const handleConfirmarProximaCuota = () => {
    agregarPago("Próxima Cuota", formProximaCuota);
    handleCloseModalProximaCuota();
  };

  return (
    <div className="right-content w-100">
      <Box sx={{ p: 3 }}>
        <Header onDevolver={handleDevolver} />

        <OpcionesPago
          montoPrestamo={montoPrestamo}
          interesMensual={interesMensual}
          saldoTotalPagar={saldoTotalPagar}
          proximaCuota={proximaCuota}
          onPagarCapital={handlePagarCapital}
          onPagarInteres={handlePagarInteres}
          onPagarSaldoTotal={handlePagarSaldoTotal}
          onPagarProximaCuota={handlePagarProximaCuota}
        />

        {/* Modales */}
        <ModalPago
          open={openModalCapital}
          onClose={handleCloseModalCapital}
          title="Abonar a Capital"
          subtitle="Reduce el saldo principal del préstamo"
          color="#4caf50"
          iconType="capital"
          form={formCapital}
          setForm={setFormCapital}
          onConfirm={handleConfirmarCapital}
          montoEditable={true}
          alertMessage="Este abono reducirá directamente el capital adeudado. No afecta los intereses ya generados."
          alertSeverity="info"
          clienteInfo={{ nombre, numeroTarjeta }}
        />

        <ModalPago
          open={openModalInteres}
          onClose={handleCloseModalInteres}
          title="Pagar Interés"
          subtitle="Pago de intereses del período actual"
          color="#ff9800"
          iconType="interes"
          form={formInteres}
          setForm={setFormInteres}
          onConfirm={handleConfirmarInteres}
          montoEditable={false}
          alertMessage="Este pago cubre únicamente los intereses generados. El capital permanece igual."
          alertSeverity="warning"
          clienteInfo={{ nombre, numeroTarjeta }}
        />

        <ModalPago
          open={openModalLiquidar}
          onClose={handleCloseModalLiquidar}
          title="Liquidar Préstamo"
          subtitle="Pago total para cerrar el préstamo"
          color="#f44336"
          iconType="liquidar"
          form={formLiquidar}
          setForm={setFormLiquidar}
          onConfirm={handleConfirmarLiquidar}
          montoEditable={false}
          alertMessage="⚠️ Esta acción liquidará completamente el préstamo. El saldo restante quedará en $0."
          alertSeverity="error"
          clienteInfo={{ nombre, numeroTarjeta }}
        />

        <ModalPago
          open={openModalProximaCuota}
          onClose={handleCloseModalProximaCuota}
          title="Pagar Próxima Cuota"
          subtitle={proximaCuota ? `Cuota programada para ${proximaCuota.fecha_pago}` : ""}
          color="#2196f3"
          iconType="cuota"
          form={formProximaCuota}
          setForm={setFormProximaCuota}
          onConfirm={handleConfirmarProximaCuota}
          montoEditable={false}
          alertMessage="Este pago cubre la cuota programada que incluye capital e intereses."
          alertSeverity="success"
          clienteInfo={{ nombre, numeroTarjeta }}
        />

        <InformacionCliente nombre={nombre} numeroTarjeta={numeroTarjeta} />

        <DetallesPrestamo
          fechaPrestamo={fechaPrestamo}
          tipoPrestamo={tipoPrestamo}
          duracionPrestamo={duracionPrestamo}
          numeroCuotas={numeroCuotas}
        />

        <InformacionFinanciera
          montoPrestamo={montoPrestamo}
          valorCuota={valorCuota}
          saldoTotalPagar={saldoTotalPagar}
          interesMensual={interesMensual}
          porcentajeInteres={porcentajeInteres}
          totalInteresPagar={totalInteresPagar}
        />

        <AnalisisUtilidades
          utilidad1={utilidad1}
          utilidad2={utilidad2}
          utilidad3={utilidad3}
          utilidadTotal={utilidadTotal}
        />

        <HistorialPagos
          historial={historialPagos}
          totalPagado={totalPagado}
        />

        <ProgresoPago
          cuotasPagadas={cuotasPagadas}
          numeroCuotas={numeroCuotas}
          progresoPago={progresoPago}
        />

        <TablaCuotas cuotas={cuotas} />
      </Box>
    </div>
  );
};