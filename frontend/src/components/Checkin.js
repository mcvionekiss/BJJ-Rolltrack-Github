import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import {
    Button,
    TextField,
    Container,
    Paper,
    Typography
} from "@mui/material";

function Checkin() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            // TODO: CHANGE THIS TO RUN LOCALLY
            const response = await axios.post("http://192.168.2.1:8000/api/check_student/", { email });

            if (response.data.exists) {
                console.log("✅ Student found:", response.data);
                navigate("/available-classes", { state: { email } });
            }
        } catch (error) {
            console.error("🔴 Student not found:", error.response?.data?.message || "Error checking student.");
            setError("Email not found. Please try again or contact an instructor.");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
                <Typography variant="h5" fontWeight="bold">
                    Check-In
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                    Enter your email to check in.
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2, backgroundColor: "black", color: "white" }}
                    >
                        Continue
                    </Button>
                </form>

                <Button
                    type="submit"
                    variant="contained"
                    onClick={() => navigate("/guest-checkin")}
                    fullWidth
                    sx={{ mt: 2, backgroundColor: "black", color: "white" }}
                >
                    Guest Check-in
                </Button>
            </Paper>
        </Container>
    );
}

export default Checkin;