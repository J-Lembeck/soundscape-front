import React, { useState, useRef } from 'react';
import { TextField, Button, Box, Typography, IconButton } from '@mui/material';
import { AudioFile, Image as ImageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';
import { ArtistDTO } from '../../pages/artists/IArtist';
import { IUploadFileProps } from './IUploadFile';
import axios from 'axios';

export default function UploadFile({ fetchSongsFromArtist }: IUploadFileProps) {
    const [title, setTitle] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFileInfo, setAudioFileInfo] = useState<{ name: string; size: number } | null>(null);

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const errorMessagesMap: { [key: string]: string } = {
        "Upload failed: The song matches a copyrighted song:": "Falha no upload: A música enviada coincide com uma música protegida por direitos autorais:"
    };

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

    const handleOpenMyProfile = async () => {
        try {
            const response = await api.get<ArtistDTO>('/artists/findArtistFromLoggedUser');
            fetchSongsFromArtist(response.data.id);
            navigate(`/artist/${response.data.id}`);
        } catch (error) {
            showNotification({
                type: NotificationType.ERROR,
                content: 'Não foi possível redirecionar para o perfil do usuário.',
            });
        }
    };

    const handleUpload = async () => {
        setIsUploading(true);
        try {
            if (!title || !audioFile) {
                showNotification({
                    type: NotificationType.WARNING,
                    content: 'Por favor, preencha todos os campos.',
                });
                setIsUploading(false);
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('audioFile', audioFile);
            if (imageFile) formData.append('imageFile', imageFile);

            const response = await api.post('/songs/upload', formData);
            showNotification({
                type: NotificationType.SUCCESS,
                content: 'Upload realizado com sucesso!',
            });
            await handleOpenMyProfile();
        } catch (error) {
            setIsUploading(false);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const statusCode = error.response.status;
                    const responseData = error.response.data;

                    let backendMessage = '';
                    if (typeof responseData === 'string') {
                        backendMessage = responseData;
                    } else if (responseData && responseData.message) {
                        backendMessage = responseData.message;
                    }

                    let translatedMessage = 'Falha no upload: Ocorreu um erro.';
                    for (const [englishMessage, portugueseMessage] of Object.entries(errorMessagesMap)) {
                        if (backendMessage.startsWith(englishMessage)) {
                            translatedMessage = backendMessage.replace(englishMessage, portugueseMessage);
                            break;
                        }
                    }

                    showNotification({
                        type: NotificationType.ERROR,
                        content: translatedMessage,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha no upload: Não foi possível conectar ao servidor.',
                    });
                }
            } else {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha no upload: Ocorreu um erro desconhecido.',
                });
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
                                    borderRadius: '4px',
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
                        label="Título"
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

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        fullWidth
                        disabled={isUploading}
                    >
                        {isUploading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
