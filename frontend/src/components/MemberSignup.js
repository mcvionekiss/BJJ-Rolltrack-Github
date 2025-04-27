import { useNavigate } from "react-router-dom";
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
    Divider,
    FormHelperText,
    FormControl,
    InputLabel,
    OutlinedInput
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function MemberSignup() {
    // TODO: Change to the actual gym name
    const GYM_NAME = "Elite Jiu-Jitsu";
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

    useEffect(() => {
        // Fetch CSRF token when component mounts
        const fetchCsrfToken = async () => {
            try {
                const response = await axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true });
                setCsrfToken(response.data.csrfToken);
            } catch (error) {
                console.error("Failed to fetch CSRF token", error);
                setError("Failed to initialize form. Please refresh the page.");
            }
        };

        fetchCsrfToken();
    }, []);

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

        try {
            // Prepare the data to match backend field names
            const backendFormData = {
                firstName: formData.name.split(' ')[0],
                lastName: formData.name.split(' ').slice(1).join(' '),
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                password: formData.password,
                belt: 1, // Default to White Belt (ID 1)
                role: 1  // Default to Student Role (ID 1)
            };
            
            // Call the API with CSRF token
            const response = await axios.post("http://localhost:8000/auth/member-signup/", backendFormData, {
                headers: {
                    "X-CSRFToken": csrfToken
                }
            });
            
            setSuccess("Account created successfully! You can now log in.");
            setTimeout(() => {
                navigate("/checkin");
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Error creating account. Please try again.");
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
                Member Sign Up
            </Typography>
            
            <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 5 }}
            >
                Create your account to join {GYM_NAME}
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

export default MemberSignup;
