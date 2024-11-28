import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Alert,
    InputAdornment,
    IconButton,
    Paper,
    InputLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';
import { ILoginProps } from './ILogin';

export default function Login({ setIsAuthenticated }: ILoginProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

            navigate('/');
        } catch (error: any) {
            showNotification({
                type: NotificationType.ERROR,
                content: 'Usuário ou senha incorretos.',
            });
        }
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            marginTop: '4px',
            '& fieldset': {
                border: 'none',
            },
        },
    };

    const errorInputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFEBEB',
            borderRadius: '6px',
            marginTop: '4px',
            '& fieldset': {
                border: 'none',
            },
        },
    };

    const labelStyle = {
        color: '#6A41A1',
        fontSize: '16px',
        fontWeight: 400,
        marginBottom: '4px',
    };

    const errorLabelStyle = {
        color: '#D32F2F',
        fontSize: '16px',
        fontWeight: 400,
        marginBottom: '4px',
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background:
                    'linear-gradient(45deg, rgba(2,0,36,1) 0%, rgba(69,44,99,1) 50%, rgba(106,65,161,1) 100%)',
                padding: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: 4,
                    borderRadius: 3,
                    backgroundColor: '#F4EFFD',
                }}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    sx={{ gap: 2, width: '100%' }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '24px 0',
                            fontWeight: '600',
                            fontFamily: 'Outfit, sans-serif !important',
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 'bold',
                                fontFamily: '"Outfit", sans-serif',
                                color: '#452C63',
                                fontSize: '36px',
                            }}
                        >
                            Sound
                            <span style={{ color: '#FFFFFF', backgroundColor: '#452C63', padding: '0 4px 6px', borderRadius: '4px' }}>
                                Scape
                            </span>
                        </Typography>
                    </Box>

                    <Box width="100%">
                        <InputLabel
                            htmlFor="username-input"
                            sx={errors.username ? errorLabelStyle : labelStyle}
                        >
                            Nome de Usuário
                        </InputLabel>
                        <TextField
                            id="username-input"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Digite seu usuário..."
                            sx={errors.username ? errorInputStyle : inputStyle}
                            style={{ marginTop: 0 }}
                            variant="outlined"
                        />
                    </Box>

                    <Box width="100%">
                        <InputLabel
                            htmlFor="password-input"
                            sx={errors.password ? errorLabelStyle : labelStyle}
                        >
                            Senha
                        </InputLabel>
                        <TextField
                            id="password-input"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha..."
                            sx={errors.password ? errorInputStyle : inputStyle}
                            style={{ marginTop: 0 }}
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                            sx={{
                                                color: '#452C63',
                                                '&:hover': {
                                                    color: '#6A41A1',
                                                },
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleLogin}
                        disabled={!username || !password}
                        sx={{
                            mt: 2,
                            backgroundColor: '#452C63',
                            color: '#fff',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: '6px',
                            '&:hover': {
                                backgroundColor: '#6A41A1',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#CCC',
                            },
                        }}
                    >
                        Entrar
                    </Button>

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
                        style={{ marginTop: 0 }}
                    >
                        Cadastrar-se
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
