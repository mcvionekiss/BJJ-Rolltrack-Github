import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    Box,
    Grid2,
    Card,
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
    const navigate = useNavigate();
    const location = useLocation();
    const [weekDays, setWeekDays] = useState(getWeekDays());

    // Retrieve student email from the previous page
    const studentEmail = location.state?.email || "";
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch available classes for the current week
        axios.get("http://localhost:8000/api/available_classes_today/")
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
                    onClick={() => navigate("/checkin")}
                    sx={{ cursor: "pointer", color: "#757575" }}
                />
                <Typography variant="h5" fontWeight="bold" sx={{ ml: 1 }}>
                    Gym Name
                </Typography>
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
            >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Location Placeholder
                </Typography>
            </Box>

            {/* Date Display */}
            <Grid2 container direction="row" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
                {weekDays.map(({ shortName, dateNumber }, index) => {
                    const today = new Date().getDate(); // Get today's day number

                    const isToday = dateNumber === today; // Check if this is today's date

                    return (
                        <Grid2 item xs={12} sx={{ display: "flex", justifyContent: "center" }} key={index}>
                            <Card
                                sx={{
                                    width: "100%",
                                    borderRadius: "15px",
                                    transition: "transform 0.2s",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 15px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                                    backgroundColor: isToday ? "black" : "white",
                                    color: isToday ? "white" : "black",
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
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

            {error && <Typography color="error">{error}</Typography>}

            {Array.isArray(classes) && classes.length > 0 ? (
                <Grid2 container direction="column" spacing={2}>
                    {classes.map((cls) => (
                        <Grid2 item xs={12} key={cls.classID}>
                            <Card
                                onClick={() => handleClassSelect(cls.classID)}
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
                                        {formatTime(cls.startTime)}
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {cls.name}
                                    </Typography>
                                    <Box display="flex" alignItems="center" mt={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            {/* cls.trainer */}
                                            Trainer Placeholder
                                        </Typography>
                                        <GroupIcon sx={{ fontSize: "16px", ml: 1, mr: 0.5, color: "#757575" }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {cls.capacity}
                                        </Typography>
                                    </Box>
                                </Box>
                                <ChevronRightIcon sx={{ color: "#757575" }} />
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            ) : !loading && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="40vh" // Adjust based on your preference
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