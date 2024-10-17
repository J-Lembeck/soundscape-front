export interface PlaylistDetails {
    id: number;
    name: string;
}

export interface SidebarProps {
    playlists: PlaylistDetails[];
    setPlaylists: (value: PlaylistDetails[]) => void;
    onPlaylistSelect: (playlistId: number) => void;
    isAuthenticated: boolean;
    isPlaylistsLoading: boolean;
  }