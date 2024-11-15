import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, IconButton, Popover, MenuItem, Tooltip, ButtonBase } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import { SongListProps } from './ISongList';
import api from '../../services/api';
import { CalendarMonth, Delete, Favorite, QueryBuilder } from '@mui/icons-material';
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
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
    
        if (seconds < 60) return `${seconds} segundos atrás`;
        if (minutes < 60) return `${minutes} minutos atrás`;
        if (hours < 24) return `${hours} horas atrás`;
        if (days < 7) return `${days} dias atrás`;
        if (weeks < 4) return `${weeks} semanas atrás`;
        return `${months} meses atrás`;
    };       

    function handleArtistClick(artistId: number) {
        navigate(`/artist/${artistId}`);
    }

    return (
        <Box style={{ overflowY: 'auto' }}>
            <Grid container spacing={3} justifyContent="left">
                {songs.map((song) => (
                    <Grid item xs={12} key={song.id}>
                        <Card
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                backgroundColor: hoveredSongId === song.id ? '#f0f0f0' : '#ffffff',
                                transition: 'background-color 0.3s ease',
                            }}
                            elevation={0}
                            onMouseEnter={() => handleMouseEnter(song.id)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Box display="flex" flex="1.5" alignItems="center" style={{ minWidth: 0 }}>
                                <Box position="relative" style={{ marginRight: '16px', flexShrink: 0 }}>
                                    <SongImage song={song} handleImageClick={handleImageClick} />
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
                                <CardContent style={{ flex: 3, minWidth: 0 }}>
                                    <Typography
                                        variant="subtitle1"
                                        component="div"
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {song.title}
                                    </Typography>
                                    <ButtonBase onClick={(event) => handleArtistClick(song.artist.id)}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {song.artist.name}
                                        </Typography>
                                    </ButtonBase>
                                </CardContent>
                            </Box>
                            <Box style={{ flex: 0.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Favorite style={{ paddingRight: '0.5rem' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {song.likes}
                                </Typography>
                            </Box>
                            <Box style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <CalendarMonth style={{ paddingRight: '0.5rem' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(song.creationDate)}
                                </Typography>
                            </Box>
                            <Box style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <QueryBuilder style={{ paddingRight: '0.5rem' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {formatDuration(song.length)}
                                </Typography>
                            </Box>
                            {isAuthenticated && (
                                <Box style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
