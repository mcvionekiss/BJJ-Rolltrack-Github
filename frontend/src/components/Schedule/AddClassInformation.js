import { Box, Button, MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import { useEvents } from './EventContext';

const AddClassInformation = ({ handleCancelButton, handleSubmit, data }) => {
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
                        {console.log(data)}
                        <label>Class Name</label>
                        <TextField fullWidth name="title" required margin="normal" defaultValue={data?.event.title ? data.event.title : ''} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <label style={{ marginBottom: '4px' }}>Time Start</label>
                                <TextField type="time" name="start" required fullWidth defaultValue={
                                    data?.event.start
                                        ? new Date(data.event.start).toISOString().slice(11, 16) // "HH:MM"
                                        : ''
                                } />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <label style={{ marginBottom: '4px' }}>Time End</label>
                                <TextField type="time" name="end" required fullWidth defaultValue={
                                    data?.event.end
                                        ? new Date(data.event.end).toISOString().slice(11, 16) // "HH:MM"
                                        : ''
                                }/>
                            </Box>
                        </Box>
                        <label>Date</label>
                        <TextField fullWidth type="date" name="date" required margin="normal" 
                        defaultValue={
                            data?.event.start
                                ? new Date(data.event.start).toISOString().slice(0, 10)
                                : ''
                        } />
                        <label>Instructor</label>
                        <TextField fullWidth name="instructor" required margin="normal" defaultValue={data?.event?.extendedProps?.instructor ?? ''}/>
                        <label>Class Level</label>
                        <TextField fullWidth name="classLevel" required margin="normal" defaultValue={data?.event?.extendedProps?.classLevel ?? ''}/>
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