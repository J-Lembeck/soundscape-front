import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Menu from "./components/menu/Menu";
import Player from "./components/player/Player";
import UploadFile from './components/uploadFile/UploadFile';
import Sidebar from './components/sideBar/Sidebar';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';
import SongList from './components/songList/SongList';
import api from './services/api';
import { PlaylistDetails } from './components/sideBar/ISidebar';
import SongDetails from './components/songList/ISongList';
import { Alert, Snackbar } from '@mui/material';
import { NotificationProvider, NotificationType, useNotification } from './utils/notifications/NotificationContext';
import Playlists from './pages/playlists/Playlists';
import Home from './pages/home/Home';
import Artists from './pages/artists/Artists';
import Favorites from './pages/Favorites/Favorites';
import Register from './pages/register/Register';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSongsLoading, setIsSongsLoading] = useState(false);
    const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(true);
    const [selectedSongId, setSelectedSongId] = useState<number | undefined>(undefined);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentSong, setCurrentSong] = useState<SongDetails | null>(null);
    const [playlists, setPlaylists] = useState<PlaylistDetails[]>([]);
    const [songs, setSongs] = useState<SongDetails[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const playerRef = useRef<{ togglePlayPause: () => void } | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            validateToken(token);
        }
    }, []);

    const validateToken = async (token: string) => {
        try {
            const response = await api.get('/auth/validate-token', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setIsAuthenticated(response.data);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    async function fetchSongs() {
        setIsSongsLoading(true);
        try {
            const response = await api.get<SongDetails[]>(searchValue ? `/songs/searchSongs?searchTerm=${searchValue}` : '/songs/load/listAll');
    
            const backendUrl = process.env.REACT_APP_API_URL;
            const songsWithImageUrl = response.data.map((song) => ({
                ...song,
                imageUrl: `${backendUrl}/songs/load/image?id=${song.id}`
            }));
    
            setSongs(songsWithImageUrl);
        } catch (error) {
            if (error instanceof Error) {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao carregar músicas: ' + error.message,
                });
            } else {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao carregar músicas: Ocorreu um erro desconhecido.',
                });
            }
            setIsAuthenticated(false);
        } finally {
            setIsSongsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (location.pathname !== '/login' && searchValue) {
                fetchSongs();

                if (location.pathname !== '/' && searchValue) {
                    navigate('/');
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue]);

    useEffect(() => {
        if (location.pathname === '/') {
            fetchSongs();
        }
    }, [location.pathname]);

    const handleSongSelect = (songId: number) => {
        if (selectedSongId === songId) {
            handleTogglePlayPause();
        } else {
            setSelectedSongId(songId);
            setIsPlaying(true);
            const selectedSong = songs.find((song) => song.id === songId);
            setCurrentSong(selectedSong || null);
        }
    };

    useEffect(() => {
        if(!isAuthenticated) {
            setIsPlaylistsLoading(false);
            return;
        }
        

        const fetchPlaylists = async () => {
            try {
                setIsPlaylistsLoading(true);
                const response = await api.get<PlaylistDetails[]>('/playlist/findAllByLoggedUser');
                setPlaylists(response.data);
            } catch (error) {
                if (error instanceof Error) {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar playlists: ' + error.message,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar playlists: Ocorreu um erro desconhecido.',
                    });
                }
            } finally {
                setIsPlaylistsLoading(false);
            }
        };

        fetchPlaylists();
    }, [isAuthenticated]);

    const fetchSongsFromPlaylist = async (playlistId: number | string | undefined) => {
        setIsSongsLoading(true);
        if(playlistId) {
            try {
                const response = await api.get<SongDetails[]>(`/playlist/findSongsFromPlaylist?playlistId=${playlistId}`);
                const backendUrl = process.env.REACT_APP_API_URL;
    
                const songsWithImageUrl = response.data.map((song) => ({
                    ...song,
                    imageUrl: `${backendUrl}/songs/load/image?id=${song.id}`
                }));
    
                setSongs(songsWithImageUrl);            
            } catch (error) {
                if (error instanceof Error) {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar músicas da playlist: ' + error.message,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar músicas da playlist: Ocorreu um erro desconhecido.',
                    });
                }
            } finally {
                setIsSongsLoading(false);
            }
        } else {
            setIsSongsLoading(false);
        }
    };    

    const fetchSongsFromArtist = async (artistId: number | string | undefined) => {
        setIsSongsLoading(true);
        if(artistId) {
            try {
                const response = await api.get<SongDetails[]>(`/artists/findSongsFromArtist?artistId=${artistId}`);
                const backendUrl = process.env.REACT_APP_API_URL;
    
                const songsWithImageUrl = response.data.map((song) => ({
                    ...song,
                    imageUrl: `${backendUrl}/songs/load/image?id=${song.id}`
                }));
    
                setSongs(songsWithImageUrl);            
            } catch (error) {
                if (error instanceof Error) {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar músicas do artista: ' + error.message,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar músicas do artista: Ocorreu um erro desconhecido.',
                    });
                }
            } finally {
                setIsSongsLoading(false);
            }
        } else {
            setIsSongsLoading(false);
        }
    };    

    const fetchLikedSongs = async () => {
        setIsSongsLoading(true);
        if(isAuthenticated) {
            try {
                const response = await api.get<SongDetails[]>(`/songs/findLikedSongs`);
                const backendUrl = process.env.REACT_APP_API_URL;
    
                const songsWithImageUrl = response.data.map((song) => ({
                    ...song,
                    imageUrl: `${backendUrl}/songs/load/image?id=${song.id}`
                }));
    
                setSongs(songsWithImageUrl);            
            } catch (error) {
                if (error instanceof Error) {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar músicas curtidas: ' + error.message,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao carregar músicas curtidas: Ocorreu um erro desconhecido.',
                    });
                }
            } finally {
                setIsSongsLoading(false);
            }
        } else {
            setIsSongsLoading(false);
        }
    };    

    const handleTogglePlayPause = () => {
        if (playerRef.current) {
            playerRef.current.togglePlayPause();
            setIsPlaying(!isPlaying);
        }
    };

    const handlePlaylistSelect = (playlistId: number) => {
        navigate(`/playlist/${playlistId}`);
    };

    const shouldShowComponents = (location.pathname !== '/login' && location.pathname !== '/register');

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {shouldShowComponents && (
                <Sidebar 
                    playlists={playlists}
                    setPlaylists={setPlaylists}
                    onPlaylistSelect={handlePlaylistSelect}
                    isAuthenticated={isAuthenticated}
                    isPlaylistsLoading={isPlaylistsLoading}
                />
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {shouldShowComponents && (
                    <Menu 
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        fetchSongsFromArtist={fetchSongsFromArtist}
                        isAuthenticated={isAuthenticated} 
                    />
                )}
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px'  }}>
                    <Routes>
                        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/"
                            element={
                                <Home
                                    isAuthenticated={isAuthenticated}
                                    onSongSelect={handleSongSelect}
                                    playingSongId={selectedSongId}
                                    isPlaying={isPlaying}
                                    togglePlayPause={handleTogglePlayPause}
                                    songs={songs}
                                    playlists={playlists}
                                    fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                                    fetchSongsFromArtist={fetchSongsFromArtist}
                                    isSongsLoading={isSongsLoading}
                                />
                            }
                        />

                        <Route
                            path="/playlist/:id"
                            element={
                                <Playlists
                                    isAuthenticated={isAuthenticated}
                                    onSongSelect={handleSongSelect}
                                    playingSongId={selectedSongId}
                                    isPlaying={isPlaying}
                                    togglePlayPause={handleTogglePlayPause}
                                    songs={songs}
                                    playlists={playlists}
                                    fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                                    fetchSongsFromArtist={fetchSongsFromArtist}
                                    isSongsLoading={isSongsLoading}
                                />
                            }
                        />

                        <Route
                            path="/artist/:id"
                            element={
                                <Artists
                                    isAuthenticated={isAuthenticated}
                                    onSongSelect={handleSongSelect}
                                    playingSongId={selectedSongId}
                                    isPlaying={isPlaying}
                                    togglePlayPause={handleTogglePlayPause}
                                    songs={songs}
                                    playlists={playlists}
                                    fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                                    fetchSongsFromArtist={fetchSongsFromArtist}
                                    isSongsLoading={isSongsLoading}
                                />
                            }
                        />

                        <Route
                            path="/favorites"
                            element={
                                <ProtectedRoute>
                                    <Favorites
                                        isAuthenticated={isAuthenticated}
                                        onSongSelect={handleSongSelect}
                                        playingSongId={selectedSongId}
                                        isPlaying={isPlaying}
                                        togglePlayPause={handleTogglePlayPause}
                                        songs={songs}
                                        playlists={playlists}
                                        fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                                        fetchSongsFromArtist={fetchSongsFromArtist}
                                        fetchLikedSongs={fetchLikedSongs}
                                        isSongsLoading={isSongsLoading}
                                    />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/upload"
                            element={
                                <ProtectedRoute>
                                    <UploadFile fetchSongsFromArtist={fetchSongsFromArtist}/>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
                {shouldShowComponents && (
                    <Player
                        ref={playerRef}
                        songId={selectedSongId}
                        setIsPlaying={setIsPlaying}
                        currentSong={currentSong}
                        isAuthenticated={isAuthenticated}
                    />
                )}
            </div>
        </div>
    );
}

function AppWrapper() {
    return (
        <Router>
            <NotificationProvider>
                <App />
            </NotificationProvider>
        </Router>
    );
}

export default AppWrapper;
