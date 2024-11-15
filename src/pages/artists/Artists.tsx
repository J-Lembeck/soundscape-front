import { Typography, Box, Avatar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Button } from '@mui/material';
import { PeopleAlt, Person, SentimentVeryDissatisfied } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import SongList from '../../components/songList/SongList';
import { ArtistDTO, ArtistProps } from './IArtist';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Artists({ isAuthenticated, onSongSelect, playingSongId, isPlaying, togglePlayPause, songs, playlists, isPlaylist,
    fetchSongsFromPlaylist, fetchSongsFromArtist, isSongsLoading }: ArtistProps) {
    const [selectedArtist, setSelectedArtist] = useState<ArtistDTO>();
    const [followers, setFollowers] = useState<ArtistDTO[]>([]);
    const [isFollowersLoading, setIsFollowersLoading] = useState<boolean>(false);
    const [isFollowButtonLoading, setIsFollowButtonLoading] = useState<boolean>(false);
    const [isFollowed, setIsFollowed] = useState<boolean>(false);

    const { id: artistId } = useParams();

    useEffect(() => {
        if (artistId) {
            fetchArtist(artistId);
            fetchFollowers(artistId);
        }
    }, [artistId]);

    async function fetchArtist(artistId: string) {
        const response = await api.get<ArtistDTO>(`/artists/findById?artistId=${artistId}`);
        fetchSongsFromArtist(artistId);
        setSelectedArtist(response.data);
    }

    async function fetchFollowers(artistId: string | number) {
        setIsFollowersLoading(true);
        try {
            const response = await api.get<ArtistDTO[]>(`/artists/findFollowersOfUser?artistId=${artistId}`);
            setFollowers(response.data);
            setIsFollowed(response.data.some(follower => follower.name === localStorage.getItem("username")));
        } catch (error) {
            console.error('Erro ao buscar seguidores:', error);
        } finally {
            setIsFollowersLoading(false);
        }
    }

    const handleFollowArtist = async () => {
        if (selectedArtist) {
            setIsFollowButtonLoading(true);
            try {
                await api.post('/artists/followArtist', null, {
                    params: {
                        artistToFollowId: selectedArtist.id,
                    },
                });
                fetchFollowers(selectedArtist.id);
                setIsFollowed(true);
            } catch (error) {
                console.error('Erro ao seguir o artista:', error);
            } finally {
                setIsFollowButtonLoading(false);
            }
        }
    };

    const handleUnFollowArtist = async () => {
        if (selectedArtist) {
            setIsFollowButtonLoading(true);
            try {
                await api.post('/artists/unfollowArtist', null, {
                    params: {
                        artistToUnfollowId: selectedArtist.id,
                    },
                });
                fetchFollowers(selectedArtist.id);
                setIsFollowed(false);
            } catch (error) {
                console.error('Erro ao seguir o artista:', error);
            } finally {
                setIsFollowButtonLoading(false);
            }
        }
    };

    if (isSongsLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress style={{color: "#2F184B"}} />
            </div>
        );
    }

    if (songs.length === 0) {
        return (
            <Box
                padding={"32px"}
                paddingLeft={"3rem"}
                paddingRight={"3rem"}
                width={"100%"}
                flexGrow={1}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Box textAlign="center">
                    <SentimentVeryDissatisfied style={{ width: 200, height: 200, color: "#2F184B" }} />
                    <Typography variant="subtitle1" gutterBottom>
                        {"Este perfil não possui nenhum conteúdo."}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box padding={"32px"} paddingLeft={"3rem"} paddingRight={"3rem"} style={{ height: "calc(100vh - 116px)", overflowY: "auto" }} className={"scroll-custom"}>
            <Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between">
                <Box display="flex" flexDirection="column" flex={1} marginRight={2}>
                    <Box display="flex" alignItems="center" marginBottom={2} width={"100%"} justifyContent={"left"}>
                        <Person style={{ marginRight: '8px', width: 40, height: 40, color: '#4B306A' }} />
                        <Typography gutterBottom margin={0}>
                            Perfil de {selectedArtist?.name}
                        </Typography>
                        {selectedArtist?.name !== localStorage.getItem("username") && isAuthenticated && (
                            <Box marginLeft={2}>
                                <Button
                                    variant="contained"
                                    style={{ backgroundColor: "#4B306A" }}
                                    onClick={isFollowed ? handleUnFollowArtist : handleFollowArtist}
                                    disabled={isFollowButtonLoading}
                                >
                                    {isFollowButtonLoading ? <CircularProgress size={24} color="inherit" /> : isFollowed ? 'Deixar de seguir' : 'Seguir'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                    <SongList
                        isAuthenticated={isAuthenticated}
                        onSongSelect={onSongSelect}
                        isPlaying={isPlaying}
                        playingSongId={playingSongId}
                        togglePlayPause={togglePlayPause}
                        songs={songs}
                        playlists={playlists}
                        isPlaylist={false}
                        isArtist={true}
                        fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                        fetchSongsFromArtist={fetchSongsFromArtist}
                    />
                </Box>

                <Box flex={0.3} style={{ backgroundColor: "#F4EFFD", padding: "1rem", borderRadius: '6px', }}>
                    <Box display="flex" alignItems="center" marginBottom={2} width={"80%"} justifyContent={"left"}>
                        <PeopleAlt style={{ marginRight: '8px', width: 40, height: 40, color: '#4B306A' }} />
                        <Typography gutterBottom margin={0}>Seguidores</Typography>
                    </Box>
                    {isFollowersLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress style={{color: "#2F184B"}} />
                        </Box>
                    ) : (
                        <List>
                            {followers.length > 0 ? (
                                followers.map((follower) => (
                                    <ListItem key={follower.id}>
                                        <ListItemAvatar>
                                            <Avatar />
                                        </ListItemAvatar>
                                        <ListItemText primary={follower.name} />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography gutterBottom margin={0}>Este usuário não possui seguidores.</Typography>
                            )}
                        </List>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
