import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconButton, Popover, Avatar, MenuItem, InputBase, Box, Typography, MenuList, Dialog, DialogContent } from "@mui/material";
import { Home, Favorite, Search, Person, Logout, UploadFile } from "@mui/icons-material";
import { MenuProps } from "./IMenu";
import api from "../../services/api";
import { ArtistDTO } from "../../pages/artists/IArtist";
import UploadFileModal from "../uploadFile/UploadFileModal";

export default function Menu({ searchValue, setSearchValue, fetchSongsFromArtist, isAuthenticated }: MenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openModal, setOpenModal] = useState(false);
    const navigate = useNavigate();

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleOpenMyProfile = async () => {
        try {
            const response = await api.get<ArtistDTO>(`/artists/findArtistFromLoggedUser`);
            navigate(`/artist/${response.data.id}`);
            fetchSongsFromArtist(response.data.id);
            handlePopoverClose();
        } catch (error) {
            console.error("Erro ao abrir o perfil:", error);
            handlePopoverClose();
        }
    };

    const onClose = () => {
        setOpenModal(false);
    };

    const open = Boolean(anchorEl);

    return (
        <nav
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                alignItems: 'center',
                height: '85px',
                marginLeft: '3rem',
                marginRight: '3rem',
            }}
        >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#4B306A' }}>
                    <IconButton style={{ paddingLeft: 0 }}>
                        <Home style={{ color: "#2F184B" }} />
                    </IconButton>
                    Home
                </Link>

                {isAuthenticated && (
                    <Link to="/favorites" style={{ textDecoration: 'none', color: '#4B306A' }}>
                        <IconButton>
                            <Favorite style={{ color: "#2F184B" }} />
                        </IconButton>
                        Curtidas
                    </Link>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F4EFFD',
                    borderRadius: '6px',
                    padding: '0 10px',
                    minWidth: '250px',
                    width: '50%',
                    maxWidth: '500px',
                    height: '55px',
                }}
            >
                <InputBase
                    placeholder="Pesquise..."
                    inputProps={{ 'aria-label': 'pesquise' }}
                    value={searchValue}
                    onChange={handleSearchChange}
                    style={{ width: '100%', height: '100%' }}
                />
                <IconButton type="submit" aria-label="search">
                    <Search />
                </IconButton>
            </div>

            <div>
                <Box display={"flex"} flexDirection={"row"} alignContent={"center"} alignItems={"center"}>
                    <Typography>
                        {isAuthenticated ? (
                            localStorage.getItem("username")
                        ) : (
                            <Link to="/login" style={{ textDecoration: 'none', color: '#4B306A' }}>
                                Fazer login
                            </Link>
                        )}
                    </Typography>
                    <IconButton onClick={handlePopoverOpen}>
                        <Avatar style={{ backgroundColor: '#4B306A', paddingRight: 0 }}>
                            <Person />
                        </Avatar>
                    </IconButton>
                </Box>
                {isAuthenticated && (
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handlePopoverClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    >
                        <MenuList>
                            <MenuItem
                                onClick={() => {
                                    setOpenModal(true);
                                    handlePopoverClose();
                                }}
                            >
                                <UploadFile style={{ paddingRight: "0.5rem" }} />
                                <Typography>Enviar</Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleOpenMyProfile();
                                    handlePopoverClose();
                                }}
                            >
                                <Typography style={{ textDecoration: 'none', color: '#4B306A', display: "flex", flexDirection: "row" }}>
                                    <Person style={{ paddingRight: "0.5rem" }} />
                                    Meu Perfil
                                </Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handlePopoverClose();
                                }}
                            >
                                <Link to="/login" style={{ textDecoration: 'none', color: '#4B306A', display: "flex", flexDirection: "row" }}>
                                    <Logout style={{ paddingRight: "0.5rem" }} />
                                    <Typography>Sair</Typography>
                                </Link>
                            </MenuItem>
                        </MenuList>
                    </Popover>
                )}
            </div>

            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 3,
                        maxWidth: '500px',
                        width: '100%',
                    },
                }}
            >
                <DialogContent>
                    <UploadFileModal fetchSongsFromArtist={fetchSongsFromArtist} onClose={onClose} />
                </DialogContent>
            </Dialog>
        </nav>
    );
}
