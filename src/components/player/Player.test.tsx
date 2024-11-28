// Player.test.tsx

import React from 'react';
import {
    render,
    fireEvent,
    screen,
    waitFor,
    RenderOptions,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import Player from './Player';
import api from '../../services/api';
import { NotificationProvider } from '../../utils/notifications/NotificationContext';
import { useNavigate } from 'react-router-dom';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

function renderWithProviders(
    ui: React.ReactElement,
    renderOptions?: Omit<RenderOptions, 'wrapper'>
) {
    function Wrapper({ children }: { children?: React.ReactNode }): JSX.Element {
        return <NotificationProvider>{children}</NotificationProvider>;
    }
    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

const mockCurrentSong = {
    id: 1,
    title: 'Sample Song',
    artist: { id: 1, name: 'Sample Artist' },
    imageUrl: 'sample.jpg',
    isLiked: false,
    creationDate: '2024-01-01T00:00:00Z',
    length: 180,
    likes: 100,
};

describe('Player Component', () => {
    const mockSetIsPlaying = jest.fn();
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    beforeAll(() => {
        class MockMediaSource {
            addEventListener = jest.fn();
            addSourceBuffer = jest.fn();
        }
        (window as any).MediaSource = MockMediaSource;

        window.URL.createObjectURL = jest.fn(() => 'blob:fake-url');

        HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
        HTMLMediaElement.prototype.pause = jest.fn();
        HTMLMediaElement.prototype.load = jest.fn();

        const mockWebSocket = {
            send: jest.fn(),
            close: jest.fn(),
            onopen: jest.fn(),
            onmessage: jest.fn(),
            onclose: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            readyState: 1,
            binaryType: 'arraybuffer',
        };

        global.WebSocket = jest.fn(() => mockWebSocket as any) as any;

        process.env.REACT_APP_STREAM_API_URL = 'ws://localhost:8080';

        delete (window as any).location;
        (window as any).location = {
            href: '',
            assign: jest.fn(),
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar o volume do áudio ao alterar o controle de volume', () => {
        const { container } = renderWithProviders(
            <Player
                songId={1}
                setIsPlaying={jest.fn()}
                currentSong={mockCurrentSong}
                isAuthenticated={true}
            />
        );

        const audioElement = container.querySelector('audio') as HTMLAudioElement;

        const volumeSlider = screen.getByLabelText('volume-slider') as HTMLInputElement;
        expect(volumeSlider).toBeDefined();

        fireEvent.change(volumeSlider, { target: { value: '0.5' } });

        expect(volumeSlider.value).toBe('0.5');
        expect(audioElement.volume).toBe(0.5);
    });

    it('deve pausar e reproduzir o áudio ao clicar no botão de play/pause', async () => {
        const { container } = renderWithProviders(
            <Player
                songId={1}
                setIsPlaying={mockSetIsPlaying}
                currentSong={mockCurrentSong}
                isAuthenticated={true}
            />
        );

        const playPauseButton = screen.getByLabelText('play-pause');
        const audioElement = container.querySelector('audio') as HTMLAudioElement;

        fireEvent.click(playPauseButton);
        await waitFor(() => expect(audioElement.play).toHaveBeenCalled());

        fireEvent.click(playPauseButton);
        expect(audioElement.pause).toHaveBeenCalled();
    });

    it('deve marcar a música como curtida ao clicar no botão de like', async () => {
        (api.put as jest.Mock).mockResolvedValue({});
        renderWithProviders(
            <Player
                songId={1}
                setIsPlaying={jest.fn()}
                currentSong={mockCurrentSong}
                isAuthenticated={true}
            />
        );

        const likeIcon = screen.getByTestId('FavoriteBorderIcon');
        const likeButton = likeIcon.closest('button') as HTMLElement;
        fireEvent.click(likeButton);

        await waitFor(() => expect(api.put).toHaveBeenCalledWith('/songs/likeSong?songId=1'));

        expect(screen.getByTestId('FavoriteIcon')).toBeInTheDocument();
    });

    it('deve iniciar o download da música ao clicar no botão de download', async () => {
        const mockBlob = new Blob(['test'], { type: 'audio/mpeg' });
        (api.get as jest.Mock).mockResolvedValue({ data: mockBlob });

        renderWithProviders(
            <Player
                songId={1}
                setIsPlaying={jest.fn()}
                currentSong={mockCurrentSong}
                isAuthenticated={true}
            />
        );

        const downloadIcon = screen.getByTestId('DownloadIcon');
        const downloadButton = downloadIcon.closest('button') as HTMLElement;
        fireEvent.click(downloadButton);

        await waitFor(() =>
            expect(api.get).toHaveBeenCalledWith('/songs/downloadSong?songId=1', {
                responseType: 'blob',
            })
        );
    });

    it('deve navegar para a página do artista ao clicar no nome do artista', () => {
        renderWithProviders(
            <Player
                songId={1}
                setIsPlaying={jest.fn()}
                currentSong={mockCurrentSong}
                isAuthenticated={true}
            />
        );

        const artistButton = screen.getByText(mockCurrentSong.artist.name);
        fireEvent.click(artistButton);

        expect(mockNavigate).toHaveBeenCalledWith(`/artist/${mockCurrentSong.artist.id}`);
    });

    it('deve adicionar SourceBuffer ao abrir o MediaSource', () => {
        const mockSourceBuffer = {
            addEventListener: jest.fn(),
            updating: false,
        };

        const mockMediaSource = {
            addSourceBuffer: jest.fn().mockReturnValue(mockSourceBuffer),
            addEventListener: jest.fn(),
        };

        (window as any).MediaSource = jest.fn(() => mockMediaSource);

        renderWithProviders(
            <Player
                songId={1}
                setIsPlaying={mockSetIsPlaying}
                currentSong={mockCurrentSong}
                isAuthenticated={true}
            />
        );

        const mediaSourceConstructor = window.MediaSource as unknown as jest.Mock;
        const mediaSourceInstance = mediaSourceConstructor.mock.instances[0];

        const sourceOpenCallback = mockMediaSource.addEventListener.mock.calls[0][1];
        sourceOpenCallback();

        expect(mockMediaSource.addSourceBuffer).toHaveBeenCalledWith('audio/mpeg');
        expect(mockSourceBuffer.addEventListener).toHaveBeenCalledWith(
            'updateend',
            expect.any(Function)
        );
    });

    it('deve exibir o placeholder quando ocorre um erro ao carregar a imagem', () => {
        renderWithProviders(
            <Player
                songId={1}
                setIsPlaying={jest.fn()}
                currentSong={mockCurrentSong}
                isAuthenticated={true}
            />
        );

        const imgElement = screen.getByAltText('Song cover') as HTMLImageElement;
        fireEvent.error(imgElement);

        expect(screen.getByTestId('AlbumIcon')).toBeInTheDocument();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
