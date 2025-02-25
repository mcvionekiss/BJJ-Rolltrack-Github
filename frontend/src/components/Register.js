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
import MuiPhoneNumber from 'mui-phone-number';
import "./Register.css";
import logo from "../assets/logo.jpeg"; // Import the logo image
import ScheduleDetails from "./ScheduleDetails.js";
import ConfirmRegistration from "./ConfirmRegistration.js";
import WelcomePage from "./WelcomePage.js"
import AddressAutocomplete from "./AddressAutocomplete";

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

const steps = ["Personal Information", "Gym Details", "Schedule Details", "Confirmation", "Welcome"];
const stepperSteps = ["Personal Information", "Gym Details", "Schedule Details", "Confirmation"];

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
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCsrfToken(setCsrfToken);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === "confirmPassword") {
            if (formData.password !== e.target.value) {
                setConfirmPasswordError("Passwords do not match.");
            } else {
                setConfirmPasswordError("");
            }
        }
    };

    const handleNext = (e) => {
        e.preventDefault();

        // Password match validation
        if (formData.password !== formData.confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            return;
        }
    
        setConfirmPasswordError(""); // Clear error if passwords match

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
                setActiveStep(activeStep + 1); // Move to Welcome Page step
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

    const handleSkip = (stepName) => {
        if (stepName === "gym") setActiveStep(2);
        if (stepName === "schedule") setActiveStep(3);
    };

    const handleScheduleUpdate = (scheduleData) => {
        setFormData(prev => ({ ...prev, schedule: scheduleData }));
    };

    const handlePhoneChange = (name, value) => {
        handleChange({ target: { name, value } }); // Simulate an event to match handleChange format
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
                    activeStep={activeStep < stepperSteps.length ? activeStep : stepperSteps.length}
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
                    {stepperSteps.map((label, index) => (
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {activeStep < 3 && (
                        <Typography variant="h5" className="form-title">{steps[activeStep]}</Typography>
                    )}
                    {activeStep === 1 && (
                            <button onClick={() => handleSkip("gym")}>Skip</button>
                    )}
                    {activeStep === 2 && (
                            <button onClick={() => handleSkip("schedule")}>Skip</button>
                        
                    )}
                    </Box>

                    <form onSubmit={handleNext} className="form">
                        {activeStep === 0 && (
                            <>
                                <TextField label="First Name" placeholder="Enter your first name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth margin="normal" required/>
                                <TextField label="Last Name" placeholder="Enter your last name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Email" placeholder="Enter your email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Password" placeholder="Create a password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth margin="normal" required />
                                <TextField label="Confirm Password" placeholder="Confirm a password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth margin="normal" required error={!!confirmPasswordError} helperText={confirmPasswordError} />
                                {/* MUI Phone Number for Personal Phone */}
                                <MuiPhoneNumber defaultCountry={"us"} label="Phone Number" variant="outlined" name="phone" value={formData.phone} onChange={(value) => handlePhoneChange("phone", value)} fullWidth margin="normal" />
                            </>
                        )}

                        {activeStep === 1 && (
                            <>
                                <TextField 
                                    label="Gym Name" 
                                    placeholder="Enter gym name" 
                                    name="gymName" 
                                    value={formData.gymName} 
                                    onChange={handleChange} 
                                    fullWidth 
                                    margin="normal" 
                                    required 
                                />
                                
                                {/* Address Autocomplete Component */}
                                <AddressAutocomplete 
                                    value={formData.address} 
                                    onAddressSelect={(address, city, state) => 
                                        setFormData((prev) => ({
                                            ...prev, 
                                            address, 
                                            city, 
                                            state
                                        }))
                                    } 
                                />

                                <TextField 
                                    label="City" 
                                    placeholder="City" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    fullWidth 
                                    margin="normal" 
                                    required 
                                />
                                <TextField 
                                    label="State" 
                                    placeholder="State" 
                                    name="state" 
                                    value={formData.state} 
                                    onChange={handleChange} 
                                    fullWidth 
                                    margin="normal" 
                                    required 
                                />
                                <TextField 
                                    label="Gym Email" 
                                    placeholder="Enter gym email" 
                                    name="gymEmail" 
                                    type="email" 
                                    value={formData.gymEmail} 
                                    onChange={handleChange} 
                                    fullWidth 
                                    margin="normal" 
                                    required 
                                />
                                {/* MUI Phone Number for Gym Phone */}
                                <MuiPhoneNumber
                                    defaultCountry={"us"}
                                    label="Gym Phone Number"
                                    variant="outlined"
                                    name="gymPhoneNumber"
                                    value={formData.gymPhoneNumber}
                                    onChange={(value) => handlePhoneChange("gymPhoneNumber", value)}
                                    fullWidth
                                    margin="normal"
                                    required
                                />
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

                        {activeStep === 4 && (<WelcomePage />)}

                        {error && (
                            <Typography color="error" align="center" sx={{ marginBottom: 2 }}>
                                {error}
                            </Typography>
                        )}

                        {activeStep < 3 && (
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
                                    {loading ? "Submitting..." : activeStep === steps.length - 2 ? "Submit" : "Continue"}
                                </Button>
                            </Box>
                        )}
                        {activeStep === 3 && (
                            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    sx={{
                                        backgroundColor: "black",
                                        color: "white",
                                        textTransform: "none", // Prevents all caps
                                        "&:hover": { backgroundColor: "#333" } // Darker shade on hover
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : activeStep === 3 && "Complete Registration"}
                                </Button>
                            </Box>
                        )}
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