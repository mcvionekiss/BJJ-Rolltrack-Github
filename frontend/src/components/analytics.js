import React, { useState, useEffect } from 'react';
import { 
    Container,
    Paper, 
    Typography, 
    ToggleButtonGroup,
    ToggleButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Box,
    useMediaQuery,
    useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { 
    BarChart, 
    Bar, 
    LineChart,
    Line,
    XAxis, 
    YAxis,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NavigationMenu from "./NavigationMenu";

// Mock data for sparklines
const sparklineData = {
    daily: [
        { value: 65 }, { value: 72 }, { value: 68 }, { value: 75 }, 
        { value: 69 }, { value: 78 }, { value: 80 }
    ],
    weekly: [
        { value: 320 }, { value: 350 }, { value: 365 }, { value: 380 }, 
        { value: 340 }, { value: 390 }, { value: 400 }
    ],
    monthly: [
        { value: 1200 }, { value: 1400 }, { value: 1350 }, { value: 1450 }, 
        { value: 1480 }, { value: 1550 }, { value: 1600 }
    ]
};

// Mock data for different time ranges
const mockDayData = [
    {
        name: 'CHILDREN',
        Fundamental: 45,
        Beginner: 35,
        Intermediate: 25,
        Advanced: 20,
    },
    {
        name: 'TEENAGERS',
        Fundamental: 15,
        Beginner: 25,
        Intermediate: 40,
        Advanced: 30,
    },
    {
        name: 'ADULT',
        Fundamental: 10,
        Beginner: 35,
        Intermediate: 45,
        Advanced: 30,
    },
];

const mockWeekData = [
    {
        name: 'CHILDREN',
        Fundamental: 150,
        Beginner: 120,
        Intermediate: 80,
        Advanced: 50,
    },
    {
        name: 'TEENAGERS',
        Fundamental: 60,
        Beginner: 100,
        Intermediate: 140,
        Advanced: 90,
    },
    {
        name: 'ADULT',
        Fundamental: 40,
        Beginner: 110,
        Intermediate: 160,
        Advanced: 120,
    },
];

const mockMonthData = [
    {
        name: 'CHILDREN',
        Fundamental: 600,
        Beginner: 450,
        Intermediate: 300,
        Advanced: 200,
    },
    {
        name: 'TEENAGERS',
        Fundamental: 250,
        Beginner: 400,
        Intermediate: 550,
        Advanced: 400,
    },
    {
        name: 'ADULT',
        Fundamental: 180,
        Beginner: 480,
        Intermediate: 620,
        Advanced: 500,
    },
];

// Mock data for today's classes
const mockClassData = [
    { name: 'Tiny Champs', checkIns: 15, time: '10:00 AM' },
    { name: 'Advanced Teens', checkIns: 30, time: '3:30 PM' },
    { name: 'Adult Fundamentals', checkIns: 25, time: '5:00 PM' },
    { name: 'Adult Advanced', checkIns: 20, time: '6:00 PM' },
    { name: 'Kids Age 5-7', checkIns: 10, time: '7:00 PM' },
    { name: 'Kids Age 8-10', checkIns: 15, time: '8:00 PM' },
];

// Attendance Stats Card Component
const AttendanceStatsCard = ({ title, value, percentage, timePeriod, data }) => (
    <Paper 
        elevation={1} 
        sx={{ 
            p: 4,
            borderRadius: 3,
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}
    >
        <Typography color="text.secondary" variant="h6">
            {title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h2" sx={{ my: 3 }}>
                {value}
            </Typography>
            <Box sx={{ width: '100px', height: '40px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                            dot={false}
                            fill="url(#gradient)"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="success" />
            <Typography color="success.main">
                {percentage}%
            </Typography>
            <Typography color="text.secondary">
                {timePeriod}
            </Typography>
        </Box>
    </Paper>
);

function Analytics() {
    const [timeRange, setTimeRange] = useState('day');
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const theme = useTheme();
    const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMdScreen = useMediaQuery(theme.breakpoints.down('lg'));
    
    // Set chart height based on screen size
    const getChartHeight = () => {
        if (isXsScreen) return 300;
        if (isSmScreen) return 350;
        return 400;
    };

    // Get appropriate bar size based on screen size
    const getMaxBarSize = () => {
        if (isXsScreen) return 30;
        if (isSmScreen) return 40;
        return 50;
    };
    
    // Modify bar gap based on screen size
    const getBarGap = () => {
        if (isXsScreen) return 4;
        if (isSmScreen) return 8;
        return 12;
    };
    
    // Modify category gap based on screen size
    const getBarCategoryGap = () => {
        if (isXsScreen) return 20;
        if (isSmScreen) return 30;
        return 40;
    };

    const getChartData = (timeRange) => {
        switch (timeRange) {
            case 'week':
                return mockWeekData;
            case 'month':
                return mockMonthData;
            default:
                return mockDayData;
        }
    };

    // Function to handle font size for axis tick labels
    const getTickFontSize = () => {
        if (isXsScreen) return 10;
        return 12;
    };

    return (
        <Box display="flex">
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Container disableGutters maxWidth={false}
                sx={{
                    flexGrow: 1,
                    px: { xs: 1, sm: 2, md: 3, lg: 5 },
                    pt: { xs: 1, sm: 2, md: 3, lg: 5 },
                    marginLeft: `${sidebarWidth}px`,
                    width: `calc(100% - ${sidebarWidth}px)`
                }}
            >
                {/* Attendance Stats Cards */}
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 6 }, width: '100%' }}>
                    <Grid item xs={12} md={4}>
                        <AttendanceStatsCard
                            title="Daily Attendance"
                            value="80"
                            percentage="1.08"
                            timePeriod="Since yesterday"
                            data={sparklineData.daily}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <AttendanceStatsCard
                            title="Weekly Attendance"
                            value="400"
                            percentage="2.85"
                            timePeriod="Since last week"
                            data={sparklineData.weekly}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <AttendanceStatsCard
                            title="Monthly Attendance"
                            value="1,600"
                            percentage="5.38"
                            timePeriod="Since last month"
                            data={sparklineData.monthly}
                        />
                    </Grid>
                </Grid>

                {/* Today's Classes and Trends - Side by side */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, sm: 3, md: 4 } }}>
                    {/* Today's Classes */}
                    <Box sx={{ flex: 1 }}>
                        <Paper
                            sx={{
                                p: { xs: 2, sm: 3, md: 4 },
                                borderRadius: 3,
                                minHeight: '300px',
                                height: '100%',
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                                Today's Classes
                            </Typography>
                            <Box sx={{ overflowX: 'auto' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', py: { xs: 1, sm: 2 } }}>CLASS NAME</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', py: { xs: 1, sm: 2 } }}>CHECK-INS</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', py: { xs: 1, sm: 2 }, minWidth: '100px' }}>TIME</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mockClassData.map((classItem, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{ py: { xs: 1, sm: 2 } }}>{classItem.name}</TableCell>
                                                <TableCell sx={{ py: { xs: 1, sm: 2 } }}>{classItem.checkIns}</TableCell>
                                                <TableCell sx={{ py: { xs: 1, sm: 2 }, whiteSpace: 'nowrap' }}>{classItem.time}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Trends */}
                    <Box sx={{ flex: 2 }}>
                        <Paper
                            sx={{
                                p: { xs: 2, sm: 3, md: 4, lg: 5 },
                                borderRadius: 3,
                                minHeight: { xs: '300px', md: '350px', lg: '450px' },
                                height: '100%',
                                width: '100%'
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                mb: { xs: 2, sm: 3, md: 4 },
                                gap: { xs: 2, sm: 0 }
                            }}>
                                <Typography variant="h5">
                                    Trends
                                </Typography>
                                <ToggleButtonGroup
                                    size={isXsScreen ? "small" : "medium"}
                                    value={timeRange}
                                    exclusive
                                    onChange={(e, newValue) => newValue && setTimeRange(newValue)}
                                    sx={{
                                        '& .MuiToggleButton-root': {
                                            textTransform: 'none',
                                            px: { xs: 2, sm: 3 }
                                        }
                                    }}
                                >
                                    <ToggleButton value="day">Day</ToggleButton>
                                    <ToggleButton value="week">Week</ToggleButton>
                                    <ToggleButton value="month">Month</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                            <ResponsiveContainer width="100%" height={getChartHeight()}>
                                <BarChart
                                    data={getChartData(timeRange)}
                                    margin={{
                                        top: 20,
                                        right: isXsScreen ? 10 : (isSmScreen ? 20 : 30),
                                        left: isXsScreen ? 0 : 10,
                                        bottom: 20,
                                    }}
                                    barGap={getBarGap()}
                                    barCategoryGap={getBarCategoryGap()}
                                    maxBarSize={getMaxBarSize()}
                                >
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                        interval={0}
                                        tick={{ fontSize: getTickFontSize() }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={isXsScreen ? 10 : 12}
                                        width={isXsScreen ? 30 : 40}
                                    />
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        layout="horizontal"
                                        align="center"
                                        wrapperStyle={{
                                            paddingTop: '10px',
                                            paddingBottom: '10px',
                                            fontSize: isXsScreen ? '0.75rem' : '0.875rem'
                                        }}
                                    />
                                    <Bar dataKey="Fundamental" fill="#e0e0e0" />
                                    <Bar dataKey="Beginner" fill="#bdbdbd" />
                                    <Bar dataKey="Intermediate" fill="#9e9e9e" />
                                    <Bar dataKey="Advanced" fill="#757575" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default Analytics; 