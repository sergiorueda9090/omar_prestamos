import './ImageUploader.css';
import React, { useState } from 'react';
import { Button, Avatar, IconButton } from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { handleForm, ImageUploaderStore, clearForm } from '../../store/ImageUploaderStore/ImageUploaderStore';

export const ImageUploader = () => {

  const dispatch = useDispatch();
  
  const {file}   = useSelector((state) => state.ImageUploaderStore);

  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    
    const selected = e.target.files[0];
    if (selected) {
      dispatch(handleForm({ name: 'file', value: selected }));

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleRemoveImage = () => {
    dispatch(clearForm());
    setPreview(null);
  };

  return (
    <div className="image-uploader-container">
      <label htmlFor="upload-photo" className="image-label">
        <Avatar
          src={preview || '../../assets/images/default-user.png'}
          sx={{ width: 150, height: 150, marginBottom: 1 }}
        />
        <input
          type="file"
          id="upload-photo"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <Button
          variant="contained"
          component="span"
          startIcon={<PhotoCamera />}
          size="small"
        >
          Subir Foto
        </Button>
      </label>

      {file && (
        <IconButton onClick={handleRemoveImage} color="error" size="small">
          <Delete /> Eliminar
        </IconButton>
      )}
    </div>
  );
};
