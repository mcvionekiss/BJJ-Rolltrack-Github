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
    Stepper,
    Step,
    StepLabel,
} from "@mui/material";
import "./Register.css";
import logo from "../assets/logo.jpeg"; // Import the logo image
import ScheduleDetails from "./ScheduleDetails.js";
import ConfirmRegistration from "./ConfirmRegistration.js";


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

const steps = ["Personal Information", "Gym Details", "Schedule Details", "Confirmation"];

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gymName: "",
        address: "",
        city: "",
        state: "",
        gymEmail: "",
        gymPhoneNumber: "",
        schedule: [],
    });

    const [activeStep, setActiveStep] = useState(0);
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

    const handleNext = (e) => {
        e.preventDefault();
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        } else {
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
        }
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleEdit = (stepName) => {
        if (stepName === "personal") setActiveStep(0);
        if (stepName === "gym") setActiveStep(1);
        if (stepName === "schedule") setActiveStep(2);
    };

    const handleScheduleUpdate = (scheduleData) => {
        setFormData(prev => ({ ...prev, schedule: scheduleData }));
    };

    return (
        <div className="signup-container">

            {/* Left Sidebar - Stepper */}
            <div className="sidebar">
                <div className="logo-container">
                    <img 
                        src={logo} 
                        alt="RollTrack Logo" 
                        className="logo-img"
                        onClick={() => navigate("/")}
                    />
                </div>
                <Typography variant="h5" className="signup-title">Sign Up</Typography>

                <Stepper 
                    activeStep={activeStep} 
                    orientation="vertical"
                    sx={{
                        "& .MuiStepIcon-root": {
                          color: "#d3d3d3", // Default color (gray)
                        },
                        "& .MuiStepIcon-root.Mui-active": {
                          color: "black", // Active step icon color
                        },
                        "& .MuiStepIcon-root.Mui-completed": {
                          color: "black", // Completed step icon color
                        },
                      }}
                >
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Typography variant="body2" className="help-email">help-center@email.com</Typography>
            </div>

            {/* Right Form Section */}
            <div className="form-container">
                <Paper elevation={3} className="form-box">
                    <Typography variant="h5" className="form-title">{steps[activeStep]}</Typography>

                    <form onSubmit={handleNext} className="form">
                        {activeStep === 0 && (
                            <>
                                <TextField label="First Name" placeholder="Enter your first name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth margin="normal" required/>
                                <TextField label="Last Name" placeholder="Enter your last name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Email" placeholder="Enter your email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Password" placeholder="Create a password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Confirm Password" placeholder="Confirm a password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Phone (optional)" placeholder="Enter your phone number" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" />
                            </>
                        )}

                        {activeStep === 1 && (
                            <>
                                <TextField label="Gym Name" placeholder="Enter gym name" name="gymName" value={formData.gymName} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Address" placeholder="Enter street address" name="address" value={formData.address} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="City" placeholder="Enter city" name="city" value={formData.city} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="State" placeholder="Enter state" name="state" value={formData.state} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Gym Email" placeholder="Enter gym email" name="gymEmail" type="email" value={formData.gymEmail} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Gym Phone Number" placeholder="Enter gym phone number" name="gymPhoneNumber" value={formData.gymPhoneNumber} onChange={handleChange} fullWidth margin="normal" required />
                            </>
                        )}

                        {activeStep === 2 && (
                            <ScheduleDetails 
                                onContinue={() => setActiveStep(activeStep + 1)}
                                onBack={() => setActiveStep(activeStep - 1)}
                                setScheduleData={handleScheduleUpdate}
                            />
                        )}

                        {activeStep === 3 && (
                            <ConfirmRegistration
                                formData={formData}
                                onEdit={handleEdit}
                                onSubmit={handleSubmit}
                            />
                        )}

                        {error && (
                            <Typography color="error" align="center" sx={{ marginBottom: 2 }}>
                                {error}
                            </Typography>
                        )}

                        <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                            {activeStep > 0 && (
                                <Button onClick={() => setActiveStep(activeStep - 1)} variant="outlined">Back</Button>
                            )}
                            <Button 
                                type="submit" 
                                variant="contained" 
                                sx={{
                                    backgroundColor: "black",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#333" } // Darker shade on hover
                                }}
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : activeStep === steps.length - 1 ? "Submit" : "Continue"}
                            </Button>
                        </Box>
                    </form>

                    {activeStep === 0 && (
                        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
                            Already have an account? <a href="/login" className="login-link">Log in</a>
                        </Typography>
                    )}
                </Paper>
            </div>
        </div>
    );
}