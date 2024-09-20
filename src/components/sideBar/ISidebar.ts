export interface PlaylistDetails {
    id: number;
    name: string;
}

export interface SidebarProps {
    onPlaylistSelect: (playlistId: number) => void;
  }