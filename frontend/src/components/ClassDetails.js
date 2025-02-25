import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { Button, Container, Paper, Typography } from "@mui/material";

function ClassDetails() {
    const { id } = useParams();  // Get class ID from URL
    const location = useLocation();
    const navigate = useNavigate();
    const studentEmail = location.state?.email || "";
    const [classDetails, setClassDetails] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`http://3.133.113.101:8000/api/class_details/${id}/`)
            .then(response => {
                setClassDetails(response.data);
            })
            .catch(error => {
                setError("Error loading class details.");
            });
    }, [id]);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await axios.post("http://3.133.113.101:8000/api/checkin/", {
                email: studentEmail,
                classID: id
            });

            alert("✅ Successfully checked in!");
            navigate("/");
        } catch (error) {
            setError("Error checking in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
                <Typography variant="h5" fontWeight="bold">Class Details</Typography>

                {error && <Typography color="error">{error}</Typography>}

                {classDetails ? (
                    <>
                        <Typography variant="h6">{classDetails.name}</Typography>
                        <Typography>Time: {classDetails.startTime} - {classDetails.endTime}</Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mt: 3, backgroundColor: "black", color: "white" }}
                            onClick={handleCheckIn}
                            disabled={loading}
                        >
                            {loading ? "Checking In..." : "Check In"}
                        </Button>
                    </>
                ) : (
                    <Typography>Loading...</Typography>
                )}
            </Paper>
        </Container>
    );
}

export default ClassDetails;