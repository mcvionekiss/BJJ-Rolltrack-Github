import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import NavigationMenu from "../NavigationMenu";
import './Dashboard.css';
import { useEvents } from './EventContext';
import Calendar from './Calendar';
import AddClassInformation from './AddClassInformation';

const EditClass = () => {
    const { events, setEvents } = useEvents();

    const navigate = useNavigate();

    const [age, setAge] = React.useState('');
    const handleChange = (event) => {
        setAge(event.target.value);
    };

    const [sidebarWidth, setSidebarWidth] = useState(250);

    const handleSubmit = (e) => {
        e.preventDefault();
        const title = e.target.elements.title.value;
        const date = e.target.elements.date.value;
        const start = `${date}T${e.target.elements.start.value}:00`;
        const end = `${date}T${e.target.elements.end.value}:00`;
        const instructor = e.target.elements.instructor.value;
        const duration = "01:00:00"; // might not be needed
        const classLevel = e.target.elements.classLevel.value;
        const selectedAge = age;

        const newEvent = {
            title,
            start,
            end,
            color: '#E0E0E0',
            textColor: 'black',
            borderColor: 'black',
            extendedProps: {
                instructor,
                classLevel,
                age: selectedAge,
                duration
            },
        };

        setEvents([...events, newEvent]);
        navigate('/dashboard');
    };


    const handleCancelButton = () => {
        navigate('/dashboard');
    }
    return (
        <Box display="flex">
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    transition: "margin-left 0.3s ease-in-out",
                    marginLeft: `${sidebarWidth}px`
                }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <div style={{ margin: "75px" }}>
                        <Typography variant="h3" mb={2}>Edit Class</Typography>
                        <AddClassInformation handleCancelButton={handleCancelButton} handleSubmit={handleSubmit}></AddClassInformation>
                    </div>
                </Box >
            </Box>
        </Box>
    )
}

export default EditClass