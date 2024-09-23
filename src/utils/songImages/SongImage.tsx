import Album from '@mui/icons-material/Album';
import { Box, CardMedia } from '@mui/material';
import { useState } from 'react';
import { SongImageProps } from './ISongImage';

const SongImage = ({ song, handleImageClick }: SongImageProps) => {
    const [imageError, setImageError] = useState(false);

    return (
        <>
            {!imageError ? (
                <CardMedia
                    component="img"
                    image={song.imageUrl}
                    alt={song.title}
                    style={{ width: 80, height: 80, cursor: 'pointer', borderRadius: 4 }}
                    onClick={() => handleImageClick(song.id)}
                    onError={() => setImageError(true)}
                />
            ) : (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{ width: 80, height: 80, borderRadius: 4, marginRight: 16, backgroundColor: "#ADB5BD", margin: 0 }}
                >
                    <Album style={{ width: 45, height: 45, color: "#FBFAFF", margin: 0 }} />
                </Box>
            )}
        </>
    );
};

export default SongImage;
