import React, { useState, useRef, useEffect } from 'react';
import { Slider, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

export default function Player() {
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [volume, setVolume] = useState<number>(1); // Volume inicial 100%
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const websocketRef = useRef<WebSocket | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const queueRef = useRef<ArrayBuffer[]>([]); // Fila de dados para serem processados

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

    const setupWebSocketAndPlay = () => {
        const audioPlayer = audioPlayerRef.current!;
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        audioPlayer.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', () => {
            if (!sourceBufferRef.current && mediaSourceRef.current) {
                sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('audio/mpeg');
                sourceBufferRef.current.addEventListener('updateend', processQueue);
                processQueue(); // Processa a fila de dados
            }
        });

        const websocket = new WebSocket('ws://localhost:8080/audio-stream');
        websocketRef.current = websocket;
        websocket.binaryType = 'arraybuffer';

        websocket.onmessage = (event) => {
            if (typeof event.data === 'string' && event.data.startsWith('duration:')) {
                const duration = parseInt(event.data.split(':')[1], 10);
                setDuration(duration);
            } else {
                queueRef.current.push(event.data); // Adiciona o dado à fila
                processQueue(); // Processa a fila de dados
            }
        };

        websocket.onopen = () => {
            audioPlayer.play().catch((error) => {
                console.error('Playback error:', error);
            });
            setIsPlaying(true);
        };

        websocket.onclose = () => {
            setIsPlaying(false);
        };
    };

    const togglePlayPause = () => {
        const audioPlayer = audioPlayerRef.current!;
        if (isPlaying) {
            audioPlayer.pause();
            setIsPlaying(false);
        } else {
            if (!websocketRef.current) {
                setupWebSocketAndPlay();
            } else {
                audioPlayer.play().catch((error) => {
                    console.error('Playback error:', error);
                });
                setIsPlaying(true);
            }
        }
    };

    useEffect(() => {
        const audioPlayer = audioPlayerRef.current!;
        const updateCurrentTime = () => {
            setCurrentTime(audioPlayer.currentTime);
        };

        audioPlayer.addEventListener('timeupdate', updateCurrentTime);

        return () => {
            audioPlayer.removeEventListener('timeupdate', updateCurrentTime);
        };
    }, []);

    return (
        <div>
            <audio ref={audioPlayerRef}></audio>
            <Typography gutterBottom>
                Tempo: {currentTime.toFixed(1)}s / Duração: {duration}s
            </Typography>
            <Slider
                value={currentTime}
                min={0}
                max={duration}
                onChange={handleSliderChange}
                aria-labelledby="audio-slider"
                sx={{
                    '& .MuiSlider-thumb': {
                        display: 'none',
                    },
                }}
            />
            <Typography gutterBottom>
                Volume: {(volume * 100).toFixed(0)}%
            </Typography>
            <Slider
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
                aria-labelledby="volume-slider"
                sx={{
                    '& .MuiSlider-thumb': {
                        display: 'none',
                    },
                }}
            />
            <IconButton onClick={togglePlayPause} aria-label="play-pause">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
        </div>
    );
};