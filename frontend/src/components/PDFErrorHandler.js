import React, { useEffect } from 'react';

/**
 * PDFErrorHandler - Component to handle and suppress PDF.js errors
 * 
 * This component monitors for uncaught errors in PDF.js, especially the
 * "Failed to construct 'Headers': Invalid name" error, and prevents them
 * from being logged to the console.
 */
const PDFErrorHandler = ({ children }) => {
  useEffect(() => {
    // Original console.error function
    const originalConsoleError = console.error;
    
    // Error patterns to suppress
    const errorPatterns = [
      'Failed to construct \'Headers\': Invalid name',
      'PDFNetworkStreamFullRequestReader._onHeadersReceived',
      'NetworkManager.onStateChange'
    ];
    
    // Original window.onerror handler
    const originalOnError = window.onerror;
    
    // Intercept console.error to suppress specific PDF.js errors
    console.error = function(...args) {
      // Check if this is a PDF.js error we want to suppress
      const errorMessage = args.join(' ');
      const isPDFJSError = errorPatterns.some(pattern => errorMessage.includes(pattern));
      
      if (isPDFJSError) {
        // Log a simplified message for debugging
        originalConsoleError.call(console, '[PDF.js Headers Error] Suppressed. PDF display should still work.');
        
        // Optional: log details to a more detailed log for debugging
        if (process.env.NODE_ENV === 'development') {
          originalConsoleError.call(console, '[PDF.js Error Details]', ...args);
        }
        return;
      }
      
      // Pass through all other errors normally
      originalConsoleError.call(console, ...args);
    };
    
    // Intercept window.onerror to handle unhandled PDF.js errors
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if this is a PDF.js error we want to handle
      if (source && source.includes('pdf.worker') || 
          (message && errorPatterns.some(pattern => message.toString().includes(pattern)))) {
        console.log('[PDF.js Unhandled Error] Suppressed to prevent app crashes');
        return true; // Prevents the error from propagating
      }
      
      // Call the original handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
    
    // Add errorhandler for unhandledrejection (Promise errors)
    const handleUnhandledRejection = (event) => {
      if (event.reason && 
          errorPatterns.some(pattern => event.reason.toString().includes(pattern))) {
        event.preventDefault();
        console.log('[PDF.js Promise Error] Suppressed');
        return true;
      }
      return false;
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Clean up when component unmounts
    return () => {
      console.error = originalConsoleError;
      window.onerror = originalOnError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
};

export default PDFErrorHandler;