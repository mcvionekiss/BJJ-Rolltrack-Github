import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Container,
  CircularProgress
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import { Document, Page, pdfjs } from 'react-pdf';
import { pdf, BlobProvider } from '@react-pdf/renderer';
import PDFWaiverTemplate from './PDFWaiverTemplate';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF.js worker with a reliable source URL
// Use a fixed CDN URL to avoid "Headers: Invalid name" error and "Invalid `workerSrc` type" error
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const WaiverSetup = ({ formData, setFormData }) => {
  const [waiverType, setWaiverType] = useState(formData.waiverType || "default");
  const [waiverFileName, setWaiverFileName] = useState(formData.waiverFileName || "");
  const [previewError, setPreviewError] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState(null);
  const fileInputRef = useRef();
  
  // Prepare address from form data
  const gymAddressForWaiver = useMemo(() => {
    return formData.address && formData.city && formData.state ? 
      `${formData.address}, ${formData.city}, ${formData.state}` : 
      "Your Gym Address";
  }, [formData.address, formData.city, formData.state]);
  
  // Format gym name for waiver display
  const gymNameForWaiver = formData.waiverGymName || formData.gymName || "[GYM NAME]";
  
  // Function to generate PDF from template
  const generatePdf = useCallback(async () => {
    try {
      const gymName = formData.waiverGymName || formData.gymName || "Your Gym Name";
      const pdfDoc = <PDFWaiverTemplate 
        gymName={gymName} 
        gymAddress={gymAddressForWaiver} 
      />;
      
      // Generate PDF blob
      const blob = await pdf(pdfDoc).toBlob();
      setGeneratedPdfBlob(blob);
      return blob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPreviewError("Error generating PDF template");
      return null;
    }
  }, [formData.waiverGymName, formData.gymName, gymAddressForWaiver]);
  
  // Options for PDF.js with defensive configuration
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
    withCredentials: false,
    httpHeaders: {} // Empty headers to avoid potential conflicts
  }), []);
  
  // Convert file to blob URL for safer handling
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  
  // Load PDF file from formData and create safe blob URL
  useEffect(() => {
    if (formData.waiverFile && waiverType === "custom") {
      setPdfFile(formData.waiverFile);
      
      // Create a blob URL for the file to avoid network issues
      if (formData.waiverFile instanceof File) {
        const fileUrl = URL.createObjectURL(formData.waiverFile);
        setPdfBlobUrl(fileUrl);
      }
    }
    
    // Clean up blob URL on unmount or when file changes
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [formData.waiverFile, waiverType]);
  
  // Generate PDF once on initial render and when necessary values change
  useEffect(() => {
    if (waiverType === "default") {
      generatePdf();
    }
    // Only run this effect when waiver type changes to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiverType]);

  // Handle waiver type selection
  const handleWaiverTypeChange = (event) => {
    setWaiverType(event.target.value);
    
    // Reset pageNumber and clear errors
    setPageNumber(1);
    setPreviewError("");
    
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
    setPageNumber(1);
    setPdfFile(null);
    setFormData({
      ...formData,
      waiverType: "default",
      waiverGymName: formData.waiverGymName || formData.gymName || "",
    });
  };

  // Handle gym name changes for default template
  const handleGymNameChange = (event) => {
    // Update the form data
    setFormData({
      ...formData,
      waiverGymName: event.target.value,
    });
    
    // Clear any previous error
    setPreviewError("");
    
    // Manually trigger PDF regeneration after a short delay
    setTimeout(() => generatePdf(), 100);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setWaiverFileName(file.name);
      setPreviewError("");
      setPdfFile(file);
      setPageNumber(1);
      
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

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Navigate through PDF pages
  const changePage = (offset) => {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber > 0 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  // Regenerate PDF before download
  const handleRegeneratePdf = useCallback(() => {
    if (waiverType === "default") {
      return generatePdf();
    }
    return Promise.resolve(null);
  }, [waiverType, generatePdf]);

  // Download the waiver
  const handleDownload = async () => {
    if (waiverType === "custom" && pdfFile) {
      // For custom PDF, create a download link
      const url = URL.createObjectURL(pdfFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = waiverFileName || "waiver.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (waiverType === "default") {
      // Generate PDF from the template and download it
      setIsGeneratingPdf(true);
      try {
        // Always generate a fresh PDF for download to ensure latest data
        const blob = await generatePdf();
        
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${formData.waiverGymName || formData.gymName || 'Gym'}_Waiver.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          throw new Error("Failed to generate PDF");
        }
      } catch (error) {
        console.error("Error downloading PDF:", error);
        setPreviewError("Error generating PDF for download");
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };

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

  // Render the PDF viewer for custom uploaded PDFs
  const renderCustomPdfViewer = () => {
    if (!pdfFile) return null;
    
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          height: "420px",
          overflow: "auto",
          backgroundColor: "#f8f8f8"
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Document
            file={pdfBlobUrl || pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error("Error loading PDF:", error);
              setPreviewError("Error loading PDF: " + error.message);
            }}
            loading={<CircularProgress />}
            noData={<Typography>PDF file not available for preview.</Typography>}
            error={<Typography color="error">Failed to load PDF preview.</Typography>}
            options={pdfOptions}
          >
            <Page
              pageNumber={pageNumber}
              width={450}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
          
          {numPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
              <Button 
                onClick={() => changePage(-1)} 
                disabled={pageNumber <= 1}
                size="small"
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ mx: 2 }}>
                Page {pageNumber} of {numPages}
              </Typography>
              <Button 
                onClick={() => changePage(1)} 
                disabled={pageNumber >= numPages}
                size="small"
              >
                Next
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    );
  };

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
              <Typography variant="body2" sx={{ mb: 0.5, mt: 1, color: "text.secondary", fontSize: '0.75rem' }}>
                The gym address from your details will be automatically included
              </Typography>
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
            startIcon={isGeneratingPdf ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            onClick={async () => {
              await handleRegeneratePdf();
              handleDownload();
            }}
            size="small"
            disabled={isGeneratingPdf || (waiverType === "custom" && !pdfFile)}
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": { backgroundColor: "#333" },
              mt: 1
            }}
          >
            {isGeneratingPdf ? "Generating..." : "Download Waiver"}
          </Button>
        </Box>

        {/* Right Column - Preview */}
        <Box sx={{ flex: 1.5, minWidth: { xs: '100%', md: '60%' } }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
            Waiver Preview
          </Typography>

          {waiverType === "default" ? (
            // For default template, show either a PDF preview or text preview
            <BlobProvider document={<PDFWaiverTemplate 
              gymName={gymNameForWaiver} 
              gymAddress={gymAddressForWaiver}
            />}>
              {({ blob, url, loading, error }) => {
                if (loading) {
                  return (
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        height: "420px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <CircularProgress size={40} />
                    </Paper>
                  );
                }
                
                if (error || !url) {
                  // Fall back to text preview if PDF rendering fails
                  return (
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        height: "420px",
                        overflow: "auto",
                        backgroundColor: "#f8f8f8",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        fontSize: "0.75rem"
                      }}
                    >
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
                        {error && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            PDF preview not available. Using text preview instead.
                          </Alert>
                        )}
                      </Box>
                    </Paper>
                  );
                }
                
                // Show PDF preview
                return (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      height: "420px",
                      overflow: "auto",
                      backgroundColor: "#f8f8f8"
                    }}
                  >
                    <Document
                      file={url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => setPreviewError("Error loading PDF preview: " + error.message)}
                      options={pdfOptions}
                    >
                      <Page
                        pageNumber={pageNumber}
                        width={450}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </Document>
                    
                    {numPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                        <Button 
                          onClick={() => changePage(-1)} 
                          disabled={pageNumber <= 1}
                          size="small"
                        >
                          Previous
                        </Button>
                        <Typography variant="body2" sx={{ mx: 2 }}>
                          Page {pageNumber} of {numPages}
                        </Typography>
                        <Button 
                          onClick={() => changePage(1)} 
                          disabled={pageNumber >= numPages}
                          size="small"
                        >
                          Next
                        </Button>
                      </Box>
                    )}
                  </Paper>
                );
              }}
            </BlobProvider>
          ) : pdfFile ? (
            // PDF viewer for uploaded PDF files
            renderCustomPdfViewer()
          ) : (
            // No waiver selected yet (custom type with no file)
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: "420px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f8f8f8"
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Please upload a PDF waiver
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default WaiverSetup;