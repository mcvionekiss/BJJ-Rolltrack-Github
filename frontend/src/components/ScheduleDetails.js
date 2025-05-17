import React, { useState, useEffect } from 'react';
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from '@mui/material/TextField';
import dayjs from "dayjs";
import { Box, Typography } from '@mui/material';

const ScheduleDetails = ({ onContinue, onBack, setScheduleData, setScheduleErrors, initialSchedule }) => {
  const defaultSchedule =
  ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => ({
    day,
    openTime: day === "SUN" ? null : null, 
    closeTime: day === "SUN" ? null : null,
    closed: day === "SUN",
  }))

  const [schedule, setSchedule] = useState(initialSchedule.length ? initialSchedule : defaultSchedule);
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    if (initialSchedule.length) {
      setSchedule(initialSchedule);
    }
  }, [initialSchedule]); 

  useEffect(() => {
    if (initialSchedule.length) {
      const parsedSchedule = initialSchedule.map(entry => ({
        ...entry,
        openTime: typeof entry.openTime === "string" ? dayjs(entry.openTime, "h:mm A") : entry.openTime,
        closeTime: typeof entry.closeTime === "string" ? dayjs(entry.closeTime, "h:mm A") : entry.closeTime,
      }));
      setSchedule(parsedSchedule);
    }
  }, [initialSchedule]);

  const validateSchedule = (scheduleData) => {
    const errors = [];

    scheduleData.forEach((entry) => {
      if (!entry.closed) {
        if (!entry.openTime || !entry.closeTime) {
          errors.push(`${entry.day}: Please set both opening and closing times.`);
        } else {
          const openTime = dayjs(entry.openTime.format("HH:mm"), "HH:mm");
          const closeTime = dayjs(entry.closeTime.format("HH:mm"), "HH:mm");

          if (openTime.isAfter(closeTime)) {
            errors.push(`${entry.day}: Opening time cannot be after closing time.`);
          }
        }
      }
    });

    return errors;
  };

  const handleTimeChange = (index, field, value) => {
    if (!value || !value.isValid || !value.isValid()) return;

    setSchedule(prev => {
      const updatedSchedule = prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );

      const scheduleForParent = updatedSchedule.map(s => ({
        ...s,
        openTime: s.openTime ? s.openTime.format("h:mm A") : null,
        closeTime: s.closeTime ? s.closeTime.format("h:mm A") : null,
      }));

      setScheduleData(scheduleForParent);

      // Validate only this day's entry
      const entry = updatedSchedule[index];
      let error = "";
      if (!entry.closed) {
        if (!entry.openTime || !entry.closeTime) {
          error = "Please set both opening and closing times.";
        } else {
          const openTime = dayjs(entry.openTime.format("HH:mm"), "HH:mm");
          const closeTime = dayjs(entry.closeTime.format("HH:mm"), "HH:mm");
          if (openTime.isAfter(closeTime)|| openTime.isSame(closeTime)) {
            error = "Opening time can only be before closing time.";
          }
        }
      }

      setLocalErrors(prevErrors => {
        const newErrors = { ...prevErrors, [entry.day]: error };
        // Clean up if no error
        if (!error) delete newErrors[entry.day];
        setScheduleErrors(Object.values(newErrors));  // Update parent with error list for disabling Continue
        return newErrors;
      });

      return updatedSchedule;
    });
  };

  const handleClosedToggle = index => {
    setSchedule(prev => {
      const updatedSchedule = prev.map((item, i) => 
        i === index ? { ...item, closed: !item.closed } : item
      );
      const scheduleForParent = updatedSchedule.map(s => ({
        ...s,
        openTime: s.openTime ? s.openTime.format("h:mm A") : null,
        closeTime: s.closeTime ? s.closeTime.format("h:mm A") : null,
      }));
      setScheduleData(scheduleForParent); // Update form data in parent
      return updatedSchedule;
    });
  };

  const tableStyles = {
    table: {
      width: '100%',
      marginTop: '10px',
      borderCollapse: 'collapse'
    },
    tableCell: {
      padding: '10px',
      textAlign: 'center'
    }
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>Gym Hours of Operation</Typography>
      <Box>
        <Box 
          component="table" 
          sx={tableStyles.table}
        >
          <thead>
            <tr>
              <Box component="th" sx={tableStyles.tableCell}>Day</Box>
              <Box component="th" sx={tableStyles.tableCell}>Opening Time</Box>
              <Box component="th" sx={tableStyles.tableCell}>Closing Time</Box>
              <Box component="th" sx={tableStyles.tableCell}>Closed</Box>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, index) => (
              <tr key={entry.day}>
                <Box component="td" sx={tableStyles.tableCell}>{entry.day}</Box>
                <Box component="td" sx={tableStyles.tableCell}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        value={entry.closed ? null : (dayjs.isDayjs(entry.openTime) ? entry.openTime : dayjs(entry.openTime, "h:mm A"))}
                        onChange={(newTime) => handleTimeChange(index, "openTime", newTime)}
                        disabled={entry.closed}
                        format="hh:mm A"
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!localErrors[entry.day],
                            helperText: localErrors[entry.day],
                            inputProps: {
                              placeholder: "hh:mm AM",
                            },
                          },
                        }}
                        renderInput={(params) => <TextField {...params} size="small" />}
                      />
                  </LocalizationProvider>
                </Box>
                <Box component="td" sx={tableStyles.tableCell}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        value={entry.closed ? null : (dayjs.isDayjs(entry.closeTime) ? entry.closeTime : dayjs(entry.closeTime, "h:mm A"))}
                        onChange={(newTime) => handleTimeChange(index, "closeTime", newTime)}
                        disabled={entry.closed}
                        format="hh:mm A"
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!localErrors[entry.day],
                            helperText: localErrors[entry.day],
                            inputProps: {
                              placeholder: "hh:mm PM",
                            },
                          },
                        }}
                        renderInput={(params) => <TextField {...params} size="small" />}
                      />
                  </LocalizationProvider>
                </Box>
                <Box component="td" sx={tableStyles.tableCell}>
                  <input
                    type="checkbox"
                    checked={entry.closed}
                    onChange={() => handleClosedToggle(index)}
                  />
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
};

export default ScheduleDetails;