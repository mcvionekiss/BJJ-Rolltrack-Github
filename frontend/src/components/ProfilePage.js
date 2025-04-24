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
            name: "Elite BJJ Academy",
            address: "123 Main St, City, State 12345",
            phone: "(123) 456-7890",
            email: "contact@elitebjj.com"
        }
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate("/login");
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex">
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box sx={{
                flexGrow: 1,
                px: { xs: 2, sm: 3, md: 5 },
                pt: { xs: 2, sm: 3, md: 5 },
                maxWidth: "1400px",
                marginLeft: `${sidebarWidth}px`,
                transition: "margin-left 0.3s ease-in-out",
            }}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 5 }}>
                    {/* Header Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Profile
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                                "&:hover": { backgroundColor: "#333" }
                            }}
                        >
                            Logout
                        </Button>
                    </Box>

                    {/* Profile Section */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                        {/* Personal Info Card */}
                        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" mb={3}>
                                Personal Information
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, mr: 2 }} />
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {profileData.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Gym Owner
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" mb={3}>
                                Gym Information
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
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
                            </Box>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ProfilePage;