import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Divider,
  Alert,
  TextField,
  FormControl,
  FormLabel
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import axios from '../utils/axiosConfig';
import config from '../config';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF.js worker with a reliable source URL
// Use legacy build to avoid "Headers: Invalid name" error
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const MemberWaiverSignature = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gymData, setGymData] = useState(null);
  const [waiver, setWaiver] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [parentSignatureComplete, setParentSignatureComplete] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [parentInfo, setParentInfo] = useState({
    name: '',
    relationship: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  // Refs for signature pads
  const signaturePadRef = useRef();
  const parentSignaturePadRef = useRef();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get gym_id and member data from URL query parameters or location state
  const queryParams = new URLSearchParams(location.search);
  const gymId = queryParams.get("gym_id") || (location.state?.gymId ? location.state.gymId : null);
  const memberData = location.state?.memberData || null;

  // Determine if member is a minor (under 18)
  useEffect(() => {
    if (memberData && memberData.dob) {
      const birthDate = new Date(memberData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birth month hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setIsMinor(age < 18);
      console.log(`🔷 Member is ${age} years old - Minor: ${age < 18}`);
    }
  }, [memberData]);

  // Safe conversion of PDF URLs to blob URLs to avoid headers issues
  useEffect(() => {
    if (waiver?.waiver_type === 'custom' && waiver?.file_url) {
      // Create a blob URL from direct URL to avoid network issues
      const fetchPdfAsBlob = async () => {
        try {
          const response = await fetch(waiver.file_url, { 
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/pdf' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status}`);
          }
          
          const pdfBlob = await response.blob();
          const blobUrl = URL.createObjectURL(pdfBlob);
          setPdfBlobUrl(blobUrl);
        } catch (error) {
          console.error('Error converting PDF URL to blob:', error);
          setError(`Error loading PDF: ${error.message}`);
        }
      };
      
      fetchPdfAsBlob();
      
      // Clean up blob URL on unmount
      return () => {
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }
      };
    }
  }, [waiver]);

  // Fetch CSRF token and waiver data on component mount
  useEffect(() => {
    console.log("🔷 Member Waiver Signature component mounted");
    console.log(`🔷 Gym ID: ${gymId || 'Not provided'}`);
    
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(config.endpoints.auth.csrf);
        const token = response.data.csrfToken;
        setCsrfToken(token);
        console.log("🔷 CSRF token fetched successfully");
      } catch (error) {
        console.error("🔴 Error fetching CSRF token:", error);
        setError("Error fetching CSRF token. Please refresh the page.");
      }
    };
    
    const fetchGymAndWaiver = async () => {
      if (!gymId) {
        setError("No gym selected. Please return to the sign-up page.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch gym details
        const gymResponse = await axios.get(config.endpoints.api.gymDetails(gymId));
        setGymData(gymResponse.data);
        
        // Fetch waiver for this gym
        const waiverResponse = await axios.get(config.endpoints.api.getWaiver(gymId));
        setWaiver(waiverResponse.data);
        setPageNumber(1);
        
        setLoading(false);
      } catch (err) {
        console.error("🔴 Error fetching gym or waiver data:", err);
        
        // For prototype purposes - use placeholder data if API fails
        setGymData({
          name: "Sample Gym",
          address: "123 Main St, Anytown, USA"
        });
        
        // Create a default waiver template with the gym name
        setWaiver({
          waiver_type: "default",
          waiver_text: generateDefaultWaiverTemplate("Sample Gym", "123 Main St", "California"),
          gym_name: "Sample Gym"
        });
        
        setError("Could not fetch gym waiver. Using sample data instead.");
        setLoading(false);
      }
    };
    
    fetchCsrfToken();
    fetchGymAndWaiver();
    
    return () => {
      console.log("🔷 Member Waiver Signature component unmounted");
    };
  }, [gymId]);

  // Handle PDF document load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Navigate through PDF pages
  const changePage = (offset) => {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber > 0 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  // Handle member signature changes
  const handleSignatureEnd = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setSignatureComplete(true);
    } else {
      setSignatureComplete(false);
    }
  };

  // Handle parent/guardian signature changes
  const handleParentSignatureEnd = () => {
    if (parentSignaturePadRef.current && !parentSignaturePadRef.current.isEmpty()) {
      setParentSignatureComplete(true);
    } else {
      setParentSignatureComplete(false);
    }
  };

  // Clear signatures
  const clearSignature = (type) => {
    if (type === 'member' && signaturePadRef.current) {
      signaturePadRef.current.clear();
      setSignatureComplete(false);
    } else if (type === 'parent' && parentSignaturePadRef.current) {
      parentSignaturePadRef.current.clear();
      setParentSignatureComplete(false);
    }
  };

  // Handle parent info change
  const handleParentInfoChange = (e) => {
    const { name, value } = e.target;
    setParentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit signature and registration data
  const handleSubmit = async () => {
    // Validate signatures
    if (!signatureComplete) {
      setError("Please sign the waiver to continue");
      return;
    }
    
    if (isMinor && (!parentSignatureComplete || !parentInfo.name)) {
      setError("Parent/guardian signature and information required for minors");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get signature data URLs
      const memberSignatureData = signaturePadRef.current.toDataURL();
      const parentSignatureData = isMinor && parentSignaturePadRef.current ? 
        parentSignaturePadRef.current.toDataURL() : null;
      
      // Prepare data for submission
      const signaturePayload = {
        gymId: parseInt(gymId),
        memberSignatureData: memberSignatureData,
        memberData: memberData,
        waiverType: waiver.waiver_type,
        waiverVersion: waiver.version || 1,
        timestamp: new Date().toISOString(),
        // Include parent data if member is a minor
        isMinor: isMinor,
        parentName: parentInfo.name,
        parentRelationship: parentInfo.relationship,
        parentSignatureData: parentSignatureData
      };
      
      // Submit to API
      await axios.post(config.endpoints.api.submitWaiverSignature(), signaturePayload, {
        headers: {
          "X-CSRFToken": csrfToken
        }
      });
      
      // Navigate to success screen
      navigate(`/checkin?gym_id=${gymId}`, { 
        state: { 
          waiverSigned: true,
          memberName: memberData?.firstName || "Member",
          gymName: gymData?.name || "Gym"
        } 
      });
    } catch (error) {
      console.error("🔴 Error submitting signature:", error);
      setError("Error submitting signature. Please try again.");
      setSubmitting(false);
    }
  };
  
  // PDF options memoized to prevent unnecessary re-renders
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
  }), []);

  // Generate a default waiver template
  const generateDefaultWaiverTemplate = (gymName, address, state) => {
    return `
WAIVER AND RELEASE OF LIABILITY AGREEMENT

Participant Name: ____________________________
Date of Birth: ____________________________
Emergency Contact: ____________________________
Phone: ____________________________

This Waiver and Release of Liability ("Agreement") is entered into by and between the undersigned participant (or parent/guardian if under 18) and ${gymName}, located at ${address}.

1. Acknowledgment of Risk
I acknowledge that participation in martial arts including but not limited to Brazilian Jiu-Jitsu, Kickboxing, Muay Thai, Self-Defense, fitness conditioning, sparring, and any other physical activities involves inherent risks of injury, including but not limited to bruises, sprains, fractures, head injury, paralysis, or even death. These risks may arise from my own actions or the actions of others, including instructors, fellow participants, or third parties.

2. Voluntary Participation
I certify that I am voluntarily participating in these activities and assume all risks of injury, illness, or death. I understand that I am responsible for determining my physical and mental fitness to participate, and I affirm that I am in good health.

3. Release of Liability
In consideration for being allowed to participate in any and all activities, I hereby release, waive, and discharge ${gymName}, its owners, instructors, employees, volunteers, agents, affiliates, and sponsors from any and all liability, claims, demands, or causes of action arising out of or related to any loss, damage, or injury, including death, that may be sustained while participating in activities at or sponsored by ${gymName}.

4. Indemnification
I agree to indemnify and hold harmless ${gymName} and its affiliates from any loss, liability, damage, or costs they may incur due to my participation or that of my child in martial arts activities, whether caused by the negligence of the released parties or otherwise.

5. Medical Treatment Consent
In the event of injury, I authorize ${gymName} to obtain medical treatment deemed necessary for myself or my child. I understand that I am responsible for any medical costs incurred.

6. Use of Likeness
I grant permission to ${gymName} to use photographs, video recordings, or any other likeness of myself or my child for marketing and promotional purposes without compensation.

7. Severability
If any provision of this Agreement is found to be unenforceable, the remaining terms shall be enforced to the fullest extent permitted by law.

8. Governing Law
This Agreement shall be governed by the laws of the State of ${state}.

I HAVE READ AND UNDERSTAND THIS AGREEMENT, AND I AM SIGNING IT VOLUNTARILY.

Participant Signature: ____________________________
Date: ____________________________
Parent/Guardian Signature (if under 18): ____________________________
Date: ____________________________
    `;
  };

  // Render PDF preview for default or custom waiver
  const renderWaiverPreview = () => {
    if (!waiver) return null;
    
    if (waiver.waiver_type === "custom" && waiver.file_url) {
      // Render PDF preview for custom waiver
      return (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            maxHeight: "400px",
            overflow: "auto",
            backgroundColor: "#f8f8f8",
            mb: 2
          }}
        >
          {error && waiver.waiver_type === "custom" && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error} Showing text-based version instead.
            </Alert>
          )}
          
          {error && waiver.waiver_text ? (
            // Fallback to text display when PDF fails to load
            <Box sx={{ 
              whiteSpace: "pre-wrap", 
              fontFamily: "monospace", 
              fontSize: "0.75rem" 
            }}>
              {waiver.waiver_text}
            </Box>
          ) : (
            <Document
              file={pdfBlobUrl || waiver.file_url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error("Error loading PDF:", error);
                setError("Error loading PDF. Displaying text version if available.");
              }}
              options={{
                ...pdfOptions,
                withCredentials: false,
                cMapPacked: true
              }}
            >
              <Page 
                pageNumber={pageNumber} 
                width={450}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                error={(error) => (
                  <Typography color="error">
                    Error rendering page: {error.message}
                  </Typography>
                )}
                loading={<CircularProgress />}
              />
            </Document>
          )}
          
          {numPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
              <Button 
                variant="outlined" 
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
                variant="outlined"
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
    } else if (waiver.waiver_type === "default") {
      // Render default template preview
      return (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            maxHeight: "400px",
            overflow: "auto",
            backgroundColor: "#f8f8f8",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            fontSize: "0.75rem",
            mb: 2
          }}
        >
          {waiver.waiver_text}
        </Paper>
      );
    } else {
      // Fallback for no waiver or unsupported type
      return (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            height: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8f8f8",
            mb: 2
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Waiver Document
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary">
            No valid waiver document available from {gymData?.name || "the gym"}
          </Typography>
        </Paper>
      );
    }
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Membership Waiver
      </Typography>
      
      {gymData && (
        <Typography variant="h6" gutterBottom>
          {gymData.name}
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Typography variant="body1" paragraph>
            Please read the following waiver carefully. You{isMinor ? " and your parent/guardian" : ""} must sign at the bottom to complete your registration.
          </Typography>
          
          {isMinor && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Since you are under 18 years old, a parent or guardian must also sign this waiver.
            </Alert>
          )}
          
          {/* Waiver Preview */}
          {renderWaiverPreview()}
          
          {/* Legal Disclaimer */}
          <Alert severity="info" sx={{ mb: 4 }}>
            As with every legal agreement, you should always consult a lawyer before signing.
          </Alert>
          
          {/* Member Signature Section */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isMinor ? "Participant Signature" : "Signature"}
          </Typography>
          
          <Box 
            sx={{ 
              border: '1px solid #ccc', 
              borderRadius: 1,
              backgroundColor: '#fff',
              mb: 2
            }}
          >
            <SignatureCanvas
              ref={signaturePadRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
              onEnd={handleSignatureEnd}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Button
              variant="outlined"
              onClick={() => clearSignature('member')}
            >
              Clear
            </Button>
            <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
              {signatureComplete ? "Signature captured" : "Please sign above"}
            </Typography>
          </Box>
          
          {/* Parent/Guardian Section - Only displayed for minors */}
          {isMinor && (
            <>
              <Divider sx={{ mb: 4 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Parent/Guardian Information
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Name"
                  name="name"
                  value={parentInfo.name}
                  onChange={handleParentInfoChange}
                  required
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Relationship to Participant"
                  name="relationship"
                  placeholder="e.g., Mother, Father, Legal Guardian"
                  value={parentInfo.relationship}
                  onChange={handleParentInfoChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Parent/Guardian Signature
              </Typography>
              
              <Box 
                sx={{ 
                  border: '1px solid #ccc', 
                  borderRadius: 1,
                  backgroundColor: '#fff',
                  mb: 2
                }}
              >
                <SignatureCanvas
                  ref={parentSignaturePadRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas'
                  }}
                  onEnd={handleParentSignatureEnd}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => clearSignature('parent')}
                >
                  Clear
                </Button>
                <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
                  {parentSignatureComplete ? "Signature captured" : "Please sign above"}
                </Typography>
              </Box>
            </>
          )}
          
          <Divider sx={{ mb: 4 }} />
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !signatureComplete || 
                submitting || 
                (isMinor && (!parentSignatureComplete || !parentInfo.name))
              }
              sx={{ 
                backgroundColor: "black", 
                color: "white",
                "&:hover": { backgroundColor: "#333" }
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit & Complete Registration"}
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default MemberWaiverSignature;