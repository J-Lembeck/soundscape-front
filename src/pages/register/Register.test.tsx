import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';
import { NotificationProvider } from '../../utils/notifications/NotificationContext';
import api from '../../services/api';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../../services/api');

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar o formulário de registro corretamente', () => {
        render(
            <NotificationProvider>
                <Register />
            </NotificationProvider>
        );

        expect(screen.getByPlaceholderText('Digite um nome de usuário...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Digite seu email...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Crie uma senha...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirme sua senha...')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /Cadastrar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    });


    it('deve registrar com sucesso e redirecionar para a página de login', async () => {
        (api.post as jest.Mock).mockResolvedValueOnce({});

        render(
            <NotificationProvider>
                <Register />
            </NotificationProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('Digite um nome de usuário...'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('Digite seu email...'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Crie uma senha...'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText('Confirme sua senha...'), { target: { value: 'Password123!' } });

        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        expect(screen.getByText('Cadastro realizado com sucesso.')).toBeInTheDocument();
    });

    it('deve exibir mensagens de erro quando a API retorna erros específicos', async () => {
        (api.post as jest.Mock).mockRejectedValueOnce({
            response: {
                status: 409,
                data: ['Email já está em uso.', 'Nome de usuário já está em uso.'],
            },
        });

        render(
            <NotificationProvider>
                <Register />
            </NotificationProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('Digite um nome de usuário...'), { target: { value: 'existinguser' } });
        fireEvent.change(screen.getByPlaceholderText('Digite seu email...'), { target: { value: 'existing@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Crie uma senha...'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText('Confirme sua senha...'), { target: { value: 'Password123!' } });

        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Email já está em uso.')).toBeInTheDocument();
            expect(screen.getByText('Nome de usuário já está em uso.')).toBeInTheDocument();
        });
    });

    it('deve exibir notificação de erro genérico quando a API retorna um erro desconhecido', async () => {
        (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

        render(
            <NotificationProvider>
                <Register />
            </NotificationProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('Digite um nome de usuário...'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('Digite seu email...'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Crie uma senha...'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText('Confirme sua senha...'), { target: { value: 'Password123!' } });

        fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Falha no cadastro: Ocorreu um erro desconhecido.')).toBeInTheDocument();
        });
    });

    it('deve desabilitar o botão "Cadastrar" quando os campos estão vazios ou inválidos', () => {
        render(
            <NotificationProvider>
                <Register />
            </NotificationProvider>
        );

        const cadastrarButton = screen.getByRole('button', { name: /Cadastrar/i });

        expect(cadastrarButton).toBeDisabled();

        fireEvent.change(screen.getByPlaceholderText('Digite um nome de usuário...'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('Digite seu email...'), { target: { value: 'invalidemail' } });

        expect(cadastrarButton).toBeDisabled();

        fireEvent.change(screen.getByPlaceholderText('Crie uma senha...'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText('Confirme sua senha...'), { target: { value: 'DifferentPass!' } });

        expect(cadastrarButton).toBeDisabled();
    });

    it('deve habilitar o botão "Cadastrar" quando todos os campos estão preenchidos corretamente', () => {
        render(
            <NotificationProvider>
                <Register />
            </NotificationProvider>
        );

        const cadastrarButton = screen.getByRole('button', { name: /Cadastrar/i });

        fireEvent.change(screen.getByPlaceholderText('Digite um nome de usuário...'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('Digite seu email...'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Crie uma senha...'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText('Confirme sua senha...'), { target: { value: 'Password123!' } });

        expect(cadastrarButton).not.toBeDisabled();
    });

    it('deve navegar para a página de login ao clicar em "Entrar"', () => {
        render(
            <NotificationProvider>
                <Register />
            </NotificationProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
