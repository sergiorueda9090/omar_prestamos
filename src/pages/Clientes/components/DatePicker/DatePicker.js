import React, { useState } from 'react';
import { FormControl, TextField, Button, Tooltip } from '@mui/material';


import { useDispatch } from 'react-redux';
import { actionGetAllFilterData } from '../../../../store/userStore/userStoreActions';
import { RiFileExcel2Fill } from "react-icons/ri";
import { actionDownload } from '../../../../store/clientesStore/clientesStoreActions';

export const DatePickerValue = () => {
    const dispatch = useDispatch();

    const [startDateValue, setStartDateValue] = useState('');
    const [endDateValue, setEndDateValue] = useState('');

    const handleFilterClick = () => {
        dispatch(actionGetAllFilterData(1, {
          startDate: startDateValue,
          endDate: endDateValue
        }));
    };

    const handleClearFilters = () => {
        setStartDateValue('');
        setEndDateValue('');
        dispatch(actionGetAllFilterData(1)); // Sin filtros → trae todos los datos
    };

    const handleDownloadClient = () =>{
      dispatch(actionDownload({startDateValue, endDateValue}));
    }

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <FormControl size="small" fullWidth>
        <TextField
          label="Fecha Inicio"
          type="date"
          size="small"
          fullWidth
          value={startDateValue}
          onChange={(e) => setStartDateValue(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </FormControl>

      <FormControl size="small" fullWidth>
        <TextField
          label="Fecha Fin"
          type="date"
          size="small"
          fullWidth
          value={endDateValue}
          onChange={(e) => setEndDateValue(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </FormControl>
        <Button onClick={ handleFilterClick} disabled={!startDateValue && !endDateValue} className="btn-blue" variant="contained">Buscar</Button>
        <Button onClick={ handleClearFilters} disabled={!startDateValue && !endDateValue} className="btn-blue" variant="contained">Limpiar</Button>
        
     

        <Tooltip title="Descargar" arrow>
          <Button className="success" color="success" onClick={handleDownloadClient}>
            <RiFileExcel2Fill />
          </Button>
        </Tooltip>
        
        
    </div>
  );
};
