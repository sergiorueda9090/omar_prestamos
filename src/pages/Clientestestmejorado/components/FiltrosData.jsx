import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  FormControl,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  actionGetAllPrestamos,
  actionGetAllFilterData,
} from '../../../store/prestamosTestStore/prestamosTestStoreActions';

const FiltrosData = () => {
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Buscar por texto (nombre o tarjeta)
  const handleSearch = () => {
    if (searchText.trim()) {
      dispatch(actionGetAllFilterData(1, { search: searchText }));
    }
  };

  // Buscar por Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Filtrar por rango de fechas
  const handleFilterByDate = () => {
    dispatch(actionGetAllFilterData(1, { startDate, endDate }));
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
    dispatch(actionGetAllPrestamos(1));
  };

  return (
    <div className="row cardFilters mt-3">
      {/* Busqueda por texto */}
      <div className="col-12 col-md-4 mb-3 mb-md-0">
        <FormControl size="small" fullWidth>
          <TextField
            size="small"
            label="Buscar por nombre o tarjeta..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      </div>

      {/* Filtros de fecha */}
      <div className="col-12 col-md-8">
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <FormControl size="small" fullWidth>
            <TextField
              label="Fecha Inicio"
              type="date"
              size="small"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>

          <FormControl size="small" fullWidth>
            <TextField
              label="Fecha Fin"
              type="date"
              size="small"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>

          <Tooltip title="Filtrar por fecha">
            <Button
              onClick={handleFilterByDate}
              disabled={!startDate && !endDate}
              className="btn-blue"
              variant="contained"
            >
              Buscar
            </Button>
          </Tooltip>

          <Tooltip title="Limpiar filtros">
            <Button
              onClick={handleClearFilters}
              disabled={!searchText && !startDate && !endDate}
              className="btn-blue"
              variant="contained"
            >
              Limpiar
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default FiltrosData;
