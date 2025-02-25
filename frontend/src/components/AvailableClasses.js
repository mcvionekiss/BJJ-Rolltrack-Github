import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Button,
    Container,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress
} from "@mui/material";

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
        axios.get("http://3.133.113.101:8000/api/available_classes/")
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

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
                <Typography variant="h5" fontWeight="bold">
                    Available Classes This Week
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                    Select a class to check in.
                </Typography>

                {loading && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                        <CircularProgress />
                    </div>
                )}

                {error && <Typography color="error">{error}</Typography>}

                {Array.isArray(classes) && classes.length > 0 ? (
                    <List>
                        {classes.map((cls) => (
                            <ListItem button key={cls.classID} onClick={() => handleClassSelect(cls.classID)}>
                                <ListItemText primary={cls.name} secondary={`${cls.startTime} - ${cls.endTime}`} />
                            </ListItem>
                        ))}
                    </List>
                ) : !loading && (
                    <Typography>No classes available.</Typography>
                )}

                <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2, backgroundColor: "black", color: "white" }}
                    onClick={() => navigate("/")}
                >
                    Back
                </Button>
            </Paper>
        </Container>
    );
}

export default AvailableClasses;