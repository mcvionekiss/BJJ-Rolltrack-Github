import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Container,
    Typography,
    Box,
    InputAdornment,
    IconButton,
    FormHelperText,
    FormControl,
    InputLabel,
    OutlinedInput,
    CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import config from "../config";
function MemberSignup() {
    const [gymName, setGymName] = useState("Loading...");
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dob: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
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
        console.log("🔷 Member Signup component mounted");
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
            console.log("🔷 Member Signup component unmounted");
        };
    }, [gymId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!gymId) {
            setError("No gym selected. Please scan the QR code again.");
            return;
        }

        // Validate form data
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Proceed to waiver signing page with form data
        // Instead of creating account directly, we show the waiver first
        const memberData = {
            firstName: formData.name.split(' ')[0],
            lastName: formData.name.split(' ').slice(1).join(' '),
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            password: formData.password,
            belt: 1, // Default to White Belt (ID 1)
            role: 1,  // Default to Student Role (ID 1)
            gymId: parseInt(gymId)
        };
        
        // Navigate to waiver page with form data and gym ID
        navigate(`/member-waiver?gym_id=${gymId}`, {
            state: {
                memberData,
                gymId,
                csrfToken
            }
        });
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
                        Member Sign Up
                    </Typography>
                    
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ mb: 5 }}
                    >
                        Create your account to join {gymName}!
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

                        <TextField
                            fullWidth
                            label="Date of Birth"
                            variant="outlined"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        
                        <FormControl 
                            variant="outlined" 
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <OutlinedInput
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                            <FormHelperText>
                                Password must be at least 8 characters
                            </FormHelperText>
                        </FormControl>

                        <FormControl 
                            variant="outlined" 
                            fullWidth
                            error={Boolean(formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
                            <OutlinedInput
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Confirm Password"
                            />
                            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <FormHelperText error>
                                    Passwords do not match
                                </FormHelperText>
                            )}
                        </FormControl>
                        
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
                            Sign Up
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

export default MemberSignup;
