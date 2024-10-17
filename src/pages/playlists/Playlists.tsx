import { Typography, Box, CircularProgress } from '@mui/material';
import { QueueMusic, SentimentVeryDissatisfied } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import SongList from '../../components/songList/SongList';
import { useEffect } from 'react';
import { PlaylistProps } from './IPlaylists';

export default function Playlists({ isAuthenticated, onSongSelect, playingSongId, isPlaying, togglePlayPause, songs, playlists, fetchSongsFromPlaylist, 
    fetchSongsFromArtist, isSongsLoading }: PlaylistProps) {
    const { id: playlistId } = useParams();

    useEffect(() => {
        if(playlistId) fetchSongsFromPlaylist(playlistId);
    }, [playlistId])

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
                        {"Esta playlist está vazia!"}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box padding={"32px"} paddingLeft={"3rem"} paddingRight={"3rem"}>
            <Box display="flex" flexDirection="row" alignItems="center" marginBottom={2}>
                <QueueMusic style={{ marginRight: '8px', width: 40, height: 40, color: "#2F184B" }} />
                <Typography gutterBottom margin={0}>
                    {playlists.find(playlist => playlist.id === Number(playlistId))?.name}
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
                isArtist={false}
                fetchSongsFromPlaylist={fetchSongsFromPlaylist}
                fetchSongsFromArtist={fetchSongsFromArtist}
            />
        </Box>
    );
}
