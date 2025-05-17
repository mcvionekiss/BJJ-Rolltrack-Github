import React from "react";
import { Box, Typography, Button, Divider, List, ListItem, Stack } from '@mui/material';

const ConfirmRegistration = ({ formData, onEdit, onSubmit }) => {
  const sectionStyles = {
    section: {
      marginBottom: 1,
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mt: 2,
      mb: 1,
    },
    editButton: {
      color: 'text.secondary',
      textTransform: 'none',
      fontWeight: 500,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        color: 'black',
        background: 'transparent',
      }
    },
    sectionContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      textAlign: 'left',
    },
    infoItem: {
      display: 'flex',
      minWidth: '300px',
      my: 0.75,
      pl: 5,
    },
    label: {
      fontWeight: 500,
      mr: 1,
    },
    list: {
      pl: 2,
      m: 0,
    }
  };

  return (
    <Box>
      <Box sx={sectionStyles.section}>
        <Box sx={sectionStyles.sectionHeader}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>
          <Button 
            onClick={() => onEdit("personal")} 
            variant="text" 
            sx={sectionStyles.editButton}
          >
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={sectionStyles.sectionContent}>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Name:</Typography>
            <Typography>{formData.firstName} {formData.lastName}</Typography>
          </Box>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Email:</Typography>
            <Typography>{formData.email}</Typography>
          </Box>
          {formData.phone && (
            <Box sx={sectionStyles.infoItem}>
              <Typography sx={sectionStyles.label}>Phone Number:</Typography>
              <Typography>{formData.phone}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={sectionStyles.section}>
        <Box sx={sectionStyles.sectionHeader}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Gym Details</Typography>
          <Button 
            onClick={() => onEdit("gym")} 
            variant="text" 
            sx={sectionStyles.editButton}
          >
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={sectionStyles.sectionContent}>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Gym Name:</Typography>
            <Typography>{formData.gymName}</Typography>
          </Box>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Address:</Typography>
            <Typography>{formData.address}</Typography>
          </Box>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>City:</Typography>
            <Typography>{formData.city}</Typography>
          </Box>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>State:</Typography>
            <Typography>{formData.state}</Typography>
          </Box>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Gym Email:</Typography>
            <Typography>{formData.gymEmail}</Typography>
          </Box>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Gym Phone:</Typography>
            <Typography>{formData.gymPhoneNumber}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={sectionStyles.section}>
        <Box sx={sectionStyles.sectionHeader}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Schedule Details</Typography>
          <Button 
            onClick={() => onEdit("schedule")} 
            variant="text" 
            sx={sectionStyles.editButton}
          >
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={sectionStyles.sectionContent}>
          <List sx={sectionStyles.list}>
            {formData.schedule && formData.schedule.length > 0 ? (
              formData.schedule.map((entry, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <Typography>
                    {entry.day}:{" "} 
                    {entry.closed
                      ? "Closed"
                      : entry.openTime == null || entry.closeTime == null
                      ? "No schedule available"
                      : `${entry.openTime} - ${entry.closeTime}`}
                </Typography>
                </ListItem>
              ))
            ) : (
              <ListItem sx={{ py: 0.5 }}>
                <Typography>No schedule available</Typography>
              </ListItem>
            )}
          </List>
        </Box>
      </Box>

      <Box sx={sectionStyles.section}>
        <Box sx={sectionStyles.sectionHeader}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Waiver Information</Typography>
          <Button 
            onClick={() => onEdit("waiver")} 
            variant="text" 
            sx={sectionStyles.editButton}
          >
            Edit
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={sectionStyles.sectionContent}>
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Waiver Type:</Typography>
            <Typography>
              {formData.waiverType === "default" ? "Default Template" : "Custom Upload"}
            </Typography>
          </Box>
          
          {formData.waiverType === "default" ? (
            <Box sx={sectionStyles.infoItem}>
              <Typography sx={sectionStyles.label}>Gym Name on Waiver:</Typography>
              <Typography>
                {formData.waiverGymName || formData.gymName || "Not specified"}
              </Typography>
            </Box>
          ) : (
            <Box sx={sectionStyles.infoItem}>
              <Typography sx={sectionStyles.label}>Uploaded Waiver File:</Typography>
              <Typography>
                {formData.waiverFileName || "No file uploaded"}
              </Typography>
            </Box>
          )}
          
          <Box sx={sectionStyles.infoItem}>
            <Typography sx={sectionStyles.label}>Waiver Status:</Typography>
            <Typography>Ready for member sign-up</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ConfirmRegistration;