export interface IUploadFileModalProps {
    fetchSongsFromArtist: (artistId: number | string | undefined) => void;
    onClose: () => void;
}