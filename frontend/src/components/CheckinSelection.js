import { useNavigate } from "react-router-dom";
import {
    Button,
    Divider,
    Container,
    Stack,
    Typography
} from "@mui/material";

function CheckinSelection() {
    // TODO: Change to the actual gym name
    const GYM_NAME = "Elite Jiu-Jitsu";
    const navigate = useNavigate();

    return (
        <Container 
            maxWidth="sm" 
            sx={{ 
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '100vh'
            }}
        >
            <Typography 
                variant="h4" 
                sx={{ 
                    mb: 4, 
                    fontWeight: "bold",
                    color: "#333"
                }}
            >
                Welcome to {GYM_NAME}
            </Typography>
            
            <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 5 }}
            >
                Please select an option
            </Typography>
            
            <Stack spacing={3} sx={{ mb: 4, width: '100%', maxWidth: '400px' }}>
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate("/checkin")}
                    fullWidth
                    sx={{ 
                        py: 1.5,
                        backgroundColor: "black", 
                        color: "white",
                        borderRadius: 2,
                        "&:hover": { 
                            backgroundColor: "#333"
                        }
                    }}
                >
                    Member Login
                </Button>
                
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate("/member-signup")}
                    fullWidth
                    sx={{ 
                        py: 1.5,
                        backgroundColor: "black", 
                        color: "white",
                        borderRadius: 2,
                        "&:hover": { 
                            backgroundColor: "#333"
                        }
                    }}
                >
                    Member Sign Up
                </Button>
            </Stack>

            <Divider sx={{ my: 3, width: '100%', maxWidth: '400px' }}>
                <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>
            
            <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate("/guest-checkin")}
                fullWidth
                sx={{ 
                    py: 1.5,
                    borderColor: "black", 
                    color: "black",
                    borderRadius: 2,
                    borderWidth: 2,
                    maxWidth: '400px',
                    "&:hover": { 
                        backgroundColor: "black", 
                        color: "white",
                        borderColor: "black",
                        borderWidth: 2
                    }
                }}
            >
                Guest Check-In
            </Button>
        </Container>
    );
}

export default CheckinSelection;