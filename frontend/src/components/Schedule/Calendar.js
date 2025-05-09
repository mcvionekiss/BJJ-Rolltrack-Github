import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import rrulePlugin from '@fullcalendar/rrule'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from './EventContext';
import { Box, Modal, Typography, Button, IconButton, Chip, Tooltip } from '@mui/material';
import AddClassInformation from './AddClassInformation';
import { 
  CalendarMonth as CalendarMonthIcon,
  PersonOutline as PersonOutlineIcon,
  PeopleAlt as PeopleAltIcon,
  Grade as GradeIcon,
  Groups as GroupsIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  FitnessCenter as FitnessCenterIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import "./Dashboard.css";
import { v4 as uuidv4 } from 'uuid';


export default function Calendar({ sidebarWidth }) {
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

  // Effect to handle sidebar width changes
  useEffect(() => {
    if (calendarRef.current) {
      // Force the calendar to update its dimensions when sidebar width changes
      setTimeout(() => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.updateSize();
      }, 200); // Small delay to allow transition to complete
    }
  }, [sidebarWidth]);

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
      
      // SPECIAL DAY VIEW RENDERING - optimized for the daily view
      if (currentView === 'timeGridDay') {
        const bgColor = getLevelColor(extendedProps?.classLevel);
        return (
          <div style={{
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '6px 8px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: bgColor,
            color: '#fff',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
          }}>
            {/* Class Title - Larger and Always Visible */}
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '15px',
              marginBottom: '6px',
              textAlign: 'center',
              overflow: 'visible',
              wordBreak: 'break-word',
              hyphens: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: '0 0 auto'
            }}>
              {title}
            </div>
            
            {/* Details Section - Simplified for day view */}
            <div style={{ 
              paddingLeft: '2px',
              flex: '1 1 auto',
              overflow: 'auto'
            }}>
              {/* Time */}
              <div style={{ 
                fontSize: '13px', 
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'flex-start',
                overflow: 'visible'
              }}>
                <AccessTimeIcon sx={{ fontSize: 13, mr: 1, mt: 0.2, flexShrink: 0 }} />
                <span>{formatTime(start)} - {formatTime(end)}</span>
              </div>
              
              {/* Instructor */}
              {extendedProps?.instructor && (
                <div style={{ 
                  fontSize: '13px', 
                  marginBottom: '5px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  overflow: 'visible',
                  wordBreak: 'break-word'
                }}>
                  <PersonOutlineIcon sx={{ fontSize: 13, mr: 1, mt: 0.2, flexShrink: 0 }} />
                  <span style={{ wordBreak: 'break-word' }}>{extendedProps.instructor}</span>
                </div>
              )}
              
              {/* Class Level */}
              {extendedProps?.classLevel && (
                <div style={{ 
                  fontSize: '13px', 
                  display: 'flex',
                  alignItems: 'flex-start',
                  overflow: 'visible',
                  wordBreak: 'break-word'
                }}>
                  <GradeIcon sx={{ fontSize: 13, mr: 1, mt: 0.2, flexShrink: 0 }} />
                  <span style={{ wordBreak: 'break-word' }}>{extendedProps.classLevel}</span>
                </div>
              )}
            </div>
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

      // For week view, adjust by duration
      const viewAdjustedSize = isSmallEvent ? 'small' : isMediumEvent ? 'medium' : 'large';

      // SMALL EVENT: only show class name and time
      if (viewAdjustedSize === 'small') {
        return (
          <Tooltip 
            title={
              <Box>
                <Typography variant="subtitle2">{title}</Typography>
                <Typography variant="body2" sx={{display: 'flex', alignItems: 'center'}}>
                  <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                  {formatTime(start)} - {formatTime(end)}
                </Typography>
                {extendedProps?.instructor && (
                  <Typography variant="body2" sx={{display: 'flex', alignItems: 'center'}}>
                    <PersonOutlineIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    {extendedProps.instructor}
                  </Typography>
                )}
                {extendedProps?.classLevel && (
                  <Typography variant="body2" sx={{display: 'flex', alignItems: 'center'}}>
                    <GradeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    {extendedProps.classLevel}
                  </Typography>
                )}
              </Box>
            }
            arrow
            placement="top"
            enterDelay={300}
            leaveDelay={100}
          >
            <div style={{
              borderRadius: '6px',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              padding: '3px 5px',
              height: '100%',
              overflow: 'hidden',
              backgroundColor: bgColor,
              color: '#fff',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '12px',
                marginBottom: '4px', // More spacing below title
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                maxHeight: '36px',
                overflow: 'auto',
                textAlign: 'center' // Center the title
              }}>
                {title}
              </div>
              
              {start && end && (
                <div style={{ 
                  fontSize: '10px', 
                  opacity: '0.9',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left' // Left-align the time
                }}>
                  {formatTime(start)}
                </div>
              )}
            </div>
          </Tooltip>
        );
      }

      // MEDIUM EVENT: show class name, time, and instructor
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
            justifyContent: 'flex-start',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px',
              marginBottom: '5px',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              maxHeight: '38px',
              overflow: 'auto',
              textAlign: 'center'
            }}>
              {title}
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              {/* Time */}
              <div style={{ 
                fontSize: '13px', 
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'flex-start',
                overflow: 'visible'
              }}>
                <AccessTimeIcon sx={{ fontSize: 13, mr: 1, mt: 0.2, flexShrink: 0 }} />
                <span>{formatTime(start)} - {formatTime(end)}</span>
              </div>
              
              {/* Instructor */}
              {extendedProps?.instructor && (
                <div style={{ 
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  <PersonOutlineIcon sx={{ fontSize: 11, mr: 0.5 }} />
                  {extendedProps.instructor}
                </div>
              )}
            </div>
          </div>
        );
      }

      // LARGE EVENT: show all event details
      else {
        return (
          <div style={{
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '6px 8px',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: bgColor,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px',
              marginBottom: '6px',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              maxHeight: '42px',
              overflow: 'auto',
              textAlign: 'center'
            }}>
              {title}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* Time */}
              <div style={{ 
                fontSize: '13px', 
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'flex-start',
                overflow: 'visible'
              }}>
                <AccessTimeIcon sx={{ fontSize: 13, mr: 1, mt: 0.2, flexShrink: 0 }} />
                <span>{formatTime(start)} - {formatTime(end)}</span>
              </div>
              
              {/* Instructor */}
              {extendedProps?.instructor && (
                <div style={{ 
                  fontSize: '12px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  <PersonOutlineIcon sx={{ fontSize: 12, mr: 0.5 }} />
                  {extendedProps.instructor}
                </div>
              )}
              
              {/* Class Level */}
              {extendedProps?.classLevel && (
                <div style={{ 
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  <GradeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                  {extendedProps.classLevel}
                </div>
              )}
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error("Error rendering event content:", error);
      return (<div>Error</div>);
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

  // Add a function to handle deleting an event
  const handleDeleteEvent = (eventId) => {
    // Ask for confirmation before deleting
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      // Filter out the event with the given ID
      const updatedEvents = events.filter(event => event.id !== eventId);
      
      // Update the state
      setEvents(updatedEvents);
      
      // Update localStorage
      try {
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      // Close the modal
      handleCloseModal();
    }
  };

  // Add a function to handle deleting all recurring events
  const handleDeleteRecurringEvents = (eventTitle) => {
    // Ask for confirmation before deleting all recurring events
    if (window.confirm('Do you want to delete all occurrences of this recurring class? This action cannot be undone.')) {
      // Filter out all events with the given title
      const updatedEvents = events.filter(event => event.title !== eventTitle);
      
      // Update the state
      setEvents(updatedEvents);
      
      // Update localStorage
      try {
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      // Close the modal
      handleCloseModal();
    }
  };

  return (
    <div className="calendar-container" style={{ 
      width: 'auto', 
      maxWidth: '100%', 
      overflow: 'hidden',
      height: 'calc(100vh - 100px)',
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
          contentHeight="auto"
          // expandRows={true}
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
          windowResize={(arg) => {
            // Update our width state
            if (typeof window !== 'undefined') {
              setWindowWidth(window.innerWidth);
            }
            
            // Check if arg and arg.view exist before proceeding
            if (!arg || !arg.view) return;
            
            const calendar = arg.view.calendar;
            // Only proceed if calendar exists
            if (!calendar || typeof calendar.changeView !== 'function') return;
            
            // Automatically adjust to screen size
            if (typeof window !== 'undefined') {
              const currentWidth = window.innerWidth;
              const currentViewType = arg.view.type;
              
              if (currentWidth < 768 && currentViewType !== 'timeGridDay') {
                calendar.changeView('timeGridDay');
              } else if (currentWidth >= 768 && currentWidth < 1024 && currentViewType !== 'timeGridWeek') {
                calendar.changeView('timeGridWeek');
              }
              // No else case needed - we don't need to change to month view automatically
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                      flex: 1,
                      mr: 1
                    }}
                  >
                    EDIT
                  </Button>
                  
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    sx={{
                      backgroundColor: 'error.lighter',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'error.light',
                      width: 40,
                      height: 40,
                      '& svg': {
                        color: 'error.main', // Default icon color
                        transition: 'color 0.2s ease'
                      },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'error.main', // Full red background on hover
                        borderColor: 'error.dark',
                        '& svg': {
                          color: 'white' // White icon on hover
                        }
                      }
                    }}
                    aria-label="delete class"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {/* Only show the delete all occurrences button if it's a recurring event */}
                {selectedEvent.extendedProps?.dayOfWeek && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="text" 
                      color="error"
                      size="small"
                      onClick={() => handleDeleteRecurringEvents(selectedEvent.title)}
                      sx={{ 
                        borderRadius: '8px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Delete All Occurrences
                    </Button>
                  </Box>
                )}
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