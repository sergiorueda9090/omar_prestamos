import { useState } from 'react';
import dayjs from 'dayjs';
import {
  parseMoney,
  formatMoney,
  calcularInteresSimple,
  calcularNumeroCuotasPorDuracion,
  calcularFechasCobro,
  aplicarSaldoFavorACuotas,
  calcularUtilidad1,
  calcularUtilidad2,
  calcularUtilidad3,
} from '../utils/loanCalculations';

const useLoanManager = () => {
  const [config, setConfig] = useState({
    montoPrestamo: '1000000',
    porcentajeInteres: '10',
    duracionPrestamo: '10',
    tipoPrestamo: 'Mensual',
    fechaPrestamo: dayjs().format('YYYY-MM-DD'),
    diaCobro: '1',
    prestamoSinCronograma: false,
  });

  const [cuotas, setCuotas] = useState([]);
  const [datosPrestamoOriginal, setDatosPrestamoOriginal] = useState(null);
  const [resumenActual, setResumenActual] = useState({});
  const [prestamoGenerado, setPrestamoGenerado] = useState(false);
  const [plazoEditableSinCronograma, setPlazoEditableSinCronograma] = useState('');
  const [historial, setHistorial] = useState([]);
  const [interesAcumulado, setInteresAcumulado] = useState(0);

  const [dialogos, setDialogos] = useState({
    liquidacion: false,
    calcularPago: false,
  });
  const [parametrosAmpliacion, setParametrosAmpliacion] = useState(null);

  const updateConfig = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const agregarEvento = (tipo, titulo, descripcion, monto = null) => {
    const nuevoEvento = {
      tipo,
      titulo,
      descripcion,
      monto,
      fecha: new Date().toISOString(),
    };
    setHistorial(prev => [nuevoEvento, ...prev]);
  };

  const actualizarResumen = (cuotasActuales, capitalActual, tasaActual, numCuotasActual, saldoAplicado = 0) => {
    const cuotasConPagos = cuotasActuales.filter(c => c.abonado > 0);
    const totalPagado = cuotasConPagos.reduce((sum, c) => sum + c.abonado, 0);
    const { valorCuota, saldoTotal } = calcularInteresSimple(capitalActual, tasaActual, numCuotasActual);
    setResumenActual({
      totalPagado,
      saldoAplicado,
      nuevoSaldoTotal: saldoTotal,
      nuevoValorCuota: valorCuota,
      capitalNuevo: capitalActual,
      numeroCuotasNuevas: numCuotasActual,
    });
  };

  const recalcularPrestamoSinCronograma = (nuevosPlazo) => {
    if (!datosPrestamoOriginal || !datosPrestamoOriginal.sinCronograma) return;
    const plazo = parseInt(nuevosPlazo);
    if (!plazo || plazo <= 0) return;

    const { valorCuota, saldoTotal, totalInteres, interesMensual } =
      calcularInteresSimple(datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, plazo);

    setDatosPrestamoOriginal({
      ...datosPrestamoOriginal,
      numeroCuotasOriginal: plazo,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: interesMensual,
    });

    actualizarResumen([], datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, plazo);
  };

  const generarPlanCuotas = () => {
    const monto = parseMoney(config.montoPrestamo);
    const tasa = parseFloat(config.porcentajeInteres);
    const duracion = parseInt(config.duracionPrestamo);

    if (!monto || !tasa || !duracion) {
      alert('Complete todos los campos del préstamo');
      return false;
    }

    const numeroCuotas = calcularNumeroCuotasPorDuracion(duracion, config.tipoPrestamo);
    const { valorCuota, saldoTotal, totalInteres, interesMensual } = calcularInteresSimple(monto, tasa, numeroCuotas);

    if (config.prestamoSinCronograma) {
      setCuotas([]);
      setPlazoEditableSinCronograma(numeroCuotas.toString());
      setDatosPrestamoOriginal({
        montoOriginal: monto,
        tasaOriginal: tasa,
        numeroCuotasOriginal: numeroCuotas,
        valorCuotaOriginal: valorCuota,
        saldoTotalOriginal: saldoTotal,
        totalInteresOriginal: totalInteres,
        interesMensualOriginal: interesMensual,
        sinCronograma: true,
      });
      actualizarResumen([], monto, tasa, numeroCuotas);
      agregarEvento('creacion', 'Préstamo Creado (Sin Cronograma)', `Monto: $${formatMoney(monto)}, Tasa: ${tasa}%, Plazo: ${numeroCuotas} meses`, monto);
    } else {
      const fechas = calcularFechasCobro(config.fechaPrestamo, numeroCuotas, config.tipoPrestamo, config.diaCobro);
      const nuevasCuotas = fechas.map((fecha, index) => ({
        numero: index + 1,
        fecha_pago: fecha,
        valor: valorCuota,
        estado_pago: 'pendiente',
        abonado: 0,
        saldo: valorCuota,
      }));

      setCuotas(nuevasCuotas);
      setDatosPrestamoOriginal({
        montoOriginal: monto,
        tasaOriginal: tasa,
        numeroCuotasOriginal: numeroCuotas,
        valorCuotaOriginal: valorCuota,
        saldoTotalOriginal: saldoTotal,
        totalInteresOriginal: totalInteres,
        interesMensualOriginal: interesMensual,
        sinCronograma: false,
      });
      actualizarResumen(nuevasCuotas, monto, tasa, numeroCuotas);
      agregarEvento('creacion', 'Préstamo Creado', `Monto: $${formatMoney(monto)}, Tasa: ${tasa}%, ${numeroCuotas} cuotas de $${formatMoney(valorCuota)}`, monto);
    }

    setPrestamoGenerado(true);
    return true;
  };

  const handleAplicarPago = (monto, distribucion, tipoPago, datosSaldo = null) => {
    if (tipoPago === 'interes') {
      setInteresAcumulado(prev => prev + monto);
      agregarEvento('pago', 'Pago de Interés Registrado', `Pago de interés personalizado: $${formatMoney(monto)}. Se suma a las 3 utilidades.`, monto);
      return;
    }

    if (tipoPago === 'pagar_saldo') {
      agregarEvento('pago', 'Pago de Saldo Registrado', `Saldo pagado: $${formatMoney(monto)}. Dinero prestado: $${formatMoney(datosSaldo.dineroPrestado)}, Abono: $${formatMoney(datosSaldo.abonoCliente)}, Tasa: ${datosSaldo.porcentajeInteres}%, Plazo: ${datosSaldo.tiempo} meses, Fecha: ${dayjs(datosSaldo.fechaPago).format('DD/MM/YYYY')}`, monto);
      return;
    }

    const nuevasCuotas = [...cuotas];
    let totalPagadoEnOperacion = 0;

    distribucion.forEach(dist => {
      const cuota = nuevasCuotas[dist.index];
      cuota.abonado = (cuota.abonado || 0) + dist.abonar;
      cuota.saldo = dist.saldoDespues;
      totalPagadoEnOperacion += dist.abonar;

      if (cuota.saldo <= 0) {
        cuota.estado_pago = 'pagado';
        cuota.saldo = 0;
        cuota.abonado = cuota.valor;
      } else if (cuota.abonado > 0) {
        cuota.estado_pago = 'parcial';
      }
    });

    setCuotas(nuevasCuotas);

    if (datosPrestamoOriginal) {
      actualizarResumen(nuevasCuotas, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, datosPrestamoOriginal.numeroCuotasOriginal);
    }

    const cuotasAfectadas = distribucion.map(d => `#${d.numero}`).join(', ');
    agregarEvento('pago', 'Pago Registrado', `Pago de $${formatMoney(totalPagadoEnOperacion)} distribuido en cuota(s): ${cuotasAfectadas}`, totalPagadoEnOperacion);
  };

  const handleCambiarFecha = (index, nuevaFecha) => {
    const nuevasCuotas = [...cuotas];
    const cuota = nuevasCuotas[index];
    const fechaAnterior = cuota.fecha_pago;
    cuota.fecha_pago = nuevaFecha;
    setCuotas(nuevasCuotas);
    agregarEvento('cambio_fecha', `Fecha Modificada - Cuota #${cuota.numero}`, `Fecha anterior: ${dayjs(fechaAnterior).format('DD/MM/YYYY')}, Nueva fecha: ${dayjs(nuevaFecha).format('DD/MM/YYYY')}`);
  };

  const handleEliminarPago = (index) => {
    const nuevasCuotas = [...cuotas];
    const cuota = nuevasCuotas[index];
    const montoEliminado = cuota.abonado || 0;

    if (montoEliminado === 0) {
      alert('Esta cuota no tiene pagos para eliminar');
      return;
    }

    cuota.abonado = 0;
    cuota.saldo = cuota.valor;
    cuota.estado_pago = 'pendiente';
    setCuotas(nuevasCuotas);

    if (datosPrestamoOriginal) {
      actualizarResumen(nuevasCuotas, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, datosPrestamoOriginal.numeroCuotasOriginal);
    }

    agregarEvento('eliminacion_pago', `Pago Eliminado - Cuota #${cuota.numero}`, `Se eliminaron pagos por $${formatMoney(montoEliminado)}. La cuota volvió a estado pendiente.`, montoEliminado);
  };

  const iniciarProcesoAmpliacion = (params) => {
    setParametrosAmpliacion(params);
    setDialogos(prev => ({ ...prev, liquidacion: true }));
  };

  const confirmarLiquidacionYAmpliar = (datosLiquidacion) => {
    if (!parametrosAmpliacion || !datosPrestamoOriginal) return;

    const { montoAdicional, nuevaTasa, nuevasCuotas: numCuotasNuevas } = parametrosAmpliacion;
    const { saldoFavor } = datosLiquidacion;
    const capitalVigente = datosPrestamoOriginal.montoOriginal;
    const nuevoCapitalTotal = capitalVigente + montoAdicional;
    const { valorCuota, saldoTotal, totalInteres } = calcularInteresSimple(nuevoCapitalTotal, nuevaTasa, numCuotasNuevas);
    const primeraCuotaPendiente = cuotas.find(c => c.estado_pago !== 'pagado');
    const fechaInicio = primeraCuotaPendiente ? dayjs(primeraCuotaPendiente.fecha_pago) : dayjs().add(1, 'month');
    const nuevasFechas = calcularFechasCobro(fechaInicio, numCuotasNuevas, config.tipoPrestamo, config.diaCobro);
    const nuevoCronograma = nuevasFechas.map((fecha, index) => ({
      numero: index + 1,
      fecha_pago: fecha,
      valor: valorCuota,
      estado_pago: 'pendiente',
      abonado: 0,
      saldo: valorCuota,
    }));

    const cronogramaConSaldo = aplicarSaldoFavorACuotas(nuevoCronograma, saldoFavor);
    setCuotas(cronogramaConSaldo);
    setDatosPrestamoOriginal({
      montoOriginal: nuevoCapitalTotal,
      tasaOriginal: nuevaTasa,
      numeroCuotasOriginal: numCuotasNuevas,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: (nuevoCapitalTotal * nuevaTasa) / 100,
    });
    actualizarResumen(cronogramaConSaldo, nuevoCapitalTotal, nuevaTasa, numCuotasNuevas, saldoFavor);
    setConfig(prev => ({
      ...prev,
      montoPrestamo: formatMoney(nuevoCapitalTotal),
      porcentajeInteres: nuevaTasa.toString(),
      duracionPrestamo: numCuotasNuevas.toString(),
    }));
    agregarEvento('liquidacion', 'Liquidación Realizada', `Interés de liquidación: $${formatMoney(datosLiquidacion.totalInteres)}, Saldo a favor: $${formatMoney(saldoFavor)}`, datosLiquidacion.totalInteres);
    agregarEvento('ampliacion', 'Ampliación de Préstamo', `Monto adicional: $${formatMoney(montoAdicional)}, Nuevo total: $${formatMoney(nuevoCapitalTotal)}, ${numCuotasNuevas} cuotas`, montoAdicional);
    setDialogos(prev => ({ ...prev, liquidacion: false }));
    setParametrosAmpliacion(null);
  };

  const handleConfirmarPagoCalculado = (datosCalculo) => {
    agregarEvento('pago', 'Pago de Saldo Calculado', `Dinero prestado: $${formatMoney(datosCalculo.dineroPrestado)}, Abono: $${formatMoney(datosCalculo.abonoCliente)}, Saldo pagado: $${formatMoney(datosCalculo.saldoFinal)} (${datosCalculo.porcentaje}% interés, ${datosCalculo.plazo} meses)`, datosCalculo.saldoFinal);
    setInteresAcumulado(prev => prev + datosCalculo.interesTotal);
    alert(`Pago de saldo registrado exitosamente!\n\nSaldo pagado: $${formatMoney(datosCalculo.saldoFinal)}\nInterés incluido: $${formatMoney(datosCalculo.interesTotal)}\n\nEl interés se ha sumado a las 3 utilidades.`);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    updateConfig('montoPrestamo', formatMoney(value));
  };

  const cerrarDialogoLiquidacion = () => {
    setDialogos(prev => ({ ...prev, liquidacion: false }));
    setParametrosAmpliacion(null);
  };

  const cuotasConPagos = cuotas.filter(c => c.abonado > 0);
  const cuotasCompletamentePagadas = cuotas.filter(c => c.estado_pago === 'pagado');

  const datosPrestamo = datosPrestamoOriginal ? {
    estado: "Crédito Vigente",
    numeroTarjeta: "#1",
    nombreCliente: "Omaira Saul",
    dineroPrestado: datosPrestamoOriginal.montoOriginal,
    plazoPrestamo: datosPrestamoOriginal.numeroCuotasOriginal,
    interes: datosPrestamoOriginal.tasaOriginal,
    valorCuota: datosPrestamoOriginal.valorCuotaOriginal,
    fechaPrestamo: config.fechaPrestamo,
    abonoTotalIntereses: (resumenActual.totalPagado || 0) + interesAcumulado,
    abonoTotal: resumenActual.totalPagado || 0,
    // Saldo Total: se reduce con pagos de cuotas y abonos parciales (no incluye intereses)
    saldoTotal: cuotas.reduce((sum, c) => sum + (c.saldo ?? c.valor), 0),
    // Saldo A Inversion: empieza con el dinero prestado, se resta con pagos, mínimo 0
    saldoInversionIntereses: Math.max(0, datosPrestamoOriginal.montoOriginal - (resumenActual.totalPagado || 0) - interesAcumulado),
    // Intereses Pendientes: solo disminuye cuando Abono Total recupera el dinero prestado
    interesesPendientes: datosPrestamoOriginal.totalInteresOriginal - Math.max(0, (resumenActual.totalPagado || 0) - datosPrestamoOriginal.montoOriginal),
    // Cuotas Pagas: proporcional (ej: 1.5 si hay 1 completa y 1 al 50%)
    cuotasPagas: Math.round(cuotas.reduce((sum, c) => sum + ((c.abonado || 0) / c.valor), 0) * 10) / 10,
    // Cuotas Pendientes: total - pagas proporcional
    cuotasPendientes: Math.round((cuotas.length - cuotas.reduce((sum, c) => sum + ((c.abonado || 0) / c.valor), 0)) * 10) / 10,
    intereses: interesAcumulado,
    utilidadReal1: calcularUtilidad1(datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.saldoTotalOriginal, interesAcumulado),
    utilidadReal2: calcularUtilidad2(cuotasConPagos, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.totalInteresOriginal, datosPrestamoOriginal.numeroCuotasOriginal, interesAcumulado),
    utilidadReal3: calcularUtilidad3(cuotasConPagos, datosPrestamoOriginal.montoOriginal, interesAcumulado),
  } : null;

  return {
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
    parametrosAmpliacion,
    cerrarDialogoLiquidacion,
    generarPlanCuotas,
    recalcularPrestamoSinCronograma,
    handleAplicarPago,
    handleCambiarFecha,
    handleEliminarPago,
    iniciarProcesoAmpliacion,
    confirmarLiquidacionYAmpliar,
    handleConfirmarPagoCalculado,
  };
};

export default useLoanManager;
