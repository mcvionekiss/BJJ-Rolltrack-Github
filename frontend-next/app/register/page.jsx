"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { API_ENDPOINTS } from "../../config.js";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Link,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import PasswordChecklist from "react-password-checklist";
import logo from "../../public/logo.jpeg";
import styles from "./Register.module.css";
import ScheduleDetails from "../components/ScheduleDetails.jsx";
import ConfirmRegistration from "../components/ConfirmRegistration.jsx";
import WelcomePage from "../components/WelcomePage/WelcomePage.jsx";
import AddressAutocomplete from "../components/AddressAutocomplete.jsx";

const fetchCsrfToken = async (setCsrfToken) => {
  try {
    const response = await axios.get(API_ENDPOINTS.AUTH.CSRF, {
      withCredentials: true,
    });
    setCsrfToken(response.data.csrfToken);
  } catch (error) {
    console.error("Failed to fetch CSRF token", error);
  }
};

const registerUser = async (userData, csrfToken) => {
  return axios.post(API_ENDPOINTS.AUTH.GYM_OWNER_REGISTER, userData, {
    withCredentials: true,
    headers: { "X-CSRFToken": csrfToken },
  });
};

const steps = [
  "Personal Information",
  "Gym Details",
  "Schedule Details",
  "Confirmation",
  "Welcome",
];
const stepperSteps = [
  "Personal Information",
  "Gym Details",
  "Schedule Details",
  "Confirmation",
];

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

  const passwordMessages = {
    minLength: "At least 8 characters!",
    specialChar: "At least one special character!",
    number: "At least one number!",
    capital: "At least one uppercase letter!",
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

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setConfirmPasswordError("");

    if (
      activeStep === 0 &&
      formData.phone &&
      (!matchIsValidTel(formData.phone) || !formData.phone.startsWith("+1"))
    ) {
      setPhoneErrors({
        personal: "Please enter a valid US phone number.",
        gym: "",
      });
      return;
    }

    if (
      activeStep === 1 &&
      (!matchIsValidTel(formData.gymPhoneNumber) ||
        !formData.gymPhoneNumber.startsWith("+1"))
    ) {
      setPhoneErrors({
        personal: "",
        gym: "Please enter a valid US gym phone number.",
      });
      return;
    }

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

    try {
      const response = await registerUser(formData, csrfToken);
      console.log("🟢 Registration successful", response.data);
      setActiveStep(activeStep + 1);
    } catch (error) {
      console.error("🔴 Registration failed", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
    setFormData((prev) => ({ ...prev, schedule: scheduleData }));
  };

  const handlePhoneChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles["signup-container"]}>
      {/* Left Sidebar - Stepper */}
      <div className={styles.sidebar}>
        <div className="">
          <Image
            src={logo}
            alt="RollTrack Logo"
            className={`w-10 mb-2 object-contain`}
            onClick={() => {
              window.location.href = "/";
            }}
          />
        </div>
        <Typography variant="h5" className={styles["signup-title"]}>
          Sign Up
        </Typography>

        <Stepper
          activeStep={
            activeStep < stepperSteps.length ? activeStep : stepperSteps.length
          }
          orientation="vertical"
          sx={{
            "& .MuiStepIcon-root": {
              color: "#d3d3d3",
            },
            "& .MuiStepIcon-root.Mui-active": {
              color: "black",
            },
            "& .MuiStepIcon-root.Mui-completed": {
              color: "black",
            },
          }}
        >
          {stepperSteps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="body2" className={styles["help-email"]}>
          help-center@email.com
        </Typography>
      </div>

      {/* Right Form Section */}
      <div className={styles["form-container"]}>
        <Paper elevation={3} className={styles["form-box"]}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {activeStep < 3 && (
              <Typography variant="h5" className={styles["form-title"]}>
                {steps[activeStep]}
              </Typography>
            )}
            {activeStep === 1 && (
              <button onClick={() => handleSkip("gym")}>Skip</button>
            )}
            {activeStep === 2 && (
              <button onClick={() => handleSkip("schedule")}>Skip</button>
            )}
          </Box>

          <form onSubmit={handleNext} className={styles.form}>
            {activeStep === 0 && (
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
                  error={
                    formData.password.length > 0 && unmetCriteria.length > 0
                  }
                  helperText={
                    formData.password.length > 0 && unmetCriteria.length > 0
                      ? `⚠️ ${unmetCriteria
                          .map((rule) => passwordMessages[rule])
                          .join(" ")}`
                      : ""
                  }
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
                />

                {formData.password.length > 0 && (
                  <PasswordChecklist
                    rules={["minLength", "specialChar", "number", "capital"]}
                    minLength={8}
                    value={formData.password}
                    valueAgain={formData.confirmPassword}
                    onChange={(isValid, failedRules) =>
                      setUnmetCriteria(failedRules)
                    }
                    messages={passwordMessages}
                    style={{ display: "none" }}
                  />
                )}

                <MuiTelInput
                  defaultCountry="US"
                  onlyCountries={["US"]}
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

                <AddressAutocomplete
                  addressValue={formData.address}
                  cityValue={formData.city}
                  stateValue={formData.state}
                  onAddressSelect={(address, city, state) =>
                    setFormData((prev) => ({
                      ...prev,
                      address,
                      city,
                      state,
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
                <MuiTelInput
                  defaultCountry="US"
                  onlyCountries={["US"]}
                  forceCallingCode
                  readOnlyCountryCode
                  label="Gym Phone Number"
                  variant="outlined"
                  value={formData.gymPhoneNumber}
                  onChange={(value) =>
                    handlePhoneChange("gymPhoneNumber", value)
                  }
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
                initialSchedule={formData.schedule}
              />
            )}

            {activeStep === 3 && (
              <ConfirmRegistration
                formData={formData}
                onEdit={handleEdit}
                onSubmit={handleSubmit}
              />
            )}

            {activeStep === 4 && <WelcomePage />}

            {error && (
              <Typography color="error" align="center" sx={{ marginBottom: 2 }}>
                {error}
              </Typography>
            )}

            {activeStep < 3 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 2,
                }}
              >
                {activeStep > 0 && (
                  <Button
                    onClick={() => setActiveStep(activeStep - 1)}
                    variant="outlined"
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
                    "&:hover": { backgroundColor: "#333" },
                  }}
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : activeStep === steps.length - 2
                    ? "Submit"
                    : "Continue"}
                </Button>
              </Box>
            )}
            {activeStep === 3 && (
              <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
              >
                <Button
                  type="button"
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#333" },
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
                onClick={() => {
                  window.location.href = "/";
                }}
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "black",
                }}
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
