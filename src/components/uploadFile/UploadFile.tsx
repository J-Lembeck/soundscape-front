import React, { useState, useRef } from 'react';
import { TextField, Button, Box, Typography, IconButton } from '@mui/material';
import { AudioFile, Image as ImageIcon } from '@mui/icons-material';
import api from '../../services/api';

export default function UploadFile() {
    const [title, setTitle] = useState<string>('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFileInfo, setAudioFileInfo] = useState<{ name: string; size: number } | null>(null);

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            setAudioFile(file);
            setAudioFileInfo({
                name: file.name,
                size: file.size / 1024,
            });
        }
    };

    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImageFile(event.target.files[0]);
        }
    };

    const handleImageClick = () => {
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!title || !audioFile || !imageFile) {
            alert('Please fill in all fields');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('audioFile', audioFile);
        formData.append('imageFile', imageFile);

        try {
            const response = await api.post('/songs/upload', formData);
            alert('Upload successful: ' + response.data);
        } catch (error) {
            if (error instanceof Error) {
                alert('Upload failed: ' + error.message);
            } else {
                alert('Upload failed: An unknown error occurred.');
            }
        }
    };

    return (
        <Box display="flex" justifyContent="center" mt={4}>
            <Box display="flex" maxWidth="800px" width="100%" gap={4}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minWidth="200px"
                    minHeight="200px"
                    border="1px dashed gray"
                    borderRadius="4px"
                    overflow="hidden"
                >
                    <IconButton component="label" onClick={handleImageClick} sx={{ padding: 0 }}>
                        {imageFile ? (
                            <img
                                src={URL.createObjectURL(imageFile)}
                                alt="Selected"
                                style={{
                                    width: '200px',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                }}
                            />
                        ) : (
                            <ImageIcon style={{ fontSize: 50 }} />
                        )}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageFileChange}
                            ref={imageInputRef}
                        />
                    </IconButton>
                </Box>

                <Box display="flex" flexDirection="column" gap={2} width="100%">
                    <TextField
                        label="Song Title"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />

                    <Box display="flex" flexDirection="column" gap={1}>
                        <Button variant="contained" component="label" fullWidth startIcon={<AudioFile />}>
                            Enviar arquivo de áudio
                            <input type="file" hidden accept="audio/*" onChange={handleAudioFileChange} />
                        </Button>
                        {audioFileInfo && (
                            <Typography variant="body2" color="textSecondary">
                                {`Arquivo: ${audioFileInfo.name} (${audioFileInfo.size.toFixed(2)} KB)`}
                            </Typography>
                        )}
                    </Box>

                    <Button variant="contained" color="primary" onClick={handleUpload} fullWidth>
                        Enviar
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
