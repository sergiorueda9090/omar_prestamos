import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Paper, Stack, LinearProgress, Chip } from '@mui/material';
import { ShowChart, TrendingUp, MonetizationOn, Assessment } from '@mui/icons-material';

const UtilidadCard = ({ numero, valor, icono, color, descripcion }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `2px solid ${color}40`,
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: `0 12px 24px ${color}30`,
        border: `2px solid ${color}`,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        background: `${color}10`,
        borderRadius: '50%',
      }
    }}
  >
    <Box position="relative" zIndex={1}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}40`
          }}
        >
          {icono}
        </Box>
        <Chip
          label={`#${numero}`}
          size="small"
          sx={{
            backgroundColor: color,
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </Box>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        fontWeight={500}
        gutterBottom
      >
        {descripcion}
      </Typography>
      
      <Typography 
        variant="h4" 
        fontWeight="bold" 
        sx={{ 
          color: color,
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        ${parseFloat(valor).toLocaleString('es-CO')}
      </Typography>

      <Box 
        display="flex" 
        alignItems="center" 
        gap={0.5} 
        mt={1.5}
        sx={{ color: color }}
      >
        <TrendingUp fontSize="small" />
        <Typography variant="caption" fontWeight="bold">
          Ganancia activa
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const AnalisisUtilidades = ({ utilidad1, utilidad2, utilidad3, utilidadTotal }) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <ShowChart sx={{ fontSize: 32, color: '#2e7d32' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Análisis de Utilidades
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Desglose de ganancias por categoría
              </Typography>
            </Box>
          </Box>
          <Paper 
            elevation={3} 
            sx={{ 
              px: 3, 
              py: 1.5, 
              backgroundColor: '#2e7d32',
              borderRadius: 2
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
              TOTAL
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
              ${utilidadTotal.toLocaleString('es-CO')}
            </Typography>
          </Paper>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <UtilidadCard
              numero={1}
              valor={utilidad1}
              descripcion="Utilidad Principal"
              icono={<MonetizationOn sx={{ color: 'white', fontSize: 28 }} />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <UtilidadCard
              numero={2}
              valor={utilidad2}
              descripcion="Utilidad Secundaria"
              icono={<Assessment sx={{ color: 'white', fontSize: 28 }} />}
              color="#9c27b0"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <UtilidadCard
              numero={3}
              valor={utilidad3}
              descripcion="Utilidad Complementaria"
              icono={<TrendingUp sx={{ color: 'white', fontSize: 28 }} />}
              color="#ed6c02"
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Distribución de Utilidades
            </Typography>
            <Stack spacing={1.5} mt={2}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Utilidad 1
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {((utilidad1 / utilidadTotal) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(utilidad1 / utilidadTotal) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#1976d220',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#1976d2',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Utilidad 2
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {((utilidad2 / utilidadTotal) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(utilidad2 / utilidadTotal) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#9c27b020',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#9c27b0',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Utilidad 3
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {((utilidad3 / utilidadTotal) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(utilidad3 / utilidadTotal) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#ed6c0220',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ed6c02',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </Stack>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalisisUtilidades;