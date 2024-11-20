import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Alert, InputAdornment, IconButton, Paper } from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';
import { ILoginProps } from './ILogin';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Login({ setIsAuthenticated }: ILoginProps) {
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
                borderColor: '#452C63',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'gray',
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#452C63',
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    borderRadius: 3,
                    backgroundColor: '#F4EFFD',
                }}
            >
                <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                    {/* Logo / Título */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            fontFamily: '"Outfit", sans-serif',
                            color: '#452C63',
                            marginBottom: 2,
                        }}
                    >
                        Sound
                        <span style={{ color: '#FFFFFF', backgroundColor: '#452C63', padding: '0 4px', borderRadius: '4px' }}>
                            Scape
                        </span>
                    </Typography>

                    {/* Erro */}
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                    {/* Campo Nome de Usuário */}
                    <TextField
                        label="Nome de Usuário"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={inputStyle}
                    />

                    {/* Campo Senha */}
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

                    {/* Botão Entrar */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleLogin}
                        sx={{
                            mt: 2,
                            backgroundColor: '#452C63',
                            color: '#fff',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#6A41A1',
                            },
                        }}
                    >
                        Entrar
                    </Button>

                    {/* Botão Cadastrar-se */}
                    <Button
                        variant="text"
                        fullWidth
                        onClick={() => navigate('/register')}
                        sx={{
                            mt: 2,
                            color: '#452C63',
                            fontWeight: 'bold',
                            textTransform: 'none',
                        }}
                    >
                        Cadastrar-se
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};
