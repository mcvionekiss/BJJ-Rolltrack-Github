import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
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
import { MuiTelInput, matchIsValidTel } from 'mui-tel-input'; // Updated import
import PasswordChecklist from "react-password-checklist";
import "./Register.css";
import logo from "../assets/logo.jpeg"; // Import the logo image
import ScheduleDetails from "./ScheduleDetails.js";
import ConfirmRegistration from "./ConfirmRegistration.js";
import WelcomePage from "./WelcomePage.js"
import AddressAutocomplete from "./AddressAutocomplete";
import WaiverSetup from "./WaiverSetup";

const fetchCsrfToken = async (setCsrfToken) => {
    try {
        const response = await axios.get(config.endpoints.auth.csrf, {
            withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

const registerUser = async (userData, csrfToken) => {
    const payload = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        ...(userData.password && { password: userData.password }),
        phone: userData.phone,
        gym_name: userData.gymName,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        gym_email: userData.gymEmail,
        gym_phone_number: userData.gymPhoneNumber,
        schedule: userData.schedule,
      };
    
      return axios.post(config.endpoints.auth.register, payload, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfToken },
      });
};

const steps = ["Personal Information", "Gym Details", "Schedule Details", "Waiver Setup", "Confirmation", "Welcome"];
const stepperSteps = ["Personal Information", "Gym Details", "Schedule Details", "Waiver Setup", "Confirmation"];

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
        waiverType: "default",
        waiverGymName: "",
        waiverFileName: "",
        waiverFile: null,
    });

    const passwordMessages = {
        minLength: "Your password must be at least 8 characters long.",
        specialChar: "Your password must contain at least one special character.",
        number: "Your password must contain at least one number.",
        capital: "Your password must contain at least one uppercase letter.",
    };

    const [activeStep, setActiveStep] = useState(0);
    const [csrfToken, setCsrfToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [unmetCriteria, setUnmetCriteria] = useState([]);
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [phoneErrors, setPhoneErrors] = useState({
        personal: "",
        gym: "",
      });
    const [isGoogleSignup, setIsGoogleSignup] = useState(false);

    useEffect(() => {
        fetchCsrfToken(setCsrfToken);
    }, []);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    
        if (window.location.pathname === "/register/google" && userInfo) {
            setIsGoogleSignup(true);
            setFormData((prev) => ({
                ...prev,
                firstName: userInfo.first_name || "",
                lastName: userInfo.last_name || "",
                email: userInfo.email || "",
            }));
            setActiveStep(1); // Skip personal info
        }
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

    if (
        activeStep === 0 &&
        formData.phone &&
        (!matchIsValidTel(formData.phone) || !formData.phone.startsWith("+1"))
        ) {
        setPhoneErrors({ personal: "Please enter a valid US phone number.", gym: "" });
        return;
        }
        
        if (
        activeStep === 1 &&
        (!matchIsValidTel(formData.gymPhoneNumber) || !formData.gymPhoneNumber.startsWith("+1"))
        ) {
        setPhoneErrors({ personal: "", gym: "Please enter a valid US gym phone number." });
        return;
        }
        
        // Clear both if no error
        setPhoneErrors({ personal: "", gym: "" });

        setError("");
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");
    
        console.log("Submitting with data:", formData, "and CSRF:", csrfToken);
    
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
    };

    const handleEdit = (stepName) => {
        if (stepName === "personal") setActiveStep(0);
        if (stepName === "gym") setActiveStep(1);
        if (stepName === "schedule") setActiveStep(2);
        if (stepName === "waiver") setActiveStep(3);
    };

    const handleSkip = (stepName) => {
        if (stepName === "gym") setActiveStep(2);
        if (stepName === "schedule") setActiveStep(3);
        if (stepName === "waiver") setActiveStep(4);
    };

    const handleScheduleUpdate = (scheduleData) => {
        setFormData(prev => ({ ...prev, schedule: scheduleData }));
    };

    const handlePhoneChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="signup-container">

            {/* Left Sidebar - Stepper */}
            <div className="sidebar">
                <div className="logo-container" 
            >
                    <img 
                        src={logo} 
                        alt="RollTrack Logo" 
                        className="logo-img"
                        onClick={(e) => {
                            console.log("Navigating to login...");
                            window.location.href = "/"; // Forces full page reload
                        }}
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
                        {activeStep < 5 && (
                            <Typography variant="h5" className="form-title">{steps[activeStep]}</Typography>
                        )}
                        {activeStep === 1 && (
                            <button onClick={() => handleSkip("gym")}>Skip</button>
                        )}
                        {activeStep === 2 && (
                            <button onClick={() => handleSkip("schedule")}>Skip</button>
                        )}
                        {activeStep === 3 && (
                            <button onClick={() => handleSkip("waiver")}>Skip</button>
                        )}
                    </Box>

                    <form onSubmit={handleNext} className="form">
                        {activeStep === 0 && (
                            <>
                                {!isGoogleSignup && (
                                <>
                                    <TextField label="First Name" placeholder="Enter your first name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth margin="normal" required/>
                                    <TextField label="Last Name" placeholder="Enter your last name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth margin="normal" required />
                                    <TextField label="Email" placeholder="Enter your email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required />
                                    <TextField label="Password" placeholder="Create a password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth margin="normal" required 
                                        error={formData.password.length > 0 && unmetCriteria.length > 0} // Show red border only if password is entered and invalid
                                        helperText={
                                            formData.password.length > 0 && unmetCriteria.length > 0
                                                ? `⚠️ ${unmetCriteria.map(rule => passwordMessages[rule]).join(" ")}`
                                                : "" // Hide if no unmet criteria
                                        }
                                    />
                                    <TextField label="Confirm Password" placeholder="Confirm a password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth margin="normal" required error={!!confirmPasswordError} helperText={confirmPasswordError} />
                                    
                                    {/* Hidden Password Checklist for Validation */}
                                    {formData.password.length > 0 && (
                                        <PasswordChecklist
                                            rules={["minLength", "specialChar", "number", "capital"]}
                                            minLength={8}
                                            value={formData.password}
                                            valueAgain={formData.confirmPassword}
                                            onChange={(isValid, failedRules) => setUnmetCriteria(failedRules)}
                                            messages={passwordMessages}
                                            style={{ display: "none" }} // Hide checklist UI
                                        />
                                    )}
                                    
                                    {/* Updated MuiTelInput for Personal Phone */}
                                    <MuiTelInput
                                        defaultCountry="US"
                                        onlyCountries={['US']}
                                        forceCallingCode
                                        readOnlyCountryCode
                                        label="Phone Number"
                                        variant="outlined"
                                        value={formData.phone}
                                        onChange={(value) => handlePhoneChange("phone", value)}
                                        fullWidth
                                        margin="normal"
                                        error={!!phoneErrors.personal}
                                        helperText={phoneErrors.personal}
                                    />
                                  </>
                                )}
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
                                    addressValue={formData.address} 
                                    cityValue={formData.city} 
                                    stateValue={formData.state}
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
                                {/* Updated MuiTelInput for Gym Phone */}
                                <MuiTelInput
                                    defaultCountry="US"
                                    onlyCountries={['US']}
                                    forceCallingCode
                                    readOnlyCountryCode
                                    label="Gym Phone Number"
                                    variant="outlined"
                                    value={formData.gymPhoneNumber}
                                    onChange={(value) => handlePhoneChange("gymPhoneNumber", value)}
                                    fullWidth
                                    margin="normal"
                                    required
                                    error={!!phoneErrors.gym}
                                    helperText={phoneErrors.gym}
                                />
                            </>
                        )}

                        {activeStep === 2 && (
                            <ScheduleDetails 
                                onContinue={() => setActiveStep(activeStep + 1)}
                                onBack={() => setActiveStep(activeStep - 1)}
                                setScheduleData={handleScheduleUpdate}
                                initialSchedule={formData.schedule} // Pass stored schedule
                            />
                        )}

                        {activeStep === 3 && (
                            <WaiverSetup 
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {activeStep === 4 && (
                            <ConfirmRegistration
                                formData={formData}
                                onEdit={handleEdit}
                                onSubmit={handleSubmit}
                            />
                        )}

                        {activeStep === 5 && (
                            <WelcomePage />
                        )}

                        {error && (
                            <Typography color="error" align="center" sx={{ marginBottom: 2 }}>
                                {error}
                            </Typography>
                        )}

                        {activeStep < 4 && (
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

                        {activeStep === 4 && (
                            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                                <Button 
                                    type="button" 
                                    variant="contained" 
                                    sx={{
                                        backgroundColor: "black",
                                        color: "white",
                                        textTransform: "none", // Prevents all caps
                                        "&:hover": { backgroundColor: "#333" } // Darker shade on hover
                                    }}
                                    disabled={loading}
                                    onClick={handleSubmit}
                                >
                                    {loading ? "Submitting..." : "Complete Registration"}
                                </Button>
                            </Box>
                        )}
                    </form>

                    {activeStep === 0 && (
                        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>                            
                            Already have an account?{" "}
                            <Link 
                                component="button" 
                                onClick={(e) => {
                                    window.location.href = "/"; // Forces full page reload
                                }}
                                sx={{ cursor: "pointer", textDecoration: "underline", color: "black" }}
                            >
                                Log in
                            </Link>
                        </Typography>
                    )}
                </Paper>
            </div>
        </div>
    );
}