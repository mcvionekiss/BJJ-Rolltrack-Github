import { useNavigate } from "react-router-dom";
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

function Checkin() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Log component mount
    useEffect(() => {
        console.log("🔷 Checkin component mounted");
        
        return () => {
            console.log("🔷 Checkin component unmounted");
        };
    }, []);
    
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
        
        console.log(`🔶 Form submitted with email: ${email}`);
        setError(""); // Clear previous errors
        setLoading(true);
        console.log("🔶 Previous errors cleared");

        try {
            console.log(`🔶 Making API request to check_student with email: ${email}`);
            const startTime = performance.now();
            const response = await axios.post("http://localhost:8000/api/check_student/", { email });
            const endTime = performance.now();
            
            console.log(`🔶 API response received in ${(endTime - startTime).toFixed(2)}ms`);
            console.log("🔶 API response data:", response.data);

            if (response.data.exists) {
                console.log(`✅ Student found: ${email}`, {
                    studentData: response.data,
                    timestamp: new Date().toISOString()
                });
                console.log(`🔶 Navigating to /available-classes with email: ${email}`);
                navigate("/available-classes", { state: { email } });
            } else {
                console.warn(`⚠️ Student exists=false for email: ${email}`);
                setError("Email not found. Please try again or sign up as a new member.");
            }
        } catch (error) {
            console.error("🔴 Student not found:", {
                email,
                errorMessage: error.response?.data?.message || "Error checking student.",
                status: error.response?.status,
                timestamp: new Date().toISOString(),
                fullError: error
            });
            
            // Handle different error types
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 404) {
                    setError("Email not found. Please try again or sign up as a new member.");
                } else {
                    setError(error.response.data.message || "Error checking student. Please try again.");
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError("Could not connect to server. Please check your connection and try again.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError("An unexpected error occurred. Please try again later.");
            }
            
            console.log(`🔶 Error state updated with message: ${error}`);
        } finally {
            setLoading(false);
        }
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
                    disabled={loading}
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
                    ) : "Continue"}
                </Button>
                
                <Button
                    variant="text"
                    onClick={() => navigate("/checkin-selection")}
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