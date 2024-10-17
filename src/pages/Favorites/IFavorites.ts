import { PlaylistDetails } from "../../components/sideBar/ISidebar";
import SongDetails from "../../components/songList/ISongList";

export interface FavoritesProps {
    isAuthenticated: boolean;
    onSongSelect: (songId: number) => void;
    playingSongId?: number;
    isPlaying: boolean;
    togglePlayPause: () => void;
    songs: SongDetails[];
    playlists: PlaylistDetails[];
    isArtist?: boolean;
    fetchSongsFromPlaylist: (playlistId: number | string | undefined) => void;
    fetchSongsFromArtist: (artistId: number | string | undefined) => void;
    fetchLikedSongs: () => void;
}