import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import { Button, Box, Typography } from "@mui/material";
import NavigationMenu from "../NavigationMenu.js";
import Calendar from './Calendar'
import AddClass from './AddClass.js';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState("");
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const addEvent = (newEvent) => {
        setEvents((prev) => [...prev, newEvent]);
    };
    const [events, setEvents] = useState([
        {
          title: 'Adult Fundamentals',
          start: '2025-02-20T10:00:00Z',
          end: '2025-02-20T12:00:00Z',
          color: '#E0E0E0',
          textColor: 'black',
          borderColor: 'black',
        },
        {
          title: 'Adult Advanced',
          start: '2025-02-20T12:30:00Z',
          end: '2025-02-20T14:20:00Z',
          color: '#E0E0E0',
          textColor: 'black',
          borderColor: 'black',
        },
      ]);

    // ✅ Fetch CSRF token before making logout requests
    useEffect(() => {
        axios.get(config.endpoints.auth.csrf, { withCredentials: true })
            .then(response => {
                if (!response.data.csrfToken) {
                    throw new Error("CSRF Token missing in response");
                }
                setCsrfToken(response.data.csrfToken);
            })
            .catch(error => console.error("Failed to fetch CSRF token", error));
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(
                config.endpoints.auth.logout,
                {},
                {
                    headers: { "X-CSRFToken": csrfToken },
                    withCredentials: true
                });
            console.log("🟢 Logged out successfully");
            navigate("/login");  // ✅ Redirect to login page after logout
        } catch (error) {
            console.error("🔴 Logout failed", error);
        }
    };

    return (
        <Box display="flex">
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    transition: "margin-left 0.3s ease-in-out",
                    marginLeft: `${sidebarWidth}px`
                }}
            >
                <Box style={{ marginLeft: '50px', marginRight: '50px' }}>
                    <Calendar style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
            </Box>
        </Box>
    );
}

export default Dashboard;