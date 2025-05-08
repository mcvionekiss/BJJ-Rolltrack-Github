import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TemplateIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axios from 'axios';

// Update this to your actual API URL
const API_BASE_URL = 'http://localhost:8000';

// Configure axios defaults globally
axios.defaults.withCredentials = false;

// Helper function to map API template to frontend format
const mapApiTemplateToFrontend = (apiTemplate) => {
  return {
    id: apiTemplate.id,
    name: apiTemplate.name,
    instructor: apiTemplate.instructor || '',
    level_id: apiTemplate.level_id || 'Fundamentals',
    duration_minutes: apiTemplate.duration_minutes || 60,
    max_capacity: apiTemplate.max_capacity || 20,
    description: apiTemplate.description || '',
    age: apiTemplate.age || 'Adult',
    // Add recurrence properties if they exist in the API template
    isRecurring: apiTemplate.is_recurring || false,
    recurrenceType: apiTemplate.recurrence_type || 'weekly',
    recurrenceDays: apiTemplate.recurrence_days || null
  };
};

const ClassTemplateSelector = ({ onSelectTemplate, formData, disabled }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from the API
      const response = await axios.get(`${API_BASE_URL}/api/templates/`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const apiTemplates = response.data;
      
      // Convert API templates to frontend format
      const frontendTemplates = apiTemplates.map(mapApiTemplateToFrontend);
      
      setTemplates(frontendTemplates);
      console.log('Templates loaded from API:', frontendTemplates);
    } catch (err) {
      console.error('Error fetching templates from API:', err);
      // Fallback to mock data for development
      const mockTemplates = [
        { id: 1, name: 'Adult Fundamentals', level_id: 'Fundamentals', instructor: 'John Smith', duration_minutes: 60, max_capacity: 20, age: 'Adult' },
        { id: 2, name: 'Adult Advanced', level_id: 'Advanced', instructor: 'Sarah Johnson', duration_minutes: 90, max_capacity: 15, age: 'Adult' },
        { id: 3, name: 'Kids Beginners', level_id: 'Fundamentals', instructor: 'Mike Davis', duration_minutes: 45, max_capacity: 15, age: 'Child' }
      ];
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template && onSelectTemplate) {
        onSelectTemplate(template);
        // Show a brief success message
        setSuccessMessage(`Applied template: ${template.name}`);
        setShowSuccessAlert(true);
        
        // Automatically hide the success message after 3 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 3000);
      }
    }
  };

  const handleSaveAsTemplate = () => {
    // Use current class name as default template name if available
    if (formData?.title) {
      setNewTemplateName(formData.title);
    }
    setSaveDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      return;
    }

    setLoading(true);
    try {
      // Create template object from current form data
      const templateData = {
        name: newTemplateName,
        instructor: formData.instructor || '',
        level_id: formData.classLevel || 'Fundamentals',
        max_capacity: parseInt(formData.maxCapacity) || 20,
        duration_minutes: calculateDurationMinutes(formData.startTime, formData.endTime),
        age: formData.age || 'Adult',
        description: `${newTemplateName} class template`,
        // Add recurrence info if present in formData
        is_recurring: formData.isRecurring || false,
        recurrence_type: formData.recurrenceType || 'weekly',
        recurrence_days: formData.recurrenceDays || null
      };
            
      // Try to save to the API
      const response = await axios.post(`${API_BASE_URL}/api/templates/`, templateData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const apiTemplate = response.data;
      
      // Convert to frontend format
      const newTemplate = mapApiTemplateToFrontend(apiTemplate);
      
      console.log('Template saved to API:', newTemplate);
      
      // Add to local state
      setTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate.id);
      setSaveDialogOpen(false);
      setNewTemplateName('');
      
      // Show success message
      setSuccessMessage(`Template "${newTemplateName}" saved successfully to database`);
      setShowSuccessAlert(true);
      
      // Automatically hide the success message after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving template to API:', err);
      
      // Extract the error message
      const errorMsg = err.response?.data?.error || err.message;
      setError(`Failed to save template: ${errorMsg}`);
      
      // Show error message
      setSuccessMessage(`Error: ${errorMsg || 'Failed to save template'}`);
      setShowSuccessAlert(true);
      
      // Automatically hide the error message after 5 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate duration in minutes from start and end times
  const calculateDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 60; // Default to 60 minutes
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;
    
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    
    return hours * 60 + minutes;
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete from API
      await axios.delete(`${API_BASE_URL}/api/templates/${templateId}/`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Update local state
      const templateToDelete = templates.find(t => t.id === templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      if (selectedTemplate === templateId) {
        setSelectedTemplate('');
      }
      
      // Show success message
      if (templateToDelete) {
        setSuccessMessage(`Template "${templateToDelete.name}" deleted from database`);
        setShowSuccessAlert(true);
        
        // Automatically hide the success message after 3 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error deleting template from API:', err);
      
      // Extract the error message
      const errorMsg = err.response?.data?.error || err.message;
      setError(`Failed to delete template: ${errorMsg}`);
      
      // Show error message
      setSuccessMessage(`Error: ${errorMsg || 'Failed to delete template'}`);
      setShowSuccessAlert(true);
      
      // Automatically hide the error message after 5 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Get template details for the selected template
  const getTemplateDetails = () => {
    if (!selectedTemplate) return null;
    return templates.find(t => t.id === selectedTemplate);
  };

  const selectedTemplateDetails = getTemplateDetails();

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TemplateIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          Class Template
        </Typography>
        <Tooltip title="Templates allow you to quickly create classes with predefined settings">
          <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl fullWidth variant="outlined" size="small" disabled={disabled || loading}>
          <InputLabel>Select Template</InputLabel>
          <Select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            label="Select Template"
            startAdornment={loading && 
              <CircularProgress size={20} sx={{ mr: 1 }} />
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Tooltip title="Save current class settings as a template">
          <span>
            <Button
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveAsTemplate}
              disabled={disabled || !formData?.title || loading}
              size="small"
              sx={{ 
                backgroundColor: '#3788d8',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#2d6db3',
                },
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                SAVE AS TEMPLATE
              </Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                SAVE
              </Box>
            </Button>
          </span>
        </Tooltip>
      </Box>

      {selectedTemplateDetails && (
        <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Template Details
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block" color="text.secondary">Duration</Typography>
              <Typography variant="body2">{selectedTemplateDetails.duration_minutes} mins</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block" color="text.secondary">Level</Typography>
              <Typography variant="body2">{selectedTemplateDetails.level_id}</Typography>
            </Grid>
            {selectedTemplateDetails.instructor && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" color="text.secondary">Instructor</Typography>
                <Typography variant="body2">{selectedTemplateDetails.instructor}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save as Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Save the current class settings as a template to reuse them later.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="template-name"
            label="Template Name"
            fullWidth
            variant="outlined"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            helperText="Choose a descriptive name like 'Adult Intermediate Evening'"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveTemplate} 
            disabled={!newTemplateName.trim() || loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={3000}
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessAlert(false)} 
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassTemplateSelector; 