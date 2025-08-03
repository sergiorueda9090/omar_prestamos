import React, {useContext, useEffect, useState} from "react";
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from "react-redux";
import { FormControl, MenuItem, Select, TextField, InputAdornment, IconButton, Autocomplete } from "@mui/material"
import { actionGetAllFilterData} from "../../../../store/userStore/userStoreActions";

export const Search = () => {

    const [searchText, setSearchText] = useState('');
    
    const dispatch = useDispatch();

    const handleSearchClick = () => {
        dispatch(actionGetAllFilterData(1, {search: searchText}));
    };


    return (
        <FormControl size="small" fullWidth className="w-100">
                    <TextField
                    size="small"
                    label="Buscar por..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleSearchClick}>
                            <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                        ),
                    }}
                    />
        </FormControl>
    )
}