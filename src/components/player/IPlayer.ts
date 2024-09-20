import SongDetails from "../songList/ISongList";

export interface PlayerProps {
    songId?: number;
    setIsPlaying: (isPlaying: boolean) => void;
    currentSong: SongDetails | null;
}