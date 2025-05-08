// src/components/NavigationMenu.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Tooltip,
    Divider,
} from "@mui/material";

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/logo.jpeg';
import config from "../config";

const NavigationMenu = ({ onWidthChange }) => {
    const navigate = useNavigate();
    const currentPath = window.location.pathname;

    const [sidebarWidth, setSidebarWidth] = useState(250);
    const MAX_WIDTH = 250;
    const MIN_WIDTH = 60;

    const handleResize = () => {
        const screenWidth = window.innerWidth;
        const displayWidth = window.screen.width;

        if (screenWidth < (displayWidth / 2)) {
            setSidebarWidth(MIN_WIDTH);
        } else {
            setSidebarWidth(MAX_WIDTH);
        }
    };

    useEffect(() => {
        onWidthChange(sidebarWidth);
    }, [sidebarWidth, onWidthChange]);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        { text: "Schedule", path: "/dashboard", icon: <CalendarTodayIcon /> },
        { text: "Analytics", path: "/analytics", icon: <BarChartIcon /> },
        { text: "Clients", path: "/clients-page", icon: <PeopleIcon /> },
        { text: "Profile", path: "/profile", icon: <PersonIcon /> }
    ];

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }
  
    const handleLogout = async () => {
        try {
            const csrfToken = getCookie("csrftoken");
            await axios.post(
                `${config.apiUrl}/auth/logout/`,
                {},
                {
                    headers: {
                        "X-CSRFToken": csrfToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            // Clear local storage
            localStorage.removeItem("profileData");
            localStorage.removeItem("qrUrl");
            // Redirect to login page
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        }
    };

    return (
        <Box
            sx={{
                width: `${sidebarWidth}px`,
                height: "100vh",
                backgroundColor: "#f5f5f5",
                boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
                padding: "20px 10px",
                position: "fixed",
                zIndex: 1200,
                overflowX: "hidden",
                overflowY: "auto",
                transition: "width 0.3s ease-in-out",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent={sidebarWidth > MIN_WIDTH ? "space-between" : "center"}
                mb={2}
            >
                {sidebarWidth > MIN_WIDTH && (
                    <img
                        src={logo}
                        alt="RollTrack Logo"
                        style={{ height: "40px", cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    />
                )}
                {sidebarWidth > MIN_WIDTH && (
                    <Typography variant="h5" fontWeight="bold">
                        Rolltrack
                    </Typography>
                )}
                <MenuIcon
                    onClick={() =>
                        setSidebarWidth(
                            sidebarWidth > MIN_WIDTH ? MIN_WIDTH : MAX_WIDTH
                        )
                    }
                    sx={{
                        cursor: "pointer",
                        color: "#757575",
                        transition: "transform 0.3s"
                    }}
                />
            </Box>
            
            {/* Main navigation items */}
            <List sx={{ flex: 1 }}>
                {menuItems.map((item, index) => (
                    <Tooltip title={item.text} placement="right" key={index}>
                        <ListItem
                            component="div"
                            onClick={() => navigate(item.path)}
                            sx={{
                                mb: 1,
                                borderRadius: "8px",
                                backgroundColor: currentPath === item.path ? "#e0e0e0" : "transparent",
                                "&:hover": {
                                    backgroundColor: "#e0e0e0"
                                },
                                cursor: "pointer"
                            }}
                        >
                            <ListItemIcon sx={{ color: "#757575", minWidth: "40px" }}>
                                {item.icon}
                            </ListItemIcon>
                            {sidebarWidth > MIN_WIDTH && (
                                <ListItemText primary={item.text} />
                            )}
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
            
            {/* Logout button at bottom with extra spacing */}
            <Box sx={{ mt: 'auto', pb: 4 }}>
                <Divider sx={{ my: 2 }} />
                <Tooltip title="Logout" placement="right">
                    <ListItem
                        component="div"
                        onClick={handleLogout}
                        sx={{
                            borderRadius: "8px",
                            "&:hover": {
                                backgroundColor: "rgba(211, 47, 47, 0.1)",
                                color: "#d32f2f"
                            },
                            cursor: "pointer",
                            color: "#d32f2f"
                        }}
                    >
                        <ListItemIcon sx={{ color: "inherit", minWidth: "40px" }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        {sidebarWidth > MIN_WIDTH && (
                            <ListItemText primary="Logout" />
                        )}
                    </ListItem>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default NavigationMenu;