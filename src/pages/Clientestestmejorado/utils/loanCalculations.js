import dayjs from 'dayjs';

/**
 * Convierte string formateado a número
 * Ejemplo: "1.000.000" -> 1000000
 */
export const parseMoney = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(/\./g, '').replace(/,/g, '.')) || 0;
};

/**
 * Formatea número a string estilo colombiano
 * Ejemplo: 1000000 -> "1.000.000"
 */
export const formatMoney = (value) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Calcula interés simple sobre un capital
 */
export const calcularInteresSimple = (capital, tasaMensual, numeroCuotas) => {
  const interesMensual = capital * (tasaMensual / 100);
  const totalInteres = interesMensual * numeroCuotas;
  const valorCuota = (capital + totalInteres) / numeroCuotas;
  const saldoTotal = capital + totalInteres;

  return {
    interesMensual,
    totalInteres,
    valorCuota,
    saldoTotal,
  };
};

/**
 * Calcula número de cuotas según duración y tipo
 */
export const calcularNumeroCuotasPorDuracion = (duracion, tipo) => {
  const meses = parseInt(duracion);

  switch (tipo) {
    case 'Mensual':
      return meses;
    case 'Quincenal':
      return meses * 2;
    case 'Semanal':
      return meses * 4;
    case 'Diario':
      return meses * 30;
    default:
      return meses;
  }
};

/**
 * Genera fechas de cobro según tipo de préstamo
 */
export const calcularFechasCobro = (fechaInicial, numeroCuotas, tipo, dia) => {
  const fechas = [];
  let fechaActual = dayjs(fechaInicial);

  for (let i = 0; i < numeroCuotas; i++) {
    if (tipo === 'Mensual') {
      fechaActual = fechaActual.add(1, 'month');
      if (dia) {
        fechaActual = fechaActual.date(parseInt(dia));
      }
    } else if (tipo === 'Quincenal') {
      fechaActual = fechaActual.add(15, 'days');
    } else if (tipo === 'Semanal') {
      fechaActual = fechaActual.add(7, 'days');
    } else if (tipo === 'Diario') {
      fechaActual = fechaActual.add(1, 'day');
    }

    fechas.push(fechaActual.format('YYYY-MM-DD'));
  }

  return fechas;
};

/**
 * Aplica saldo a favor a las cuotas de un nuevo cronograma
 */
export const aplicarSaldoFavorACuotas = (cuotas, saldoFavor) => {
  let saldoRestante = saldoFavor;

  return cuotas.map((cuota) => {
    if (saldoRestante <= 0) {
      return { ...cuota, estado_pago: 'pendiente', abonado: 0, saldo: cuota.valor };
    }

    const valorCuota = cuota.valor;

    if (saldoRestante >= valorCuota) {
      saldoRestante -= valorCuota;
      return {
        ...cuota,
        estado_pago: 'pagado',
        abonado: valorCuota,
        saldo: 0,
      };
    } else {
      const saldoPendiente = valorCuota - saldoRestante;
      const cuotaActualizada = {
        ...cuota,
        estado_pago: 'parcial',
        abonado: saldoRestante,
        saldo: saldoPendiente,
      };
      saldoRestante = 0;
      return cuotaActualizada;
    }
  });
};

/**
 * Calcula la Utilidad 1 - Ganancia total inmediata + intereses pagados
 */
export const calcularUtilidad1 = (montoOriginal, totalAPagar, interesAcumulado = 0) => {
  return (totalAPagar - montoOriginal) + interesAcumulado;
};

/**
 * Calcula la Utilidad 2 - Ganancia distribuida por cuotas + intereses pagados
 */
export const calcularUtilidad2 = (cuotasPagadas, montoOriginal, totalInteres, numeroCuotasTotal, interesAcumulado = 0) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  const totalAPagar = montoOriginal + totalInteres;
  const proporcionInteres = totalInteres / totalAPagar;
  return (totalPagado * proporcionInteres) + interesAcumulado;
};

/**
 * Calcula la Utilidad 3 - Ganancia después de recuperar el capital + intereses pagados
 */
export const calcularUtilidad3 = (cuotasPagadas, montoOriginal, interesAcumulado = 0) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  if (totalPagado <= montoOriginal) {
    return interesAcumulado;
  }
  return (totalPagado - montoOriginal) + interesAcumulado;
};

/**
 * Calcula el porcentaje de capital recuperado
 */
export const calcularPorcentajeCapitalRecuperado = (cuotasPagadas, montoOriginal) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  const porcentaje = Math.min((totalPagado / montoOriginal) * 100, 100);
  return porcentaje;
};

/**
 * Calcula el interés de una cuota individual
 */
export const calcularInteresCuota = (montoOriginal, tasaMensual, numeroCuotas) => {
  const { totalInteres } = calcularInteresSimple(montoOriginal, tasaMensual, numeroCuotas);
  return totalInteres / numeroCuotas;
};
