// src/components/NavigationMenu.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Tooltip,
    IconButton,
    Divider
} from "@mui/material";

// Import MUI Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import logo from '../assets/logo.jpeg';

const NavigationMenu = ({ onWidthChange }) => {
    const navigate = useNavigate();

    // State for Sidebar Width
    const [sidebarWidth, setSidebarWidth] = useState(250);

    // Responsive Breakpoints
    const MAX_WIDTH = 250;
    const MIN_WIDTH = 60;

    // Handle Resize
    const handleResize = () => {
        const screenWidth = window.innerWidth;
        const displayWidth = window.screen.width;

        if (screenWidth < (displayWidth / 2)) {
            setSidebarWidth(MIN_WIDTH); // Only icons
        } else {
            setSidebarWidth(MAX_WIDTH); // Full version
        }
    };

    // Notify parent component of width change
    useEffect(() => {
        onWidthChange(sidebarWidth);
    }, [sidebarWidth, onWidthChange]);

    // Add Event Listener for Resizing
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        { text: "Schedule", path: "/dashboard", icon: <CalendarTodayIcon /> },
        { text: "Analytics", path: "/analytics", icon: <BarChartIcon /> },
        { text: "Clients", path: "/clients-page", icon: <PeopleIcon /> }
    ];

    return (
        <Box
            sx={{
                width: `${sidebarWidth}px`,
                height: "100vh",
                backgroundColor: "#f5f5f5",
                boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
                padding: "20px 10px",
                position: "fixed",
                overflowX: "hidden",
                transition: "width 0.3s ease-in-out"
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
                        style={{ height: "40px", cursor: "pointer" }} // Adjust height if needed
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
                        transition: "transform 0.3s",
                        // "&:hover": {
                        //     transform: "rotate(90deg)"
                        // }
                    }}
                />
            </Box>
            <List>
                {menuItems.map((item, index) => (
                    <Tooltip title={item.text} placement="right" key={index}>
                        <ListItem
                            button
                            onClick={() => navigate(item.path)}
                            sx={{
                                mb: 1,
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "#e0e0e0"
                                }
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
        </Box>
    );
};

export default NavigationMenu;