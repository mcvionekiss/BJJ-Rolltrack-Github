import React from 'react';
import { TextField, Box } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';

const PersonalInfoForm = ({ value, onChange, errors = {} }) => {
  const handleChange = (e) => {
    onChange((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (phone) => {
    onChange((prev) => ({
      ...prev,
      phone,
    }));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        name="firstName"
        label="First Name"
        value={value.firstName}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.firstName}
        helperText={errors.firstName}
      />
      <TextField
        name="lastName"
        label="Last Name"
        value={value.lastName}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.lastName}
        helperText={errors.lastName}
      />
      <TextField
        name="email"
        label="Email"
        value={value.email}
        onChange={handleChange}
        fullWidth
        disabled
        required
      />
      <MuiTelInput
        defaultCountry="US"
        onlyCountries={['US']}
        forceCallingCode
        readOnlyCountryCode
        label="Phone Number"
        variant="outlined"
        value={value.phone}
        onChange={handlePhoneChange}
        fullWidth
      />
    </Box>
  );
};

export default PersonalInfoForm;