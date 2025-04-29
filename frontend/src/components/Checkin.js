import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Container,
    Typography,
    Box,
    Alert,
    CircularProgress
} from "@mui/material";
import config from '../config';

// Ensure cookies are included with requests
axios.defaults.withCredentials = true;

function Checkin() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");
    const [studentInfo, setStudentInfo] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get gym_id from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const gymId = queryParams.get("gym_id");
    
    // Fetch CSRF token on component mount
    useEffect(() => {
        console.log("🔷 Checkin component mounted");
        console.log(`🔷 Gym ID from URL: ${gymId || 'Not provided'}`);
        
        const fetchCsrfToken = async () => {
            try {
                const response = await axios.get(config.endpoints.auth.csrf);
                const token = response.data.csrfToken;
                setCsrfToken(token);
                console.log("🔷 CSRF token fetched successfully:", token);
            } catch (error) {
                console.error("🔴 Error fetching CSRF token:", error);
                setError("Error fetching CSRF token. Please refresh the page.");
            }
        };
        
        fetchCsrfToken();
        
        return () => {
            console.log("🔷 Checkin component unmounted");
        };
    }, [gymId]);
    
    // Log email state changes
    useEffect(() => {
        if (email) {
            console.log(`🔹 Email state updated: ${email}`);
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!email.includes('@')) {
            setError("Please enter a valid email address");
            return;
        }
        
        if (!csrfToken) {
            setError("An error occurred. Please refresh the page.");
            return;
        }
        
        setError(""); // Clear previous errors
        setLoading(true);

        try {
            console.log(`🔶 Making API request to check_student with email: ${email} and gymId: ${gymId}`);
            
            // Configure headers with CSRF token
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };
            
            const response = await axios.post(
                config.endpoints.api.checkStudent, 
                { 
                    email,
                    gym_id: gymId  // Include the gym_id in the request
                },
                { headers }
            );
            
            if (response.data.success) {
                console.log(`✅ Student found: ${email}`, {
                    studentData: response.data.student,
                    timestamp: new Date().toISOString()
                });
                console.log(`🔶 Navigating to /available-classes with email: ${email} and gymId: ${gymId}`);
                setStudentInfo(response.data.student);
                
                // Pass both email and gym_id to the next page
                navigate("/available-classes", { 
                    state: { email, gymId } 
                });
            } else {
                console.warn(`⚠️ Student exists=false for email: ${email}`);
                setError(response.data.message || "Email not found. Please try again or sign up as a new member.");
            }
        } catch (error) {
            console.error("🔴 Student not found:", {
                email,
                errorMessage: error.response?.data?.message || "Error checking student.",
                status: error.response?.status,
                timestamp: new Date().toISOString(),
                fullError: error
            });
            
            if (error.response) {
                if (error.response.status === 404) {
                    setError("Email not found. Please try again or sign up as a new member.");
                } else if (error.response.status === 403) {
                    setError("CSRF verification failed. Please refresh the page and try again.");
                    // Try to fetch a new CSRF token
                    try {
                        const response = await axios.get(config.endpoints.auth.csrf);
                        setCsrfToken(response.data.csrfToken);
                        console.log("🔷 New CSRF token fetched after error");
                    } catch (e) {
                        console.error("Failed to fetch new CSRF token", e);
                    }
                } else {
                    setError(error.response.data.message || "Error checking student. Please try again.");
                }
            } else if (error.request) {
                setError("Could not connect to server. Please check your connection and try again.");
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }
            
            console.log(`🔶 Error state updated with message: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle back button click with gym_id preservation
    const handleBack = () => {
        navigate(`/checkin-selection${gymId ? `?gym_id=${gymId}` : ''}`);
    };

    return (
        <Container 
            maxWidth="sm" 
            sx={{ 
                px: 4,
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '100vh'
            }}
        >
            <Typography 
                variant="h4" 
                sx={{ 
                    mb: 3, 
                    fontWeight: "bold",
                    color: "#333"
                }}
            >
                Member Check-In
            </Typography>
            
            <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 5 }}
            >
                Enter your email to check in
            </Typography>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3,
                        width: '100%',
                        maxWidth: '400px'
                    }}
                >
                    {error}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}
            >
                <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
                
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !csrfToken}
                    sx={{ 
                        py: 1.5,
                        backgroundColor: "black", 
                        color: "white",
                        borderRadius: 2,
                        "&:hover": { 
                            backgroundColor: "#333"
                        }
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Checking...
                        </Box>
                    ) : !csrfToken ? "Loading..." : "Continue"}
                </Button>
                
                <Button
                    variant="text"
                    onClick={handleBack}
                    disabled={loading}
                    sx={{ 
                        mt: 1,
                        color: "text.secondary",
                        "&:hover": { 
                            backgroundColor: "transparent",
                            color: "black"
                        }
                    }}
                >
                    Back
                </Button>
            </Box>
        </Container>
    );
}

export default Checkin;