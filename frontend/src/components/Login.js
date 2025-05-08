// src/components/Login.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import {
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Typography,
    Container,
    Paper,
    Box,
    Link,
    CircularProgress,
    AppBar,
    Toolbar,
    Divider,
    Fade,
    useTheme
} from "@mui/material";
import logo from '../assets/logo.jpeg';
import GoogleSignIn from "../components/GoogleSignIn";

const fetchCsrfToken = async (setCsrfToken) => {
    try {
        // Use config object for consistent URL patterns
        const response = await axios.get(config.endpoints.auth.csrf, { withCredentials: true });
        setCsrfToken(response.data.csrfToken);
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

const loginUser = async (credentials, csrfToken) => {
    return axios.post(
        config.endpoints.auth.login,
        credentials,
        {
            withCredentials: true, // Required for session authentication
            headers: { "X-CSRFToken": csrfToken }, // Send CSRF token
        }
    );
};

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [csrfToken, setCsrfToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    // ✅ Load email from localStorage if "Remember Me" was checked
    useEffect(() => {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            setFormData((prev) => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    // ✅ Fetch CSRF token when the component mounts
    useEffect(() => {
        fetchCsrfToken(setCsrfToken);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        if (loading) return;
        setLoading(true);

        try {
            const response = await loginUser(
                { email: formData.email, password: formData.password },
                csrfToken
            );
            console.log("🟢 Login successful", response.data);

            // ✅ Store email in localStorage if "Remember Me" is checked
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", formData.email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            navigate("/dashboard"); // ✅ Redirect to dashboard
        } catch (error) {
            console.error("🔴 Login failed", error.response?.data || error);
            setError("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        navigate("/signup"); // ✅ Redirects to the Register page
    };

    return (
        <Container className="login-container"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "visible"
            }}
        >
            {/* Top Navigation Bar with Logo */}
            <AppBar position="static" elevation={0} sx={{ background: "white", color: "black", padding: "10px 10px" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                    {/* Left: Logo Image */}
                    <img
                        src={logo}
                        alt="RollTrack Logo"
                        style={{ height: "40px", cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    />

                    {/* Right: Sign Up Button */}
                    <Box>
                        <Button 
                            variant="contained" 
                            onClick={handleSignUp} 
                            sx={{ 
                                ml: 2, 
                                backgroundColor: "black", 
                                color: "white", 
                                borderRadius: "8px",
                                fontWeight: 500,
                                textTransform: "none",
                                padding: "8px 20px",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": { 
                                    backgroundColor: "#333",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
                                } 
                            }}
                        >
                            Sign up
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Centered Login Form */}
            <Fade in={true} timeout={800}>
                <Box 
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "calc(100vh - 125px)", // Subtract the AppBar height
                        position: "relative",
                        zIndex: 1,
                        py: 4,
                    }}
                >
                    <Paper elevation={4} className="form-box"
                        sx={{
                            textAlign: "center",
                            borderRadius: "16px",
                            paddingY: "50px",
                            paddingX: { xs: "24px", sm: "48px" },
                            width: { xs: "90%", sm: "400px" },
                            maxWidth: "500px",
                            background: "linear-gradient(145deg, #ffffff, #f9f9f9)",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                            position: "relative",
                            overflow: "auto",
                            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                            "&:hover": {
                                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
                                transform: "translateY(-5px)"
                            }
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                mb: 1, 
                                fontWeight: 700, 
                                letterSpacing: "0.5px",
                                background: "linear-gradient(90deg, #000000, #333333)",
                                backgroundClip: "text",
                                textFillColor: "transparent",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Welcome Back!
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            sx={{ 
                                mb: 3,
                                maxWidth: "280px",
                                mx: "auto",
                                lineHeight: 1.6
                            }}
                        >
                            Please enter your details to log in
                        </Typography>

                        {error && (
                            <Typography 
                                color="error" 
                                sx={{ 
                                    mb: 2, 
                                    py: 1, 
                                    px: 2, 
                                    borderRadius: "8px", 
                                    bgcolor: "rgba(211, 47, 47, 0.1)" 
                                }}
                            >
                                {error}
                            </Typography>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: "10px",
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'black',
                                        },
                                    },
                                    '& label.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            />

                            {/* Password Input */}
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: "10px",
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'black',
                                        },
                                    },
                                    '& label.Mui-focused': {
                                        color: 'black',
                                    },
                                }}
                            />

                            {/* Remember Me & Forgot Password */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ margin: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            sx={{ 
                                                color: 'black',
                                                '&.Mui-checked': {
                                                    color: 'black',
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            Remember me
                                        </Typography>
                                    }
                                />
                                <Link 
                                    href="/forgot-password" 
                                    underline="hover" 
                                    sx={{ 
                                        color: "text.secondary",
                                        fontWeight: 500,
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            color: "black"
                                        }
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </Box>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    backgroundColor: "black",
                                    color: "white",
                                    textTransform: "none",
                                    fontWeight: 500,
                                    fontSize: "16px",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        backgroundColor: "#222",
                                        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-2px)"
                                    }
                                }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign in"}
                            </Button>

                            {/* Divider */}
                            <Box sx={{ position: "relative", width: "100%", my: 3 }}>
                                <Box sx={{ 
                                    position: "absolute", 
                                    top: "50%", 
                                    left: 0, 
                                    right: 0, 
                                    height: "1px", 
                                    bgcolor: "rgba(0,0,0,0.1)" 
                                }} />
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        position: "relative", 
                                        display: "inline-block", 
                                        px: 2, 
                                        bgcolor: "#f9f9f9", 
                                        color: "text.secondary" 
                                    }}
                                >
                                    or
                                </Typography>
                            </Box>

                            {/* Google Sign-In Button */}
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <GoogleSignIn />
                            </Box>
                        </form>

                        {/* Sign Up Link */}
                        <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
                            Don't have an account?{" "}
                            <Link 
                                href="#" 
                                underline="hover" 
                                onClick={handleSignUp}
                                sx={{ 
                                    color: "black", 
                                    fontWeight: 500,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        textDecoration: "none"
                                    }
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Paper>
                </Box>
            </Fade>
        </Container>
    );
}

export default Login;