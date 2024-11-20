import { Close, CloseSharp, Image as ImageIcon } from '@mui/icons-material';
import { Box, Button, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtistDTO } from '../../pages/artists/IArtist';
import api from '../../services/api';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';
import { IUploadFileModalProps } from './IUploadModalFile';

export default function UploadFileModal({ fetchSongsFromArtist, onClose }: IUploadFileModalProps) {
    const [title, setTitle] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFileInfo, setAudioFileInfo] = useState<{ name: string; size: number } | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const errorMessagesMap: { [key: string]: string } = {
        "Upload failed: The song matches a copyrighted song:": "Falha no upload: A música enviada coincide com uma música protegida por direitos autorais:"
    };

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];

            const validMimeType = file.type === 'audio/mpeg';
            const validExtension = file.name.toLowerCase().endsWith('.mp3');

            if (!validMimeType || !validExtension) {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Por favor, envie apenas arquivos MP3.',
                });
                return;
            }

            setAudioFile(file);
            setAudioFileInfo({
                name: file.name,
                size: file.size / 1024,
            });
        }
    };

    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            setImageFile(file);

            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);
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
            onClose();
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
        <Box display="flex" flexDirection="column" p={2} sx={{ width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="#4B306A">
                    Enviar Música
                </Typography>
                <IconButton onClick={onClose} aria-label="close">
                    <CloseSharp />
                </IconButton>
            </Box>

            <DialogContent style={{ padding: 0 }}>
                <Box display="flex" gap={2} width="100%" alignItems={"center"}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        width="130px"
                        height="130px"
                        border="2px dashed #CCCCCC"
                        borderRadius="8px"
                        bgcolor="#F9F9F9"
                        position="relative"
                    >
                        <IconButton component="label" sx={{ padding: 0, width: '100%', height: '100%' }}>
                            {imagePreviewUrl ? (
                                <>
                                    <img
                                        src={imagePreviewUrl}
                                        alt="Imagem Selecionada"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <IconButton
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setImageFile(null);
                                            setImagePreviewUrl(null);
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            padding: '4px',
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        <Close style={{ fontSize: 20, color: '#FFFFFF' }} />
                                    </IconButton>
                                </>
                            ) : (
                                <ImageIcon style={{ fontSize: 40, color: '#888888' }} />
                            )}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageFileChange}
                            />
                        </IconButton>
                    </Box>


                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems={"flex-end"} gap={1} flexGrow={1}>
                        <Box width="100%">
                            <Typography
                                component="label"
                                sx={{
                                    color: '#6A41A1',
                                    fontSize: '16px',
                                    fontWeight: 400,
                                    marginBottom: '4px',
                                }}
                            >
                                Título
                            </Typography>
                            <TextField
                                fullWidth
                                margin="normal"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                variant="outlined"
                                placeholder='Digita um título...'
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#6A41A1',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#4B306A',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#4B306A',
                                        },
                                    },
                                }}
                                style={{
                                    marginTop: 0,
                                    maxWidth: '280px',
                                }}
                            />
                        </Box>

                        {audioFileInfo && (
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ alignSelf: 'flex-start', marginBottom: 1 }}
                            >
                                {`Arquivo: ${audioFileInfo.name} (${audioFileInfo.size.toFixed(2)} KB)`}
                            </Typography>
                        )}

                        <Button
                            variant="contained"
                            component="label"
                            fullWidth
                            sx={{
                                maxWidth: '280px',
                                backgroundColor: '#4B306A',
                                color: '#FFFFFF',
                                '&:hover': {
                                    backgroundColor: '#2F184B',
                                },
                            }}
                        >
                            Selecionar Arquivo de Áudio
                            <input type="file" hidden accept="audio/*" onChange={handleAudioFileChange} />
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        maxWidth: '120px',
                        color: '#4B306A',
                        borderColor: '#4B306A',
                        '&:hover': {
                            backgroundColor: '#F9F9F9',
                            borderColor: '#2F184B',
                        },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={isUploading || !audioFile || !title}
                    sx={{
                        maxWidth: '120px',
                        backgroundColor: '#4B306A',
                        color: '#FFFFFF',
                        '&.Mui-disabled': {
                            backgroundColor: '#CCC',
                        },
                        '&:hover': {
                            backgroundColor: '#2F184B',
                        },
                    }}
                >
                    {isUploading ? 'Enviando...' : 'Enviar'}
                </Button>
            </Box>
        </Box>
    );
}
