import React, { useState } from 'react';
import { Card, CardContent, Typography, CardMedia, CircularProgress, Grid, Box, IconButton, Popover, MenuItem, Button, Tooltip, ButtonBase } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import { SongListProps } from './ISongList';
import api from '../../services/api';
import { Album, CalendarMonth, Delete, Favorite, LockClock, PunchClock, QueryBuilder, QueueMusic, SentimentVeryDissatisfied, Subscriptions } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import SongImage from '../../utils/songImages/SongImage';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';

export default function SongList({ isAuthenticated, onSongSelect, playingSongId, isPlaying, togglePlayPause, songs, playlists, isPlaylist, fetchSongsFromPlaylist, fetchSongsFromArtist }: SongListProps) {
    const [hoveredSongId, setHoveredSongId] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
    const { id: playlistId } = useParams();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleMouseEnter = (songId: number) => {
        setHoveredSongId(songId);
    };

    const handleMouseLeave = () => {
        setHoveredSongId(null);
    };

    const handleImageClick = (songId: number) => {
        onSongSelect(songId);
    };

    const handleAddButtonClick = (event: React.MouseEvent<HTMLElement>, songId: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedSongId(songId);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setSelectedSongId(null);
    };

    const handleAddToPlaylist = async (playlistId: number) => {
        if (selectedSongId) {
            try {
                await api.put(`/playlist/addSongToPlaylist?playlistId=${playlistId}&songId=${selectedSongId}`);
                showNotification({
                    type: NotificationType.SUCCESS,
                    content: 'Música adicionada à playlist com sucesso.',
                });
                handleClosePopover();
            } catch (error) {
                if (typeof error === 'object' && error !== null && 'response' in error) {
                    const response = (error as any).response;
                    if (response.status === 400) {
                        showNotification({
                            type: NotificationType.ERROR,
                            content: 'Essa música já está nesta playlist.',
                        });
                    } else {
                        showNotification({
                            type: NotificationType.ERROR,
                            content: 'Falha ao adicionar música à playlist: ' + response.statusText,
                        });
                    }
                } else if (error instanceof Error) {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao adicionar música à playlist: ' + error.message,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao adicionar música à playlist: Ocorreu um erro desconhecido.',
                    });
                }
            }
        }
    };

    const handleRemoveFromPlaylist = async (event: React.MouseEvent<HTMLElement>, songId: number) => {
        if (playlistId) {
            try {
                await api.put(`/playlist/removeSongFromPlaylist?playlistId=${playlistId}&songId=${songId}`);
                if(fetchSongsFromPlaylist) {
                    fetchSongsFromPlaylist(playlistId);
                }
                showNotification({
                    type: NotificationType.SUCCESS,
                    content: 'Música removida a playlist com sucesso.'
                });
                handleClosePopover();
            } catch (error) {
                if (error instanceof Error) {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao remover música a playlist: ' + error.message,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao remover música a playlist: Ocorreu um erro desconhecido.',
                    });
                }
            }
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date);
    };

    function handleArtistClick(artistId: number) {
        fetchSongsFromArtist(artistId);
        navigate(`/artist/${artistId}`);
    }

    return (
        <Box>
            <Box>
                <Grid container spacing={3} justifyContent="left">
                    {songs.map((song) => (
                        <Grid item xs={12} sm={6} key={song.id}>
                            <Card
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                    backgroundColor: hoveredSongId === song.id ? '#f0f0f0' : '#FBFAFF',
                                    transition: 'background-color 0.3s ease'
                                }}
                                elevation={0}
                                onMouseEnter={() => handleMouseEnter(song.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Box
                                    position="relative"
                                    style={{ marginRight: '16px' }}
                                >
                                    <SongImage song={song} handleImageClick={handleImageClick}/>
                                    {hoveredSongId === song.id && (
                                        <IconButton
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: 'white',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            }}
                                            onClick={() => handleImageClick(song.id)}
                                        >
                                            {playingSongId === song.id && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                                        </IconButton>
                                    )}
                                </Box>
                                <CardContent style={{ flex: '1 0 auto' }}>
                                    <Typography variant="subtitle1" component="div">
                                        {song.title}
                                    </Typography>
                                    <ButtonBase onClick={(event) => handleArtistClick(song.artist.id)}>
                                        <Typography variant="body2" color="text.secondary">
                                            {song.artist.name}
                                        </Typography>
                                    </ButtonBase>
                                </CardContent>
                                <Typography variant="body2" color="text.secondary" style={{ marginRight: "3rem" }} display={"flex"} alignItems={"center"}>
                                    <Favorite style={{ paddingRight: "0.5rem" }} />
                                    {song.likes}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" style={{ marginRight: "3rem" }} display={"flex"} alignItems={"center"}>
                                    <CalendarMonth style={{ paddingRight: "0.5rem" }} />
                                    {formatDate(song.creationDate)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" style={{ marginRight: '10px' }} display={"flex"} alignItems={"center"}>
                                    <QueryBuilder style={{ paddingRight: "0.5rem" }} />
                                    {formatDuration(song.length)}
                                </Typography>
                                {isAuthenticated && (
                                    <Box style={{ marginLeft: 'auto', paddingRight: '10px', display: 'flex', alignItems: 'center', flexDirection: "column" }}>
                                        {isPlaylist ? (
                                            <Tooltip title="Remover desta playlist">
                                                <IconButton onClick={(event) => handleRemoveFromPlaylist(event, song.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        ) : ( 
                                            <Tooltip title="Adicionar a uma playlist">
                                                <IconButton onClick={(event) => handleAddButtonClick(event, song.id)}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {playlists.map((playlist) => (
                    <MenuItem key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id)}>
                        {playlist.name}
                    </MenuItem>
                ))}
            </Popover>
        </Box>
    );
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
