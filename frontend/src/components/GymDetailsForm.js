import React from 'react';
import { TextField, Box } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import AddressAutocomplete from './AddressAutocomplete';

const GymDetailsForm = ({ value, onChange, errors = {} }) => {
  const handleChange = (e) => {
    onChange((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (gymPhone) => {
    onChange((prev) => ({
      ...prev,
      gymPhone,
    }));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        name="gymName"
        label="Gym Name"
        value={value.gymName}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.gymName}
        helperText={errors.gymName}
      />
      <AddressAutocomplete
        addressValue={value.address}
        cityValue={value.city}
        stateValue={value.state}
        onAddressSelect={(address, city, state) =>
          onChange((prev) => ({
            ...prev,
            address,
            city,
            state,
          }))
        }
      />
      <TextField
        name="gymEmail"
        label="Gym Email"
        value={value.gymEmail}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.gymEmail}
        helperText={errors.gymEmail}
      />
      <MuiTelInput
        defaultCountry="US"
        onlyCountries={['US']}
        forceCallingCode
        readOnlyCountryCode
        label="Gym Phone Number"
        variant="outlined"
        value={value.gymPhone}
        onChange={handlePhoneChange}
        fullWidth
        required
      />
    </Box>
  );
};

export default GymDetailsForm;