import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    Button,
    TextField,
    Container,
    Paper,
    Typography
} from "@mui/material";
import MuiPhoneNumber from 'mui-phone-number';

function GuestCheckin() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            const response = await fetch("http://localhost:8000/api/guest_checkin/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ firstName, lastName, email }),
            });

            const data = await response.json();

            if (data.success) {
                navigate("/available-classes", { state: { firstName, lastName, email, isGuest: true } });
            } else {
                setError(data.message || "Oops! An error occurred. Please try again.");
            }
        } catch (error) {
            console.error("Guest Check-In Error:", error);
            setError("Oops! An error occurred. Please try again.");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: "center", mt: 5 }}>
                <Typography variant="h5" fontWeight="bold">
                    Guest Check-In
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                    Please fill out this form.
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField label="First Name" placeholder="Enter your first name" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth margin="normal" required />
                    <TextField label="Last Name" placeholder="Enter your last name" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth margin="normal" required />
                    <TextField label="Email" placeholder="Enter your email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" required />
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

export default GuestCheckin;