import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Paper,
  Alert,
  Container
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import ArticleIcon from "@mui/icons-material/Article";

const WaiverSetup = ({ formData, setFormData }) => {
  const [waiverType, setWaiverType] = useState(formData.waiverType || "default");
  const [waiverFileName, setWaiverFileName] = useState(formData.waiverFileName || "");
  const [previewError, setPreviewError] = useState("");
  const fileInputRef = useRef();

  // Handle waiver type selection
  const handleWaiverTypeChange = (event) => {
    setWaiverType(event.target.value);
    
    // If switching to default template, initialize waiverGymName if not set
    if (event.target.value === "default" && !formData.waiverGymName) {
      setFormData({
        ...formData,
        waiverType: event.target.value,
        waiverGymName: formData.gymName || "", // Autofill with gym name
      });
    } else {
      setFormData({
        ...formData,
        waiverType: event.target.value,
      });
    }
  };

  // Handle reverting from custom to default template
  const handleRevertToTemplate = () => {
    setWaiverType("default");
    setFormData({
      ...formData,
      waiverType: "default",
      waiverGymName: formData.waiverGymName || formData.gymName || "",
    });
  };

  // Handle gym name changes for default template
  const handleGymNameChange = (event) => {
    setFormData({
      ...formData,
      waiverGymName: event.target.value,
    });
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setWaiverFileName(file.name);
      setPreviewError("");
      
      // Store filename in form data
      setFormData({
        ...formData,
        waiverFileName: file.name,
        waiverFile: file, // In a real implementation, you'd handle file storage properly
      });
      
      // In a real implementation, you would handle the file upload to a server
      console.log("File selected:", file.name);
    } else {
      setPreviewError("Please select a valid PDF file");
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Mock function to download the waiver
  const handleDownload = () => {
    // In a real implementation, this would generate and download the PDF
    console.log("Downloading waiver...");
    alert("In a production environment, this would download the waiver as a PDF.");
  };

  // Format gym name for waiver display (without markers)
  const gymNameForWaiver = formData.waiverGymName || formData.gymName || "[GYM NAME]";

  // Mock content for the default waiver template (without markers for bold text)
  const defaultWaiverContent = `
    MARTIAL ARTS WAIVER AND RELEASE OF LIABILITY

    In consideration of being allowed to participate in any way in the programs, events, and activities of
    ${gymNameForWaiver}, I acknowledge, understand, and agree that:

    1. Participation in martial arts activities involves risks of injury, disability, or death.
    2. I KNOWINGLY AND FREELY ASSUME ALL SUCH RISKS, both known and unknown.
    3. I, for myself and on behalf of my heirs, assigns, personal representatives and next of kin, 
       HEREBY RELEASE AND HOLD HARMLESS ${gymNameForWaiver}, 
       its officers, officials, agents, employees, other participants, and sponsors, WITH RESPECT TO ANY AND 
       ALL INJURY, DISABILITY, DEATH, or loss or damage to person or property.
    4. I understand the nature of martial arts activities and believe I am qualified to participate.
    5. I have read this waiver, fully understand its terms, and sign it freely and voluntarily.

    ...

    Member Signature: ________________________
    Date: __________
  `;

  return (
    <Container sx={{ maxWidth: '100%'}}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Column - Settings */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '40%' } }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
            Select how you want to handle the waiver for new gym members:
          </Typography>

          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 1.5, mb: 2, bgcolor: '#f9f9f9' }}>
            <RadioGroup
              value={waiverType}
              onChange={handleWaiverTypeChange}
              sx={{ mb: 0.5 }}
            >
              <FormControlLabel
                value="default"
                control={<Radio />}
                label={<Typography variant="body2" fontWeight="medium">Use default martial arts waiver template</Typography>}
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label={<Typography variant="body2" fontWeight="medium">Upload your own waiver PDF</Typography>}
              />
            </RadioGroup>
          </Box>

          {waiverType === "default" && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Customize the default waiver with your gym name:
              </Typography>
              <TextField
                fullWidth
                label="Gym Name for Waiver"
                name="waiverGymName"
                value={formData.waiverGymName || formData.gymName || ""}
                onChange={handleGymNameChange}
                placeholder={formData.gymName || "Enter gym name"}
                margin="normal"
                size="small"
                helperText="This name will appear in bold in the waiver document"
              />
            </Box>
          )}

          {waiverType === "custom" && (
            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={handleUploadClick}
                  size="small"
                  sx={{ mb: 0.5 }}
                >
                  Select PDF Waiver
                </Button>
                
                {waiverFileName && (
                  <Typography variant="body2" sx={{ ml: 1, fontSize: '0.75rem' }}>
                    Selected file: {waiverFileName}
                  </Typography>
                )}
                
                {previewError && <Alert severity="error" sx={{ py: 0.5, fontSize: '0.75rem' }}>{previewError}</Alert>}
                
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleRevertToTemplate}
                  size="small"
                  sx={{ alignSelf: 'start', mt: 0.5 }}
                >
                  Revert to Default Template
                </Button>
              </Box>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            size="small"
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": { backgroundColor: "#333" },
              mt: 1
            }}
          >
            Download Waiver
          </Button>
        </Box>

        {/* Right Column - Preview */}
        <Box sx={{ flex: 1.5, minWidth: { xs: '100%', md: '60%' } }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
            Waiver Preview
          </Typography>

          <Paper
            elevation={2}
            sx={{
              p: 2,
              height: "300px",
              overflow: "auto",
              backgroundColor: "#f8f8f8",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              fontSize: "0.75rem"
            }}
          >
        {waiverType === "default" ? (
          // Enhanced preview with direct formatting for better Docker compatibility
          <Box sx={{ 
            fontFamily: "monospace", 
            whiteSpace: "pre-wrap", 
            fontSize: "0.875rem",
            lineHeight: 1.5
          }}>
            {defaultWaiverContent
              .split(gymNameForWaiver)
              .reduce((prev, current, i) => {
                if (i === 0) return [current];
                return [...prev, 
                  <span key={`gym-${i}`} style={{ fontWeight: 800, display: 'inline' }}>
                    {gymNameForWaiver}
                  </span>, 
                  current
                ];
              }, [])
            }
          </Box>
        ) : waiverFileName ? (
          // Enhanced mock preview of uploaded PDF with page simulation
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
            <Box 
              sx={{ 
                width: '100%', 
                height: '300px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                mb: 2
              }}
            >
              <Box sx={{ 
                bgcolor: '#f1f1f1', 
                borderBottom: '1px solid #ccc',
                p: 1,
                display: 'flex',
                justifyContent: 'center'
              }}>
                <Typography variant="caption">{waiverFileName}</Typography>
              </Box>
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 2,
                bgcolor: 'white' 
              }}>
                <ArticleIcon sx={{ fontSize: 80, color: "primary.main", opacity: 0.7 }} />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                p: 1,
                borderTop: '1px solid #ccc',
                bgcolor: '#f1f1f1',
              }}>
                <Typography variant="caption">Page 1 of 1</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              PDF preview simulation - actual PDF viewer would be integrated in production
            </Typography>
          </Box>
        ) : (
          // No waiver selected yet
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {waiverType === "custom"
                ? "Please upload a PDF waiver"
                : "Please enter your gym name to customize the waiver"}
            </Typography>
          </Box>
        )}
      </Paper>

        </Box>
      </Box>
    </Container>
  );
};

export default WaiverSetup;