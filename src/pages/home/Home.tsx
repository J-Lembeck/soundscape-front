import { Typography, Box, CircularProgress } from '@mui/material';
import { Height, QueueMusic, SentimentVeryDissatisfied } from '@mui/icons-material';
import SongList from '../../components/songList/SongList';
import { HomeProps } from './IHome';

export default function Home({ isAuthenticated, onSongSelect, playingSongId, isPlaying, togglePlayPause, songs, playlists, fetchSongsFromPlaylist, 
    fetchSongsFromArtist, isSongsLoading }: HomeProps) {
 
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
                        {"Não encontramos nenhum resultado."}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box padding={"32px"} paddingLeft={"3rem"} paddingRight={"3rem"} style={{height: "calc(100vh - 116px)", overflowY: "auto"}}>
            <Box display="flex" flexDirection="row" alignItems="center" marginBottom={2}>
                <QueueMusic style={{ marginRight: '8px', width: 40, height: 40, color: "#2F184B" }} />
                <Typography margin={0} gutterBottom>
                    Uploads recentes
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
                isArtist={false}
                fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                fetchSongsFromArtist={fetchSongsFromArtist}
            />
        </Box>
    );
}
