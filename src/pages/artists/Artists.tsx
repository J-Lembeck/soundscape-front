import { Typography, Box, Avatar, CircularProgress } from '@mui/material';
import { SentimentVeryDissatisfied } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import SongList from '../../components/songList/SongList';
import { ArtistDTO, ArtistProps } from './IArtist';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Artists({ isAuthenticated, onSongSelect, playingSongId, isPlaying, togglePlayPause, songs, playlists, isPlaylist, 
    fetchSongsFromPlaylist, fetchSongsFromArtist, isSongsLoading }: ArtistProps) {
    const [selectedArtist, setSelectedArtist] = useState<ArtistDTO>();
    const { id: artistId } = useParams();

    useEffect(() => {
        if(artistId) fetchArtist(artistId);
    }, [artistId])

    async function fetchArtist(artistId: string) {
        const response = await api.get<ArtistDTO>(`/artists/findById?artistId=${artistId}`)
        setSelectedArtist(response.data);
    }

    if (isSongsLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
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
        <Box padding={"32px"} paddingLeft={"3rem"} paddingRight={"3rem"}>
            <Box display="flex" flexDirection="row" alignItems="center" marginBottom={2}>
                <Avatar style={{ marginRight: '8px', width: 40, height: 40, backgroundColor: '#4B306A' }} />
                <Typography gutterBottom margin={0}>
                    Perfil de {selectedArtist?.name}
                </Typography>
            </Box>

            <SongList
                isAuthenticated={isAuthenticated}
                onSongSelect={onSongSelect}
                isPlaying={isPlaying}
                playingSongId={playingSongId}
                togglePlayPause={togglePlayPause}
                songs={songs}
                playlists={playlists}
                isPlaylist={true}
                isArtist={true}
                fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                fetchSongsFromArtist={fetchSongsFromArtist}
            />
        </Box>
    );
}
