export interface MenuProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    fetchSongsFromArtist: (artistId: number | string | undefined) => void;
    isAuthenticated: boolean;
}