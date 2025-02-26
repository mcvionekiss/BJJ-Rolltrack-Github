import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    IconButton,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

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

function AvailableClasses() {
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve student email from the previous page
    const studentEmail = location.state?.email || "";
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch available classes for the current week
        axios.get("http://localhost:8000/api/available_classes/")
            .then(response => {
                setClasses(response.data.classes);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching classes:", error);
                setError("Failed to load classes.");
                setLoading(false);
            });
    }, []);

    const handleClassSelect = (classID) => {
        console.log(studentEmail);
        navigate(`/class-details/${classID}`, { state: { email: studentEmail } });
    };

    // Get today's date formatted
    const today = formatDate(new Date());

    return (
        <Container maxWidth="sm" sx={{ mt: 4, pb: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <ArrowBackIosIcon
                    onClick={() => navigate("/")}
                    sx={{ cursor: "pointer", color: "#757575" }}
                />
                <Typography variant="h5" fontWeight="bold" sx={{ ml: 1 }}>
                    Gym Location Placeholder
                </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Location Placeholder
            </Typography>

            {/* Date Display */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    mb: 3,
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}
            >
                <Typography variant="body1" fontWeight="bold">
                    {today}
                </Typography>
            </Box>

            {error && <Typography color="error">{error}</Typography>}

            {Array.isArray(classes) && classes.length > 0 ? (
                <Grid container spacing={2}>
                    {classes.map((cls) => (
                        <Grid item xs={12} key={cls.classID}>
                            <Card
                                onClick={() => handleClassSelect(cls.classID)}
                                sx={{
                                    borderRadius: "15px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 15px",
                                    "&:hover": {
                                        transform: "scale(1.01)"
                                    }
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                        {formatTime(cls.startTime)}
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {cls.name}
                                    </Typography>
                                    <Box display="flex" alignItems="center" mt={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            John Doe
                                        </Typography>
                                        <GroupIcon sx={{ fontSize: "16px", ml: 1, mr: 0.5, color: "#757575" }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {cls.capacity}
                                        </Typography>
                                    </Box>
                                </Box>
                                <ChevronRightIcon sx={{ color: "#757575" }} />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : !loading && (
                <Typography>No classes available.</Typography>
            )}
        </Container>
    );
}

export default AvailableClasses;