import React, { useEffect, useState } from "react";
import { Button, Typography, Box, Paper, Modal } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import "./WelcomePage.css"; // Create this CSS file for styling
import config from "../config";

const WelcomePage = ({ gymId, open, onClose }) => {
    const [qrUrl, setQrUrl] = useState(null);

    useEffect(() => {
        if (gymId) {
            // Call backend endpoint to generate QR code and get the image URL
            // This assumes you have a backend endpoint that runs the script and serves the image
            // For local dev, you could have the image saved in /public and just set the URL
            setQrUrl(config.endpoints.api.generateQR(gymId));
            // Or, if you have an API: `/api/generate-qr?gym_id=${gymId}`
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

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="welcome-modal-title" aria-describedby="welcome-modal-desc">
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        padding: 5,
                        borderRadius: 4,
                        minWidth: 400,
                        maxWidth: 500,
                        textAlign: "center",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    }}
                >
                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "#4caf50", mb: 1 }} />
                    <Typography variant="h4" className="welcome-title" sx={{ fontWeight: 700, mb: 1 }}>
                        Welcome to RollTrack!
                    </Typography>
                    <Typography variant="body1" className="welcome-text" sx={{ mb: 2 }}>
                        Your account has been successfully created, and you're all set to start managing your gym.
                    </Typography>
                    {gymId ? (
                        <>
                            <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 500 }}>
                                This QR code is your gym's unique check-in code.<br />
                                <span style={{ color: "#333" }}>Download and print it to display in your physical gym. Your gym members can scan this QR code to check in.</span>
                            </Typography>
                            {qrUrl && (
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                                    <img
                                        src={qrUrl}
                                        alt="Gym QR Code"
                                        style={{
                                            width: 220,
                                            height: 220,
                                            marginBottom: 18,
                                            border: "4px solid #eee",
                                            borderRadius: 12,
                                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                            background: "#fff"
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleDownload}
                                        sx={{
                                            mb: 2,
                                            fontWeight: 600,
                                            background: "#222",
                                            color: "#fff",
                                            borderRadius: 2,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                            "&:hover": { background: "#000" }
                                        }}
                                    >
                                        Download QR Code
                                    </Button>
                                </Box>
                            )}
                        </>
                    ) : (
                        <Typography variant="body1" color="warning.main" sx={{ mt: 2, mb: 2 }}>
                            You have not added a gym yet. Please add a new gym from your profile page to generate a unique QR code for your gym.
                        </Typography>
                    )}
                    <Button
                        variant="outlined"
                        sx={{
                            backgroundColor: "#fff",
                            color: "#222",
                            border: "2px solid #222",
                            fontWeight: 600,
                            borderRadius: 2,
                            mt: 1,
                            "&:hover": { backgroundColor: "#f5f5f5" }
                        }}
                        onClick={onClose}
                    >
                        Start
                    </Button>
                </Paper>
            </Box>
        </Modal>
    );
};

export default WelcomePage;