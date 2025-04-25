// src/components/Login.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    Divider
} from "@mui/material";
import logo from '../assets/logo.jpeg';
import GoogleSignIn from "../components/GoogleSignIn";

const fetchCsrfToken = async (setCsrfToken) => {
    try {
        const response = await axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true });
        setCsrfToken(response.data.csrfToken);
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

const loginUser = async (credentials, csrfToken) => {
    return axios.post(
        "http://localhost:8000/auth/login/",
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
                            <Link href="/forgot-password" underline="hover">
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

                        {/* 🔹 Google Sign-In Button */}
                        <form>
                        <Box sx={{ mt: 2 }}>
                            <GoogleSignIn />
                        </Box>
                        </form>
                    </form>

                    {/* Sign Up Link */}
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Don't have an account?{" "}
                        <Link href="#" underline="hover" onClick={handleSignUp}>
                            Sign up
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Container>
    );
}

export default Login;