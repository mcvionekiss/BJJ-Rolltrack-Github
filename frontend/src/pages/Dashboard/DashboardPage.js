import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import axios from "axios";
<<<<<<< Updated upstream:frontend/src/components/Schedule/Dashboard.js
import { API_ENDPOINTS } from "../../config";
import { Button, Box, Typography } from "@mui/material";
import NavigationMenu from "../NavigationMenu.js";
import Calendar from './Calendar'
import AddClass from './AddClass.js';
import './Dashboard.css';
=======
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import NavigationMenu from "../../components/NavigationMenu.js";
import Calendar from './Calendar/Calendar.js'
import "../../styles/Dashboard.css";
import WelcomePage from '../Dashboard/WelcomePage.js';
import config from "../../config.js";
>>>>>>> Stashed changes:frontend/src/pages/Dashboard/DashboardPage.js

function DashboardPage() {
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
        axios.get(API_ENDPOINTS.AUTH.CSRF, { withCredentials: true })
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
                API_ENDPOINTS.AUTH.LOGOUT,
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
        <Box display="flex" sx={{ overflowY: "auto" }}>
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    transition: "margin-left 0.2s ease-in-out",
                    marginLeft: `${sidebarWidth}px`
                }}
            >
<<<<<<< Updated upstream:frontend/src/components/Schedule/Dashboard.js
                <Box style={{ marginLeft: '50px', marginRight: '50px' }}>
                    <Calendar style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
=======
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                ) : (
                    <>
                        {gymName && (
                            <Typography variant="h4" sx={{ ml: 5, fontWeight: "bold" }}>
                                {gymName} Dashboard
                            </Typography>
                        )}
                        <WelcomePage open={showWelcome} gymId={gymId} onClose={() => setShowWelcome(false)} />
                        <Box sx={{ ml: 5, mr: 5 }}>
                            <Calendar 
                                gymId={gymId}
                                sidebarWidth={sidebarWidth}
                            />
                        </Box>
                    </>
                )}
>>>>>>> Stashed changes:frontend/src/pages/Dashboard/DashboardPage.js
            </Box>
        </Box>
    );
}

export default DashboardPage;