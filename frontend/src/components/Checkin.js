import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
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
            const response = await axios.post("http://localhost:8000/api/check_student/", { email });

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
            </Paper>
        </Container>
    );
}

export default Checkin;