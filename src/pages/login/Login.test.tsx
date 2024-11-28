// Login.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { NotificationProvider } from '../../utils/notifications/NotificationContext';
import api from '../../services/api';
import '@testing-library/jest-dom';

const mockSetIsAuthenticated = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../../services/api');

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('deve renderizar o formulário de login corretamente', () => {
        render(
            <NotificationProvider>
                <Login setIsAuthenticated={mockSetIsAuthenticated} />
            </NotificationProvider>
        );

        expect(screen.getByLabelText('Nome de Usuário')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cadastrar-se/i })).toBeInTheDocument();
    });

    it('deve desabilitar o botão "Entrar" quando os campos estão vazios', () => {
        render(
            <NotificationProvider>
                <Login setIsAuthenticated={jest.fn()} />
            </NotificationProvider>
        );

        expect(screen.getByRole('button', { name: /Entrar/i })).toBeDisabled();
    });

    it('deve habilitar o botão "Entrar" quando os campos estão preenchidos', () => {
        render(
            <NotificationProvider>
                <Login setIsAuthenticated={jest.fn()} />
            </NotificationProvider>
        );

        fireEvent.change(screen.getByLabelText('Nome de Usuário'), { target: { value: 'user' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'password' } });

        expect(screen.getByRole('button', { name: /Entrar/i })).not.toBeDisabled();
    });

    it('deve exibir notificação de erro quando o login falha', async () => {
        (api.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

        render(
            <NotificationProvider>
                <Login setIsAuthenticated={jest.fn()} />
            </NotificationProvider>
        );

        fireEvent.change(screen.getByLabelText('Nome de Usuário'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'wrongpassword' } });

        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Usuário ou senha incorretos.')).toBeInTheDocument();
        });
    });

    it('deve processar o login com sucesso corretamente', async () => {
        (api.post as jest.Mock).mockResolvedValue({
            data: {
                token: 'fake-token',
                username: 'testuser',
            },
        });

        render(
            <NotificationProvider>
                <Login setIsAuthenticated={mockSetIsAuthenticated} />
            </NotificationProvider>
        );

        fireEvent.change(screen.getByLabelText('Nome de Usuário'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'correctpassword' } });

        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('fake-token');
            expect(localStorage.getItem('username')).toBe('testuser');
            expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('deve navegar para a página de registro ao clicar em "Cadastrar-se"', () => {
        render(
            <NotificationProvider>
                <Login setIsAuthenticated={jest.fn()} />
            </NotificationProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /Cadastrar-se/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});
