import { Add, LibraryMusic, Person, Search, Delete } from "@mui/icons-material";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Popover,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArtistDTO } from "../../pages/artists/IArtist";
import api from "../../services/api";
import { NotificationType, useNotification } from "../../utils/notifications/NotificationContext";
import { PlaylistDetails, SidebarProps } from "./ISidebar";

export default function Sidebar({
    playlists,
    setPlaylists,
    onPlaylistSelect,
    isAuthenticated,
    isPlaylistsLoading,
    setIsPlaylistsLoading,
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [newPlaylistName, setNewPlaylistName] = useState<string>("");
    const [selectedTab, setSelectedTab] = useState<'playlists' | 'artists'>('playlists');
    const [followedArtists, setFollowedArtists] = useState<ArtistDTO[]>([]);
    const [isArtistsLoading, setIsArtistsLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchPlaylists();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (selectedTab === 'playlists') {
            fetchPlaylists();
        } else if (selectedTab === 'artists') {
            fetchFollowedArtists();
        }
    }, [selectedTab, isAuthenticated]);

    const fetchPlaylists = async () => {
        setIsPlaylistsLoading(true);
        try {
            const response = await api.get<PlaylistDetails[]>('/playlist/findAllByLoggedUser');
            setPlaylists(response.data);
        } catch (error) {
            if (error instanceof Error) {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao carregar playlists: ' + error.message,
                });
            } else {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao carregar playlists: Ocorreu um erro desconhecido.',
                });
            }
        } finally {
            setIsPlaylistsLoading(false);
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
                if (error instanceof Error) {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao criar playlist: ' + error.message,
                    });
                } else {
                    showNotification({
                        type: NotificationType.ERROR,
                        content: 'Falha ao criar playlist: Ocorreu um erro desconhecido.',
                    });
                }
            }
        }
    };

    const fetchFollowedArtists = async () => {
        setIsArtistsLoading(true);
        try {
            const response = await api.get<ArtistDTO[]>('/artists/findFollowedByUser');
            setFollowedArtists(response.data);
        } catch (error) {
            if (error instanceof Error) {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao carregar artistas seguidos: ' + error.message,
                });
            } else {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao carregar artistas seguidos: Ocorreu um erro desconhecido.',
                });
            }
        } finally {
            setIsArtistsLoading(false);
        }
    };

    function handleArtistClick(artistId: number) {
        navigate(`/artist/${artistId}`);
    }

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

    const filteredPlaylists =
        selectedTab === 'playlists' && searchQuery.trim() !== ""
            ? playlists.filter(playlist =>
                  searchWords.some(word => playlist.name.toLowerCase().includes(word))
              )
            : playlists;

    const filteredArtists =
        selectedTab === 'artists' && searchQuery.trim() !== ""
            ? followedArtists.filter(artist =>
                  searchWords.some(word => artist.name.toLowerCase().includes(word))
              )
            : followedArtists;

    async function handleDeletePlaylist(playlistId: number) {
        try {
            await api.delete(`/playlist/deletePlaylist?playlistId=${playlistId}`);
            showNotification({
                type: NotificationType.SUCCESS,
                content: 'Playlist excluída com sucesso.',
            });
            fetchPlaylists();
        } catch (error) {
            if (error instanceof Error) {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao excluir playlist: ' + error.message,
                });
            } else {
                showNotification({
                    type: NotificationType.ERROR,
                    content: 'Falha ao excluir playlist: Ocorreu um erro desconhecido.',
                });
            }
        }
    }

    const open = Boolean(anchorEl);

    return (
        <Box
            sx={{
                width: '300px',
                backgroundColor: '#F4EFFD',
                padding: '16px',
                paddingTop: 0,
                borderRadius: '6px',
                margin: '8px',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '24px 0',
                    fontWeight: '600',
                    fontFamily: 'Outfit, sans-serif !important',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        fontFamily: '"Outfit", sans-serif',
                        color: '#452C63',
                        fontSize: '36px',
                    }}
                >
                    Sound
                    <span
                        style={{
                            color: '#FFFFFF',
                            backgroundColor: '#452C63',
                            padding: '0 4px 6px',
                            borderRadius: '4px',
                        }}
                    >
                        Scape
                    </span>
                </Typography>
            </Box>

            {isAuthenticated && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, marginTop: '8px' }}>
                    <Button
                        variant={selectedTab === 'playlists' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedTab('playlists')}
                        sx={{
                            borderRadius: '50px',
                            textTransform: 'none',
                            padding: '8px 24px',
                            fontSize: '14px',
                            fontWeight: selectedTab === 'playlists' ? 'bold' : 'normal',
                            backgroundColor: selectedTab === 'playlists' ? '#452C63' : 'transparent',
                            color: selectedTab === 'playlists' ? '#fff' : '#2F184B',
                            borderColor: '#2F184B',
                            '&:hover': {
                                backgroundColor: selectedTab === 'playlists' ? '#2F184B' : 'rgba(47, 24, 75, 0.1)',
                                borderColor: '#2F184B',
                            },
                        }}
                    >
                        Minhas Playlists
                    </Button>
                    <Button
                        variant={selectedTab === 'artists' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedTab('artists')}
                        sx={{
                            borderRadius: '50px',
                            textTransform: 'none',
                            padding: '8px 24px',
                            fontSize: '14px',
                            fontWeight: selectedTab === 'artists' ? 'bold' : 'normal',
                            backgroundColor: selectedTab === 'artists' ? '#452C63' : 'transparent',
                            color: selectedTab === 'artists' ? '#fff' : '#2F184B',
                            borderColor: '#2F184B',
                            '&:hover': {
                                backgroundColor: selectedTab === 'artists' ? '#2F184B' : 'rgba(47, 24, 75, 0.1)',
                                borderColor: '#2F184B',
                            },
                        }}
                    >
                        Artistas
                    </Button>
                </Box>
            )}

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2,
                    mb: 2,
                    marginBottom: 0,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        height: '40px',
                        flex: 1,
                        marginBottom: '16px',
                    }}
                >
                    <IconButton sx={{ color: '#2F184B' }}>
                        <Search />
                    </IconButton>
                    <InputBase
                        placeholder={selectedTab === 'playlists' ? 'Pesquise playlists...' : 'Pesquise artistas...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        sx={{
                            ml: 1,
                            fontSize: '14px',
                            height: '100%',
                        }}
                    />
                </Box>
                {selectedTab === 'playlists' && (
                    <IconButton onClick={handlePopoverOpen} sx={{ color: '#2F184B', height: '40px', width: '40px' }}>
                        <Add />
                    </IconButton>
                )}
            </Box>

            {isAuthenticated &&
                (selectedTab === 'playlists' ? (
                    isPlaylistsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress style={{ color: '#2F184B' }} />
                        </Box>
                    ) : (
                        <List>
                            {filteredPlaylists.map((playlist) => (
                                <ListItem
                                    key={playlist.id}
                                    onClick={() => handlePlaylistClick(playlist.id)}
                                    sx={{
                                        borderRadius: '6px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(47, 24, 75, 0.1)',
                                        },
                                        cursor: 'pointer',
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeletePlaylist(playlist.id);
                                            }}
                                            sx={{ color: '#452C63' }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    }
                                >
                                    <ListItemIcon
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 70,
                                            height: 70,
                                            borderRadius: 4,
                                            marginRight: 16,
                                            backgroundColor: '#ADB5BD',
                                        }}
                                    >
                                        <LibraryMusic style={{ width: 40, height: 40, color: '#ffffff' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={playlist.name} />
                                </ListItem>
                            ))}
                        </List>
                    )
                ) : selectedTab === 'artists' ? (
                    isArtistsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress style={{ color: '#2F184B' }} />
                        </Box>
                    ) : (
                        <List>
                            {filteredArtists.map((artist) => (
                                <ListItem
                                    key={artist.id}
                                    onClick={() => handleArtistClick(artist.id)}
                                    sx={{
                                        borderRadius: '6px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(47, 24, 75, 0.1)',
                                        },
                                        cursor: 'pointer',
                                    }}
                                >
                                    <ListItemIcon
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 70,
                                            height: 70,
                                            borderRadius: 4,
                                            marginRight: 16,
                                            backgroundColor: '#ADB5BD',
                                        }}
                                    >
                                        <Person style={{ width: 40, height: 40, color: '#ffffff' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={artist.name} />
                                </ListItem>
                            ))}
                        </List>
                    )
                ) : null)}

            {isAuthenticated && (
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
                        horizontal: 'left',
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            backgroundColor: '#F4EFFD',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                            padding: '16px',
                            width: '300px',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#2F184B',
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                        >
                            Nova Playlist
                        </Typography>
                        <InputBase
                            placeholder="Digite o nome da playlist"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            fullWidth
                            sx={{
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                fontSize: '14px',
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCreatePlaylist}
                            sx={{
                                backgroundColor: '#2F184B',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                borderRadius: '6px',
                                '&:hover': {
                                    backgroundColor: '#452C63',
                                },
                            }}
                        >
                            Criar
                        </Button>
                    </Box>
                </Popover>
            )}
        </Box>
    );
}
