import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import NavigationMenu from "../NavigationMenu";
import './Dashboard.css';
import { useEvents } from './EventContext';
import Calendar from './Calendar';
import AddClassInformation from './AddClassInformation';
import { v4 as uuidv4 } from 'uuid';


export default function AddClass() {
  const { events, setEvents } = useEvents();
  const navigate = useNavigate();
  const [sidebarWidth, setSidebarWidth] = useState(250);

  // Color helper function
  const getLevelColor = (level) => {
    if (!level) return '#3788d8';
    
    const levelLower = level.toLowerCase();
    if (levelLower.includes('beginner') || levelLower.includes('fundamentals')) return '#4caf50';
    if (levelLower.includes('intermediate')) return '#ff9800';
    if (levelLower.includes('advanced')) return '#f44336';
    return '#3788d8'; // default blue
  };

  // NEW Version of handleSubmit with completely different approach
  const handleSubmit = (e, recurrence) => {
    e.preventDefault();
    console.log("=== NEW FORM HANDLER STARTED ===");
    
    // Extract all form data
    const form = e.target;
    const title = form.elements.title.value;
    const date = form.elements.date.value; 
    const startTime = form.elements.start.value;
    const endTime = form.elements.end.value;
    const instructor = form.elements.instructor.value;
    const classLevel = form.elements.classLevel.value;
    const ageGroup = form.elements.age.value;
    const id = uuidv4();
    
    // Get color based on class level
    const color = getLevelColor(classLevel);
    
    // Get the date object for the selected date
    const baseDate = new Date(date + "T00:00:00");
    const baseDayIndex = baseDate.getDay(); // 0=Sunday, 1=Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const baseDayName = dayNames[baseDayIndex];
    
    console.log(`Base date is ${baseDate.toDateString()} (${baseDayName})`);
    
    // Array to hold all new events
    const newEvents = [];
    
    // If this is a recurring event and is weekly
    if (recurrence && recurrence.type === 'weekly') {
      console.log("Creating weekly recurring events");
      console.log("Selected days:", recurrence.days);
      
      // Debug which days are selected 
      let selectedDayCount = 0;
      dayNames.forEach(day => {
        if (recurrence.days[day]) {
          console.log(`- ${day} is selected`);
          selectedDayCount++;
        }
      });
      console.log(`Total selected days: ${selectedDayCount}`);
      
      // Process each day of the week
      dayNames.forEach((dayName, dayIndex) => {
        // Skip if this day is not selected
        if (!recurrence.days[dayName]) {
          return;
        }
        
        console.log(`Processing day: ${dayName} (day ${dayIndex})`);
        
        // Calculate date for this day
        const dayDiff = calculateDayDifference(baseDayIndex, dayIndex);
        console.log(`Day difference: ${dayDiff} days`);
        
        // Clone the base date
        const eventDate = new Date(baseDate);
        
        // Adjust to the target day
        eventDate.setDate(eventDate.getDate() + dayDiff);
        
        // Format as YYYY-MM-DD
        const formattedDate = formatDate(eventDate);
        console.log(`Event date: ${formattedDate} (${eventDate.toDateString()})`);
        
        // Create a unique ID
        const eventId = `class-${Date.now()}-${dayName}`;
        
        // Create the event
        const newEvent = {
          id: eventId,
          title,
          start: `${formattedDate}T${startTime}`,
          end: `${formattedDate}T${endTime}`,
          color,
          textColor: 'white',
          extendedProps: {
            instructor,
            classLevel,
            age: ageGroup,
            duration: calculateDuration(startTime, endTime),
            dayOfWeek: dayName
          }
        };
        
        // Add to our collection
        newEvents.push(newEvent);
        console.log(`Created event for ${dayName} on ${formattedDate}`);
      });
    } else {
      // Not recurring, just create a single event for the selected date
      const eventId = `class-${Date.now()}-single`;
      
      const singleEvent = {
        id: eventId,
        title,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        color,
        textColor: 'white',
        extendedProps: {
          instructor,
          classLevel,
          age: ageGroup,
          duration: calculateDuration(startTime, endTime)
        }
      };
      
      newEvents.push(singleEvent);
      console.log(`Created single event for ${date}`);
    }
    
    // No events were created
    if (newEvents.length === 0) {
      console.error("No events were created!");
      return;
    }
    
    console.log(`Adding ${newEvents.length} events to calendar`);
    
    // Check for existing events with the same title and date/time to avoid duplicates
    const filteredEvents = newEvents.filter(newEvent => {
      const duplicate = events.some(existingEvent => 
        existingEvent.title === newEvent.title && 
        existingEvent.start === newEvent.start
      );
      
      if (duplicate) {
        console.log(`Skipping duplicate event: ${newEvent.title} on ${newEvent.start}`);
        return false;
      }
      
      return true;
    });
    
    console.log(`After filtering duplicates: ${filteredEvents.length} events to add`);
    
    // Update the state with new events
    if (filteredEvents.length > 0) {
      const updatedEvents = [...events, ...filteredEvents];
      setEvents(updatedEvents);
      
      // Store in localStorage
      try {
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    
    // Navigate back to dashboard
    console.log("=== FORM HANDLER COMPLETED ===");
    setEvents([...events, newEvent]);
    navigate('/dashboard');
  };
  
  // Helper function to calculate days between two weekdays
  function calculateDayDifference(startDayIndex, targetDayIndex) {
    // If target day is after start day in the week
    if (targetDayIndex > startDayIndex) {
      return targetDayIndex - startDayIndex;
    }
    // If target day is before start day, go to next week
    else if (targetDayIndex < startDayIndex) {
      return 7 - startDayIndex + targetDayIndex;
    }
    // Same day
    else {
      return 0;
    }
  }
  
  // Helper to format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper to calculate duration string
  function calculateDuration(start, end) {
    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);
    
    let hours = endParts[0] - startParts[0];
    let minutes = endParts[1] - startParts[1];
    
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  const handleCancelButton = () => {
    navigate('/dashboard');
  };

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
            <Typography variant="h3" mb={2}>Add Class</Typography>
            <AddClassInformation handleCancelButton={handleCancelButton} handleSubmit={handleSubmit} />
          </div>
        </Box>
      </Box>
    </Box>
  );
}
