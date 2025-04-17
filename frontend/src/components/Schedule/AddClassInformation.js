import { 
  Box, 
  Button, 
  MenuItem, 
  Select, 
  TextField, 
  FormControl,
  FormLabel,
  InputLabel,
  Grid,
  Typography,
  Divider,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Collapse
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useEvents } from './EventContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GradeIcon from '@mui/icons-material/Grade';
import GroupsIcon from '@mui/icons-material/Groups';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RepeatIcon from '@mui/icons-material/Repeat';

const AddClassInformation = ({
  handleCancelButton, 
  handleSubmit,
  initialDate = '',
  initialStartTime = '',
  initialEndTime = '' 
}) => {
    const { events, setEvents } = useEvents();

    const [age, setAge] = useState('Adult');
    const [date, setDate] = useState(initialDate);
    const [startTime, setStartTime] = useState(initialStartTime);
    const [endTime, setEndTime] = useState(initialEndTime);
    
    // Recurring options
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState('weekly');
    const [recurrenceDays, setRecurrenceDays] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    });
    const [hasEndDate, setHasEndDate] = useState(false);
    const [endDate, setEndDate] = useState('');
    
    // Helper function to initialize days based on a date
    const initializeRecurrenceDaysFromDate = (dateStr) => {
        if (!dateStr) {
            console.log("No date provided for initialization");
            return;
        }
        
        console.log(`Initializing recurrence days from date: ${dateStr}`);
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        
        // Map JS day number (0-6) to day name
        const dayMap = {
            0: 'sunday',
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        };
        
        const dayName = dayMap[dayOfWeek];
        console.log(`Selected date day of week: ${dayOfWeek} (${dayName})`);
        
        // Create an object with all days initialized to false, 
        // then set only the current day to true
        const newDays = {
            sunday: false,
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false
        };
        
        // Set only the day corresponding to the selected date
        newDays[dayName] = true;
        
        console.log(`Setting recurrence days to:`, newDays);
        setRecurrenceDays(newDays);
    };

    // When initial date changes, set the day of week
    useEffect(() => {
        if (initialDate) {
            setDate(initialDate);
            console.log('Initial date changed:', initialDate);
            initializeRecurrenceDaysFromDate(initialDate);
        }
        if (initialStartTime) setStartTime(initialStartTime);
        if (initialEndTime) setEndTime(initialEndTime);
    }, [initialDate, initialStartTime, initialEndTime]);

    // When date changes, update the recurrence days
    useEffect(() => {
        if (date) {
            console.log('Date changed:', date);
            // Only reset days when recurring is first enabled or date changes
            if (!isRecurring) {
                initializeRecurrenceDaysFromDate(date);
            }
        }
    }, [date, isRecurring]);

    // Completely rewritten handleFormSubmit function for simpler logic
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        console.log("=== FORM SUBMISSION STARTED ===");
        console.log("Recurrence enabled:", isRecurring);
        console.log("Current day selections:", recurrenceDays);
        
        // If recurring is enabled, send the recurrence object
        if (isRecurring) {
            // If it's weekly recurrence, make sure at least one day is selected
            if (recurrenceType === 'weekly') {
                const hasDaySelected = Object.values(recurrenceDays).some(day => day === true);
                
                if (!hasDaySelected) {
                    // If no days selected, set the current date's day
                    console.log("No days selected for weekly recurrence, defaulting to current date's day");
                    if (date) {
                        const currentDate = new Date(date);
                        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
                        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        
                        // Create a fresh days object with only today selected
                        const updatedDays = {
                            sunday: false,
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false
                        };
                        
                        // Set the current day to true
                        updatedDays[dayNames[dayOfWeek]] = true;
                        
                        console.log(`Setting default day to ${dayNames[dayOfWeek]}`);
                        setRecurrenceDays(updatedDays);
                        
                        // Create a deep copy of the updated days to avoid reference issues
                        const recurrenceObject = {
                            type: recurrenceType,
                            days: { ...updatedDays },
                            hasEndDate: hasEndDate,
                            endDate: hasEndDate ? endDate : null
                        };
                        
                        console.log("Submitting with default day recurrence:", recurrenceObject);
                        handleSubmit(e, recurrenceObject);
                        return;
                    }
                }
            }
            
            // Create a deep copy of the recurrence days to avoid reference issues
            const recurrenceCopy = { ...recurrenceDays };
            
            // Normal submission with recurring enabled
            const recurrenceObject = {
                type: recurrenceType,
                days: recurrenceCopy,
                hasEndDate: hasEndDate,
                endDate: hasEndDate ? endDate : null
            };
            
            console.log("Submitting with recurrence:", recurrenceObject);
            handleSubmit(e, recurrenceObject);
        } else {
            // No recurrence, just submit the form
            console.log("Submitting without recurrence");
            handleSubmit(e, null);
        }
        
        console.log("=== FORM SUBMISSION COMPLETED ===");
    };

    // Simpler handler for toggling recurring checkbox
    const handleRecurringToggle = () => {
        const newValue = !isRecurring;
        console.log(`Toggling recurring checkbox from ${isRecurring} to ${newValue}`);
        
        setIsRecurring(newValue);
        
        // If turning recurring on, initialize with current date's day
        if (newValue && date) {
            const currentDate = new Date(date);
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            
            // Reset all days first
            const freshDays = {
                sunday: false,
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false
            };
            
            // Only set the current day to true
            freshDays[dayNames[dayOfWeek]] = true;
            
            console.log(`Initializing with ${dayNames[dayOfWeek]} selected`);
            setRecurrenceDays(freshDays);
        }
    };

    // Simplified day toggle handler
    const handleDayToggle = (day) => {
        console.log(`Toggling day ${day} from ${recurrenceDays[day]} to ${!recurrenceDays[day]}`);
        
        // Create a new object with the updated day value
        const updatedDays = { 
            ...recurrenceDays,
            [day]: !recurrenceDays[day] 
        };
        
        // Update the state
        setRecurrenceDays(updatedDays);
    };

    const handleAgeChange = (event) => {
        setAge(event.target.value);
    };

    return (
        <Box>
            <form onSubmit={handleFormSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-end' }}>
                            <FitnessCenterIcon sx={{ mr: 1, mb: 0.5, color: 'text.secondary' }} />
                            <TextField 
                                fullWidth 
                                label="Class Name" 
                                name="title" 
                                required 
                                variant="standard"
                                placeholder="e.g. Adult Fundamentals"
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ display: 'block', mb: 1 }}
                        >
                            Time & Date
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccessTimeIcon sx={{ mr: 1, mb: 0.5, color: 'text.secondary' }} />
                            <TextField 
                                type="time" 
                                name="start" 
                                required 
                                fullWidth 
                                label="Start Time"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField 
                            type="time" 
                            name="end" 
                            required 
                            fullWidth 
                            label="End Time"
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
                            <CalendarMonthIcon sx={{ mr: 1, mb: 0.5, color: 'text.secondary' }} />
                            <TextField 
                                fullWidth 
                                type="date" 
                                name="date" 
                                required 
                                label="Date"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 2 }}>
                            <RepeatIcon sx={{ mr: 1, mb: 0.5, color: 'text.secondary' }} />
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        checked={isRecurring}
                                        onChange={handleRecurringToggle}
                                        name="isRecurring"
                                    />
                                }
                                label="Recurring Class"
                            />
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Collapse in={isRecurring}>
                            <Box sx={{ pl: 4, pr: 2, pb: 2, pt: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                                    Recurrence Pattern
                                </Typography>
                                
                                <FormControl component="fieldset" sx={{ mb: 2 }}>
                                    <RadioGroup
                                        row
                                        name="recurrenceType"
                                        value={recurrenceType}
                                        onChange={(e) => setRecurrenceType(e.target.value)}
                                    >
                                        <FormControlLabel value="daily" control={<Radio size="small" />} label="Daily" />
                                        <FormControlLabel value="weekly" control={<Radio size="small" />} label="Weekly" />
                                        <FormControlLabel value="monthly" control={<Radio size="small" />} label="Monthly" />
                                    </RadioGroup>
                                </FormControl>
                                
                                <Collapse in={recurrenceType === 'weekly'}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        Repeat on:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {[
                                            { key: 'monday', label: 'Mon' },
                                            { key: 'tuesday', label: 'Tue' },
                                            { key: 'wednesday', label: 'Wed' },
                                            { key: 'thursday', label: 'Thu' },
                                            { key: 'friday', label: 'Fri' },
                                            { key: 'saturday', label: 'Sat' },
                                            { key: 'sunday', label: 'Sun' }
                                        ].map(({ key, label }) => (
                                            <Box 
                                                key={key}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: recurrenceDays[key] ? 'primary.main' : 'grey.300',
                                                    borderRadius: '4px',
                                                    padding: '4px 8px',
                                                    backgroundColor: recurrenceDays[key] ? 'primary.light' : 'transparent',
                                                    color: recurrenceDays[key] ? 'primary.contrastText' : 'text.primary',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => handleDayToggle(key)}
                                            >
                                                <Checkbox 
                                                    checked={recurrenceDays[key]}
                                                    onChange={() => handleDayToggle(key)}
                                                    size="small"
                                                    sx={{ 
                                                        padding: '2px',
                                                        color: recurrenceDays[key] ? 'white' : undefined,
                                                        '&.Mui-checked': {
                                                            color: recurrenceDays[key] ? 'white' : undefined,
                                                        }
                                                    }}
                                                />
                                                {label}
                                            </Box>
                                        ))}
                                    </Box>
                                </Collapse>
                                
                                <Box sx={{ mt: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                checked={hasEndDate}
                                                onChange={() => setHasEndDate(!hasEndDate)}
                                                name="hasEndDate"
                                                size="small"
                                            />
                                        }
                                        label="End date"
                                    />
                                    <Collapse in={hasEndDate}>
                                        <TextField 
                                            sx={{ mt: 1 }}
                                            fullWidth 
                                            type="date" 
                                            name="recurrenceEndDate" 
                                            label="End Date"
                                            variant="outlined"
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </Collapse>
                                </Box>
                            </Box>
                        </Collapse>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ display: 'block', mt: 2, mb: 1 }}
                        >
                            Class Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <PersonOutlineIcon sx={{ mr: 1, mb: 0.5, color: 'text.secondary' }} />
                            <TextField 
                                fullWidth 
                                label="Instructor" 
                                name="instructor" 
                                required 
                                variant="standard"
                                placeholder="e.g. John Doe"
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
                            <GradeIcon sx={{ mr: 1, mb: 0.5, color: 'text.secondary' }} />
                            <FormControl fullWidth variant="standard">
                                <InputLabel id="class-level-label">Class Level</InputLabel>
                                <Select
                                    labelId="class-level-label"
                                    name="classLevel"
                                    defaultValue="Fundamentals"
                                    label="Class Level"
                                >
                                    <MenuItem value="Fundamentals">Fundamentals</MenuItem>
                                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                                    <MenuItem value="Advanced">Advanced</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
                            <GroupsIcon sx={{ mr: 1, mb: 0.5, color: 'text.secondary' }} />
                            <FormControl fullWidth variant="standard">
                                <InputLabel id="age-label">Age Group</InputLabel>
                                <Select
                                    labelId="age-label"
                                    name="age"
                                    value={age}
                                    onChange={handleAgeChange}
                                    label="Age Group"
                                >
                                    <MenuItem value="Adult">Adult</MenuItem>
                                    <MenuItem value="Teen">Teen</MenuItem>
                                    <MenuItem value="Child">Child</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button 
                                onClick={handleCancelButton} 
                                variant="outlined"
                                sx={{ 
                                    borderRadius: '8px', 
                                    flex: 1, 
                                    mr: 1 
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                sx={{ 
                                    borderRadius: '8px', 
                                    backgroundColor: '#3788d8',
                                    '&:hover': {
                                        backgroundColor: '#3788d8dd',
                                    },
                                    flex: 1
                                }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    )
}

export default AddClassInformation