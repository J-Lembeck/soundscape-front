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
import { NotificationProvider } from './utils/notifications/NotificationContext';

function App() {
    const [selectedSongId, setSelectedSongId] = useState<number | undefined>(undefined);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentSong, setCurrentSong] = useState<SongDetails | null>(null);
    const [playlists, setPlaylists] = useState<PlaylistDetails[]>([]);
    const [songs, setSongs] = useState<SongDetails[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const playerRef = useRef<{ togglePlayPause: () => void } | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    async function fetchSongs() {
        try {
            const response = await api.get<SongDetails[]>(searchValue ? `/songs/searchSongs?searchTerm=${searchValue}` : '/songs/load/listAll');

            const backendUrl = process.env.REACT_APP_API_URL;
            const songsWithImageUrl = response.data.map((song) => ({
                ...song,
                imageUrl: `${backendUrl}/songs/load/image?id=${song.id}`
            }));

            setSongs(songsWithImageUrl);
        } catch (error) {
            console.error('Failed to fetch songs', error);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, [searchValue]);

    useEffect(() => {
        fetchSongs();
    }, []);

    useEffect(() => {
        if (location.pathname === '/home') {
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
        const fetchPlaylists = async () => {
            try {
                const response = await api.get<PlaylistDetails[]>('/playlist/findAllByLoggedUser');
                setPlaylists(response.data);
            } catch (error) {
                console.error('Failed to fetch playlists', error);
            }
        };

        fetchPlaylists();
    }, []);

    const fetchSongsFromPlaylist = async (playlistId: number | string | undefined) => {
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
                console.error('Failed to fetch songs from playlist', error);
            }
        }
    };

    const handleTogglePlayPause = () => {
        if (playerRef.current) {
            playerRef.current.togglePlayPause();
            setIsPlaying(!isPlaying);
        }
    };

    const handlePlaylistSelect = (playlistId: number) => {
        fetchSongsFromPlaylist(playlistId);
        navigate(`/playlist/${playlistId}`);
    };

    const shouldShowComponents = location.pathname !== '/';

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {shouldShowComponents && <Sidebar playlists={playlists} setPlaylists={setPlaylists} onPlaylistSelect={handlePlaylistSelect} />}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {shouldShowComponents && <Menu searchValue={searchValue} setSearchValue={setSearchValue} />}
                <div style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route
                            path="/home"
                            element={
                                <SongList
                                    onSongSelect={handleSongSelect}
                                    playingSongId={selectedSongId}
                                    isPlaying={isPlaying}
                                    togglePlayPause={handleTogglePlayPause}
                                    songs={songs}
                                    playlists={playlists}
                                    isPlaylist={false}
                                    fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                                />
                            }
                        />
                        <Route
                            path="/playlist/:id"
                            element={
                                <SongList
                                    onSongSelect={handleSongSelect}
                                    playingSongId={selectedSongId}
                                    isPlaying={isPlaying}
                                    togglePlayPause={handleTogglePlayPause}
                                    songs={songs}
                                    playlists={playlists}
                                    isPlaylist={true}
                                    fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                                />
                            }
                        />
                        <Route
                            path="/upload"
                            element={
                                <ProtectedRoute>
                                    <UploadFile />
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
