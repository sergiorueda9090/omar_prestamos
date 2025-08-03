import React, {useContext, useEffect, useState} from "react";
import { MyContext }    from "../../App";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  Stack,
  Button
} from '@mui/material';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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
    
    const dispatch = useDispatch();
    const context = useContext(MyContext)
    const utilidad1 = 10;
    const utilidad2 = 11;
    const utilidad3 = 12;

    useEffect(() =>{
        context.setIsHideSideBarAndHeader(false)
        window.scrollTo(0,0);
    },[])

    const navigate = useNavigate();

    const handleDevolver = (clienteId) => {
      navigate(`/clientes`);
    };

    const TablaCuotas = ({ cuotas }) => {
      if (!cuotas || cuotas.length === 0) {
        return (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No hay cuotas registradas.
          </Typography>
        );
      }

      return (
        <Box display="flex" justifyContent="center" mt={3}>
          <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>Fecha</strong></TableCell>
                  <TableCell align="center"><strong>Valor</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cuotas.map((cuota, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{cuota.fecha_pago}</TableCell>
                    <TableCell align="center">${cuota.valor}</TableCell>
                    <TableCell align="center">
                      <Typography
                        color={cuota.estado_pago === "pagado" ? "green" : "blue"}
                        fontWeight="bold"
                      >
                        {cuota.estado_pago.toUpperCase()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    };


    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 p-3 mt-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="hd">Detalles del Préstamo</h3>
                        <Button  className="btn-blue" variant="contained" onClick={handleDevolver}>Devolver</Button>
                    </div>
                       <Card sx={{ maxWidth: 700, borderRadius: 3, boxShadow: 3 }}>
                          <CardContent>
                            <Typography variant="h5" textAlign="center" gutterBottom>
                              📄 Detalles del Préstamo
                            </Typography>

                            <Stack spacing={1}>
                              <Typography><strong>Número de Tarjeta:</strong> {numeroTarjeta}</Typography>
                              <Typography><strong>Nombre del Cliente:</strong> {nombre}</Typography>
                              <Typography><strong>Fecha del Préstamo:</strong> {fechaPrestamo}</Typography>
                              <Typography><strong>Tipo de Préstamo:</strong> {tipoPrestamo}</Typography>
                              <Typography><strong>Duración (meses):</strong> {duracionPrestamo}</Typography>
                              <Typography><strong>Número de Cuotas:</strong> {numeroCuotas}</Typography>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Stack spacing={1}>
                              <Typography><strong>Monto del Préstamo:</strong> ${montoPrestamo}</Typography>
                              <Typography><strong>Porcentaje de Interés:</strong> {porcentajeInteres}%</Typography>
                              <Typography><strong>Interés Mensual:</strong> ${interesMensual}</Typography>
                              <Typography><strong>Valor de Cada Cuota:</strong> ${valorCuota}</Typography>
                              <Typography><strong>Total a Pagar en Intereses:</strong> ${totalInteresPagar}</Typography>
                              <Typography><strong>Saldo Total a Pagar:</strong> ${saldoTotalPagar}</Typography>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Stack spacing={1}>
                              <Typography><strong>📈 Utilidad 1:</strong> {utilidad1}</Typography>
                              <Typography><strong>📈 Utilidad 2:</strong> {utilidad2}</Typography>
                              <Typography><strong>📈 Utilidad 3:</strong> {utilidad3}</Typography>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" color="primary" gutterBottom>
                              🗓 Cuotas Programadas
                            </Typography>
                            <List dense>
                              <TablaCuotas cuotas={cuotas} />
                            </List>
                          </CardContent>
                        </Card>
                </div>
            </div>

        </>
        
    )
}