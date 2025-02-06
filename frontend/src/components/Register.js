import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Box,
    Link,
    CircularProgress,
    AppBar,
    Toolbar,
} from "@mui/material";

// Import the logo image
import logo from "../assets/bjjrolltracklogo.jpeg"; // Adjust the path if needed

const fetchCsrfToken = async (setCsrfToken) => {
    try {
        const response = await axios.get("http://localhost:8000/auth/csrf/", {
            withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

const registerUser = async (userData, csrfToken) => {
    return axios.post("http://localhost:8000/auth/register/", userData, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfToken },
    });
};

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [csrfToken, setCsrfToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCsrfToken(setCsrfToken);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");

        try {
            const response = await registerUser(formData, csrfToken);
            console.log("🟢 Registration successful", response.data);
            navigate("/dashboard");
        } catch (error) {
            console.error("🔴 Registration failed", error.response?.data || error);
            setError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <>
            {/* Top Navigation Bar with Logo */}
            <AppBar
                position="static"
                elevation={0}
                sx={{ background: "white", color: "black", boxShadow: "none", padding: "10px 0" }}
            >
                <Toolbar
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        maxWidth: "1200px",
                        margin: "0 auto",
                        width: "100%",
                    }}
                >
                    {/* Left: Logo Image */}
                    <img
                        src={logo}
                        alt="RollTrack Logo"
                        style={{ height: "40px", cursor: "pointer" }} // Adjust height if needed
                        onClick={() => navigate("/")}
                    />

                    {/* Right: Log in & Sign Up Buttons */}
                    <Box>
                        <Button color="inherit" onClick={handleLogin} sx={{ textTransform: "none" }}>
                            Log in
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => navigate("/register")}
                            sx={{ ml: 2, backgroundColor: "black", color: "white", "&:hover": { backgroundColor: "#333" } }}
                        >
                            Sign up
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Centered Registration Form */}
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Create a Gym Owner Account
                    </Typography>
                    <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                        Register to start managing your gym.
                    </Typography>

                    {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username Input */}
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            margin="normal"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />

                        {/* First Name Input */}
                        <TextField
                            fullWidth
                            label="First Name"
                            variant="outlined"
                            margin="normal"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />

                        {/* Last Name Input */}
                        <TextField
                            fullWidth
                            label="Last Name"
                            variant="outlined"
                            margin="normal"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />

                        {/* Email Input */}
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
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

                        {/* Black Register Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3, backgroundColor: "black", color: "white", "&:hover": { backgroundColor: "#333" } }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign up"}
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Already have an account?{" "}
                        <Link href="#" underline="hover" onClick={handleLogin}>
                            Log in
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </>
    );
}