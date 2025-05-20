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
    Fade,
    useTheme,
    Stack
} from "@mui/material";
import { MuiTelInput, matchIsValidTel } from 'mui-tel-input'; // Updated import
import PasswordChecklist from "react-password-checklist";
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

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

const addGym = async (gymData) => {
    const csrfToken = getCookie('csrftoken');  // Read it directly from cookie
    const response = await axios.post(
        config.endpoints.auth.addGym,
        gymData,
        {
            headers: {
                "X-CSRFToken": csrfToken,
                "Content-Type": "application/json"
            },
            withCredentials: true  // ensures cookies are sent, including the sessionid and csrftoken
        }
    );
    console.log("🟢 Gym added successfully", response.data);
    console.log("🟢 Gym ID: ", response.data.gym.id);
    return response.data.gym.id;  // Return the gym ID
};

const registerUser = async (userData) => {
    const csrfToken = getCookie('csrftoken');
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

      console.log(payload);
    
      return axios.post(config.endpoints.auth.register, payload, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfToken },
      });
};

const steps = ["Account Information", "Gym Details", "Schedule Details", "Waiver Setup", "Confirmation"];
const stepperSteps = steps;

function Register() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [gymId, setGymId] = useState(null);
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
    const [scheduleErrors, setScheduleErrors] = useState([]);
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
            const response = await registerUser(formData);
            console.log("🟢 Registration successful", response.data);
            const userId = response.data.user?.id;

            // Add gym data if provided
            if (formData.gymName) {
                // Map day strings to numbers
                const dayMap = {
                    "SUN": 0,
                    "MON": 1,
                    "TUE": 2,
                    "WED": 3,
                    "THU": 4,
                    "FRI": 5,
                    "SAT": 6,
                };
                const scheduleForBackend = (formData.schedule || []).map(entry => ({
                    ...entry,
                    day: dayMap[entry.day] !== undefined ? dayMap[entry.day] : entry.day
                }));
                const gymData = {
                    gymName: formData.gymName,
                    gymEmail: formData.gymEmail,
                    gymPhoneNumber: formData.gymPhoneNumber,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    schedule: scheduleForBackend,  // Use mapped schedule
                    userId: userId  // Include user ID for backend association
                };
                const createdGymId = await addGym(gymData);  // Get the gym ID
                setGymId(createdGymId);  // Store the gym ID in state
                navigate("/dashboard", { state: { gymId: createdGymId, showWelcome: true } });
            } else {
                navigate("/dashboard");
            }

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
        <Container sx={{ 
            minHeight: "100vh", 
            display: "flex", 
            flexDirection: "column", 
            overflow: "hidden",
            padding: 0,
            maxWidth: "100%"
        }}>
            <AppBar position="static" elevation={0} sx={{ 
                background: "transparent", 
                color: "transparent", 
                padding: "5px 5px", 
                minHeight: "50px"
            }}>
                <Toolbar>
                    <img
                        src={logo}
                        alt="RollTrack Logo"
                        style={{ height: "40px", cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    />
                </Toolbar>
            </AppBar>

            <Container sx={{
                flex: 1,
                display: "flex", 
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                overflow: "auto",
                padding: "10px 10px",
                py: 2,
                maxHeight: "100vh",
            }}>
                <Fade in={true} timeout={800}>
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={{ xs: 1, sm: 2}}
                        alignItems="flex-start"
                        sx={{ minHeight: 0, overflow: "auto", width: "100%", marginBottom: "100px" }}
                    >
                        {/* Left Sidebar - Stepper */}
                        <Box sx={{
                            flex: { xs: 'none', sm: 1 },
                            display: "flex",
                            background: "#f8f9fa",
                            padding: { xs: "1rem", sm: "2rem" },
                            borderRadius: "16px",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignSelf: "stretch",
                            minHeight: { xs: "auto", sm: "800px"},
                            maxHeight: { xs: "auto", sm: "800px"},
                            width: { xs: '100%', sm: 'auto' },
                        }}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
                                Sign Up
                            </Typography>

                            <Box sx={{ 
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}>
                                <Stepper 
                                    activeStep={activeStep < stepperSteps.length ? activeStep : stepperSteps.length}
                                    orientation="vertical"
                                    sx={{
                                        "& .MuiStepIcon-root": {
                                            color: "#e0e0e0", // Default color
                                        },
                                        "& .MuiStepIcon-root.Mui-active": {
                                            color: "black", // Active step icon color
                                        },
                                        "& .MuiStepIcon-root.Mui-completed": {
                                            color: "black", // Completed step icon color
                                        },
                                        "& .MuiStepLabel-label": {
                                            fontWeight: 500,
                                            color: "#707070"
                                        },
                                        "& .MuiStepLabel-label.Mui-active": {
                                            fontWeight: 600,
                                            color: "black"
                                        },
                                    }}
                                >
                                    {stepperSteps.map((label, index) => (
                                        <Step key={index}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>

                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    mt: 4, 
                                    textAlign: "center",
                                    color: "text.secondary"
                                }}
                            >
                                help-center@email.com
                            </Typography>
                        </Box>

                        {/* Right Form Section */}
                        <Container
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "16px",
                                padding: { 
                                    xs: "15px", 
                                    sm: "25px",
                                },
                                flex: { xs: 'none', sm: 2 },
                                width: { xs: '100%', sm: 'auto' },
                            }}
                        >
                            <Box sx={{ 
                                flex: 1, 
                                display: "flex",
                                flexDirection: "column",
                                mb: { xs: 1, sm: 2 },
                            }}>
                                {activeStep < 5 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                fontWeight: 700,
                                                letterSpacing: "0.5px",
                                                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                                                background: "linear-gradient(90deg, #000000, #333333)",
                                                backgroundClip: "text",
                                                textFillColor: "transparent",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        >
                                            {steps[activeStep]}
                                        </Typography>
                                        
                                        {activeStep === 1 && (
                                            <Button 
                                                onClick={() => handleSkip("gym")}
                                                sx={{
                                                    color: "text.secondary",
                                                    textTransform: "none",
                                                    fontWeight: 500,
                                                    transition: "all 0.2s ease-in-out",
                                                    "&:hover": {
                                                        color: "black",
                                                        background: "transparent"
                                                    }
                                                }}
                                            >
                                                Skip
                                            </Button>
                                        )}
                                        {activeStep === 2 && (
                                            <Button 
                                                onClick={() => handleSkip("schedule")}
                                                sx={{
                                                    color: "text.secondary",
                                                    textTransform: "none",
                                                    fontWeight: 500,
                                                    transition: "all 0.2s ease-in-out",
                                                    "&:hover": {
                                                        color: "black",
                                                        background: "transparent"
                                                    }
                                                }}
                                            >
                                                Skip
                                            </Button>
                                        )}
                                        {activeStep === 3 && (
                                            <Button 
                                                onClick={() => handleSkip("waiver")}
                                                sx={{
                                                    color: "text.secondary",
                                                    textTransform: "none",
                                                    fontWeight: 500,
                                                    transition: "all 0.2s ease-in-out",
                                                    "&:hover": {
                                                        color: "black",
                                                        background: "transparent"
                                                    }
                                                }}
                                            >
                                                Skip
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </Box>

                            <form onSubmit={handleNext} className="form" style={{ width: "100%",overflow: "visible"}}>
                                {activeStep === 0 && (
                                    <>
                                        {!isGoogleSignup && (
                                        <>
                                            <TextField 
                                                label="First Name" 
                                                placeholder="Enter your first name" 
                                                name="firstName" 
                                                value={formData.firstName} 
                                                onChange={handleChange} 
                                                fullWidth 
                                                margin="normal" 
                                                required
                                                sx={{
                                                    mt: { xs: 1, sm: 2 },
                                                    mb: { xs: 1, sm: 2 },
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
                                            <TextField 
                                                label="Last Name" 
                                                placeholder="Enter your last name" 
                                                name="lastName" 
                                                value={formData.lastName} 
                                                onChange={handleChange} 
                                                fullWidth 
                                                margin="normal" 
                                                required 
                                                sx={{
                                                    mt: { xs: 1, sm: 2 },
                                                    mb: { xs: 1, sm: 2 },
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
                                            <TextField 
                                                label="Email" 
                                                placeholder="Enter your email" 
                                                name="email" 
                                                type="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                fullWidth 
                                                margin="normal" 
                                                required 
                                                sx={{
                                                    mt: { xs: 1, sm: 2 },
                                                    mb: { xs: 1, sm: 2 },
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
                                            <TextField 
                                                label="Password" 
                                                placeholder="Create a password" 
                                                name="password" 
                                                type="password" 
                                                value={formData.password} 
                                                onChange={handleChange} 
                                                fullWidth 
                                                margin="normal" 
                                                required 
                                                error={formData.password.length > 0 && unmetCriteria.length > 0}
                                                helperText={
                                                    formData.password.length > 0 && unmetCriteria.length > 0
                                                        ? `⚠️ ${unmetCriteria.map(rule => passwordMessages[rule]).join(" ")}`
                                                        : ""
                                                }
                                                sx={{
                                                    mt: { xs: 1, sm: 2 },
                                                    mb: { xs: 1, sm: 2 },
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
                                            <TextField 
                                                label="Confirm Password" 
                                                placeholder="Confirm a password" 
                                                name="confirmPassword" 
                                                type="password" 
                                                value={formData.confirmPassword} 
                                                onChange={handleChange} 
                                                fullWidth 
                                                margin="normal" 
                                                required 
                                                error={!!confirmPasswordError} 
                                                helperText={confirmPasswordError}
                                                sx={{
                                                    mt: { xs: 1, sm: 2 },
                                                    mb: { xs: 1, sm: 2 },
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
                                                sx={{
                                                    mt: { xs: 1, sm: 2 },
                                                    mb: { xs: 1, sm: 2 },
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
                                            // You might need to pass sx props or update the AddressAutocomplete component separately
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
                                        <TextField 
                                            label="State" 
                                            placeholder="State" 
                                            name="state" 
                                            value={formData.state} 
                                            onChange={handleChange} 
                                            fullWidth 
                                            margin="normal" 
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
                                    </>
                                )}

                                {activeStep === 2 && (
                                    <ScheduleDetails 
                                        onContinue={() => setActiveStep(activeStep + 1)}
                                        onBack={() => setActiveStep(activeStep - 1)}
                                        setScheduleData={handleScheduleUpdate}
                                        setScheduleErrors={setScheduleErrors}
                                        initialSchedule={formData.schedule}
                                    />
                                )}
                                {activeStep === 3 && (
                                    <>
                                        <WaiverSetup 
                                            formData={formData}
                                            setFormData={setFormData}
                                        />
                                        <Box sx={{ 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            mt: { xs: 2, sm: 4 }
                                        }}>
                                            <Button 
                                                onClick={() => setActiveStep(activeStep - 1)} 
                                                variant="outlined"
                                                sx={{
                                                    borderColor: "#e0e0e0",
                                                    color: "text.secondary",
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    py: 1,
                                                    px: 3,
                                                    fontWeight: 500,
                                                    "&:hover": {
                                                        borderColor: "black",
                                                        color: "black",
                                                        background: "transparent"
                                                    }
                                                }}
                                            >
                                                Back
                                            </Button>
                                            <Button 
                                                onClick={() => setActiveStep(activeStep + 1)}
                                                variant="contained" 
                                                sx={{
                                                    backgroundColor: "black",
                                                    color: "white",
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    py: 1.5,
                                                    px: 4,
                                                    fontWeight: 500,
                                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                                    transition: "all 0.2s ease-in-out",
                                                    "&:hover": { 
                                                        backgroundColor: "#222",
                                                        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                                                        transform: "translateY(-2px)"
                                                    }
                                                }}
                                            >
                                                Continue
                                            </Button>
                                        </Box>
                                    </>
                                )}

                                {activeStep === 4 && (
                                    <ConfirmRegistration
                                        formData={formData}
                                        onEdit={handleEdit}
                                        onSubmit={handleSubmit}
                                    />
                                )}

                                {error && (
                                    <Typography 
                                        color="error" 
                                        align="center" 
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

                                {activeStep < 4 && activeStep !== 3 && (
                                    <Box sx={{ 
                                        display: "flex", 
                                        justifyContent: activeStep === 0 ? "flex-end" : "space-between", 
                                        mt: { xs: 2, sm: 4 }
                                    }}>
                                        {activeStep > 0 && (
                                            <Button 
                                                onClick={() => setActiveStep(activeStep - 1)} 
                                                variant="outlined"
                                                sx={{
                                                    borderColor: "#e0e0e0",
                                                    color: "text.secondary",
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    py: 1,
                                                    px: 3,
                                                    fontWeight: 500,
                                                    "&:hover": {
                                                        borderColor: "black",
                                                        color: "black",
                                                        background: "transparent"
                                                    }
                                                }}
                                            >
                                                Back
                                            </Button>
                                        )}
                                        <Button 
                                            type="submit" 
                                            variant="contained" 
                                            sx={{
                                                backgroundColor: "black",
                                                color: "white",
                                                borderRadius: "10px",
                                                textTransform: "none",
                                                py: 1.5,
                                                px: 4,
                                                fontWeight: 500,
                                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                                transition: "all 0.2s ease-in-out",
                                                "&:hover": { 
                                                    backgroundColor: "#222",
                                                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                                                    transform: "translateY(-2px)"
                                                }
                                            }}
                                            disabled={loading || (activeStep === 2 && scheduleErrors.length > 0)}
                                        >
                                            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : 
                                                activeStep === steps.length - 1 ? "Submit" : "Continue"}
                                        </Button>
                                    </Box>
                                )}

                                {activeStep === 4 && (
                                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                                        <Button 
                                            type="button" 
                                            variant="contained" 
                                            sx={{
                                                backgroundColor: "black",
                                                color: "white",
                                                textTransform: "none",
                                                borderRadius: "10px",
                                                py: 1.5,
                                                px: 4,
                                                fontWeight: 500,
                                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                                transition: "all 0.2s ease-in-out",
                                                "&:hover": { 
                                                    backgroundColor: "#222",
                                                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                                                    transform: "translateY(-2px)"
                                                }
                                            }}
                                            disabled={loading}
                                            onClick={handleSubmit}
                                        >
                                            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Complete Registration"}
                                        </Button>
                                    </Box>
                                )}
                            </form>

                            {activeStep === 0 && (
                                <Typography 
                                    variant="body2" 
                                    align="center" 
                                    sx={{ 
                                        mt: 3, 
                                        color: "text.secondary" 
                                    }}
                                >                            
                                    Already have an account?{" "}
                                    <Link 
                                        component="button" 
                                        onClick={() => navigate("/login")}
                                        sx={{ 
                                            cursor: "pointer", 
                                            color: "black",
                                            fontWeight: 500,
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                textDecoration: "none"
                                            }
                                        }}
                                    >
                                        Log in
                                    </Link>
                                </Typography>
                            )}
                        </Container>
                    </Stack>
                </Fade>
            </Container>
        </Container>
    );
}

export default Register;