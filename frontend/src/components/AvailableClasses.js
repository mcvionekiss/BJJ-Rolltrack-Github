import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    Box,
    Grid2,
    Card,
    Button,
    CircularProgress
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import config from "../config";

// Utility function to format the date
const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
};

// Utility function to format time to 12-hour format
const formatTime = (time) => {
    const date = new Date(`1970-01-01T${time}Z`);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Get the days of the current week
const getWeekDays = () => {
    const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    return days.map((day, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index); // Adjust day

        return {
            shortName: day,
            dateNumber: date.getDate(),
        };
    });
};

function AvailableClasses() {
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");
    const [gymName, setGymName] = useState("");
    const [gymAddress, setGymAddress] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const [weekDays, setWeekDays] = useState(getWeekDays());
    const [retryCount, setRetryCount] = useState(0);

    // Retrieve student email and gym ID from the previous page
    const studentEmail = location.state?.email || "";
    const studentName = location.state?.studentName || "";
    const isGuest = location.state?.isGuest || false;
    const gymId = location.state?.gymId || "";
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Show welcome message for guests
        if (isGuest && studentName) {
            console.log(`Guest ${studentName} has checked in and is viewing available classes`);
        }

        // Log the gymId for debugging
        console.log(`🔷 Using Gym ID: ${gymId || 'Not provided'}`);

        // Fetch gym details if we have a gymId
        const fetchGymDetails = async () => {
            if (gymId) {
                try {
                    const response = await axios.get(config.endpoints.api.gymHours(gymId));
                    if (response.data.success) {
                        setGymName(response.data.gym_name);
                        // If the API returns address information, set it here
                        setGymAddress(response.data.address || "");
                        console.log(`🔷 Fetched gym name: ${response.data.gym_name}`);
                    }
                } catch (err) {
                    console.error("Error fetching gym details:", err);
                    setGymName("BJJ Dojo"); // Default fallback
                }
            } else {
                setGymName("BJJ Dojo"); // Default fallback
            }
        };

        fetchGymDetails();
    }, [gymId, isGuest, studentName]);

    useEffect(() => {
        // Fetch available classes for the current week
        setLoading(true);
        setError("");
        
        // Modify the API call to include gymId if available
        const classesEndpoint = gymId 
            ? `${config.endpoints.api.availableClasses}?gym_id=${gymId}`
            : config.endpoints.api.availableClasses;
            
        console.log(`🔷 Fetching classes from: ${classesEndpoint}`);
        
        axios.get(classesEndpoint)
            .then(response => {
                console.log("API Response:", response.data);
                if (response.data.success && response.data.classes) {
                    setClasses(response.data.classes);
                } else {
                    setClasses([]);
                    if (!response.data.success) {
                        setError(response.data.message || "No classes data available.");
                    }
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching classes:", error);
                
                let errorMessage = "Failed to load classes.";
                if (error.response) {
                    // The request was made and the server responded with a status code
                    console.error("Error response:", error.response.data);
                    errorMessage = error.response.data.message || errorMessage;
                } else if (error.request) {
                    // The request was made but no response was received
                    errorMessage = "No response from server. Please check your connection.";
                } else {
                    // Something happened in setting up the request
                    errorMessage = error.message || errorMessage;
                }
                
                setError(errorMessage);
                setLoading(false);
                
                // Retry up to 2 times with increasing delay if we get an error
                if (retryCount < 2) {
                    setTimeout(() => {
                        setRetryCount(count => count + 1);
                    }, 1000 * (retryCount + 1)); // Exponential backoff
                }
            });
    }, [retryCount, gymId]);

    const handleClassSelect = (classId) => {
        console.log(`Selected class ID: ${classId}, Gym ID: ${gymId}`);
        navigate(`/class-details/${classId}`, { 
            state: { 
                email: studentEmail,
                studentName: studentName,
                isGuest: isGuest,
                gymId: gymId
            } 
        });
    };

    // Handle back button with gym_id preservation
    const handleBack = () => {
        navigate(`/checkin${gymId ? `?gym_id=${gymId}` : ''}`);
    };

    // Get today's date formatted
    const today = formatDate(new Date());

    return (
        <Container maxWidth="sm" sx={{ mt: 4, pb: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <ArrowBackIosIcon
                    onClick={handleBack}
                    sx={{ cursor: "pointer", color: "#757575" }}
                />
                <Typography variant="h5" fontWeight="bold" sx={{ ml: 1 }}>
                    {gymName || "Loading..."}
                </Typography>
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
            >
                {gymAddress && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {gymAddress}
                    </Typography>
                )}
                
                {isGuest && studentName && (
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            mt: 2, 
                            mb: 3, 
                            py: 1,
                            px: 2,
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: 'success.main',
                            borderRadius: 1,
                            width: '100%'
                        }}
                    >
                        Welcome, {studentName}! Please select a class to join.
                    </Typography>
                )}
            </Box>

            {/* Date Display */}
            <Grid2 container size="auto" display="flex" flexDirection="row" justifyContent="center" spacing={1} columns={7} sx={{ mb: 2 }}>
                {weekDays.map(({ shortName, dateNumber }, index) => {
                    const today = new Date().getDate(); // Get today's day number

                    const isToday = dateNumber === today; // Check if this is today's date

                    return (
                        <Grid2 container size="grow" sx={{ display: "flex", justifyContent: "center" }} key={index}>
                            <Card
                                sx={{
                                    borderRadius: "15px",
                                    transition: "transform 0.2s",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "15px 15px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                                    backgroundColor: isToday ? "black" : "white",
                                    color: isToday ? "white" : "black",
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {shortName}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {dateNumber}
                                </Typography>
                            </Card>
                        </Grid2>
                    );
                })}
            </Grid2>

            {/* Loading state */}
            {loading && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="40vh"
                    textAlign="center"
                >
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading classes...
                    </Typography>
                </Box>
            )}

            {/* Error message */}
            {error && !loading && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="20vh"
                    textAlign="center"
                    sx={{ my: 2 }}
                >
                    <Typography color="error" variant="body1" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setRetryCount(count => count + 1)}
                    >
                        Retry
                    </Button>
                </Box>
            )}

            {/* Classes list */}
            {!loading && !error && Array.isArray(classes) && classes.length > 0 ? (
                <Grid2 container direction="column" spacing={2}>
                    {classes.map((cls) => (
                        <Grid2 item xs={12} key={cls.id}>
                            <Card
                                onClick={() => handleClassSelect(cls.id)}
                                sx={{
                                    borderRadius: "15px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 15px",
                                    "&:hover": {
                                        transform: "scale(1.02)"
                                    }
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {cls.name}
                                    </Typography>
                                    <Box display="flex" alignItems="center" mt={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            {cls.level || "All Levels"}
                                        </Typography>
                                        <GroupIcon sx={{ fontSize: "16px", ml: 1, mr: 0.5, color: "#757575" }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {cls.currentAttendance || 0}/{cls.maxCapacity || "∞"}
                                        </Typography>
                                    </Box>
                                </Box>
                                <ChevronRightIcon sx={{ color: "#757575" }} />
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            ) : !loading && !error && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="40vh"
                    textAlign="center"
                >
                    <Typography variant="h6" color="text.secondary" fontWeight="bold">
                        No classes available today.
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

export default AvailableClasses;