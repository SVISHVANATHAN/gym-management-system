import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Box,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import PaymentIcon from "@mui/icons-material/Payment";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            label: "Dashboard",
            path: "/",
            icon: <DashboardIcon />,
        },
        {
            label: "Members",
            path: "/members",
            icon: <PeopleIcon />,
        },
        {
            label: "Membership Plans",
            path: "/membership-plans",
            icon: <ListAltIcon />,
        },
        {
            label: "Memberships",
            path: "/memberships",
            icon: <CardMembershipIcon />,
        },
        {
            label: "Payments",
            path: "/payments",
            icon: <PaymentIcon />,
        },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,

                "& .MuiDrawer-paper": {
                    width: 240,
                    backgroundColor: "#111827",
                    color: "#FFFFFF",
                    boxSizing: "border-box",
                    borderRight: "none",
                },
            }}
        >
            {/* Gym Logo and Title */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2.5,
                    py: 3,
                    mb: 1.5,
                }}
            >

                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        minWidth: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        backgroundColor: "#2563EB",
                        color: "#FFFFFF",
                    }}
                >
                    <FitnessCenterIcon
                        sx={{
                            fontSize: 28,
                        }}
                    />
                </Box>


                <Box>
                    <Typography
                        sx={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#FFFFFF",
                            lineHeight: 1.4,
                            letterSpacing: 0.5,
                        }}
                    >
                        Gym
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#FFFFFF",
                            lineHeight: 1.4,
                            letterSpacing: 0.5,
                        }}
                    >
                        Management
                    </Typography>
                </Box>
            </Box>

            <List sx={{ px: 1, py: 0 }}>
                {menuItems.map((item) => {
                    const isActive =
                        location.pathname === item.path;

                    return (
                        <ListItem
                            key={item.path}
                            disablePadding
                            sx={{
                                mb: 0.5,
                            }}
                        >
                            <ListItemButton
                                selected={isActive}
                                onClick={() =>
                                    navigate(item.path)
                                }
                                sx={{
                                    minHeight: 48,
                                    gap: 2,
                                    px: 2,
                                    borderRadius: 1,

                                    backgroundColor: isActive
                                        ? "#2563EB"
                                        : "transparent",

                                    color: "#FFFFFF",

                                    "&.Mui-selected": {
                                        backgroundColor: "#2563EB",
                                    },

                                    "&.Mui-selected:hover": {
                                        backgroundColor: "#1D4ED8",
                                    },

                                    "&:hover": {
                                        backgroundColor: isActive
                                            ? "#1D4ED8"
                                            : "#1F2937",
                                    },
                                }}
                            >
                                {item.icon}

                                <ListItemText
                                    primary={item.label}
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontSize: 14,
                                                fontWeight: 500,
                                            },
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
};

export default Sidebar;