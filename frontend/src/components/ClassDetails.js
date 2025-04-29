import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Button,
    CardMedia,
    IconButton,
    Grid,
    Alert,
    CircularProgress
} from "@mui/material";
import banner from "../assets/banner.png";
import config from "../config";

// Icons
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

// Ensure cookies are included with requests
axios.defaults.withCredentials = true;

// Utility function to format date
const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(date).toLocaleDateString('en-US', options);
};

// Utility function to format time to 12-hour format
const formatTime = (time) => {
    const date = new Date(`1970-01-01T${time}Z`);
    return date.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit', hour12: true});
};

function ClassDetails() {
    const { id } = useParams();  // Get class ID from URL
    const location = useLocation();
    const navigate = useNavigate();
    const studentEmail = location.state?.email || "";
    const studentName = location.state?.studentName || "";
    const isGuest = location.state?.isGuest || false;
    const gymId = location.state?.gymId || ""; // Get gymId from location state
    const [classDetails, setClassDetails] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");

    // Log for debugging
    console.log("ClassDetails - Retrieved gymId:", gymId, "Email:", studentEmail, "Guest:", isGuest);
    
    // Fetch CSRF token when component mounts
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                console.log("Fetching CSRF token...");
                const response = await axios.get(config.endpoints.auth.csrf);
                const token = response.data.csrfToken;
                setCsrfToken(token);
                console.log("CSRF token fetched successfully");
            } catch (error) {
                console.error("Error fetching CSRF token:", error);
                setError("Error fetching CSRF token. Please refresh the page.");
            }
        };
        
        fetchCsrfToken();
    }, []);

    useEffect(() => {
        setError("");
        setLoading(true);
        
        // Log for debugging
        console.log(`Fetching class details for ID: ${id}, Gym ID: ${gymId}`);
        
        axios.get(config.endpoints.api.classDetails(id))
            .then(response => {
                if (response.data.success) {
                    setClassDetails(response.data);
                } else {
                    setError(response.data.message || "Could not load class details.");
                }
            })
            .catch(error => {
                console.error("Error fetching class details:", error);
                if (error.response) {
                    setError(error.response.data.message || "Error loading class details.");
                } else {
                    setError("Could not connect to server. Please try again later.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, gymId]);

    const handleCheckIn = async () => {
        if (!studentEmail) {
            setError("Student email is required to check in.");
            return;
        }
        
        if (!csrfToken) {
            setError("Security token not available. Please refresh the page.");
            return;
        }
        
        setCheckingIn(true);
        setError("");
        
        try {
            console.log(`Sending check-in request for class ID: ${id}, email: ${studentEmail}, gym ID: ${gymId}`);
            
            // Handle differently if it's a guest
            if (isGuest) {
                // For guests, we'll skip the backend check-in process
                console.log("Processing guest check-in");
                
                const checkinData = {
                    studentName: studentName || studentEmail.split('@')[0],
                    className: classDetails.name,
                    email: studentEmail,
                    checkinTime: new Date().toISOString(),
                    date: classDetails.date,
                    isGuest: true,
                    gymId: gymId
                };
                
                console.log("Navigating to success page with guest data:", checkinData);
                navigate("/checkin-success", { state: checkinData });
                return;
            }
            
            // Configure headers with CSRF token
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };
            
            // Regular student check-in process
            const response = await axios.post(
                config.endpoints.api.checkin, 
                {
                    email: studentEmail,
                    classID: id,  // This is the id from useParams()
                    gym_id: gymId  // Changed to gym_id to match backend parameter name
                },
                { headers }
            );

            console.log("Check-in response:", response.data);

            if (response.data.success) {
                const checkinData = response.data.checkin || {
                    studentName: studentEmail.split('@')[0],
                    className: classDetails.name,
                    email: studentEmail,
                    checkinTime: new Date().toISOString(),
                    date: classDetails.date,
                    gymId: gymId
                };
                
                console.log("Navigating to success page with data:", checkinData);
                navigate("/checkin-success", { state: { ...checkinData, email: studentEmail, gymId: gymId } });
            } else {
                console.error("Check-in failed:", response.data.message);
                setError(response.data.message || "Check-in failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during check-in:", error);
            let errorMessage = "An unexpected error occurred.";
            
            if (error.response) {
                console.error("Error response:", error.response.data);
                errorMessage = error.response.data.message || "Error checking in. Please try again.";
            } else if (error.request) {
                console.error("No response received:", error.request);
                errorMessage = "Network error. Please check your connection.";
            } else {
                console.error("Error setting up request:", error.message);
                errorMessage = error.message || "An unexpected error occurred.";
            }
            
            setError(errorMessage);
        } finally {
            setCheckingIn(false);
        }
    };

    // Back button handler
    const handleBack = () => {
        // Keep student email and guest status in state when going back
        navigate("/available-classes", { 
            state: { 
                email: studentEmail,
                studentName: studentName,
                isGuest: isGuest,
                gymId: gymId  // Include gymId when navigating back
            } 
        });
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ paddingBottom: 4 }}>
            {/* Top Image with Back Button */}
            <Box sx={{ position: "relative" }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={banner}
                    alt="Class Image"
                    sx={{
                        borderRadius: "0 0 10px 10px",
                        filter: "grayscale(100%)"
                    }}
                />
                <ArrowBackIosIcon
                    onClick={handleBack}
                    sx={{
                        cursor: "pointer",
                        position: "absolute",
                        top: 16,
                        left: 16,
                        color: "black",
                    }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
            {isGuest && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    You are checking in as a guest: {studentName || studentEmail}
                </Alert>
            )}

            {classDetails ? (
                <>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 3 }}>
                        {classDetails.name}
                    </Typography>

                    {classDetails.description && (
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            {classDetails.description}
                        </Typography>
                    )}

                    <Box sx={{ mt: 3, mb: 4 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    TIME:
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    {formatTime(classDetails.startTime)} – {formatTime(classDetails.endTime)}
                                </Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    DATE:
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    {classDetails.date ? formatDate(classDetails.date) : "Date not available"}
                                </Typography>
                            </Grid>

                            {classDetails.level && (
                                <>
                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                            SKILL LEVEL:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography>
                                            {classDetails.level}
                                        </Typography>
                                    </Grid>
                                </>
                            )}

                            {classDetails.maxCapacity && (
                                <>
                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                            CAPACITY:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography>
                                            {classDetails.maxCapacity} students
                                        </Typography>
                                    </Grid>
                                </>
                            )}

                            {classDetails.notes && (
                                <>
                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                            NOTES:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography>
                                            {classDetails.notes}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>

                    {classDetails.isCanceled ? (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            This class has been canceled.
                        </Alert>
                    ) : (
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ 
                                py: 1.5,
                                backgroundColor: "black", 
                                color: "white",
                                borderRadius: 2,
                                "&:hover": { 
                                    backgroundColor: "#333"
                                }
                            }}
                            onClick={handleCheckIn}
                            disabled={checkingIn || !studentEmail}
                        >
                            {checkingIn ? "Checking In..." : "Check In"}
                        </Button>
                    )}

                    {!studentEmail && (
                        <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: "center" }}>
                            Student email is required to check in
                        </Typography>
                    )}
                </>
            ) : (
                <Typography sx={{ mt: 4 }}>No class details available.</Typography>
            )}
        </Container>
    );
}

export default ClassDetails;