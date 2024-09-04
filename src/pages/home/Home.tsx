import React, { useState, useRef, useEffect } from 'react';
import Menu from "../../components/menu/Menu";
import Player from "../../components/player/Player";
import SongList from "../../components/songList/SongList";
import UploadFile from "../../components/uploadFile/UploadFile";
import api from '../../services/api';

interface SongDetails {
    id: number;
    title: string;
    artist: {
        id: number;
        name: string;
    };
    length: number;
    imageUrl: string;
}

export default function Home() {
    const [selectedSongId, setSelectedSongId] = useState<number | undefined>(undefined);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentSong, setCurrentSong] = useState<SongDetails | null>(null);
    const [songs, setSongs] = useState<SongDetails[]>([]);
    const playerRef = useRef<{ togglePlayPause: () => void } | null>(null);

    useEffect(() => {
        // Load all songs on component mount
        const fetchSongs = async () => {
            try {
                const response = await api.get<SongDetails[]>('/songs/listAll');
                const backendUrl = process.env.REACT_APP_API_URL;

                // Add full image URL to each song
                const songsWithImageUrl = response.data.map((song) => ({
                    ...song,
                    imageUrl: `${backendUrl}/songs/image?id=${song.id}`
                }));

                setSongs(songsWithImageUrl);
            } catch (error) {
                console.error('Failed to fetch songs', error);
            }
        };

        fetchSongs();
    }, []);

    const handleSongSelect = (songId: number) => {
        if (selectedSongId === songId) {
            handleTogglePlayPause();
        } else {
            setSelectedSongId(songId);
            setIsPlaying(true);
            const selectedSong = songs.find((song) => song.id === songId); // Find the selected song from the list
            setCurrentSong(selectedSong || null);
        }
    };

    const handleTogglePlayPause = () => {
        if (playerRef.current) {
            playerRef.current.togglePlayPause();
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <>
            <Menu />
            <SongList
                onSongSelect={handleSongSelect}
                playingSongId={selectedSongId}
                isPlaying={isPlaying}
                togglePlayPause={handleTogglePlayPause}
                songs={songs} // Pass songs list to SongList component
            />
            <Player 
                ref={playerRef} 
                songId={selectedSongId} 
                setIsPlaying={setIsPlaying} 
                currentSong={currentSong} // Pass the current song to Player
            />
            <UploadFile />
        </>
    );
}
