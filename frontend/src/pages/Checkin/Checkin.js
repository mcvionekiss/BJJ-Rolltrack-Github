import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Container,
    Paper,
    Typography
} from "@mui/material";
<<<<<<< Updated upstream:frontend/src/components/Checkin.js
=======
import config from "../../config";

// Ensure cookies are included with requests
axios.defaults.withCredentials = true;
>>>>>>> Stashed changes:frontend/src/pages/Checkin/Checkin.js

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
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
                <Typography variant="h5" fontWeight="bold">
                    Check-In
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                    Enter your email to check in.
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2, backgroundColor: "black", color: "white" }}
                    >
                        Continue
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default Checkin;