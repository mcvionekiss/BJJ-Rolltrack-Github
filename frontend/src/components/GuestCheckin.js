import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
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
    FormGroup
} from "@mui/material";

function GuestCheckin() {
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
    const navigate = useNavigate();

    const experienceLevels = [
        "No Experience",
        "Less than 6 months",
        "6 months - 1 year",
        "1-3 years",
        "3-5 years",
        "5+ years",
    ];

    const referralSources = [
        "Walk-In",
        "Google Search",
        "Social Media",
        "Friend/Family",
        "Event",
        "Promotion",
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

        try {
            // TODO: Add backend API call
            const response = await axios.post("/auth/guest-checkin/", formData);
            
            setSuccess("Check-in successful! Please proceed to the front desk.");
            setTimeout(() => {
                navigate("/checkin-success", { 
                    state: { 
                        studentName: formData.name,
                        email: formData.email,
                        className: "Guest Visit"
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
                Guest Check-In
            </Typography>
            
            <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 5 }}
            >
                Please fill out the information below to check in as a guest
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
                    <InputLabel id="referral-source-label" sx={{ textAlign: 'left' }}>How did you hear about us?</InputLabel>
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
                
                <FormGroup sx={{ textAlign: 'left' }}>
                    <FormControlLabel 
                        control={
                            <Checkbox 
                                checked={formData.firstTimeVisit} 
                                onChange={handleChange} 
                                name="firstTimeVisit" 
                            />
                        } 
                        label="This is my first time visiting this gym." 
                    />
                    <FormControlLabel 
                        control={
                            <Checkbox 
                                checked={formData.marketingConsent} 
                                onChange={handleChange} 
                                name="marketingConsent" 
                            />
                        } 
                        label="I consent to receive marketing communications." 
                    />
                </FormGroup>
                
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

export default GuestCheckin;
