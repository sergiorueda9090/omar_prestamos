import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const Header = ({ onDevolver }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Detalles del Préstamo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Información completa del préstamo y estado de cuotas
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<ArrowBack />}
        onClick={onDevolver}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          px: 3,
          py: 1
        }}
      >
        Volver
      </Button>
    </Box>
  );
};

export default Header;