import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';

export default function Login() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);

            setError(null);
            navigate('/home');
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

    return (
        <Container maxWidth="xs">
            <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
                <Typography variant="h5" mb={2}>
                    Login
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    label="Nome de Usuário"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Senha"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                    sx={{ mt: 2 }}
                >
                    Entrar
                </Button>
            </Box>
        </Container>
    );
};
