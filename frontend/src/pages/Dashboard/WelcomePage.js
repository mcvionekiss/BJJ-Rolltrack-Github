<<<<<<< Updated upstream:frontend/src/components/WelcomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import "./WelcomePage.css"; // Create this CSS file for styling

const WelcomePage = () => {
    const navigate = useNavigate();
=======
import React, { useEffect, useState } from "react";
import { Button, Typography, Box, Paper, Modal } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import "../../styles/WelcomePage.css";
import config from "../../config";

const WelcomePage = ({ gymId, open, onClose }) => {
    const [qrUrl, setQrUrl] = useState(null);

    useEffect(() => {
        if (gymId) {
            setQrUrl(config.endpoints.api.generateQR(gymId));
        }
    }, [gymId]);

    const handleDownload = async () => {
        if (!qrUrl) return;
        try {
            const response = await fetch(qrUrl, { mode: "cors" });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `bjj_rolltrack_qr_${gymId}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Failed to download QR code.");
        }
    };
>>>>>>> Stashed changes:frontend/src/pages/Dashboard/WelcomePage.js

    return (
            <Box className="welcome-box">
                <Typography variant="h4" className="welcome-title">
                    Welcome to RollTrack!
                </Typography>
                <Typography variant="body1" className="welcome-text">
                    Your account has been successfully created, and you’re all set to start managing your gym.
                </Typography>
                <Button 
                    variant="contained" 
                    sx={{
                        backgroundColor: "black",
                        color: "white",
                        textTransform: "none", // Prevents all caps
                        "&:hover": { backgroundColor: "#333" }
                    }}
                    onClick={() => navigate("/dashboard")}
                >
                    Start
                </Button>
            </Box>
    );
};

export default WelcomePage;