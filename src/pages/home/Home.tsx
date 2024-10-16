import { Typography, Box } from '@mui/material';
import { QueueMusic, SentimentVeryDissatisfied } from '@mui/icons-material';
import { SongListProps } from '../../components/songList/ISongList';
import SongList from '../../components/songList/SongList';

export default function Home({ isAuthenticated, onSongSelect, playingSongId, isPlaying, togglePlayPause, songs, playlists, fetchSongsFromPlaylist, fetchSongsFromArtist }: SongListProps) {
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
        <Box padding={"32px"} paddingLeft={"3rem"} paddingRight={"3rem"}>
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