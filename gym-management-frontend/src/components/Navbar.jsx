import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    TextField,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
} from "@mui/material";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const Navbar = () => {
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const [admin, setAdmin] = useState(null);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        setAnchorEl(null);
        navigate("/login");
    };

    // Fetch logged-in admin details
    useEffect(() => {
        let isMounted = true;

        const fetchAdmin = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    return;
                }

                const decoded = jwtDecode(token);

                const response = await axios.get(
                    `${API_BASE_URL}/admin/${decoded.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (isMounted) {
                    const adminData = response.data?.data;

                    setAdmin(
                        Array.isArray(adminData)
                            ? adminData[0] || null
                            : adminData || null
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to fetch admin details:",
                    error
                );
            }
        };

        fetchAdmin();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: "#FFFFFF",
                color: "#111827",
                borderBottom: "1px solid #E5E7EB",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: "64px",
                }}
            >
                {/* Page title */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                    }}
                >
                    Dashboard
                </Typography>

                {/* Right-side navbar items */}
                <Box
                    sx={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    {/* Search field */}
                    <TextField
                        size="small"
                        placeholder="Search..."
                        slotProps={{
                            htmlInput: {
                                "aria-label": "Search",
                            },
                        }}
                        sx={{
                            width: {
                                xs: 120,
                                sm: 180,
                                md: 220,
                            },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                            },
                        }}
                    />

                    {/* Notifications */}
                    <IconButton
                        aria-label="Notifications"
                        color="inherit"
                    >
                        <NotificationsNoneIcon />
                    </IconButton>

                    {/* Admin avatar */}
                    <IconButton
                        aria-label="Open account menu"
                        onClick={(event) =>
                            setAnchorEl(event.currentTarget)
                        }
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: "#2563EB",
                            }}
                        >
                            {admin?.name
                                ? admin.name.charAt(0).toUpperCase()
                                : "A"}
                        </Avatar>
                    </IconButton>

                    {/* Account menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem
                            onClick={() => {
                                setAnchorEl(null);
                                navigate("/profile");
                            }}
                        >
                            Profile
                        </MenuItem>

                        <MenuItem onClick={handleLogout}>
                            Logout
                        </MenuItem>
                    </Menu>

                    {/* Admin name */}
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            display: {
                                xs: "none",
                                sm: "block",
                            },
                        }}
                    >
                        {admin?.name || "Admin"}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;