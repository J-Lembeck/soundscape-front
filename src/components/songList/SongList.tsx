import React, { useState } from 'react';
import { Card, CardContent, Typography, CardMedia, CircularProgress, Grid, Box, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface ArtistDTO {
    id: number;
    name: string;
}

interface SongDTO {
    id: number;
    title: string;
    artist: ArtistDTO;
    length: number;
    imageUrl: string;
}

interface SongListProps {
    onSongSelect: (songId: number) => void;
    playingSongId?: number;
    isPlaying: boolean;
    togglePlayPause: () => void;
    songs: SongDTO[];
}

export default function SongList({ onSongSelect, playingSongId, isPlaying, togglePlayPause, songs }: SongListProps) {
    const [hoveredSongId, setHoveredSongId] = useState<number | null>(null);

    const handleMouseEnter = (songId: number) => {
        setHoveredSongId(songId);
    };

    const handleMouseLeave = () => {
        setHoveredSongId(null);
    };

    const handleImageClick = (songId: number) => {
        onSongSelect(songId); // Select the song or toggle play/pause
    };

    if (songs.length === 0) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Grid container spacing={3} justifyContent="center">
                {songs.map((song) => (
                    <Grid item xs={12} sm={6} md={4} key={song.id}>
                        <Card style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                            <Box 
                                position="relative" 
                                onMouseEnter={() => handleMouseEnter(song.id)} 
                                onMouseLeave={handleMouseLeave} 
                                style={{ marginRight: '16px' }}
                            >
                                <CardMedia
                                    component="img"
                                    image={song.imageUrl}
                                    alt={song.title}
                                    style={{ width: 80, height: 80, cursor: 'pointer' }}
                                    onClick={() => handleImageClick(song.id)}
                                />
                                {/* Play/Pause Icon on Hover */}
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
                                <Typography variant="body2" color="text.secondary">
                                    {song.artist.name}
                                </Typography>
                            </CardContent>
                            <Box style={{ marginLeft: 'auto', paddingRight: '10px' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {formatDuration(song.length)}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
