import { Box, Button, MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import { useEvents } from './EventContext';

const AddClassInformation = ({handleCancelButton, handleSubmit }) => {
    const { events, setEvents } = useEvents();

    const [age, setAge] = React.useState('');
    const handleChange = (event) => {
        setAge(event.target.value);
    };

    return (
        <div>
            <Box>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Class Name</label>
                        <TextField fullWidth label="Class Name" name="title" required margin="normal" />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <label style={{ marginBottom: '4px' }}>Time Start</label>
                                <TextField type="time" name="start" required fullWidth />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <label style={{ marginBottom: '4px' }}>Time End</label>
                                <TextField type="time" name="end" required fullWidth />
                            </Box>
                        </Box>
                        <label>Date</label>
                        <TextField fullWidth type="date" name="date" required margin="normal" />
                        <label>Instructor</label>
                        <TextField fullWidth label="Instructor" name="instructor" required margin="normal" />
                        <label>Class Level</label>
                        <TextField fullWidth label="Class Level" name="classLevel" required margin="normal" />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box>
                                <label>Age</label>
                                <Select
                                    labelId="age-label"
                                    name="age"
                                    value={age}  // Controlled component needs value
                                    onChange={handleChange}
                                    fullWidth
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    <MenuItem value="Adult">Adult</MenuItem>
                                    <MenuItem value="Teen">Teen</MenuItem>
                                    <MenuItem value="Child">Child</MenuItem>
                                </Select>
                            </Box>
                            {/* <Box>
                <FormControlLabel control={<Switch />} label="Repeat" />
                </Box> */}
                        </Box>
                    </div>
                    <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: "black" }}>
                        Save
                    </Button>
                    <Button onClick={handleCancelButton} sx={{ mt: 2 }}>
                        Cancel
                    </Button>
                </form>
            </Box>
        </div>
    )
}

export default AddClassInformation