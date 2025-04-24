import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import rrulePlugin from '@fullcalendar/rrule'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from './EventContext';
import { Box, Modal, Typography, Button, IconButton, Chip } from '@mui/material';
import AddClassInformation from './AddClassInformation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GradeIcon from '@mui/icons-material/Grade';
import GroupsIcon from '@mui/icons-material/Groups';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import './Dashboard.css';
import Edit from '@mui/icons-material/Edit';
import { v4 as uuidv4 } from 'uuid';


export default function Calendar() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 440,
    width: typeof window !== 'undefined' && windowWidth < 768 ? '95%' : '90%',
    bgcolor: 'background.paper',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    overflow: 'auto',
    maxHeight: typeof window !== 'undefined' && windowWidth < 768 ? '95vh' : '90vh',
    p: 0,
  };

  // Helper function to determine class level color - moved to component scope
  const getLevelColor = (level) => {
    if (!level) return '#3788d8';
    
    const levelLower = level.toLowerCase();
    if (levelLower.includes('beginner') || levelLower.includes('fundamentals')) return '#4caf50';
    if (levelLower.includes('intermediate')) return '#ff9800';
    if (levelLower.includes('advanced')) return '#f44336';
    return '#3788d8'; // default blue
  };

  // Helper function to format time
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Original formatDate function (for display)
  const formatDateDisplay = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Helper to format a date to YYYY-MM-DD for input fields
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date with specific format
  const formatDateCustom = (date, format) => {
    if (format === "YYYY-MM-DD") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Default format for display
    return date.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const { events, setEvents, clearStorage, resetEvents } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);

  const [age, setAge] = React.useState('');
  const handleChange = (event) => {
    setAge(event.target.value);
  };
  const [repeat, setRepeat] = useState(false);

  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Effect to handle window resize events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Handlers for opening and closing the modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => { 
    setIsModalOpen(false); 
    setSelectedEvent(null);
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState('timeGridWeek');

  // Helper to format a date to YYYY-MM-DD for input fields
  const formatTimeForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Calculate end time (1 hour after start time by default)
  const calculateEndTime = (startDate) => {
    if (!startDate) return null;
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    return endDate;
  };

  // Event Render Function To Get Event Info and Display it
  function renderEventContent(eventInfo) {
    try {
      const { title, start, end, extendedProps, backgroundColor } = eventInfo.event;
      
      // Month view simplified rendering
      if (currentView === 'dayGridMonth') {
        const bgColor = getLevelColor(extendedProps?.classLevel);
        return (
          <div style={{
            backgroundColor: bgColor,
            color: 'white',
            padding: '2px 4px',
            borderRadius: '3px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </div>
        );
      }
    
      // Calculate event duration in minutes
      const durationMinutes = end && start ? 
        Math.round((new Date(end) - new Date(start)) / 60000) : 0;
      
      // Categorize events by duration
      const isSmallEvent = durationMinutes <= 60;
      const isMediumEvent = durationMinutes > 60 && durationMinutes <= 90;
      const isLargeEvent = durationMinutes > 90;
      
      // Get background color based on class properties
      const bgColor = getLevelColor(extendedProps?.classLevel);

      // Always show more details in day view regardless of size
      const viewAdjustedSize = currentView === 'timeGridDay' 
        ? 'large' 
        : isSmallEvent ? 'small' : isMediumEvent ? 'medium' : 'large';

      // SMALL EVENT: only show class name and time
      if (viewAdjustedSize === 'small') {
        return (
          <div style={{
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '4px 6px',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: bgColor,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
            cursor: 'pointer',
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '12px',
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </div>
            
            {start && end && (
              <div style={{ 
                fontSize: '10px', 
                opacity: '0.9',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {formatTime(start)}
              </div>
            )}
          </div>
        );
      }

      // MEDIUM EVENT: show class name, time, instructor and level
      else if (viewAdjustedSize === 'medium') {
        return (
          <div style={{
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '5px 7px',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: bgColor,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease',
            cursor: 'pointer',
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '13px',
              marginBottom: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <FitnessCenterIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
              {title}
            </div>
            
            {start && end && (
              <div style={{ 
                fontSize: '11px', 
                opacity: '0.9',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '2px'
              }}>
                <AccessTimeIcon sx={{ fontSize: 11, verticalAlign: 'middle', mr: 0.5 }} />
                <span>{formatTime(start)} - {formatTime(end)}</span>
              </div>
            )}
            
            {extendedProps?.instructor && (
              <div style={{ 
                fontSize: '11px', 
                opacity: '0.9',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <PersonOutlineIcon sx={{ fontSize: 11, verticalAlign: 'middle', mr: 0.5 }} />
                {extendedProps.instructor}
              </div>
            )}
            
            {extendedProps?.classLevel && (
              <div style={{ 
                fontSize: '11px', 
                opacity: '0.9',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <GradeIcon sx={{ fontSize: 11, verticalAlign: 'middle', mr: 0.5 }} />
                {extendedProps.classLevel}
              </div>
            )}
          </div>
        );
      }

      // LARGE EVENT: show all available information
      return (
        <div style={{
          borderRadius: '6px',
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '8px 10px',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: bgColor,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease',
          cursor: 'pointer',
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '14px',
            marginBottom: '5px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            <FitnessCenterIcon sx={{ fontSize: 15, verticalAlign: 'middle', mr: 0.5 }} />
            {title}
          </div>
          
          {start && end && (
            <div style={{ 
              fontSize: '11px', 
              opacity: '0.9',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <AccessTimeIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
              <span>{formatTime(start)} - {formatTime(end)}</span>
            </div>
          )}
          
          {extendedProps?.instructor && (
            <div style={{ 
              fontSize: '11px', 
              opacity: '0.9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '3px'
            }}>
              <PersonOutlineIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
              {extendedProps.instructor}
            </div>
          )}
          
          {extendedProps?.classLevel && (
            <div style={{ 
              fontSize: '11px', 
              opacity: '0.9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '3px'
            }}>
              <GradeIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
              {extendedProps.classLevel}
            </div>
          )}
          
          {extendedProps?.age && (
            <div style={{ 
              fontSize: '11px', 
              opacity: '0.9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <GroupsIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
              {extendedProps.age}
            </div>
          )}
        </div>
      );
    } catch (err) {
      console.error("Error rendering event:", err, eventInfo);
      // Return a fallback rendering for the event
      return (
        <div style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '2px 4px',
          borderRadius: '3px',
          fontSize: '11px'
        }}>
          {eventInfo.event?.title || 'Event Error'}
        </div>
      );
    }
  }

  const handleSubmit = (e, recurrence) => {
    e.preventDefault();
    console.log("=== CALENDAR DIRECT FORM HANDLER STARTED ===");
    
    // Extract form data
    const form = e.target;
    const title = form.elements.title.value;
    const date = form.elements.date.value;
    const startTime = form.elements.start.value;
    const endTime = form.elements.end.value;
    const instructor = form.elements.instructor.value;
    const classLevel = form.elements.classLevel.value;
    const ageGroup = form.elements.age.value;
    const capacity = form.elements.maxCapacity.value;
    const id1 = uuidv4();

    
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
    
    // Create the base event for the selected date
    const baseEventId = `class-${Date.now()}-single`;
    const baseEvent = {
      id: baseEventId,
      id1,

    };
    
    // Add the base event
    newEvents.push(baseEvent);
    console.log(`Created base event for ${date}`);
    
    // If this is a recurring event and is weekly
    if (recurrence && recurrence.type === 'weekly') {
      console.log("Creating weekly recurring events");
      console.log("Selected days:", recurrence.days);
      
      // Debug: Count selected days
      let selectedDayCount = 0;
      dayNames.forEach(day => {
        if (recurrence.days[day]) {
          console.log(`- ${day} is selected`);
          selectedDayCount++;
        }
      });
      console.log(`Total selected days: ${selectedDayCount}`);
      
      // First create an event for the base day if it's in the selected days
      if (recurrence.days[baseDayName]) {
        console.log(`Creating event for base day: ${baseDayName}`);
        
        const eventId = `class-${Date.now()}-${baseDayName}`;
        
        const baseEvent = {
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
            duration: calculateDuration(startTime, endTime),
            dayOfWeek: baseDayName,
            capacity: capacity
          }
        };
        
        newEvents.push(baseEvent);
        console.log(`Created recurring event for base day ${baseDayName} on ${date}`);
      }
      
      // Process each day of the week (except the base day which was already handled)
      dayNames.forEach((dayName, dayIndex) => {
        // Skip if this day is not selected or if it's the same as the base day
        if (!recurrence.days[dayName] || dayIndex === baseDayIndex) {
          if (!recurrence.days[dayName]) {
            console.log(`Skipping ${dayName} as it's not selected`);
          } else {
            console.log(`Skipping ${dayName} as it's the same as the base day (already processed)`);
          }
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
        const formattedDate = formatDateCustom(eventDate, "YYYY-MM-DD");
        console.log(`Event date: ${formattedDate}`);
        
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
            dayOfWeek: dayName,
            capacity: capacity
          }
        };
        
        // Add to our collection
        newEvents.push(newEvent);
        console.log(`Created recurring event for ${dayName} on ${formattedDate}`);
      });
    } 
    // If this is a daily recurring event
    else if (recurrence && recurrence.type === 'daily') {
      console.log("Creating daily recurring events");
      
      // First, create an event for the base day
      const baseEventId = `class-${Date.now()}-daily-${formatDateCustom(baseDate, "YYYY-MM-DD")}`;
      
      const baseEvent = {
        id: baseEventId,
        title,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        color,
        textColor: 'white',
        extendedProps: {
          instructor,
          classLevel,
          age: ageGroup,
          duration: calculateDuration(startTime, endTime),
          recurring: 'daily',
          capacity: capacity
        }
      };
      
      newEvents.push(baseEvent);
      console.log(`Created daily recurring event for base day ${formatDateCustom(baseDate, "YYYY-MM-DD")}`);
      
      // For memory efficiency and to avoid overwhelming localStorage, 
      // we'll generate events for a reasonable time period (e.g., 2 weeks)
      // If an end date is specified, we'll respect that
      const maxDaysToGenerate = 14; // 2 weeks
      let daysToGenerate = maxDaysToGenerate;
      
      // Check if there's an end date specified
      if (recurrence.hasEndDate && recurrence.endDate) {
        const endDateObj = new Date(`${recurrence.endDate}T00:00:00`);
        const daysDifference = Math.floor((endDateObj - baseDate) / (24 * 60 * 60 * 1000));
        
        if (daysDifference > 0) {
          // Use the smaller of the two: our max days or the days until the end date
          daysToGenerate = Math.min(daysDifference, maxDaysToGenerate);
          console.log(`Generating daily events for ${daysToGenerate} days until the end date`);
        } else {
          console.log(`End date is on or before the start date, defaulting to ${maxDaysToGenerate} days`);
        }
      } else {
        console.log(`No end date specified, defaulting to ${maxDaysToGenerate} days`);
      }
      
      // Generate events for the specified number of days
      for (let i = 1; i <= daysToGenerate; i++) {
        // Clone the base date and add the days
        const eventDate = new Date(baseDate);
        eventDate.setDate(eventDate.getDate() + i);
        
        // Format as YYYY-MM-DD
        const formattedDate = formatDateCustom(eventDate, "YYYY-MM-DD");
        
        // Create a unique ID including the date to avoid collisions
        const eventId = `class-${Date.now()}-daily-${formattedDate}`;
        
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
            recurring: 'daily',
            capacity: capacity
          }
        };
        
        // Add to our collection
        newEvents.push(newEvent);
        console.log(`Created daily recurring event for day ${i}: ${formattedDate}`);
      }
      
      console.log(`Generated ${daysToGenerate} days of daily recurring events`);
    }
    // If this is a monthly recurring event
    else if (recurrence && recurrence.type === 'monthly') {
      console.log("Creating monthly recurring events");
      
      // First, create an event for the base day (this month)
      const baseEventId = `class-${Date.now()}-monthly-${formatDateCustom(baseDate, "YYYY-MM-DD")}`;
      
      const baseEvent = {
        id: baseEventId,
        title,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        color,
        textColor: 'white',
        extendedProps: {
          instructor,
          classLevel,
          age: ageGroup,
          duration: calculateDuration(startTime, endTime),
          recurring: 'monthly',
          capacity: capacity
        }
      };
      
      newEvents.push(baseEvent);
      console.log(`Created monthly recurring event for base day ${formatDateCustom(baseDate, "YYYY-MM-DD")}`);
      
      // For memory efficiency, generate events for a reasonable number of months
      const maxMonthsToGenerate = 6; // Generate for the next 6 months
      let monthsToGenerate = maxMonthsToGenerate;
      
      // Check if there's an end date specified
      if (recurrence.hasEndDate && recurrence.endDate) {
        const endDateObj = new Date(`${recurrence.endDate}T00:00:00`);
        const monthsDifference = (endDateObj.getFullYear() - baseDate.getFullYear()) * 12 + 
                                 (endDateObj.getMonth() - baseDate.getMonth());
        
        if (monthsDifference > 0) {
          // Use the smaller of the two: our max months or months until the end date
          monthsToGenerate = Math.min(monthsDifference, maxMonthsToGenerate);
          console.log(`Generating monthly events for ${monthsToGenerate} months until the end date`);
        } else {
          console.log(`End date is in the same month or earlier, defaulting to ${maxMonthsToGenerate} months`);
        }
      } else {
        console.log(`No end date specified, defaulting to ${maxMonthsToGenerate} months`);
      }
      
      // Get the day of the month from the base date (e.g., the 15th of the month)
      const dayOfMonth = baseDate.getDate();
      
      // Generate events for each month
      for (let i = 1; i <= monthsToGenerate; i++) {
        // Clone the base date
        const eventDate = new Date(baseDate);
        
        // Add i months
        eventDate.setMonth(eventDate.getMonth() + i);
        
        // Make sure we're on the right day of the month (handles months with fewer days)
        // If the base day was the 31st but next month has only 30 days, this sets it to the 30th
        while (eventDate.getDate() !== dayOfMonth) {
          eventDate.setDate(eventDate.getDate() - 1);
          if (eventDate.getDate() === 1) break; // Prevent infinite loop
        }
        
        // Format as YYYY-MM-DD
        const formattedDate = formatDateCustom(eventDate, "YYYY-MM-DD");
        
        // Create a unique ID including the date to avoid collisions
        const eventId = `class-${Date.now()}-monthly-${formattedDate}`;
        
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
            recurring: 'monthly',
            capacity: capacity
          }
        };
        
        // Add to our collection
        newEvents.push(newEvent);
        console.log(`Created monthly recurring event for month ${i}: ${formattedDate}`);
      }
      
      console.log(`Generated ${monthsToGenerate} months of monthly recurring events`);
    } 
    else {
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
          duration: calculateDuration(startTime, endTime),
          capacity: capacity
        }
      };
      
      newEvents.push(singleEvent);
      console.log(`Created single event for ${date}`);
    }
    
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
    
    console.log(`Adding ${filteredEvents.length} events to calendar`);
    
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
    
    console.log("=== CALENDAR DIRECT FORM HANDLER COMPLETED ===");
    handleCloseModal();
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

  // Add a function to handle clearing localStorage
  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to clear all calendar data? This cannot be undone.')) {
      clearStorage();
      alert('Calendar data cleared successfully.');
    }
  };

  // Add a function to reset to default events
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset to default events? This will remove all custom events.')) {
      resetEvents();
      alert('Calendar reset to default events.');
    }
  };

  return (
    <div className="calendar-container" style={{ 
      width: '100%', 
      maxWidth: '100%', 
      overflow: 'hidden',
      height: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        flexWrap: 'wrap',
        mb: 1,
        mt: 0,
        mr: 1,
        gap: 1,
        '@media (max-width: 768px)': {
          justifyContent: 'center'
        }
      }}>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />} 
          onClick={handleClearStorage}
          size={typeof window !== 'undefined' && windowWidth < 768 ? "small" : "medium"}
          sx={{ fontSize: typeof window !== 'undefined' && windowWidth < 768 ? '0.75rem' : 'inherit' }}
        >
          Clear All Events
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<FitnessCenterIcon />} 
          onClick={handleResetToDefaults}
          size={typeof window !== 'undefined' && windowWidth < 768 ? "small" : "medium"}
          sx={{ fontSize: typeof window !== 'undefined' && windowWidth < 768 ? '0.75rem' : 'inherit' }}
        >
          Reset to Defaults
        </Button>
      </Box>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
          initialView="timeGridWeek"
          editable={true}
          headerToolbar={{
            start: typeof window !== 'undefined' && windowWidth < 768 ? 'prev,next' : 'timeGridDay,timeGridWeek,dayGridMonth today',
            center: typeof window !== 'undefined' && windowWidth < 768 ? 'title' : 'prev title next',
            end: 'addClassButton',
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          scrollTime="08:00:00"
          allDaySlot={false}
          events={events}
          eventContent={renderEventContent}
          eventClick={(info) => {
            setSelectedEvent(info.event); // save clicked event
            setIsModalOpen(true);         // open the modal
          }}
          selectable={true}
          select={(info) => {
            // Capture the selected date and time
            setSelectedDate(info.start);
            setSelectedStartTime(info.start);
            setSelectedEndTime(calculateEndTime(info.start));
            setSelectedEvent(null);
            handleOpenModal();
          }}
          customButtons={{
            addClassButton: {
              text: 'Add Class',
              click: () => navigate('/add-class'),
            },
          }}
          titleFormat={{ year: 'numeric', month: 'long' }}
          height="100%"
          stickyHeaderDates={true}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }}
          datesSet={(info) => {
            setCurrentView(info.view.type);
          }}
          // Month view configuration
          dayMaxEventRows={3}
          dayMaxEvents={3}
          fixedWeekCount={false}
          // Responsive settings
          windowResize={(view) => {
            // Update our width state
            if (typeof window !== 'undefined') {
              setWindowWidth(window.innerWidth);
            }
            
            // Automatically adjust to screen size
            if (typeof window !== 'undefined' && windowWidth < 768 && view.view.type !== 'timeGridDay') {
              view.calendar.changeView('timeGridDay');
            } else if (typeof window !== 'undefined' && windowWidth >= 768 && windowWidth < 1024 && view.view.type !== 'timeGridWeek') {
              view.calendar.changeView('timeGridWeek');
            } else if (typeof window !== 'undefined' && windowWidth >= 1024 && view.view.type === 'dayGridMonth') {
              // Removing incorrect change to timeGridMonth which doesn't exist
              // view.calendar.changeView('timeGridMonth');
            }
          }}
        />
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {selectedEvent ? (
            <>
              <Box sx={{ 
                position: 'relative', 
                p: 3, 
                backgroundColor: selectedEvent.extendedProps?.classLevel ? getLevelColor(selectedEvent.extendedProps.classLevel) : '#3788d8',
                color: 'white'
              }}>
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: 8, 
                    color: 'rgba(255,255,255,0.9)'
                  }} 
                  onClick={handleCloseModal}
                >
                  <CloseIcon />
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FitnessCenterIcon sx={{ mr: 1 }} />
                  <Typography variant="caption" sx={{ fontWeight: 'medium', letterSpacing: '0.5px' }}>
                    CLASS DETAILS
                  </Typography>
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedEvent.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
                  <Typography variant="body2">
                    {selectedEvent.start ? formatTime(selectedEvent.start) : ""} - {selectedEvent.end ? formatTime(selectedEvent.end) : ""}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarMonthIcon sx={{ fontSize: 18, mr: 1 }} />
                  <Typography variant="body2">
                    {selectedEvent.start ? formatDateDisplay(selectedEvent.start) : ""}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {selectedEvent.extendedProps?.classLevel && (
                    <Chip 
                      icon={<GradeIcon />} 
                      label={selectedEvent.extendedProps.classLevel} 
                      sx={{ 
                        backgroundColor: `${getLevelColor(selectedEvent.extendedProps.classLevel)}20`,
                        color: getLevelColor(selectedEvent.extendedProps.classLevel),
                        fontWeight: 'medium',
                        mr: 1
                      }} 
                    />
                  )}
                  
                  {selectedEvent.extendedProps?.age && (
                    <Chip 
                      icon={<GroupsIcon />} 
                      label={selectedEvent.extendedProps.age} 
                      sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        color: 'text.secondary'
                      }} 
                    />
                  )}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  mb: 3
                }}>
                  {selectedEvent.extendedProps?.instructor && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonOutlineIcon sx={{ color: 'text.secondary', mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Instructor</Typography>
                        <Typography variant="body1">{selectedEvent.extendedProps.instructor}</Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleAltIcon sx={{ color: 'text.secondary', mr: 2 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacity</Typography>
                      <Typography variant="body1">{selectedEvent.extendedProps?.capacity || '20'} students</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleCloseModal}
                    sx={{ borderRadius: '8px', flex: 1, mr: 1 }}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={() => {
                      const eventData = {
                        id: selectedEvent.id,
                        title: selectedEvent.title,
                        start: selectedEvent.start,
                        end: selectedEvent.end,
                        extendedProps: {
                          instructor: selectedEvent.extendedProps?.instructor,
                          classLevel: selectedEvent.extendedProps?.classLevel,
                          age: selectedEvent.extendedProps?.age,
                          capacity: selectedEvent.extendedProps?.capacity,
                          duration: selectedEvent.extendedProps?.duration,
                          dayOfWeek: selectedEvent.extendedProps?.dayOfWeek
                        }
                      };
                      navigate('/edit-class', { state: { event: eventData } });
                    }}
                    sx={{ 
                      borderRadius: '8px', 
                      backgroundColor: selectedEvent.extendedProps?.classLevel ? 
                        getLevelColor(selectedEvent.extendedProps.classLevel) : '#3788d8',
                      '&:hover': {
                        backgroundColor: selectedEvent.extendedProps?.classLevel ? 
                          getLevelColor(selectedEvent.extendedProps.classLevel) + 'dd' : '#3788d8dd',
                      },
                      flex: 1
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ 
                position: 'relative', 
                p: 3, 
                backgroundColor: '#3788d8',
                color: 'white'
              }}>
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: 8, 
                    color: 'rgba(255,255,255,0.9)'
                  }} 
                  onClick={handleCloseModal}
                >
                  <CloseIcon />
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FitnessCenterIcon sx={{ mr: 1 }} />
                  <Typography variant="caption" sx={{ fontWeight: 'medium', letterSpacing: '0.5px' }}>
                    NEW CLASS
                  </Typography>
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Add Class Details
                </Typography>
                
                {selectedDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">
                      {formatDateDisplay(selectedDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
                <AddClassInformation 
                  handleSubmit={handleSubmit} 
                  handleCancelButton={handleCloseModal}
                  initialDate={selectedDate ? formatDateForInput(selectedDate) : ''}
                  initialStartTime={selectedStartTime ? formatTimeForInput(selectedStartTime) : ''}
                  initialEndTime={selectedEndTime ? formatTimeForInput(selectedEndTime) : ''}
                />
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}