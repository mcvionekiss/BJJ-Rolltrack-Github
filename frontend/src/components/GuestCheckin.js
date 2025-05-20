import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Container,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    FormGroup,
    CircularProgress
} from "@mui/material";
import config from "../config";

function GuestCheckin() {
    const [gymName, setGymName] = useState("Loading...");
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        experienceLevel: "",
        referralSource: "",
        firstTimeVisit: true,
        marketingConsent: false,
        otherDojos: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get gym_id from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const gymId = queryParams.get("gym_id");

    // Fetch CSRF token and gym details on component mount
    useEffect(() => {
        console.log("🔷 Guest Checkin component mounted");
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
                    console.log(`🔷 Fetched gym name: ${response.data.gym_name}`);
                } else {
                    setGymName("BJJ Dojo");
                    console.error("Could not fetch gym details");
                }
            } catch (err) {
                console.error("🔴 Error fetching gym details:", err);
                setGymName("BJJ Dojo");
            } finally {
                setLoading(false);
            }
        };
        
        fetchCsrfToken();
        fetchGymDetails();
        
        return () => {
            console.log("🔷 Guest Checkin component unmounted");
        };
    }, [gymId]);

    const experienceLevels = [
        "No Experience",
        "Less than 1 year",
        "1-3 years",
        "3-5 years",
        "5+ years",
    ];

    const referralSources = [
        "Walk-In",
        "Social Media",
        "Friend/Family",
        "Event",
        "Other"
    ];

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!gymId) {
            setError("No gym selected. Please scan the QR code again.");
            return;
        }

        try {
            // Include gymId in the form data
            const guestData = {
                ...formData,
                gymId: parseInt(gymId)
            };
            
            const response = await axios.post(config.endpoints.auth.guestCheckin, guestData, {
                headers: {
                    "X-CSRFToken": csrfToken
                },
                withCredentials: true
            });
            
            setSuccess("Check-in successful! Redirecting to available classes...");
            setTimeout(() => {
                navigate("/available-classes", { 
                    state: { 
                        studentName: formData.name,
                        email: formData.email,
                        isGuest: true,
                        gymId: gymId
                    } 
                });
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Error checking in. Please try again.");
        }
    };

    return (
        <Container 
            maxWidth="sm" 
            sx={{ 
                px: 5,
                py: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'center',
                height: '100vh',
                overflow: 'auto'
            }}
        >
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 3, 
                            fontWeight: "bold",
                            color: "#333"
                        }}
                    >
                        Guest Check-In
                    </Typography>
                    
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ mb: 5 }}
                    >
                        Please fill out the information below to check in as a guest at {gymName}
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

                    {success && (
                        <Typography 
                            sx={{ 
                                mb: 3,
                                py: 1,
                                px: 2,
                                bgcolor: 'rgba(76, 175, 80, 0.1)',
                                color: 'success.main',
                                borderRadius: 1,
                                width: '100%',
                                maxWidth: '400px'
                            }}
                        >
                            {success}
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
                        {/* Basic Information */}
                        <TextField
                            fullWidth
                            label="Full Name"
                            variant="outlined"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Phone Number"
                            variant="outlined"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        
                        {/* Analytics Information */}
                        <FormControl 
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <InputLabel id="experience-level-label" sx={{ textAlign: 'left' }}>Experience Level</InputLabel>
                            <Select
                                labelId="experience-level-label"
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                label="Experience Level"
                                onChange={handleChange}
                                required
                                sx={{ textAlign: 'left' }}
                            >
                                {experienceLevels.map((level) => (
                                    <MenuItem key={level} value={level} sx={{ textAlign: 'left' }}>{level}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <FormControl 
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <InputLabel id="referral-source-label">How did you hear about us?</InputLabel>
                            <Select
                                labelId="referral-source-label"
                                name="referralSource"
                                value={formData.referralSource}
                                label="How did you hear about us?"
                                onChange={handleChange}
                                required
                                sx={{ textAlign: 'left' }}
                            >
                                {referralSources.map((source) => (
                                    <MenuItem key={source} value={source} sx={{ textAlign: 'left' }}>{source}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        {/* Additional Questions */}
                        <FormGroup>
                            <FormControlLabel 
                                control={
                                    <Checkbox 
                                        name="firstTimeVisit" 
                                        checked={formData.firstTimeVisit} 
                                        onChange={handleChange}
                                    />
                                } 
                                label="This is my first time visiting." 
                                sx={{ textAlign: 'left' }}
                            />
                            
                            <FormControlLabel 
                                control={
                                    <Checkbox 
                                        name="marketingConsent" 
                                        checked={formData.marketingConsent} 
                                        onChange={handleChange}
                                    />
                                } 
                                label="I consent to receive emails about classes and events." 
                                sx={{ textAlign: 'left' }}
                            />
                        </FormGroup>
                        
                        {/* Additional Fields */}
                        {!formData.firstTimeVisit && (
                            <TextField
                                fullWidth
                                label="What other dojos have you trained at?"
                                variant="outlined"
                                name="otherDojos"
                                value={formData.otherDojos}
                                onChange={handleChange}
                                multiline
                                rows={2}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        )}
                        
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
                            Check In
                        </Button>
                        
                        <Button
                            variant="text"
                            onClick={() => navigate(`/checkin-selection${gymId ? `?gym_id=${gymId}` : ''}`)}
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
                </>
            )}
        </Container>
    );
}

export default GuestCheckin;
