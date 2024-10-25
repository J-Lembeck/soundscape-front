import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Alert, InputAdornment, IconButton } from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';
import { ILoginProps } from './ILogin';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login({setIsAuthenticated}: ILoginProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            setIsAuthenticated(true);

            setError(null);
            navigate('/');
        } catch (error) {
            if (error instanceof Error) {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Usuário ou senha incorretos.',
                });
            } else {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao entrar: Ocorreu um erro desconhecido.',
                });
            }
        }
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'gray',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#4B306A',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'gray',
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#4B306A',
        }
    }

    return (
        <Container maxWidth="xs">
            <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
                <Typography variant="h5" mb={2}>
                    Soundscape
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    label="Nome de Usuário"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={inputStyle}
                />
                <TextField
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={inputStyle}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    style={{backgroundColor: "#4B306A"}}
                    fullWidth
                    onClick={handleLogin}
                    sx={{ mt: 2 }}
                >
                    Entrar
                </Button>
                <Button
                    variant="text"
                    style={{color: "#4B306A"}}
                    fullWidth
                    onClick={() => navigate('/register')}
                    sx={{ mt: 2 }}
                >
                    Cadastrar-se
                </Button>
            </Box>
        </Container>
    );
};
