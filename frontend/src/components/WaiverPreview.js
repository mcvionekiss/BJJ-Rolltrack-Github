import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import config from '../config';

// Initialize PDF.js worker with a reliable source URL
// Use legacy build to avoid "Headers: Invalid name" error
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const WaiverPreview = ({ gymId, userId, onSigningComplete }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [waiverText, setWaiverText] = useState('');
  const [waiverType, setWaiverType] = useState('default');
  const [loading, setLoading] = useState(true);
  const [sigPadOpen, setSigPadOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');

  // Signature pad ref
  const sigPad = useRef(null);

  // PDF options memoized to prevent unnecessary re-renders
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
  }), []);
  
  // Convert PDF URL to Blob URL to avoid Header issues
  useEffect(() => {
    if (pdfUrl) {
      // Create a blob URL from direct URL to avoid network issues
      const fetchPdfAsBlob = async () => {
        try {
          const response = await fetch(pdfUrl, { 
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
          setError(`Error loading PDF: ${error.message}. Trying alternate display method.`);
        }
      };
      
      fetchPdfAsBlob();
    }
    
    // Clean up blob URL on unmount
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfUrl]);

  // Fetch waiver data when component mounts
  useEffect(() => {
    const fetchWaiver = async () => {
      if (!gymId) return;
      
      try {
        setLoading(true);
        
        const response = await axios.get(`${config.apiBaseUrl}/api/waivers/preview/${gymId}/`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data.success) {
          setWaiverType(response.data.waiver_type);
          
          if (response.data.waiver_type === 'default') {
            setWaiverText(response.data.waiver_text);
          } else if (response.data.waiver_type === 'custom') {
            setPdfUrl(response.data.file_url);
          }
        } else {
          // If no waiver found, show empty state
          setWaiverText('No waiver available for this gym.');
          setError('No waiver found');
        }
      } catch (err) {
        console.error('Error fetching waiver:', err);
        setError('Error loading waiver. Please try again later.');
        setWaiverText('Error loading waiver. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWaiver();
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

  // Open signature pad
  const handleOpenSignaturePad = () => {
    setSigPadOpen(true);
  };

  // Clear signature
  const clearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  // Submit signature
  const handleSubmitSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert('Please provide a signature');
      return;
    }
    
    try {
      setSigning(true);
      
      // Get signature as base64 encoded PNG
      const signatureImage = sigPad.current.toDataURL('image/png');
      
      // Submit signature to backend
      const response = await axios.post(`${config.apiBaseUrl}/api/waivers/signature/`, {
        gym_id: gymId,
        user_id: userId,
        signature_image: signatureImage
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.success) {
        if (onSigningComplete) {
          onSigningComplete(response.data.signature_id);
        }
      } else {
        setError('Failed to save signature. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting signature:', err);
      setError('Error submitting signature. Please try again later.');
    } finally {
      setSigning(false);
      setSigPadOpen(false);
    }
  };

  // Download waiver as PDF
  const handleDownloadWaiver = () => {
    if (waiverType === 'custom' && pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else if (waiverType === 'default') {
      // For default template, generate PDF from backend
      window.open(`${config.apiBaseUrl}/api/waivers/download/${gymId}/`, '_blank');
    }
  };

  // Render waiver content based on type
  const renderWaiverContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (waiverType === 'custom' && (pdfBlobUrl || pdfUrl)) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          {error ? (
            <Box p={3} border="1px solid #ddd" borderRadius="4px" mb={2} width="100%">
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
              {waiverText && (
                <Box 
                  sx={{ 
                    whiteSpace: "pre-wrap", 
                    fontFamily: "monospace", 
                    fontSize: "0.75rem",
                    mt: 2,
                    p: 2,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Showing text version instead:
                  </Typography>
                  {waiverText}
                </Box>
              )}
            </Box>
          ) : (
            <Document
              file={pdfBlobUrl || pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error("Error loading PDF:", error);
                setError(`Error loading PDF: ${error.message}. Showing text version if available.`);
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
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <Button 
                onClick={() => changePage(-1)} 
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <Typography mx={2}>
                Page {pageNumber} of {numPages}
              </Typography>
              <Button 
                onClick={() => changePage(1)} 
                disabled={pageNumber >= numPages}
              >
                Next
              </Button>
            </Box>
          )}
        </Box>
      );
    }

    if (waiverType === 'default' && waiverText) {
      return (
        <Box 
          component={Paper} 
          p={3} 
          mb={3} 
          maxHeight="400px" 
          overflow="auto"
          sx={{ 
            fontFamily: 'monospace', 
            fontSize: '0.9rem', 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6
          }}
        >
          {waiverText}
        </Box>
      );
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography>No waiver available</Typography>
      </Box>
    );
  };

  // Render signature pad
  const renderSignaturePad = () => {
    if (!sigPadOpen) return null;

    return (
      <Box mt={3} p={2} border="1px solid #ddd" borderRadius="4px">
        <Typography variant="h6" gutterBottom>Please sign below</Typography>
        
        <Box sx={{ 
          border: '1px solid #ccc', 
          backgroundColor: '#f9f9f9', 
          touchAction: 'none' 
        }}>
          <SignatureCanvas
            ref={sigPad}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas'
            }}
          />
        </Box>
        
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={clearSignature} sx={{ mr: 1 }}>
            Clear
          </Button>
          <Button 
            onClick={handleSubmitSignature} 
            variant="contained" 
            color="primary"
            disabled={signing}
          >
            {signing ? 'Submitting...' : 'Submit Signature'}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Waiver Agreement
      </Typography>
      
      {renderWaiverContent()}
      
      {waiverType === 'default' && (
        <Box mt={2} mb={3}>
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            As with every legal agreement, you should always consult a lawyer before implementing this waiver template at your gym.
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button 
          variant="outlined" 
          onClick={handleDownloadWaiver}
          disabled={loading || error}
        >
          Download Waiver
        </Button>
        
        {!sigPadOpen && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenSignaturePad}
            disabled={loading || error}
          >
            Sign Waiver
          </Button>
        )}
      </Box>
      
      {renderSignaturePad()}
    </Box>
  );
};

export default WaiverPreview;