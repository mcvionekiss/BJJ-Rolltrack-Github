import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import NavigationMenu from "../NavigationMenu";
import './Dashboard.css';
import { useEvents } from './EventContext';
import AddClassInformation from './AddClassInformation';


const EditClass = () => {
    const { events, setEvents } = useEvents();
    const { state } = useLocation();
    const navigate = useNavigate();

    console.log("Edit state:", state);
    
    // Log all events with the same title for debugging
    if (state?.event?.title) {
        const sameTitle = events.filter(e => e.title === state.event.title);
        console.log(`Found ${sameTitle.length} events with title "${state.event.title}"`);
    }

    const [sidebarWidth, setSidebarWidth] = useState(250);

    const updateEvent = (formValues, recurrence) => {
        let updatedEventCount = 0;
        let updatedEvents = [];
        console.log('Updating event with form values:', formValues);
        console.log('Recurrence information:', recurrence);
        
        try {
            // Process all events
            events.forEach(event => {
                // Check if this event is part of the recurring series
                if (event.title === state.event.title) {
                    console.log(`Found an event to check for update: ${event.title} (ID: ${event.id})`);
                    
                    let shouldUpdate = true;
                    
                    // If recurrence info is provided, handle it
                    if (recurrence && recurrence.isRecurring) {
                        console.log(`Event has dayOfWeek: ${event.extendedProps?.dayOfWeek}`);
                        
                        // Get the event's day
                        let eventDay = null;
                        try {
                            if (event.start instanceof Date) {
                                const dayNum = event.start.getDay();
                                eventDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayNum];
                            } else if (typeof event.start === 'string') {
                                const startDate = new Date(event.start);
                                const dayNum = startDate.getDay();
                                eventDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayNum];
                            } else if (event.start && typeof event.start.toDate === 'function') {
                                const startDate = event.start.toDate();
                                const dayNum = startDate.getDay();
                                eventDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayNum];
                            } else if (event.extendedProps?.dayOfWeek) {
                                // Use existing dayOfWeek as fallback
                                const dayOfWeek = event.extendedProps.dayOfWeek.toLowerCase();
                                for (const day of ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']) {
                                    if (dayOfWeek.includes(day)) {
                                        eventDay = day;
                                        break;
                                    }
                                }
                            }
                            
                            console.log(`Determined event day: ${eventDay} for event:`, event.id);
                            
                            // Check if this day is selected in the recurrence days
                            if (eventDay && !recurrence.recurrenceDays[eventDay]) {
                                console.log(`Skipping update for event on ${eventDay} as it's not in selected days`);
                                shouldUpdate = false;
                            }
                        } catch (error) {
                            console.error('Error determining event day:', error);
                        }
                    }
                    
                    // Update the event if it should be updated
                    if (shouldUpdate) {
                        // Extract the date part (YYYY-MM-DD) from the original event
                        let eventDate = null;
                        try {
                            if (event.start instanceof Date) {
                                const year = event.start.getFullYear();
                                const month = String(event.start.getMonth() + 1).padStart(2, '0');
                                const day = String(event.start.getDate()).padStart(2, '0');
                                eventDate = `${year}-${month}-${day}`;
                            } else if (typeof event.start === 'string') {
                                eventDate = event.start.split('T')[0];
                            } else if (event.start && typeof event.start.toISOString === 'function') {
                                eventDate = event.start.toISOString().split('T')[0];
                            } else if (event.start && typeof event.start.toDate === 'function') {
                                const date = event.start.toDate();
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                eventDate = `${year}-${month}-${day}`;
                            }
                        } catch (error) {
                            console.error('Error extracting date from event:', error);
                        }
                        
                        console.log(`Updating event with ID: ${event.id}, Date: ${eventDate}`);
                        
                        // Determine which properties to update
                        const updatedEvent = {
                            ...event,
                            title: formValues.title,
                            start: eventDate ? `${eventDate}T${formValues.startTime}:00` : event.start,
                            end: eventDate ? `${eventDate}T${formValues.endTime}:00` : event.end,
                            extendedProps: {
                                ...event.extendedProps,
                                instructor: formValues.instructor,
                                classLevel: formValues.classLevel,
                                age: formValues.age,
                                capacity: formValues.maxCapacity
                            }
                        };
                        
                        // Update the dayOfWeek property for recurring events
                        if (recurrence && recurrence.isRecurring) {
                            // Determine the day of week for this event
                            let eventDay = null;
                            try {
                                const startDate = new Date(updatedEvent.start);
                                const dayNum = startDate.getDay();
                                eventDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayNum];
                                
                                // Set the dayOfWeek property for this event
                                updatedEvent.extendedProps.dayOfWeek = eventDay;
                                console.log(`Set dayOfWeek to ${eventDay} for event:`, updatedEvent.id);
                            } catch (error) {
                                console.error('Error setting dayOfWeek:', error);
                            }
                        } else if (!recurrence?.isRecurring) {
                            // If recurrence is turned off, remove the dayOfWeek property
                            delete updatedEvent.extendedProps.dayOfWeek;
                            console.log(`Removed dayOfWeek for non-recurring event:`, updatedEvent.id);
                        }
                        
                        // Add the updated event
                        updatedEvents.push(updatedEvent);
                        updatedEventCount++;
                    } else {
                        // Just keep the original event if we're not updating it
                        updatedEvents.push(event);
                    }
                } else {
                    // Not part of this recurring series, just keep it as is
                    updatedEvents.push(event);
                }
            });
            
            console.log(`Updated ${updatedEventCount} events with title: ${state.event.title}`);
            
            // Save the updated events
            setEvents(updatedEvents);
            
            // Update localStorage
            localStorage.setItem('events', JSON.stringify(updatedEvents));
            
            // Close the edit dialog
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating events:', error);
        }
    };

    const handleCancelButton = () => {
        navigate('/dashboard');
    }
    
    // Handle form submission
    const handleSubmit = (e, recurrenceInfo) => {
        // If called directly from the form
        if (e && e.preventDefault) {
            e.preventDefault();
            
            // Extract form values
            const formValues = {
                title: e.target.elements.title.value,
                instructor: e.target.elements.instructor.value,
                classLevel: e.target.elements.classLevel.value,
                age: e.target.elements.age.value,
                maxCapacity: e.target.elements.maxCapacity.value,
                startTime: e.target.elements.start.value,
                endTime: e.target.elements.end.value
            };
            
            console.log("Form values:", formValues);
            
            // Call the updateEvent function with the form values and recurrence info
            updateEvent(formValues, recurrenceInfo);
        }
    };

    return (
        <Box display="flex" style={{ overflowY: 'scroll', height: '100vh' }}>
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
                        <Typography variant="subtitle1" color="primary" mb={2}>
                            Changes will be applied to all recurring instances of this class.
                        </Typography>
                        <AddClassInformation handleCancelButton={handleCancelButton} handleSubmit={handleSubmit} data={state}></AddClassInformation>
                    </div>
                </Box>
            </Box>
        </Box>
    )
}

export default EditClass