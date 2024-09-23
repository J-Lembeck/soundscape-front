export interface SongImageProps {
    song: {
      id: number;
      imageUrl: string;
      title: string;
    };
    handleImageClick: (id: number) => void;
  }