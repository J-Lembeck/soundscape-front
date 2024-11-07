import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Slider, Typography, IconButton, Box, CircularProgress } from '@mui/material';
import api from "../../services/api";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Album, PauseCircleFilled, PlayCircleFilled } from '@mui/icons-material';
import { PlayerProps } from './IPlayer';
import { NotificationType, useNotification } from '../../utils/notifications/NotificationContext';

const Player = forwardRef(({ songId, setIsPlaying, currentSong, isAuthenticated }: PlayerProps, ref) => {
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0.7);
    const [isPlaying, setPlaying] = useState<boolean>(false);
    const [imageError, setImageError] = useState(false);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const { showNotification } = useNotification();
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const websocketRef = useRef<WebSocket | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const queueRef = useRef<ArrayBuffer[]>([]);

    useImperativeHandle(ref, () => ({
        togglePlayPause() {
            togglePlayPause();
        }
    }));

    useEffect(() => {
        if (songId) {
            stopPlayback(() => setupWebSocketAndPlay(songId));
        }
    }, [songId]);

    useEffect(() => {
        setImageError(false);
        if (audioPlayerRef.current) {
            audioPlayerRef.current.volume = volume;
        }

        if (currentSong) {
            console.log("aaaaa")
            setIsLiked(currentSong.isLiked ? true : false);
        }
    }, [songId]);

    const stopPlayback = (callback?: () => void) => {
        const audioPlayer = audioPlayerRef.current;
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }

        if (websocketRef.current) {
            websocketRef.current.close();
            websocketRef.current = null;
        }

        if (sourceBufferRef.current) {
            sourceBufferRef.current.removeEventListener('updateend', processQueue);
            sourceBufferRef.current = null;
        }

        if (mediaSourceRef.current) {
            mediaSourceRef.current.removeEventListener('sourceopen', handleSourceOpen);
            mediaSourceRef.current = null;
        }

        setPlaying(false);
        setIsPlaying(false);

        if (callback) callback();
    };

    const handleSourceOpen = () => {
        if (!sourceBufferRef.current && mediaSourceRef.current) {
            sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('audio/mpeg');
            sourceBufferRef.current.addEventListener('updateend', processQueue);
            processQueue();
        }
    };

    const handleSliderChange = (event: Event, value: number | number[]) => {
        setCurrentTime(value as number);
        if (audioPlayerRef.current) {
            audioPlayerRef.current.currentTime = value as number;
        }
    };

    const handleVolumeChange = (event: Event, value: number | number[]) => {
        setVolume(value as number);
        if (audioPlayerRef.current) {
            audioPlayerRef.current.volume = value as number;
        }
    };

    const processQueue = () => {
        if (!sourceBufferRef.current || sourceBufferRef.current.updating || queueRef.current.length === 0) {
            return;
        }

        const data = queueRef.current.shift();
        if (data) {
            sourceBufferRef.current.appendBuffer(data);
        }
    };

    const setupWebSocketAndPlay = (songId: number) => {
        const audioPlayer = audioPlayerRef.current;

        if (!audioPlayer) {
            showNotification({
                type: NotificationType.ERROR,
                content: 'Falha ao carregar música.'
            });
            return;
        }

        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        audioPlayer.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', handleSourceOpen);

        const websocket = new WebSocket(process.env.REACT_APP_STREAM_API_URL + '/audio-stream');
        websocketRef.current = websocket;
        websocket.binaryType = 'arraybuffer';

        websocket.onopen = () => {
            websocket.send(`songId:${songId}`);

            audioPlayer.play().catch((error) => {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao na reprodução'
                });
                return;
            });
            setPlaying(true);
            setIsPlaying(true);
        };

        websocket.onmessage = (event) => {
            if (typeof event.data === 'string' && event.data.startsWith('duration:')) {
                const duration = parseInt(event.data.split(':')[1], 10);
                setDuration(duration);
            } else {
                queueRef.current.push(event.data);
                processQueue();
            }
        };

        websocket.onclose = () => {
            setPlaying(false);
            setIsPlaying(false);
        };
    };

    const togglePlayPause = () => {
        const audioPlayer = audioPlayerRef.current!;
        if (isPlaying) {
            audioPlayer.pause();
            setPlaying(false);
            setIsPlaying(false);
        } else {
            if (!websocketRef.current && songId) {
                setupWebSocketAndPlay(songId);
            } else {
                audioPlayer.play().catch((error) => {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha na reprodução.'
                    });
                    return;
                });
                setPlaying(true);
                setIsPlaying(true);
            }
        }
    };

    const handleLikeSong = async () => {
        if (!currentSong) return;
        if (!isAuthenticated) {
            showNotification({
                type: NotificationType.INFO,
                content: 'Faça login para curtir músicas.'
            });
            return;
        }

        setIsLiking(true);

        try {
            await api.put(`/songs/likeSong?songId=${currentSong.id}`);
            console.log("bbbbb")
            setIsLiked(!isLiked); 
            showNotification({
                type: NotificationType.SUCCESS,
                content: 'Música curtida com sucesso.'
            });
        } catch (error) {
            showNotification({
                type: NotificationType.ERROR,
                content: 'Falha ao curtir a música.'
            });
        } finally {
            setIsLiking(false);
        }
    };
    

    const PlaceholderBox = (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
                width: 90,
                height: 90,
                borderRadius: 4,
                marginRight: 16,
                backgroundColor: "#ADB5BD",
            }}
        >
            <Album style={{ width: 40, height: 40, color: "#FBFAFF" }} />
        </Box>
    );

    useEffect(() => {
        const audioPlayer = audioPlayerRef.current;
        if (audioPlayer) {
            const updateCurrentTime = () => {
                setCurrentTime(audioPlayer.currentTime);
            };

            audioPlayer.addEventListener('timeupdate', updateCurrentTime);

            return () => {
                audioPlayer.removeEventListener('timeupdate', updateCurrentTime);
            };
        }
    }, [audioPlayerRef.current]);

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#F4EFFA',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: "100%"
            }}
        >
            <audio ref={audioPlayerRef} />

            <Box display="flex" alignItems="center">
                {currentSong && !imageError ? (
                    <img
                        src={currentSong.imageUrl}
                        alt="Song cover"
                        onError={() => setImageError(true)}
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: 4,
                            marginRight: 16,
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    PlaceholderBox
                )}

                {currentSong && (
                    <Box display="flex" alignItems="center">
                        <Box>
                            <Box display="flex" alignItems="center">
                                <Typography variant="subtitle2">{currentSong.title}</Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                {currentSong.artist.name}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleLikeSong} disabled={isLiking}>
                            {isLiking ? (
                                <CircularProgress size={24} style={{ color: "#2F184B" }} />
                            ) : (
                                <>
                                    {isLiked ? (
                                        <FavoriteIcon style={{ color: "#2F184B" }} />
                                    ) : (
                                        <FavoriteBorderIcon style={{ color: "#2F184B" }} />
                                    )}
                                </>
                            )}
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
                <IconButton onClick={togglePlayPause} aria-label="play-pause" disabled={!currentSong}>
                    {isPlaying ? <PauseCircleFilled fontSize="large" style={{ width: 50, height: 50, color: "#2F184B" }} /> : <PlayCircleFilled fontSize="large" style={{ width: 50, height: 50, color: "#2F184B" }} />}
                </IconButton>
                <Box display="flex" alignItems="center" >
                    <Typography variant="caption">{`${Math.floor(currentTime / 60)}:${(currentTime % 60).toFixed(0).padStart(2, '0')}`}</Typography>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={duration}
                        onChange={handleSliderChange}
                        aria-labelledby="audio-slider"
                        sx={{ 
                            width: 500, 
                            ml: 2, 
                            color: "#2F184B",
                            '& .MuiSlider-thumb': {
                                display: 'none',
                            },
                        }}
                    />
                    <Typography style={{marginLeft: "16px"}} variant="caption">{`${Math.floor(duration / 60)}:${(duration % 60).toFixed(0).padStart(2, '0')}`}</Typography>
                </Box>

            </Box>

            <Box display="flex" alignItems="center">
                <IconButton>
                    <VolumeUpIcon style={{ color: "#2F184B" }} />
                </IconButton>
                <Slider
                    value={volume}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={handleVolumeChange}
                    aria-labelledby="volume-slider"
                    sx={{ 
                        width: 100, 
                        ml: 1, 
                        color: "#2F184B",
                        '& .MuiSlider-thumb': {
                            display: 'none',
                        },
                    }}
                />
            </Box>
        </Box>
    );
});

export default Player;
