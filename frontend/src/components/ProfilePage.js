import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Paper,
    Typography,
    Button,
    Avatar,
    Divider,
    CircularProgress
} from "@mui/material";
import {
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Logout as LogoutIcon
} from "@mui/icons-material";
import NavigationMenu from "./NavigationMenu";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "John Doe",
        email: "john@example.com",
        phone: "(123) 456-7890",
        gym: {
            id: 1, // Add a placeholder gym ID for demonstration
            name: "Elite BJJ Academy",
            address: "123 Main St, City, State 12345",
            phone: "(123) 456-7890",
            email: "contact@elitebjj.com"
        }
    });
    const [qrUrl, setQrUrl] = useState("");

    useEffect(() => {
        if (profileData.gym && profileData.gym.id) {
            setQrUrl(`http://localhost:8000/api/generate-qr/${profileData.gym.id}/`);
        }
    }, [profileData.gym]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate("/login");
    };

    const handleDownloadQR = async () => {
        if (!qrUrl) return;
        try {
            const response = await fetch(qrUrl, { mode: "cors" });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `bjj_rolltrack_qr_${profileData.gym.id}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Failed to download QR code.");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex" sx={{ minHeight: '100vh'}}>
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box sx={{
                flexGrow: 1,
                px: { xs: 1, sm: 3, md: 5 },
                pt: { xs: 2, sm: 3, md: 5 },
                maxWidth: "1400px",
                marginLeft: `${sidebarWidth}px`,
                transition: "margin-left 0.3s ease-in-out",
            }}>
                <Paper elevation={4} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 5, borderRadius: 5, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}>
                    {/* Header Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                            Profile
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                                borderRadius: 2,
                                fontWeight: 600,
                                px: 3,
                                py: 1.2,
                                fontSize: 16,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                "&:hover": { backgroundColor: "#333" }
                            }}
                        >
                            Logout
                        </Button>
                    </Box>

                    {/* Profile Section */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                        {/* Personal Info Card */}
                        <Paper elevation={2} sx={{ p: 4, borderRadius: 4, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.08)' }}>
                            <Typography variant="h6" fontWeight="bold" mb={3} sx={{ letterSpacing: 0.5 }}>
                                Personal Information
                            </Typography>
                            <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: '#e0e7ef', fontSize: 40, color: '#222' }}>
                                {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {profileData.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Gym Owner
                            </Typography>
                            <Divider sx={{ width: '100%', mb: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography>{profileData.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography>{profileData.phone}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Gym Info Card */}
                        <Paper elevation={2} sx={{ p: 4, borderRadius: 4, flex: 1, boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.08)' }}>
                            <Typography variant="h6" fontWeight="bold" mb={3} sx={{ letterSpacing: 0.5 }}>
                                Gym Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                    {profileData.gym.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography>{profileData.gym.address}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography>{profileData.gym.phone}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography>{profileData.gym.email}</Typography>
                                </Box>
                                {/* QR Code Section */}
                                {qrUrl && (
                                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: '#222' }}>
                                            Gym Check-in QR Code
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', maxWidth: 260 }}>
                                            Print and display this QR code at your gym. Members can scan it to check in!
                                        </Typography>
                                        <img
                                            src={qrUrl}
                                            alt="Gym QR Code"
                                            style={{
                                                width: 180,
                                                height: 180,
                                                marginBottom: 16,
                                                border: "3px solid #eee",
                                                borderRadius: 12,
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                                                background: "#fff"
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleDownloadQR}
                                            fullWidth
                                            sx={{
                                                backgroundColor: "black",
                                                color: "white",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                fontSize: 16,
                                                py: 1.2,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                                "&:hover": { backgroundColor: "#333" }
                                            }}
                                        >
                                            Download QR Code
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ProfilePage;