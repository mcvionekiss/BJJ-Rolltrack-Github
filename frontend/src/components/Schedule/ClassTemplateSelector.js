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
      // In production this would use your actual API endpoint
      // For now, use mock data
      // Simulating API delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for development
      const mockTemplates = [
        { id: 1, name: 'Adult Fundamentals', level_id: 'Fundamentals', instructor: 'John Smith', duration_minutes: 60, max_capacity: 20, age: 'Adult' },
        { id: 2, name: 'Adult Advanced', level_id: 'Advanced', instructor: 'Sarah Johnson', duration_minutes: 90, max_capacity: 15, age: 'Adult' },
        { id: 3, name: 'Kids Beginners', level_id: 'Fundamentals', instructor: 'Mike Davis', duration_minutes: 45, max_capacity: 15, age: 'Child' }
      ];
      
      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      // Don't show error to users, just provide the mock data anyway
      const fallbackTemplates = [
        { id: 1, name: 'Adult Fundamentals', level_id: 'Fundamentals', instructor: 'John Smith', duration_minutes: 60, max_capacity: 20, age: 'Adult' },
        { id: 2, name: 'Adult Advanced', level_id: 'Advanced', instructor: 'Sarah Johnson', duration_minutes: 90, max_capacity: 15, age: 'Adult' },
        { id: 3, name: 'Kids Beginners', level_id: 'Fundamentals', instructor: 'Mike Davis', duration_minutes: 45, max_capacity: 15, age: 'Child' }
      ];
      setTemplates(fallbackTemplates);
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
        ...formData,
      };
      
      // For now, simulate response
      const newTemplate = {
        id: templates.length + 1,
        ...templateData
      };
      
      setTemplates([...templates, newTemplate]);
      setSelectedTemplate(newTemplate.id);
      setSaveDialogOpen(false);
      setNewTemplateName('');
      
      // Show success message
      setSuccessMessage(`Template "${newTemplateName}" saved successfully`);
      setShowSuccessAlert(true);
      
      // Automatically hide the success message after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setLoading(true);
    try {
      // Update local state
      const templateToDelete = templates.find(t => t.id === templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      if (selectedTemplate === templateId) {
        setSelectedTemplate('');
      }
      
      // Show success message
      if (templateToDelete) {
        setSuccessMessage(`Template "${templateToDelete.name}" deleted`);
        setShowSuccessAlert(true);
        
        // Automatically hide the success message after 3 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
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
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassTemplateSelector; 