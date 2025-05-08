import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    InputLabel,
    Alert,
    Checkbox,
    FormControlLabel,
    CircularProgress,
} from "@mui/material";
import pdf from "../assets/pdfTest.pdf"; // Update this path as needed

const WaiverMember = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        date: "",
        signature: "",
        under18: false,
        parentName: "",
        parentSignature: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        console.log('alan deez nuts')
        e.preventDefault();
        setError("");

        const { fullName, date, signature, under18, parentName, parentSignature } = formData;

        if (!fullName || !date || !signature) {
            setError("Please fill out all required fields.");
            return;
        }

        if (under18 && (!parentName || !parentSignature)) {
            setError("Parent name and signature are required for minors.");
            return;
        }

        console.log("📤 Simulating submission:", formData);
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <Box sx={{ overflowY: "scroll", height: "100vh" }}>
            <Container maxWidth="md" disableGutters sx={{ px: 4, py: 3 }}>
                {submitted ? (
                    <>
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: "center" }}>
                            Waiver Received!
                        </Typography>
                        <Typography variant="body1" textAlign="center">
                            Thank you for submitting your waiver. You're all set.
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="h4" fontWeight="bold" mb={3} sx={{ display: "flex", justifyContent: "center" }}>
                            Waiver Form
                        </Typography>
                        <Typography variant="body1" mb={4} sx={{ display: "flex", justifyContent: "center" }}>
                            Please read through the form and ensure you understand all terms before signing.
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 10 }}>
                            <embed src={pdf} width="100%" height="800px" type="application/pdf" style={{ borderRadius: 8 }} />

                            <Box>
                                <InputLabel>Participant's Full Name</InputLabel>
                                <TextField
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    placeholder="Enter full name"
                                />
                            </Box>

                            <Box>
                                <InputLabel>Date</InputLabel>
                                <TextField
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                />
                            </Box>

                            <Box>
                                <InputLabel>Sign Here</InputLabel>
                                <TextField
                                    name="signature"
                                    value={formData.signature}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    placeholder="Enter full name to sign"
                                />
                            </Box>

                            <FormControlLabel
                                control={
                                    <Checkbox name="under18" checked={formData.under18} onChange={handleChange} />
                                }
                                label="I am under 18 years old"
                            />

                            {formData.under18 && (
                                <>
                                    <Box>
                                        <InputLabel>Parent/Guardian Name</InputLabel>
                                        <TextField
                                            name="parentName"
                                            value={formData.parentName}
                                            onChange={handleChange}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            placeholder="Enter parent/guardian name"
                                        />
                                    </Box>

                                    <Box>
                                        <InputLabel>Parent/Guardian Signature</InputLabel>
                                        <TextField
                                            name="parentSignature"
                                            value={formData.parentSignature}
                                            onChange={handleChange}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            placeholder="Enter full name to sign"
                                        />
                                    </Box>
                                </>
                            )}

                            <Typography variant="body2" mt={2}>
                                By clicking "I Agree" below, you agree to be bound by the waiver terms.
                            </Typography>
                            {/* Fixed Submit Button */}
                            <Box
                                sx={{
                                    position: "fixed",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    p: 2,
                                    borderTop: "1px solid #ddd",
                                    backgroundColor: "#fff",
                                    zIndex: 10,
                                }}
                            >
                                <Container maxWidth="md" disableGutters>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            backgroundColor: "black",
                                            color: "white",
                                            borderRadius: 2,
                                            "&:hover": { backgroundColor: "#333" },
                                        }}
                                    >
                                        {loading ? (
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                                Submitting...
                                            </Box>
                                        ) : (
                                            "I Agree"
                                        )}
                                    </Button>
                                </Container>
                            </Box>
                        </Box>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default WaiverMember;
