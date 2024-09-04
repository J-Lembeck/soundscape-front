import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Slider, Typography, IconButton, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { PauseCircleFilled, PlayCircleFilled } from '@mui/icons-material';

interface PlayerProps {
    songId?: number;
    setIsPlaying: (isPlaying: boolean) => void;
    currentSong: {
        id: number;
        title: string;
        artist: {
            id: number;
            name: string;
        };
        length: number;
        imageUrl: string;
    } | null;
}

const Player = forwardRef(({ songId, setIsPlaying, currentSong }: PlayerProps, ref) => {
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [volume, setVolume] = useState<number>(1);
    const [isPlaying, setPlaying] = useState<boolean>(false);
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
            console.error('Audio element not found.');
            return;
        }
    
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        audioPlayer.src = URL.createObjectURL(mediaSource);
    
        mediaSource.addEventListener('sourceopen', handleSourceOpen);
    
        const websocket = new WebSocket('ws://localhost:8080/audio-stream');
        websocketRef.current = websocket;
        websocket.binaryType = 'arraybuffer';
    
        websocket.onopen = () => {
            websocket.send(`songId:${songId}`);
            
            audioPlayer.play().catch((error) => {
                console.error('Playback error:', error);
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
                    console.error('Playback error:', error);
                });
                setPlaying(true);
                setIsPlaying(true);
            }
        }
    };

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
                backgroundColor: '#F3F2F7',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #ddd',
            }}
        >
            <audio ref={audioPlayerRef} />

            {/* Display current song information */}
            {currentSong && (
                <Box display="flex" alignItems="center">
                    <img
                        src={currentSong.imageUrl}
                        alt="Song cover"
                        style={{ width: 70, height: 70, borderRadius: 4, marginRight: 16 }}
                    />
                    <Box>
                        <Typography variant="subtitle2">{currentSong.title}</Typography>
                        <Typography variant="body2" color="textSecondary">{currentSong.artist.name}</Typography>
                    </Box>
                </Box>
            )}

            {/* Media controls */}
            <Box display="flex" flexDirection="column" alignItems="center">
                <IconButton onClick={togglePlayPause} aria-label="play-pause">
                    {isPlaying ? <PauseCircleFilled fontSize="large" /> : <PlayCircleFilled fontSize="large" />}
                </IconButton>
                <Box display="flex" alignItems="center">
                    <Typography variant="caption">{`${Math.floor(currentTime / 60)}:${(currentTime % 60).toFixed(0).padStart(2, '0')}`}</Typography>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={duration}
                        onChange={handleSliderChange}
                        aria-labelledby="audio-slider"
                        sx={{ width: 500, mx: 2 }} // Adjusted width
                    />
                    <Typography variant="caption">{`${Math.floor(duration / 60)}:${(duration % 60).toFixed(0).padStart(2, '0')}`}</Typography>
                </Box>
                
            </Box>

            {/* Volume and favorite controls */}
            <Box display="flex" alignItems="center">
                <IconButton>
                    <FavoriteBorderIcon />
                </IconButton>
                <IconButton>
                    <VolumeUpIcon />
                </IconButton>
                <Slider
                    value={volume}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={handleVolumeChange}
                    aria-labelledby="volume-slider"
                    sx={{ width: 100, ml: 1 }}
                />
            </Box>
        </Box>
    );
});

export default Player;
