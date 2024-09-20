import { PlaylistDetails } from "../sideBar/ISidebar";

export interface ArtistDTO {
    id: number;
    name: string;
}

export interface SongListProps {
    onSongSelect: (songId: number) => void;
    playingSongId?: number;
    isPlaying: boolean;
    togglePlayPause: () => void;
    songs: SongDetails[];
    playlists: PlaylistDetails[];
    isPlaylist: boolean;
    fetchSongsFromPlaylist: (playlistId: number | string | undefined) => void;
}

export default interface SongDetails {
    id: number;
    title: string;
    artist: ArtistDTO;
    creationDate: string;
    length: number;
    imageUrl: string;
}