import { useNavigate, useLocation } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

function CheckinSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve student name and class name from state
    const studentName = location.state?.studentName || "Student";
    const studentEmail = location.state?.email || "";
    const className = location.state?.className || "Class";

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", paddingY: 5 }}>
            {/* Success Icon */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "green" }} />
            </Box>

            {/* Success Message */}
            <Typography variant="h5" fontWeight="bold">
                You are successfully checkin in for {className}! Have a great workout!
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                What would you like to do next?
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        borderRadius: "30px",
                        backgroundColor: "black",
                        color: "white",
                        "&:hover": { backgroundColor: "#333" }
                    }}
                    onClick={() => navigate("/available-classes", {
                        state: { email: studentEmail }
                    })}
                >
                    Check Into Another Class
                </Button>

                <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                        borderRadius: "30px",
                        borderColor: "black",
                        color: "black",
                        "&:hover": { backgroundColor: "black", color: "white" }
                    }}
                    onClick={() => navigate("/checkin")}
                >
                    Done
                </Button>
            </Box>
        </Container>
    );
}

export default CheckinSuccess;