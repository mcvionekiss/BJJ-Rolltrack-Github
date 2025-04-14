import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Container,
    Typography,
    Box
} from "@mui/material";

function Checkin() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
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
        console.log(`🔶 Form submitted with email: ${email}`);
        setError(""); // Clear previous errors
        console.log("🔶 Previous errors cleared");

        try {
            console.log(`🔶 Making API request to check_student with email: ${email}`);
            const startTime = performance.now();
            const response = await axios.post("http://192.168.2.1:8000/api/check_student/", { email });
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
            }
        } catch (error) {
            console.error("🔴 Student not found:", {
                email,
                errorMessage: error.response?.data?.message || "Error checking student.",
                status: error.response?.status,
                timestamp: new Date().toISOString(),
                fullError: error
            });
            setError("Email not found. Please try again or contact an instructor.");
            console.log("🔶 Error state updated with message: Email not found. Please try again or contact an instructor.");
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
                <Typography 
                    color="error" 
                    sx={{ 
                        mb: 3,
                        py: 1,
                        px: 2,
                        bgcolor: 'rgba(211, 47, 47, 0.1)',
                        borderRadius: 1,
                        width: '100%',
                        maxWidth: '400px'
                    }}
                >
                    {error}
                </Typography>
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
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    Continue
                </Button>
                
                <Button
                    variant="text"
                    onClick={() => navigate("/checkin-selection")}
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