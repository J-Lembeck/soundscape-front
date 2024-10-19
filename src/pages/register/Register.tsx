import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Alert, InputAdornment, IconButton } from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Register() {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const validatePassword = (password: string) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
        return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!validatePassword(password)) {
            setError('A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais.');
            return;
        }

        try {
            await api.post('/auth/register', { name, email, password });
            showNotification({
                type: NotificationType.SUCCESS,
                content: 'Cadastro realizado com sucesso.',
            });
            navigate('/login');
        } catch (error) {
            if (error instanceof Error) {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha no cadastro: ' + error.message,
                });
            } else {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha no cadastro: Ocorreu um erro desconhecido.',
                });
            }
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };
    
    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <Container maxWidth="xs">
            <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
                <Typography variant="h5" mb={2}>
                    Cadastro
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    label="Nome de Usuário"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <TextField
                    label="Confirmar Senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowConfirmPassword}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleRegister}
                    sx={{ mt: 2 }}
                >
                    Cadastrar
                </Button>
                <Button
                    variant="text"
                    color="primary"
                    fullWidth
                    onClick={() => navigate('/login')}
                    sx={{ mt: 2 }}
                >
                    Entrar
                </Button>
            </Box>
        </Container>
    );
}
