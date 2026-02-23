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
    numeroTarjeta: '',
    nombre: '',
    montoPrestamo: '',
    porcentajeInteres: '',
    duracionPrestamo: '',
    tipoPrestamo: '',
    fechaPrestamo: dayjs().format('YYYY-MM-DD'),
    diaCobro: '',
    prestamoSinCronograma: false,
  });

  const [cuotas, setCuotas] = useState([]);
  const [datosPrestamoOriginal, setDatosPrestamoOriginal] = useState(null);
  const [resumenActual, setResumenActual] = useState({});
  const [prestamoGenerado, setPrestamoGenerado] = useState(false);
  const [plazoEditableSinCronograma, setPlazoEditableSinCronograma] = useState('');
  const [historial, setHistorial] = useState([]);
  const [interesAcumulado, setInteresAcumulado] = useState(0);
  const [totalPagadoCuotasSinCronograma, setTotalPagadoCuotasSinCronograma] = useState(0);
  const [pagosIntereses, setPagosIntereses] = useState([]); // Registro de pagos solo de intereses

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
    // Pasar duracion (meses) como cuarto parámetro para calcular el interés correctamente
    const { valorCuota, saldoTotal, totalInteres, interesMensual } = calcularInteresSimple(monto, tasa, numeroCuotas, duracion);

    if (config.prestamoSinCronograma) {
      setCuotas([]);
      setPlazoEditableSinCronograma(duracion.toString());
      setDatosPrestamoOriginal({
        montoOriginal: monto,
        tasaOriginal: tasa,
        numeroCuotasOriginal: numeroCuotas,
        duracionMesesOriginal: duracion, // Guardar duración en meses
        tipoPrestamo: config.tipoPrestamo,
        valorCuotaOriginal: valorCuota,
        saldoTotalOriginal: saldoTotal,
        totalInteresOriginal: totalInteres,
        interesMensualOriginal: interesMensual,
        sinCronograma: true,
        numeroTarjeta: config.numeroTarjeta || '',
        nombreCliente: config.nombre || '',
        fechaPrestamo: config.fechaPrestamo,
        diaCobro: config.diaCobro,
      });
      actualizarResumen([], monto, tasa, numeroCuotas);
      agregarEvento('creacion', 'Préstamo Creado (Sin Cronograma)', `Monto: $${formatMoney(monto)}, Tasa: ${tasa}%, Plazo: ${duracion} meses (${numeroCuotas} cuotas ${config.tipoPrestamo})`, monto);
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
        duracionMesesOriginal: duracion, // Guardar duración en meses
        tipoPrestamo: config.tipoPrestamo,
        valorCuotaOriginal: valorCuota,
        saldoTotalOriginal: saldoTotal,
        totalInteresOriginal: totalInteres,
        interesMensualOriginal: interesMensual,
        sinCronograma: false,
        numeroTarjeta: config.numeroTarjeta || '',
        nombreCliente: config.nombre || '',
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
      // Registrar el pago de interés para mostrarlo en el cronograma
      setPagosIntereses(prev => [...prev, {
        id: Date.now(),
        fecha: dayjs().format('YYYY-MM-DD'),
        monto: monto,
        tipo: 'interes',
        descripcion: 'Pago de Interés',
      }]);
      agregarEvento('pago', 'Pago de Interés Registrado', `Pago de interés personalizado: $${formatMoney(monto)}. Se suma a las 3 utilidades.`, monto);
      return;
    }

    if (tipoPago === 'pagar_saldo') {
      const nuevasCuotasSaldo = [...cuotas];
      distribucion.forEach(dist => {
        const cuota = nuevasCuotasSaldo[dist.index];
        cuota.abonado = (cuota.abonado || 0) + dist.abonar;
        cuota.saldo = dist.saldoDespues;
        if (cuota.saldo <= 0) {
          cuota.estado_pago = 'pagado';
          cuota.saldo = 0;
          cuota.abonado = cuota.valor;
        } else if (cuota.abonado > 0) {
          cuota.estado_pago = 'parcial';
        }
      });
      setCuotas(nuevasCuotasSaldo);
      if (datosPrestamoOriginal) {
        actualizarResumen(nuevasCuotasSaldo, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.tasaOriginal, datosPrestamoOriginal.numeroCuotasOriginal);
      }
      agregarEvento('pago', 'Pago de Saldo Total Registrado', `Saldo total pagado: $${formatMoney(monto)}. ${distribucion.length} cuota(s) liquidadas. Fecha: ${dayjs(datosSaldo.fechaPago).format('DD/MM/YYYY')}`, monto);
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
    const { saldoFavor, totalInteres: interesLiquidacion } = datosLiquidacion;
    const capitalVigente = datosPrestamoOriginal.montoOriginal;
    const nuevoCapitalTotal = capitalVigente + montoAdicional;
    // Para ampliaciones, asumimos que las cuotas nuevas son mensuales (duracion = numCuotas)
    const { valorCuota, saldoTotal, totalInteres } = calcularInteresSimple(nuevoCapitalTotal, nuevaTasa, numCuotasNuevas, numCuotasNuevas);
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
      duracionMesesOriginal: numCuotasNuevas, // Para ampliaciones, asumimos mensual
      tipoPrestamo: config.tipoPrestamo,
      valorCuotaOriginal: valorCuota,
      saldoTotalOriginal: saldoTotal,
      totalInteresOriginal: totalInteres,
      interesMensualOriginal: (nuevoCapitalTotal * nuevaTasa) / 100,
      sinCronograma: false,
      numeroTarjeta: datosPrestamoOriginal.numeroTarjeta || '',
      nombreCliente: datosPrestamoOriginal.nombreCliente || '',
    });
    actualizarResumen(cronogramaConSaldo, nuevoCapitalTotal, nuevaTasa, numCuotasNuevas, saldoFavor);
    setConfig(prev => ({
      ...prev,
      montoPrestamo: formatMoney(nuevoCapitalTotal),
      porcentajeInteres: nuevaTasa.toString(),
      duracionPrestamo: numCuotasNuevas.toString(),
    }));

    // Agregar el interés de liquidación a los intereses acumulados
    setInteresAcumulado(prev => prev + interesLiquidacion);

    // Registrar el interés de liquidación para mostrarlo en el cronograma
    setPagosIntereses(prev => [...prev, {
      id: Date.now(),
      fecha: dayjs().format('YYYY-MM-DD'),
      monto: interesLiquidacion,
      tipo: 'liquidacion',
      descripcion: 'Interés de Liquidación',
    }]);

    agregarEvento('liquidacion', 'Liquidación Realizada', `Interés de liquidación: $${formatMoney(interesLiquidacion)}, Saldo a favor: $${formatMoney(saldoFavor)}. El interés se agregó a Intereses.`, interesLiquidacion);
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

  // Funciones para préstamos sin cronograma
  const handlePagoCuotaSinCronograma = (monto, tipoPago, datos) => {
    setTotalPagadoCuotasSinCronograma(prev => prev + monto);

    const cuotasEquivalentes = datosPrestamoOriginal?.valorCuotaOriginal
      ? (monto / datosPrestamoOriginal.valorCuotaOriginal).toFixed(2)
      : 0;

    agregarEvento(
      'pago',
      'Pago de Cuota (Sin Cronograma)',
      `Pago de $${formatMoney(monto)} (${cuotasEquivalentes} cuotas equivalentes). Fecha: ${dayjs(datos.fechaPago).format('DD/MM/YYYY')}`,
      monto
    );
  };

  const handlePagoInteresSinCronograma = (monto, datos) => {
    setInteresAcumulado(prev => prev + monto);
    // Registrar el pago de interés para mostrarlo en el cronograma
    setPagosIntereses(prev => [...prev, {
      id: Date.now(),
      fecha: datos.fechaPago || dayjs().format('YYYY-MM-DD'),
      monto: monto,
      tipo: 'interes',
      descripcion: datos.descripcion || 'Pago de Interés (Sin Cronograma)',
    }]);
    agregarEvento(
      'pago',
      'Pago de Interés (Sin Cronograma)',
      `Pago de interés: $${formatMoney(monto)}. Fecha: ${dayjs(datos.fechaPago).format('DD/MM/YYYY')}${datos.descripcion ? `. ${datos.descripcion}` : ''}`,
      monto
    );
  };

  // Función para eliminar un pago de interés
  const handleEliminarPagoInteres = (pagoId) => {
    const pago = pagosIntereses.find(p => p.id === pagoId);
    if (!pago) return;

    setPagosIntereses(prev => prev.filter(p => p.id !== pagoId));
    setInteresAcumulado(prev => Math.max(0, prev - pago.monto));
    agregarEvento(
      'eliminacion_pago',
      'Pago de Interés Eliminado',
      `Se eliminó pago de interés por $${formatMoney(pago.monto)}. Fecha: ${dayjs(pago.fecha).format('DD/MM/YYYY')}`,
      pago.monto
    );
  };

  const cuotasConPagos = cuotas.filter(c => c.abonado > 0);
  const cuotasCompletamentePagadas = cuotas.filter(c => c.estado_pago === 'pagado');

  // Calcular datos según si es préstamo con o sin cronograma
  const esSinCronograma = datosPrestamoOriginal?.sinCronograma;
  const totalPagadoEfectivo = esSinCronograma ? totalPagadoCuotasSinCronograma : (resumenActual.totalPagado || 0);
  const saldoTotalEfectivo = esSinCronograma
    ? Math.max(0, (datosPrestamoOriginal?.saldoTotalOriginal || 0) - totalPagadoCuotasSinCronograma)
    : cuotas.reduce((sum, c) => sum + (c.saldo ?? c.valor), 0);

  const datosPrestamo = datosPrestamoOriginal ? {
    estado: saldoTotalEfectivo <= 0 ? "Crédito Pagado" : "Crédito Vigente",
    numeroTarjeta: datosPrestamoOriginal.numeroTarjeta || "",
    nombreCliente: datosPrestamoOriginal.nombreCliente || "",
    dineroPrestado: datosPrestamoOriginal.montoOriginal,
    plazoPrestamo: datosPrestamoOriginal.numeroCuotasOriginal,
    interes: datosPrestamoOriginal.tasaOriginal,
    valorCuota: datosPrestamoOriginal.valorCuotaOriginal,
    fechaPrestamo: config.fechaPrestamo,
    abonoTotalIntereses: totalPagadoEfectivo + interesAcumulado,
    abonoTotal: totalPagadoEfectivo,
    // Saldo Total: se reduce con pagos de cuotas y abonos parciales (no incluye intereses)
    saldoTotal: saldoTotalEfectivo,
    // Saldo A Inversion: empieza con el dinero prestado, se resta con pagos, mínimo 0
    saldoInversionIntereses: Math.max(0, datosPrestamoOriginal.montoOriginal - totalPagadoEfectivo - interesAcumulado),
    // Intereses Pendientes: solo disminuye cuando Abono Total recupera el dinero prestado
    interesesPendientes: datosPrestamoOriginal.totalInteresOriginal - Math.max(0, totalPagadoEfectivo - datosPrestamoOriginal.montoOriginal),
    // Cuotas Pagas: proporcional (ej: 1.5 si hay 1 completa y 1 al 50%)
    cuotasPagas: esSinCronograma
      ? Math.round((totalPagadoCuotasSinCronograma / datosPrestamoOriginal.valorCuotaOriginal) * 10) / 10
      : Math.round(cuotas.reduce((sum, c) => sum + ((c.abonado || 0) / c.valor), 0) * 10) / 10,
    // Cuotas Pendientes: total - pagas proporcional
    cuotasPendientes: esSinCronograma
      ? Math.round((datosPrestamoOriginal.numeroCuotasOriginal - (totalPagadoCuotasSinCronograma / datosPrestamoOriginal.valorCuotaOriginal)) * 10) / 10
      : Math.round((cuotas.length - cuotas.reduce((sum, c) => sum + ((c.abonado || 0) / c.valor), 0)) * 10) / 10,
    intereses: interesAcumulado,
    utilidadReal1: calcularUtilidad1(datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.saldoTotalOriginal, interesAcumulado),
    utilidadReal2: esSinCronograma
      ? calcularUtilidad2([{ abonado: totalPagadoCuotasSinCronograma }], datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.totalInteresOriginal, datosPrestamoOriginal.numeroCuotasOriginal, interesAcumulado)
      : calcularUtilidad2(cuotasConPagos, datosPrestamoOriginal.montoOriginal, datosPrestamoOriginal.totalInteresOriginal, datosPrestamoOriginal.numeroCuotasOriginal, interesAcumulado),
    utilidadReal3: esSinCronograma
      ? calcularUtilidad3([{ abonado: totalPagadoCuotasSinCronograma }], datosPrestamoOriginal.montoOriginal, interesAcumulado)
      : calcularUtilidad3(cuotasConPagos, datosPrestamoOriginal.montoOriginal, interesAcumulado),
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
    // Funciones y estados para préstamos sin cronograma
    totalPagadoCuotasSinCronograma,
    handlePagoCuotaSinCronograma,
    handlePagoInteresSinCronograma,
    // Pagos de intereses para mostrar en cronograma
    pagosIntereses,
    handleEliminarPagoInteres,
  };
};

export default useLoanManager;
