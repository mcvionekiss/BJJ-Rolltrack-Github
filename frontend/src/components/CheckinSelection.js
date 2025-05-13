import { useNavigate, useLocation } from "react-router-dom";
import {
    Button,
    Divider,
    Container,
    Stack,
    Typography,
    CircularProgress,
    Fade
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

function CheckinSelection() {
    const [gymName, setGymName] = useState(""); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get gym_id from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const gymId = queryParams.get("gym_id");
    
    useEffect(() => {
        const fetchGymDetails = async () => {
            if (!gymId) {
                setGymName("BJJ Dojo");
                setLoading(false);
                return;
            }
            
            try {
                const response = await axios.get(config.endpoints.api.gymHours(gymId));
                if (response.data.success) {
                    setGymName(response.data.gym_name);
                } else {
                    setGymName("BJJ Dojo");
                    setError("Could not fetch gym details");
                }
            } catch (err) {
                console.error("Error fetching gym details:", err);
                setGymName("BJJ Dojo");
                setError("Could not fetch gym details");
            } finally {
                setLoading(false);
            }
        };
        
        fetchGymDetails();
    }, [gymId]);

    const handleNavigation = (path) => {
        // Preserve the gym_id parameter when navigating
        navigate(`${path}${gymId ? `?gym_id=${gymId}` : ''}`);
    };

    if (loading) {
        return (
            <Container 
                maxWidth="sm" 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Fade in={true} timeout={800}>
            <Container 
                maxWidth="sm" 
                sx={{ 
                    px: 5,
                    py: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100vh',
                    overflow: 'auto'
                }}
            >
                <Typography 
                    variant="h5" 
                    sx={{ 
                        mb: 4, 
                        fontWeight: "bold",
                        color: "#333"
                    }}
                >
                    Welcome to {gymName}
                </Typography>
                
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ mb: 5 }}
                >
                    Please select an option
                </Typography>
                
                <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px' }}>
                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => handleNavigation("/checkin")}
                        fullWidth
                        sx={{
                            py: 1.5,
                            borderRadius: "30px",
                            backgroundColor: "black",
                            color: "white",
                            fontWeight: 600,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                            "&:hover": { 
                                backgroundColor: "#333",
                                boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Member Login
                    </Button>
                    
                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => handleNavigation("/member-signup")}
                        fullWidth
                        sx={{
                            py: 1.5,
                            borderRadius: "30px",
                            backgroundColor: "black",
                            color: "white",
                            fontWeight: 600,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                            "&:hover": { 
                                backgroundColor: "#333",
                                boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Member Sign Up
                    </Button>
                </Stack>

                <Divider sx={{ my: 4, width: '100%', maxWidth: '400px' }}>
                    <Typography variant="body2" color="text.secondary">OR</Typography>
                </Divider>
                
                <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => handleNavigation("/guest-checkin")}
                    fullWidth
                    sx={{
                        py: 1.5,
                        borderColor: "black",
                        borderRadius: "30px",
                        borderWidth: 2,
                        color: "black",
                        maxWidth: '400px',
                        fontWeight: 600,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease-in-out',
                        "&:hover": { 
                            backgroundColor: "black",
                            color: "white",
                            boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Guest Check-In
                </Button>
                
                {error && (
                    <Typography 
                        variant="body2" 
                        color="error" 
                        sx={{ mt: 3 }}
                    >
                        {error}
                    </Typography>
                )}
            </Container>
        </Fade>
    );
}

export default CheckinSelection;