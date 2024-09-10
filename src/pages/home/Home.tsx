import React, { useEffect } from 'react';
import SongList from "../../components/songList/SongList";
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

interface HomeProps {
  setSelectedSongId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentSong: React.Dispatch<React.SetStateAction<SongDetails | null>>;
  handleTogglePlayPause: () => void;
  isPlaying: boolean;
  selectedSongId: number | undefined;
}

export default function Home({
  setSelectedSongId,
  setIsPlaying,
  setCurrentSong,
  handleTogglePlayPause,
  isPlaying,
  selectedSongId,
}: HomeProps) {
  const [songs, setSongs] = React.useState<SongDetails[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await api.get<SongDetails[]>('/songs/load/listAll');
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

    fetchSongs();
  }, []);

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

  return (
    <SongList
      onSongSelect={handleSongSelect}
      playingSongId={selectedSongId}
      isPlaying={isPlaying}
      togglePlayPause={handleTogglePlayPause}
      songs={songs}
    />
  );
}
