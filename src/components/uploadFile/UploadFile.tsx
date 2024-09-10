import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import api from '../../services/api';

export default function UploadFile() {
    const [title, setTitle] = useState<string>('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setAudioFile(event.target.files[0]);
        }
    };

    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImageFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!title || !audioFile || !imageFile) {
            alert("Please fill in all fields");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('artistId', '1');
        formData.append('audioFile', audioFile);
        formData.append('imageFile', imageFile);

        try {
            const response = await api.post('/songs/upload', formData);
            alert("Upload successful: " + response.data);
        } catch (error) {
            if (error instanceof Error) {
                alert("Upload failed: " + error.message);
            } else {
                alert("Upload failed: An unknown error occurred.");
            }
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <TextField
                label="Song Title"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
            />
            <Button variant="contained" component="label" fullWidth>
                Upload Audio File
                <input type="file" hidden accept="audio/*" onChange={handleAudioFileChange} />
            </Button>
            <Button variant="contained" component="label" fullWidth>
                Upload Image File
                <input type="file" hidden accept="image/*" onChange={handleImageFileChange} />
            </Button>
            <Button variant="contained" color="primary" onClick={handleUpload} fullWidth>
                Submit
            </Button>
        </Box>
    );
}
