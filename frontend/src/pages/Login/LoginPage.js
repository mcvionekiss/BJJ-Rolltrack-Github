import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
<<<<<<< Updated upstream:frontend/src/components/Login.js
import { API_ENDPOINTS } from "../config";
=======
import config from "../../config";
>>>>>>> Stashed changes:frontend/src/pages/Login/LoginPage.js
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
<<<<<<< Updated upstream:frontend/src/components/Login.js
    Toolbar
} from "@mui/material";
import logo from '../assets/logo.jpeg';
=======
    Toolbar,
    Fade,
    useTheme
} from "@mui/material";
import logo from '../../assets/logo.jpeg';
import GoogleSignIn from "../../components/GoogleSignIn";
>>>>>>> Stashed changes:frontend/src/pages/Login/LoginPage.js

const fetchCsrfToken = async (setCsrfToken) => {
    try {
        const response = await axios.get(API_ENDPOINTS.AUTH.CSRF, { withCredentials: true });
        setCsrfToken(response.data.csrfToken);
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

const loginUser = async (credentials, csrfToken) => {
    return axios.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
        {
            withCredentials: true, // Required for session authentication
            headers: { "X-CSRFToken": csrfToken }, // Send CSRF token
        }
    );
};

function LoginPage() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [csrfToken, setCsrfToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

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
        navigate("/register"); // ✅ Redirects to the Register page
    };

    return (
        <Container maxWidth="xl">
            {/* Top Navigation Bar with Logo */}
            <AppBar position="static" elevation={0} sx={{ background: "white", color: "black", boxShadow: "none", padding: "10px 0" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                    {/* Left: Logo Image */}
                    <img
                        src={logo}
                        alt="RollTrack Logo"
                        style={{ height: "40px", cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    />

                    {/* Right: Log in & Sign Up Buttons */}
                    <Box>
                        <Button color="inherit" onClick={() => navigate("/login")} sx={{ textTransform: "none" }}>
                            Log in
                        </Button>
                        <Button variant="contained" onClick={handleSignUp} sx={{ ml: 2, backgroundColor: "black", color: "white", "&:hover": { backgroundColor: "#333" } }}>
                            Sign up
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Centered Login Form */}
<<<<<<< Updated upstream:frontend/src/components/Login.js
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Log in to your account
                    </Typography>
                    <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                        Welcome back! Please enter your details.
                    </Typography>

                    {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {error}
=======
            <Fade in={true} timeout={800}>
                <Box 
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "calc(100vh - 200px)", // Subtract the AppBar height
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
>>>>>>> Stashed changes:frontend/src/pages/Login/LoginPage.js
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
                        />

                        {/* Remember Me & Forgot Password */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Remember me"
                            />
                            <Link href="/forgot" underline="hover">
                                Forgot password?
                            </Link>
                        </Box>

                        {/* Black Sign In Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3, backgroundColor: "black", color: "white", "&:hover": { backgroundColor: "#333" } }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign in"}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Don’t have an account?{" "}
                        <Link href="#" underline="hover" onClick={handleSignUp}>
                            Sign up
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Container>
    );
}

export default LoginPage;