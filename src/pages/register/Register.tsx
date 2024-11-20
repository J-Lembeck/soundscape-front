import { Visibility, VisibilityOff, CheckCircle, ErrorOutline } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    NotificationType,
    useNotification,
} from '../../utils/notifications/NotificationContext';

export default function Register() {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleRegister = async () => {
        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await api.post('/auth/register', { name, email, password });
            showNotification({
                type: NotificationType.SUCCESS,
                content: 'Cadastro realizado com sucesso.',
            });
            navigate('/login');
        } catch (error: any) {
            handleApiErrors(error);
        }
    };

    const validateFields = () => {
        const errors: { [key: string]: string } = {};

        if (!name) {
            errors.name = 'O nome de usuário é obrigatório.';
        }

        if (!email) {
            errors.email = 'O email é obrigatório.';
        } else if (!validateEmail(email)) {
            errors.email = 'O email é inválido.';
        }

        if (!password) {
            errors.password = 'A senha é obrigatória.';
        } else if (!validatePassword(password)) {
            errors.password =
                'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais.';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'As senhas não coincidem.';
        }

        return errors;
    };

    const validateEmail = (email: string) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validatePassword = (password: string) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
        return re.test(password);
    };

    const handleApiErrors = (error: any) => {
        const newErrors: { [key: string]: string } = {};
        if (
            error.response &&
            error.response.status === 409 &&
            Array.isArray(error.response.data)
        ) {
            error.response.data.forEach((message: string) => {
                if (message.includes('Email')) {
                    newErrors.email = message;
                }
                if (message.includes('Nome de usuário')) {
                    newErrors.name = message;
                }
            });
        } else {
            showNotification({
                type: NotificationType.ERROR,
                content: 'Falha no cadastro: Ocorreu um erro desconhecido.',
            });
        }
        setErrors(newErrors);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            '& fieldset': {
                border: 'none',
            },
        },
    };

    const errorInputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            boxShadow: 'inset 0 0 0 1000px rgba(211, 47, 47, 0.15)',
            '& fieldset': {
                border: 'none',
            },
        },
    };

    const warningInputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            boxShadow: 'inset 0 0 0 1000px rgba(255, 235, 59, 0.2)',
            '& fieldset': {
                border: 'none',
            },
        },
    };

    const validInputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            boxShadow: 'inset 0 0 0 1000px rgba(76, 175, 80, 0.2)',
            '& fieldset': {
                border: 'none',
            },
        },
    };

    const labelStyle = {
        color: '#6A41A1',
        fontSize: '16px',
        fontWeight: 400,
    };

    const errorLabelStyle = {
        color: '#D32F2F',
        fontSize: '16px',
        fontWeight: 400,
    };

    const warningLabelStyle = {
        color: '#F57C00',
        fontSize: '16px',
        fontWeight: 400,
    };

    const validLabelStyle = {
        color: '#1B5E20',
        fontSize: '16px',
        fontWeight: 400,
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
                            <span
                                style={{
                                    color: '#FFFFFF',
                                    backgroundColor: '#452C63',
                                    padding: '0 4px 6px',
                                    borderRadius: '4px',
                                }}
                            >
                                Scape
                            </span>
                        </Typography>
                    </Box>

                    <Box width="100%">
                        <Typography
                            component="label"
                            sx={errors.name ? errorLabelStyle : labelStyle}
                        >
                            Nome de Usuário
                        </Typography>
                        <TextField
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={errors.name ? errorInputStyle : inputStyle}
                            style={{ marginTop: 0 }}
                            variant="outlined"
                            placeholder='Digite um nome de usuário...'
                        />
                        {errors.name && (
                            <Box display="flex" alignItems="center" sx={{ color: '#D32F2F', mt: 0.5 }}>
                                <ErrorOutline fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="caption">{errors.name}</Typography>
                            </Box>
                        )}
                    </Box>

                    <Box width="100%">
                        <Typography
                            component="label"
                            sx={errors.email ? errorLabelStyle : labelStyle}
                        >
                            Email
                        </Typography>
                        <TextField
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={errors.email ? errorInputStyle : inputStyle}
                            style={{ marginTop: 0 }}
                            variant="outlined"
                            placeholder='Digite seu email...'
                        />
                        {errors.email && (
                            <Box display="flex" alignItems="center" sx={{ color: '#D32F2F', mt: 0.5 }}>
                                <ErrorOutline fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="caption">{errors.email}</Typography>
                            </Box>
                        )}
                    </Box>

                    <Box width="100%">
                        <Typography
                            component="label"
                            sx={
                                errors.password
                                    ? errorLabelStyle
                                    : validatePassword(password)
                                        ? validLabelStyle
                                        : password && !validatePassword(password)
                                            ? warningLabelStyle
                                            : labelStyle
                            }
                        >
                            Senha
                        </Typography>
                        <TextField
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={
                                errors.password
                                    ? errorInputStyle
                                    : validatePassword(password)
                                        ? validInputStyle
                                        : password && !validatePassword(password)
                                            ? warningInputStyle
                                            : inputStyle
                            }
                            style={{ marginTop: 0 }}
                            variant="outlined"
                            placeholder='Crie uma senha...'
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {validatePassword(password) && (
                                            <CheckCircle sx={{ color: 'green', mr: 1 }} />
                                        )}
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
                        {errors.password && (
                            <Box display="flex" alignItems="center" sx={{ color: '#D32F2F', mt: 0.5 }}>
                                <ErrorOutline fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="caption">{errors.password}</Typography>
                            </Box>
                        )}
                    </Box>

                    <Box width="100%">
                        <Typography
                            component="label"
                            sx={
                                errors.confirmPassword
                                    ? errorLabelStyle
                                    : confirmPassword && confirmPassword === password
                                        ? validLabelStyle
                                        : confirmPassword && confirmPassword !== password
                                            ? warningLabelStyle
                                            : labelStyle
                            }
                        >
                            Confirmar Senha
                        </Typography>
                        <TextField
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={
                                errors.confirmPassword
                                    ? errorInputStyle
                                    : confirmPassword && confirmPassword === password
                                        ? validInputStyle
                                        : confirmPassword && confirmPassword !== password
                                            ? warningInputStyle
                                            : inputStyle
                            }
                            style={{ marginTop: 0 }}
                            variant="outlined"
                            placeholder='Confirme sua senha...'
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {confirmPassword && confirmPassword === password && (
                                            <CheckCircle sx={{ color: 'green', mr: 1 }} />
                                        )}
                                        <IconButton
                                            onClick={handleClickShowConfirmPassword}
                                            edge="end"
                                            sx={{
                                                color: '#452C63',
                                                '&:hover': {
                                                    color: '#6A41A1',
                                                },
                                            }}
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {errors.confirmPassword && (
                            <Box display="flex" alignItems="center" sx={{ color: '#D32F2F', mt: 0.5 }}>
                                <ErrorOutline fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="caption">{errors.confirmPassword}</Typography>
                            </Box>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleRegister}
                        disabled={
                            !name ||
                            !email ||
                            !password ||
                            !confirmPassword ||
                            password !== confirmPassword
                        }
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
                        Cadastrar
                    </Button>

                    <Button
                        variant="text"
                        fullWidth
                        onClick={() => navigate('/login')}
                        sx={{
                            mt: 2,
                            color: '#452C63',
                            fontWeight: 'bold',
                            textTransform: 'none',
                        }}
                        style={{ marginTop: 0 }}
                    >
                        Entrar
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
