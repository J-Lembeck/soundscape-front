import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import api from "../../services/api";
import { PlaylistDetails, SidebarProps } from "./ISidebar";
import { Alert, Box, Button, IconButton, InputAdornment, InputBase, List, ListItem, ListItemIcon, ListItemText, Popover, Snackbar, Tooltip } from "@mui/material";
import { Add, Delete, LibraryMusic, Search } from "@mui/icons-material";
import { NotificationType, useNotification } from "../../utils/notifications/NotificationContext";

export default function Sidebar({ playlists, setPlaylists, onPlaylistSelect }: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [newPlaylistName, setNewPlaylistName] = useState<string>("");
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const response = await api.get<PlaylistDetails[]>('/playlist/findAllByLoggedUser');
            setPlaylists(response.data);
        } catch (error) {
            console.error('Failed to fetch playlists', error);
        }
    };

    const handleCreatePlaylist = async () => {
        if (newPlaylistName) {
            try {
                await api.post(`/playlist/createNewPlaylist?playlistName=${newPlaylistName}`);
                setNewPlaylistName("");
                setAnchorEl(null);
                showNotification({ type: NotificationType.SUCCESS, content: 'Playlist criada com sucesso!' });
                fetchPlaylists();
            } catch (error) {
                console.error('Failed to create playlist', error);
            }
        }
    };

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handlePlaylistClick = (playlistId: number) => {
        onPlaylistSelect(playlistId);
    };

    const searchWords = searchQuery.toLowerCase().split(" ").filter(word => word);

    const filteredPlaylists = searchQuery.trim() === "" ? playlists : playlists.filter(playlist =>
        searchWords.some(word => playlist.name.toLowerCase().includes(word))
    );

    async function handleDeletePlaylist(playlistId: number) {
        try {
            await api.delete(`/playlist/deletePlaylist?playlistId=${playlistId}`);
            fetchPlaylists();
        } catch (error) {
            console.error('Failed to remove song from playlist', error);
        }
    }

    const open = Boolean(anchorEl);

    return (
        <Box sx={{ width: '320px', backgroundColor: '#F4EFFA', padding: '16px', paddingTop: 0}}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 , height: "85px"}}>
                <InputBase
                    style={{backgroundColor: "#FBFAFF"}}
                    placeholder="Pesquise..."
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ ml: 1, p: 1, flex: 1, borderRadius: "6px", height: "55px"}}
                    startAdornment={
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    }
                />
                <IconButton onClick={handlePopoverOpen}>
                    <Add />
                </IconButton>
            </Box>
            <List>
                {filteredPlaylists.map(playlist => (
                    <ListItem key={playlist.id} button onClick={() => handlePlaylistClick(playlist.id)}>
                        <ListItemIcon style={{ display: "flex", justifyContent: "center", alignItems: "center", width: 70, height: 70, borderRadius: 4, marginRight: 16, backgroundColor: "#ADB5BD" }}>
                            <LibraryMusic style={{ width: 40, height: 40, color: "#FBFAFF" }}/>
                        </ListItemIcon>
                        <ListItemText primary={playlist.name} />
                        <Tooltip title="Excluir playlist">
                            <IconButton onClick={(event) => handleDeletePlaylist(playlist.id)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2 }}>
                    <InputBase
                        placeholder="Nome da nova playlist"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        fullWidth
                    />
                    <Button variant="contained" onClick={handleCreatePlaylist}>
                        Criar
                    </Button>
                </Box>
            </Popover>
        </Box>
    );
}
