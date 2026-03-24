import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

export const BackdropComponent = () => {
    const { openBackDropStore } = useSelector((state) => state.globalStore);
    return (
        <div>
        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={openBackDropStore}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
        </div>
  );
}