import { useNavigate, useLocation } from "react-router-dom";
import { Container, Typography, Box, Button, Divider, Fade } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

function CheckinSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve student name and class name from state
    const studentName = location.state?.studentName || "Student";
    const studentEmail = location.state?.email || "";
    const className = location.state?.className || "Class";
    const checkinTime = location.state?.checkinTime ? new Date(location.state.checkinTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
    const classDate = location.state?.date ? new Date(location.state.date).toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'}) : "";
    const gymId = location.state?.gymId || ""; // Retrieve gymId from location state
    
    // Log for debugging
    console.log("CheckinSuccess - Retrieved gymId:", gymId);

    return (
        <Fade in={true} timeout={800}>
            <Container 
                maxWidth="sm" 
                sx={{ 
                    minHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingY: 5,
                    textAlign: "center"
                }}
            >
                {/* Success Icon */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <CheckCircleOutlineIcon 
                        sx={{ 
                            fontSize: 90, 
                            color: "#4CAF50",
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                        }} 
                    />
                </Box>

                {/* Success Message */}
                <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ 
                        mb: 3,
                        color: '#1e1e1e',
                        textShadow: '0px 1px 1px rgba(0,0,0,0.1)'
                    }}
                >
                    Check-In Complete!
                </Typography>

                {/* Class Details Card */}
                <Box 
                    sx={{ 
                        background: '#f5f5f5', 
                        borderRadius: 3, 
                        padding: 3, 
                        mb: 4,
                        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FitnessCenterIcon sx={{ mr: 1, color: '#555' }} />
                        <Typography variant="h6" fontWeight="medium" color="#333">
                            {className}
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <PersonIcon sx={{ mr: 1, color: '#555', fontSize: 20 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {studentName}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <AccessTimeIcon sx={{ mr: 1, color: '#555', fontSize: 20 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {checkinTime} - {classDate}
                        </Typography>
                    </Box>
                </Box>

                <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                        mb: 4,
                        fontWeight: 500,
                        fontStyle: 'italic'
                    }}
                >
                    Have a great workout! What would you like to do next?
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            py: 1.5,
                            borderRadius: "30px",
                            backgroundColor: "black",
                            color: "white",
                            fontWeight: 600,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                            "&:hover": { 
                                backgroundColor: "#333",
                                boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                        onClick={() => navigate("/available-classes", {
                            state: { email: studentEmail, gymId: gymId }
                        })}
                    >
                        Check Into Another Class
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                            py: 1.5,
                            borderRadius: "30px",
                            borderColor: "black",
                            borderWidth: 2,
                            color: "black",
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            "&:hover": { 
                                backgroundColor: "black", 
                                color: "white",
                                borderWidth: 2,
                                transform: 'translateY(-2px)'
                            }
                        }}
                        onClick={() => navigate(`/checkin${gymId ? `?gym_id=${gymId}` : ''}`)}
                    >
                        Done
                    </Button>
                </Box>
            </Container>
        </Fade>
    );
}

export default CheckinSuccess;