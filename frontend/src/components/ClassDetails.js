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
    Grid
} from "@mui/material";
import banner from "../assets/banner.png";

// Icons
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

// Utility function to format date
const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
    const [classDetails, setClassDetails] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`http://192.168.2.1:8000/api/class_details/${id}/`)
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
            await axios.post("http://192.168.2.1:8000/api/checkin/", {
                email: studentEmail,
                classID: id
            });

            navigate("/checkin-success", {
                state: { studentName: "John Doe", className: classDetails.name, email: studentEmail } // Replace with actual student name
            });
        } catch (error) {
            setError("Error checking in. Please try again.");
        } finally {
            setLoading(false);
        }
    };


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
                    onClick={() => navigate("/available-classes")}
                    sx={{
                        cursor: "pointer",
                        position: "absolute",
                        top: 16,
                        left: 16,
                        color: "black",
                    }}
                />
            </Box>

            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

            {classDetails ? (
                <>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 3 }}>
                        {classDetails.name}
                    </Typography>

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
                                    {/*{formatDate(classDetails.day)}*/}
                                    No Date Defined
                                </Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    TRAINER:
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    {/*{classDetails.trainer}*/}
                                    No Trainer Defined
                                </Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    CATEGORY:
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    {/*{classDetails.category}*/}
                                    No Category Defined
                                </Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    SKILL LEVEL:
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    {/*{classDetails.skillLevel}*/}
                                    No Skill Defined
                                </Typography>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    ADDRESS:
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    Gym Location Placeholder
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 3,
                            borderRadius: "30px",
                            // backgroundColor: classDetails.isAvailable ? "black" : "#E0E0E0",
                            backgroundColor: "black",
                            // color: classDetails.isAvailable ? "white" : "#757575",
                            color: "white",
                            // "&:hover": {
                            //     backgroundColor: classDetails.isAvailable ? "#333" : "#E0E0E0"
                            // }
                            "&:hover": {
                                backgroundColor: "#333"
                            }
                        }}
                        onClick={handleCheckIn}
                        // disabled={loading || !classDetails.isAvailable}
                        disabled={loading}
                    >
                        {loading ? "Checking In..." : "Check In"}
                    </Button>
                </>
            ) : (
                <Typography sx={{ mt: 4 }}>Loading...</Typography>
            )}
        </Container>
    );
}

export default ClassDetails;