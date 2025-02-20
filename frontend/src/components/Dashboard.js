import Calendar from './Calendar'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";


function Dashboard() {
    const navigate = useNavigate();
    const [csrfToken, setCsrfToken] = useState("");

    // ✅ Fetch CSRF token before making logout requests
    useEffect(() => {
        axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true })
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
                "http://localhost:8000/auth/logout/",
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
        <>
            <Box display="flex" justifyContent="space-between" >
                <h1>Welcome to the Dashboard</h1>
                <button onClick={handleLogout} className="btn variant-filled-primary">
                    Profile
                </button>
            </Box>
            <hr></hr>
            <Box style={{ marginLeft: '50px', marginRight: '50px'}}>
                <Calendar style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
        </>
    );
}

export default Dashboard;