import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box } from "@mui/material";
import NavigationMenu from "../NavigationMenu.js";
import Calendar from './Calendar'
import './Dashboard.css';
import WelcomePage from '../WelcomePage';

function Dashboard() {
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState("");
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const location = useLocation();
    const [showWelcome, setShowWelcome] = useState(location.state?.showWelcome || false);
    const gymId = location.state?.gymId;

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
                <WelcomePage open={showWelcome} gymId={gymId} onClose={() => setShowWelcome(false)} />
                <Box style={{ marginLeft: '50px', marginRight: '50px' }}>
                    <Calendar style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
            </Box>
        </Box>
    );
}

export default Dashboard;