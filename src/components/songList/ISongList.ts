import { ArtistDTO } from "../../pages/artists/IArtist";
import { PlaylistDetails } from "../sideBar/ISidebar";

export interface SongListProps {
    isAuthenticated: boolean;
    onSongSelect: (songId: number) => void;
    playingSongId?: number;
    isPlaying: boolean;
    togglePlayPause: () => void;
    songs: SongDetails[];
    playlists: PlaylistDetails[];
    isPlaylist?: boolean;
    isArtist?: boolean;
    fetchSongsFromPlaylist: (playlistId: number | string | undefined) => void;
    fetchSongsFromArtist: (artistId: number | string | undefined) => void;
    fetchLikedSongs?: () => void;
}

export default interface SongDetails {
    id: number;
    title: string;
    artist: ArtistDTO;
    creationDate: string;
    length: number;
    likes: number;
    imageUrl: string;
    isLiked: boolean;
}