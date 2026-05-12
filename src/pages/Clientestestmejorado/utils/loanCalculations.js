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
 * @param {number} capital - Monto del préstamo
 * @param {number} tasaMensual - Tasa de interés mensual (%)
 * @param {number} numeroCuotas - Número de cuotas a pagar
 * @param {number} duracionMeses - Duración en meses (opcional, si no se pasa usa numeroCuotas)
 */
export const calcularInteresSimple = (capital, tasaMensual, numeroCuotas, duracionMeses = null) => {
  // El interés se calcula sobre los MESES, no sobre el número de cuotas
  const mesesParaInteres = duracionMeses !== null ? duracionMeses : numeroCuotas;
  const interesMensual = capital * (tasaMensual / 100);
  const totalInteres = interesMensual * mesesParaInteres;
  const valorCuota = Math.ceil((capital + totalInteres) / numeroCuotas / 1000) * 1000;
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
 *
 * Suma directa de intereses esperados del prestamo (campo total_interes_pagar)
 * mas los intereses ya cobrados (interes_acumulado, que incluye pagos manuales
 * de interes e interes de liquidacion). No se deriva de saldo_total_pagar porque
 * ese campo puede tener restas (saldo a favor aplicado por ampliacion) que
 * desviarian la utilidad real.
 */
export const calcularUtilidad1 = (totalInteres, interesAcumulado = 0) => {
  return totalInteres + interesAcumulado;
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
 * Calcula la Utilidad 3 - Ganancia después de recuperar el capital invertido
 * Comienza en 0 hasta que se recupere el dinero invertido
 */
export const calcularUtilidad3 = (cuotasPagadas, montoOriginal, interesAcumulado = 0) => {
  const totalPagado = cuotasPagadas.reduce((sum, c) => sum + c.abonado, 0);
  // El capital invertido se considera recuperado cuando cuotas + intereses cobrados
  // superan el monto original. Asi la utilidad arranca a subir en el mismo instante
  // en que "Saldo A Inversion + Intereses" toca 0 (ambas formulas usan la misma base).
  const totalRecuperado = totalPagado + interesAcumulado;
  if (totalRecuperado <= montoOriginal) {
    return 0;
  }
  return totalRecuperado - montoOriginal;
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
 * @param {number} montoOriginal - Monto del préstamo
 * @param {number} tasaMensual - Tasa de interés mensual (%)
 * @param {number} numeroCuotas - Número total de cuotas
 * @param {number} duracionMeses - Duración en meses (opcional)
 */
export const calcularInteresCuota = (montoOriginal, tasaMensual, numeroCuotas, duracionMeses = null) => {
  const { totalInteres } = calcularInteresSimple(montoOriginal, tasaMensual, numeroCuotas, duracionMeses);
  return Math.ceil(totalInteres / numeroCuotas / 1000) * 1000;
};
