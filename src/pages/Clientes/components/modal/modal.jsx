import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Box,
  Grid,
  InputAdornment,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import dayjs from 'dayjs';
import { actionCloseModal } from '../../../../store/globalStore/globalStoreActions';
import { actionFormStore, actionCreateRecord, actionUpdateRecord, actionClearData } from '../../../../store/clientesStore/clientesStoreActions';
import { useSelector, useDispatch } from 'react-redux';

export const Modal = () => {

  const dispatch = useDispatch();

  const { openMolda } = useSelector((state) => state.globalStore);
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
  } = useSelector((state) => state.clientesStore);
  
  const [errors, setErrors] = useState({});

  const [porcentajeInteresCheck, setPorcentajeInteresCheck] = useState(true);

  const handleCheckboxChange = (event) => {
      setPorcentajeInteresCheck(event.target.checked);
      dispatch(actionClearData());
  };

  // Función para llenar datos de prueba
  const llenarDatosPrueba = () => {
    // Diferentes conjuntos de datos de prueba
    const nombresPrueba = [
      'Juan Carlos Pérez García',
      'María Fernanda López Ramírez',
      'Carlos Alberto Rodríguez Martínez',
      'Ana Patricia Gómez Hernández',
      'Luis Eduardo Torres Sánchez'
    ];

    const tiposPrestamo = ['Mensual', 'Quincenal', 'Semanal', 'Diario'];
    const tipoSeleccionado = tiposPrestamo[Math.floor(Math.random() * tiposPrestamo.length)];
    const nombreSeleccionado = nombresPrueba[Math.floor(Math.random() * nombresPrueba.length)];

    // Datos de prueba base
    const datosPrueba = {
      numeroTarjeta: `TC-${Math.floor(Math.random() * 900000) + 100000}`,
      nombre: nombreSeleccionado,
      montoPrestamo: '1.000.000',
      porcentajeInteres: '10',
      duracionPrestamo: '12',
      tipoPrestamo: tipoSeleccionado,
      fechaPrestamo: dayjs().format('YYYY-MM-DD'),
      diaCobro: dayjs().add(1, 'month').format('YYYY-MM-DD')
    };

    // Llenar los campos básicos
    dispatch(actionFormStore({ name: 'numeroTarjeta', value: datosPrueba.numeroTarjeta }));
    dispatch(actionFormStore({ name: 'nombre', value: datosPrueba.nombre }));
    dispatch(actionFormStore({ name: 'montoPrestamo', value: datosPrueba.montoPrestamo }));
    dispatch(actionFormStore({ name: 'porcentajeInteres', value: datosPrueba.porcentajeInteres }));
    dispatch(actionFormStore({ name: 'duracionPrestamo', value: datosPrueba.duracionPrestamo }));
    dispatch(actionFormStore({ name: 'tipoPrestamo', value: datosPrueba.tipoPrestamo }));
    dispatch(actionFormStore({ name: 'fechaPrestamo', value: datosPrueba.fechaPrestamo }));
    dispatch(actionFormStore({ name: 'diaCobro', value: datosPrueba.diaCobro }));

    // Paso 1: Calcular número de cuotas según tipo de préstamo
    setTimeout(() => {
      calcularNumeroCuotasPorDuracion(datosPrueba.tipoPrestamo, datosPrueba.duracionPrestamo);

      // Paso 2: Calcular valores financieros (intereses, total, etc.)
      setTimeout(() => {
        calcularPrestamoSimple(
          datosPrueba.montoPrestamo,
          datosPrueba.porcentajeInteres,
          datosPrueba.duracionPrestamo,
          datosPrueba.tipoPrestamo
        );

        // Paso 3: Generar las cuotas (necesita numeroCuotas y valorCuota ya calculados)
        setTimeout(() => {
          // Aquí ya deberíamos tener numeroCuotas y valorCuota en el store
          // Vamos a forzar la generación de cuotas
          const monto = parseFloat(datosPrueba.montoPrestamo.replace(/\./g, ''));
          const interes = parseFloat(datosPrueba.porcentajeInteres);
          const tiempo = parseInt(datosPrueba.duracionPrestamo);
          const interesTotal = monto * (interes / 100) * tiempo;
          const totalPagar = monto + interesTotal;
          let cuotaMensual = totalPagar / tiempo;

          // Ajustar cuota según frecuencia
          switch (datosPrueba.tipoPrestamo.toLowerCase()) {
            case 'quincenal':
              cuotaMensual /= 2;
              break;
            case 'semanal':
              cuotaMensual /= 4;
              break;
            case 'diario':
              cuotaMensual /= 30;
              break;
            default:
              break;
          }

          const formatearSinSimbolo = (valor) =>
            new Intl.NumberFormat('es-CO', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(valor);

          const valorCuotaFormateado = formatearSinSimbolo(cuotaMensual);

          // Calcular número de cuotas
          const diasEnMes = 30;
          let numCuotas;
          switch (datosPrueba.tipoPrestamo.toLowerCase()) {
            case 'mensual':
              numCuotas = tiempo;
              break;
            case 'quincenal':
              numCuotas = Math.floor((tiempo * diasEnMes) / 15);
              break;
            case 'semanal':
              numCuotas = Math.floor((tiempo * diasEnMes) / 7);
              break;
            case 'diario':
              numCuotas = tiempo * diasEnMes;
              break;
            default:
              numCuotas = 0;
          }

          // Generar fechas de cobro
          const fechasCobro = calcularFechasCobro(
            datosPrueba.diaCobro,
            datosPrueba.tipoPrestamo,
            numCuotas,
            valorCuotaFormateado
          );

          dispatch(actionFormStore({ name: 'cuotas', value: fechasCobro }));
        }, 300);
      }, 200);
    }, 100);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!nombre.trim()) newErrors.nombre = 'Campo requerido';
    if (!montoPrestamo) newErrors.montoPrestamo = 'Campo requerido';
    if (!porcentajeInteres) newErrors.porcentajeInteres = 'Campo requerido';
    if (!duracionPrestamo) newErrors.duracionPrestamo = 'Campo requerido';
    if (!tipoPrestamo) newErrors.tipoPrestamo = 'Campo requerido';
    if (!fechaPrestamo) newErrors.fechaPrestamo = 'Campo requerido';
    if (!diaCobro) newErrors.diaCobro = 'Campo requerido';
    if (!interesMensual) newErrors.interesMensual = 'Campo requerido';
    if (!numeroCuotas) newErrors.numeroCuotas = 'Campo requerido';
    if (!valorCuota) newErrors.valorCuota = 'Campo requerido';
    if (!totalInteresPagar) newErrors.totalInteresPagar = 'Campo requerido';
    if (!saldoTotalPagar) newErrors.saldoTotalPagar = 'Campo requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatNumber = (val) => {
    const num = val.replace(/\./g, '').replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };


  const handleChange = (e) => {
    const {name, value} = e.target;
    
    if(name == "tipoPrestamo" && porcentajeInteresCheck){
      calcularPrestamoSimple(montoPrestamo, porcentajeInteres, duracionPrestamo, value);
      calcularNumeroCuotasPorDuracion(value, duracionPrestamo)
      dispatch(actionFormStore(e.target));
      return
    }

    if(name == "tipoPrestamo" && !porcentajeInteresCheck){
      calcularNumeroCuotasPorDuracion(value, duracionPrestamo)
      dispatch(actionFormStore(e.target));
      return
    }

    if(name == "montoPrestamo"){
      const formatted = formatNumber(e.target.value);
      dispatch(actionFormStore({ name, value: formatted}));
      return
    }

    if(name == "diaCobro"){
      const fechasCobro = calcularFechasCobro(value, tipoPrestamo, numeroCuotas, valorCuota);
      dispatch(actionFormStore({ name:"cuotas", value: fechasCobro}));
      dispatch(actionFormStore({ name, value}));
      
      return
    }

    if(name == "valorCuota" && !porcentajeInteresCheck){
      const monto = limpiarNumero(montoPrestamo);
      const cuotas = limpiarNumero(duracionPrestamo);
      const cuotaMensual = limpiarNumero(value);
      const interes = calcularInteresMensualAproximado(monto, cuotas, cuotaMensual, tipoPrestamo);
      console.log("interes ",interes)
      dispatch(actionFormStore({ name:"porcentajeInteres", value: interes}));
      

      const formatted = formatNumber(e.target.value);
      dispatch(actionFormStore({ name, value: formatted}));
     
      calcularPrestamoSimple(monto, interes, cuotas);
      return
    }

    dispatch(actionFormStore(e.target));
  };

  function limpiarNumero(valor) {
    if (typeof valor === 'string') {
      return parseFloat(valor.replace(/[.,]/g, ''));
    }
    return valor;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(actionCreateRecord());
  };

  const handlEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(actionUpdateRecord(id));
  };

  const handleOpenModal = async () => {
    dispatch(actionCloseModal())
  }


  const calcularPrestamoSimple = (montoPrestamo, interesMensual, meses, frecuenciaPago) => {
    // Eliminar puntos y convertir a número
    const monto = parseFloat(String(montoPrestamo).replace(/\./g, '').replace(',', '.'));
    const interes = parseFloat(interesMensual);
    const tiempo = parseInt(meses);

    if (!monto || !interes || !tiempo) return;

    const interesTotal = monto * (interes / 100) * tiempo;
    const totalPagar = monto + interesTotal;
    let cuotaMensual = totalPagar / tiempo;
    const interesMensualPesos = interesTotal / tiempo;


    // Ajustar cuota según frecuencia de pago
    if(porcentajeInteresCheck){
          switch (frecuenciaPago.toLowerCase()) {
              case 'quincenal':
                  cuotaMensual /= 2;
                  break;
              case 'semanal':
                  cuotaMensual /= 4;
                  break;
              case 'diario':
                  cuotaMensual /= 30;
                  break;
              case 'mensual':
                  cuotaMensual /= 1;
                  break;
              default:
                  // No se modifica
                break;
          }
          console.log(" cuotaMensual ",cuotaMensual)
    }


    // Formato sin símbolo de moneda
    const formatearSinSimbolo = (valor) =>
      new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(valor);

      if(!porcentajeInteresCheck){
        dispatch(actionFormStore({ name: "saldoTotalPagar",   value: formatearSinSimbolo(totalPagar) }));
        dispatch(actionFormStore({ name: "interesMensual",    value: formatearSinSimbolo(interesMensualPesos) }));
        dispatch(actionFormStore({ name: "totalInteresPagar", value: formatearSinSimbolo(interesTotal) }));
        return;
      }

    // Despachar todos los valores
    dispatch(actionFormStore({ name: "totalInteresPagar", value: formatearSinSimbolo(interesTotal) }));
    dispatch(actionFormStore({ name: "saldoTotalPagar",   value: formatearSinSimbolo(totalPagar) }));
    dispatch(actionFormStore({ name: "valorCuota",        value: formatearSinSimbolo(cuotaMensual) }));
    dispatch(actionFormStore({ name: "interesMensual",    value: formatearSinSimbolo(interesMensualPesos) }));
  };



  const calcularFechasCobro = (fechaInicio, tipoPrestamo, numeroCuotas, valorCuota) => {
    const fechas = [];
    let fecha = dayjs(fechaInicio);

    for (let i = 0; i < numeroCuotas; i++) {
      let nuevaFecha;

      switch (tipoPrestamo.toLowerCase()) {
        case 'mensual':
          nuevaFecha = fecha.add(i, 'month');
          break;
        case 'quincenal':
          nuevaFecha = fecha.add(i * 15, 'day');
          break;
        case 'semanal':
          nuevaFecha = fecha.add(i * 7, 'day');
          break;
        case 'diario':
          nuevaFecha = fecha.add(i, 'day');
          break;
        default:
          nuevaFecha = fecha;
      }

      fechas.push({
        fecha_pago: nuevaFecha.format('YYYY-MM-DD'),
        valor: valorCuota,
        estado_pago: 'pendiente'
      });
    }
    console.log(fechas)
    return fechas;
  };

  const calcularNumeroCuotasPorDuracion = (tipoPrestamo, duracionEnMeses) => {
    const diasEnMes = 30; // Aprox. promedio para préstamos

    switch (tipoPrestamo.toLowerCase()) {
      case 'mensual':
        return dispatch(actionFormStore({ name: "numeroCuotas", value: duracionEnMeses }));

      case 'quincenal':
        return dispatch(actionFormStore({ name: "numeroCuotas",value: Math.floor((duracionEnMeses * diasEnMes) / 15) }));

      case 'semanal':
        return dispatch(actionFormStore({ name: "numeroCuotas",value: Math.floor((duracionEnMeses * diasEnMes) / 7) }));

      case 'diario':
        return dispatch(actionFormStore({ name: "numeroCuotas",value: duracionEnMeses * diasEnMes }));

      default:
        return dispatch(actionFormStore({ name: "numeroCuotas",value: 0 }));;
    }
  };


  function calcularInteresMensualAproximado(dp, t, vcm, frecuencia = 'mensual') {
    if (!dp || !t || !vcm || dp <= 0 || t <= 0 || vcm <= 0) {
      return "Datos inválidos";
    }

    let multiplicador = 1;
    switch (frecuencia.toLowerCase()) {
      case 'quincenal':
        multiplicador = 2;
        break;
      case 'semanal':
        multiplicador = 4;
        break;
      case 'diario':
        multiplicador = 30;
        break;
      case 'mensual':
      default:
        multiplicador = 1;
        break;
    }

    const interesMensual = (((vcm * multiplicador) * t - dp) / (dp * t)) * 100;
    return interesMensual.toFixed(6);
  }
  
  console.log(" porcentajeInteresCheck ",porcentajeInteresCheck)
  return (
    <>
      <Dialog open={openMolda} fullWidth maxWidth="md">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>{ id != "" ? "Editar Cliente": "Crear Cliente"}</span>
            {id === "" && (
              <Button
                variant="outlined"
                size="small"
                onClick={llenarDatosPrueba}
                sx={{ textTransform: 'none' }}
              >
                Llenar Datos de Prueba
              </Button>
            )}
          </Box>
        </DialogTitle>
        <form onSubmit={id !== "" ? handlEditSubmit : handleSubmit}>

          <DialogContent>

            <Box display="flex" flexDirection="column" gap={2}>

              <Grid container spacing={2}>
                {/* ===== GRIND ==== */}
                <Grid size={3}>
                  <TextField
                    label="Número de Tarjeta"
                    name="numeroTarjeta"
                    value={numeroTarjeta}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.numeroTarjeta}
                    helperText={errors.numeroTarjeta}
                  />
                </Grid>

                <Grid size={9}>
                  <TextField
                    label="Nombre completo"
                    name="nombre"
                    value={nombre}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                  />
                </Grid>

                {/* ===== END GRIND ==== */}

                {/* ===== GRIND ==== */}
                <Grid item size={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={porcentajeInteresCheck}
                        onChange={handleCheckboxChange}
                        name="porcentajeInteres"
                      />
                    }
                    label="Porcentaje de Interés"
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    label="Monto del Préstamo"
                    name="montoPrestamo"
                    type="text"
                    value={montoPrestamo}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.montoPrestamo}
                    helperText={errors.montoPrestamo}
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    label="Porcentaje de Interés"
                    name="porcentajeInteres"
                    type="number"
                    value={porcentajeInteres}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.porcentajeInteres}
                    helperText={errors.porcentajeInteres}
                    disabled={!porcentajeInteresCheck}
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    label="Duración del Préstamo (meses)"
                    name="duracionPrestamo"
                    type="number"
                    value={duracionPrestamo}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.duracionPrestamo}
                    helperText={errors.duracionPrestamo}
                  />
                </Grid>

                {/* ===== END GRIND ==== */}

                {/* ===== GRIND ==== */}
                <Grid size={4}>
                    <TextField
                        select
                        label="Tipo de Préstamo"
                        name="tipoPrestamo"
                        value={tipoPrestamo}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.tipoPrestamo}
                        helperText={errors.tipoPrestamo}
                      >
                        <MenuItem value="">Selecciona una opción</MenuItem>
                        <MenuItem value="Mensual">Mensual</MenuItem>
                        <MenuItem value="Quincenal">Quincenal</MenuItem>
                        <MenuItem value="Semanal">Semanal</MenuItem>
                        <MenuItem value="Diario">Diario</MenuItem>
                    </TextField>
                </Grid>
                {/* ===== END GRIND ==== */}

                {/* ===== GRIND ==== */}
                
                <Grid size={4}>
                  <TextField
                    label="Interés Mensual"
                    name="interesMensual"
                    type="text"
                    value={interesMensual}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.interesMensual}
                    helperText={errors.interesMensual}
                    disabled
                  />
                </Grid>

                <Grid size={3}>
                  <TextField
                    label="Número de Cuotas"
                    name="numeroCuotas"
                    type="text"
                    value={numeroCuotas}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.numeroCuotas}
                    helperText={errors.numeroCuotas}
                    disabled
                  />
                </Grid>

                <Grid size={9}>
                    <TextField
                      label="Valor de la Cuota"
                      name="valorCuota"
                      type="text"
                      value={valorCuota}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.valorCuota}
                      helperText={errors.valorCuota}
                      disabled={porcentajeInteresCheck === true}
                    />
                </Grid>
                {/* ===== END GRIND ==== */}

                {/* ===== GRIND ==== */}
                <Grid size={6}>
                    <TextField
                      label="Total Intereses a Pagar"
                      name="totalInteresPagar"
                      type="text"
                      value={totalInteresPagar}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.totalInteresPagar}
                      helperText={errors.totalInteresPagar}
                      disabled
                    />
                </Grid>

                  <Grid size={6}>
                      <TextField
                        label="Saldo Total a Pagar"
                        name="saldoTotalPagar"
                        type="text"
                        value={saldoTotalPagar}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.saldoTotalPagar}
                        helperText={errors.saldoTotalPagar}
                        disabled
                      />
                </Grid>

                
                <Grid size={6}>
                  <TextField
                    label="Fecha del Préstamo"
                    name="fechaPrestamo"
                    type="date"
                    value={fechaPrestamo}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!!errors.fechaPrestamo}
                    helperText={errors.fechaPrestamo}
                  />
                </Grid>

                <Grid size={6}>
                  <TextField
                    label="Día de Cobro"
                    name="diaCobro"
                    type="date"
                    value={diaCobro}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    required
                    error={!!errors.diaCobro}
                    helperText={errors.diaCobro}
                  />
                </Grid>
                {/* ===== END GRIND ==== */}

              </Grid>

            </Box>
  
          </DialogContent>

          <DialogActions>
            <Button onClick={handleOpenModal}>Cancelar</Button>
            <Button type="submit" className='btn-blue' variant="contained">{ id != "" ? "Editar Cliente": "Crear Cliente"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
