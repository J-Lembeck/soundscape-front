import Album from '@mui/icons-material/Album';
import { Box, CardMedia, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { SongImageProps } from './ISongImage';

const SongImage = ({ song, handleImageClick }: SongImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    return (
        <Box
            position="relative"
            width={80}
            height={80}
            style={{ cursor: 'pointer', borderRadius: 4 }}
            onClick={() => handleImageClick(song.id)}
        >
            {isLoading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <CircularProgress size={24} style={{color: "#2F184B"}}/>
                </Box>
            )}
            {!imageError && (
                <CardMedia
                    component="img"
                    image={song.imageUrl}
                    alt={song.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 4,
                        display: isLoading ? 'none' : 'block',
                    }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setImageError(true);
                    }}
                />
            )}
            {imageError && !isLoading && (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                    height="100%"
                    style={{ borderRadius: 4, backgroundColor: '#ADB5BD' }}
                >
                    <Album style={{ width: 45, height: 45, color: '#ffffff' }} />
                </Box>
            )}
        </Box>
    );
};

export default SongImage;
