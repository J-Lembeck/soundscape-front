import { Typography, Box, CircularProgress } from '@mui/material';
import { Favorite, SentimentVeryDissatisfied } from '@mui/icons-material';
import SongList from '../../components/songList/SongList';
import { useEffect } from 'react';
import { FavoritesProps } from './IFavorites';

export default function Favorites({ isAuthenticated, onSongSelect, playingSongId, isPlaying, togglePlayPause, songs, playlists, 
    fetchSongsFromPlaylist, fetchSongsFromArtist, fetchLikedSongs, isSongsLoading }: FavoritesProps) {

    useEffect(() => {
        fetchLikedSongs();
    }, []);

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
        <Box padding={"32px"} paddingLeft={"3rem"} paddingRight={"3rem"} height={"100%"} style={{height: "calc(100vh - 116px)", overflowY: "auto"}} className={"scroll-custom"}>
            <Box display="flex" flexDirection="row" alignItems="center" marginBottom={2}>
                <Favorite style={{ marginRight: '8px', width: 40, height: 40, color: '#4B306A' }} />
                <Typography gutterBottom margin={0}>
                    Músicas curtidas
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
                isPlaylist={false}
                isArtist={true}
                fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                fetchSongsFromArtist={fetchSongsFromArtist}
            />
        </Box>
    );
}
