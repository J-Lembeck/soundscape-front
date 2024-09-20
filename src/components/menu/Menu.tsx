import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton, Popover, Avatar, MenuItem, InputBase, Box, Typography } from "@mui/material";
import { Home, Favorite, Search, Person } from "@mui/icons-material";

export default function Menu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#FBFAFF', alignItems: 'center', height: '85px', marginLeft: '3rem', marginRight: '3rem'}}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <Link to="/home" style={{ textDecoration: 'none', color: '#4B306A' }}>
                    <IconButton style={{paddingLeft: 0}}>
                        <Home style={{color: "#2F184B"}} />
                    </IconButton>
                    Home
                </Link>

                <Link to="/favorites" style={{ textDecoration: 'none', color: '#4B306A' }}>
                    <IconButton>
                        <Favorite style={{color: "#2F184B"}} />
                    </IconButton>
                    Curtidas
                </Link>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F4EFFD',
                borderRadius: '6px',
                padding: '0 10px',
                minWidth: '250px',
                width: '50%',
                maxWidth: '1000px',
                height: '55px'
            }}>
                <InputBase
                    placeholder="Pesquise..."
                    inputProps={{ 'aria-label': 'pesquise' }}
                    style={{ width: '100%', height: '100%' }}
                />
                <IconButton type="submit" aria-label="search">
                    <Search />
                </IconButton>
            </div>

            <div>
                <Box display={"flex"} flexDirection={"row"} alignContent={"center"} alignItems={"center"}>
                    <Typography> 
                        {localStorage.getItem("username") ? localStorage.getItem("username") : "Fazer login"}
                    </Typography>
                    <IconButton onClick={handlePopoverOpen}>
                        <Avatar style={{ backgroundColor: '#4B306A', paddingRight: 0 }}>
                            <Person />
                        </Avatar>
                    </IconButton>
                </Box>
                
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handlePopoverClose}>
                        <Link to="/upload" style={{ textDecoration: 'none', color: '#4B306A' }}>
                            Upload
                        </Link>
                    </MenuItem>
                </Popover>
            </div>
        </nav>
    );
}
