import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import NavigationMenu from "../NavigationMenu.js";
import Calendar from './Calendar'
import './Dashboard.css';
import WelcomePage from '../WelcomePage';
import config from "../../config";

function Dashboard() {
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState("");
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const location = useLocation();
    const [showWelcome, setShowWelcome] = useState(location.state?.showWelcome || false);
    const locationGymId = location.state?.gymId;
    const [gymId, setGymId] = useState(locationGymId);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [gymName, setGymName] = useState("");

    // Fetch user profile to get gym information
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${config.apiUrl}/auth/profile/`, {
                    withCredentials: true
                });
                
                const { gym } = res.data;
                if (gym && gym.id) {
                    setGymId(gym.id);
                    setGymName(gym.name);
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setError("Failed to load gym information. Please try again.");
                setLoading(false);
                
                // If unauthorized, redirect to login
                if (error.response && error.response.status === 401) {
                    navigate("/login");
                }
            }
        };

        if (!locationGymId) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [navigate, locationGymId]);

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
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                ) : (
                    <>
                        {gymName && (
                            <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                                {gymName} Dashboard
                            </Typography>
                        )}
                        <WelcomePage open={showWelcome} gymId={gymId} onClose={() => setShowWelcome(false)} />
                        <Box style={{ marginLeft: '50px', marginRight: '50px' }}>
                            <Calendar 
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                gymId={gymId}
                            />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default Dashboard;