import React, { useState, useEffect } from 'react';
import axios from "axios";
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
    useTheme,
    CircularProgress,
    Alert
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
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NavigationMenu from "./NavigationMenu";
import { useNavigate } from "react-router-dom";

import config from "../config";

const fetchCsrfToken = async (setCsrfToken) => {
    try {
        const response = await axios.get(config.endpoints.auth.csrf, {
            withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

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
            {
                percentage > 0 ?
                <div>
                    <TrendingUpIcon color="success" />
                    <Typography color="success.main">
                        {percentage}%
                    </Typography>
                </div>
                :
                <div>
                    <TrendingDownIcon color="error" />
                    <Typography color="error.main">
                        {percentage}%
                    </Typography>
                </div>
            }
            <Typography color="text.secondary">
                {timePeriod}
            </Typography>
        </Box>
    </Paper>
);

const getdata = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.todayAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );
};

const getyesterdaydata = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.yesterdayAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );
};

const getweeklydata = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.weeklyAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );
};

const getlastweekdata = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.lastWeekAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );
};

const getmonthlydata = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.monthlyAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );
};

const getlastmonthdata = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.lastMonthAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );
};

const gettodaycategory = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.todayCategoryAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );

};

const getweekcategory = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.weekCategoryAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );

};

const getmonthcategory = async (csrfToken, gymId) => {
    return axios.get(
        config.endpoints.api.monthCategoryAttendance,
        {
            withCredentials: true, // Required for session authentication
            params: gymId ? { gym_id: gymId } : {}
        }
    );

};

function Analytics() {
    const [csrfToken, setCsrfToken] = useState("");
    const [timeRange, setTimeRange] = useState('day');
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const theme = useTheme();
    const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmScreen = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const [mockClassData, setMockClassData] = useState([]);
    const [dailyAttendanceCount, setDailyAttendanceCount] = useState(0);
    const [yesterdayAttendanceCount, setYesterdayAttendanceCount] = useState(0);
    const [WeeklyAttendanceCount, setWeeklyAttendanceCount] = useState(0);
    const [LastWeekAttendanceCount, setLastWeekAttendanceCount] = useState(0);
    const [MonthlyAttendanceCount, setMonthlyAttendanceCount] = useState(0);
    const [LastMonthAttendanceCount, setLastMonthAttendanceCount] = useState(0);
    const [TodayCategory, setTodayCategory] = useState([]);
    const [WeekCategory, setWeekCategory] = useState([]);
    const [MonthCategory, setMonthCategory] = useState([]);
    const [gymId, setGymId] = useState(null);
    const [gymName, setGymName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ✅ Fetch CSRF token when the component mounts
    useEffect(() => {
        fetchCsrfToken(setCsrfToken);
    }, []);

    // Fetch user profile to get gym information
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${config.apiUrl}/auth/profile/`, {
                    withCredentials: true
                });
                
                const { gym } = res.data;
                if (gym && gym.id) {
                    setGymId(gym.id);
                    setGymName(gym.name);
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setError("Failed to load gym information. Please try again.");
                setLoading(false);
                
                // If unauthorized, redirect to login
                if (error.response && error.response.status === 401) {
                    navigate("/login");
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    const getDailyData = async () => {
        try {
            const response = await getdata(csrfToken, gymId);
            setMockClassData(response.data.classes);
            setDailyAttendanceCount(response.data.total_attendance_for_today);
        } catch (error) {
            console.log(error);
        }
    };

    const getYesterdayData = async () => {
        try {
            const response = await getyesterdaydata(csrfToken, gymId);
            setYesterdayAttendanceCount(response.data.yesterdays_count);
        } catch (error) {
            console.log(error);
        }
    };

    const getWeeklyData = async () => {
        try {
            const response = await getweeklydata(csrfToken, gymId);
            setWeeklyAttendanceCount(response.data.weekly_count);
        } catch (error) {
            console.log(error);
        }
    };

    const getLastWeekData = async () => {
        try {
            const response = await getlastweekdata(csrfToken, gymId);
            setLastWeekAttendanceCount(response.data.weekly_count);
        } catch (error) {
            console.log(error);
        }
    };

    const getMonthlyData = async () => {
        try {
            const response = await getmonthlydata(csrfToken, gymId);
            setMonthlyAttendanceCount(response.data.monthly_count);
        } catch (error) {
            console.log(error);
        }
    };

    const getLastMonthData = async () => {
        try {
            const response = await getlastmonthdata(csrfToken, gymId);
            setLastMonthAttendanceCount(response.data.monthly_count);
        } catch (error) {
            console.log(error);
        }
    };

    const getDailyCategoryData = async () => {
        try {
            const response = await gettodaycategory(csrfToken, gymId);
            const arr = [];
            arr.push(response.data.data);
            setTodayCategory(arr);
        } catch (error) {
            console.log(error);
        }
    };

    const getWeekCategoryData = async () => {
        try {
            const response = await getweekcategory(csrfToken, gymId);
            const arr = [];
            arr.push(response.data.data);
            setWeekCategory(arr);
        } catch (error) {
            console.log(error);
        }
    };

    const getMonthCategoryData = async () => {
        try {
            const response = await getmonthcategory(csrfToken, gymId);
            const arr = [];
            arr.push(response.data.data);
            setMonthCategory(arr);
        } catch (error) {
            console.log(error);
        }
    };

    // Fetch analytics data when gymId is available
    useEffect(() => {
        if (gymId) {
            getDailyData();
            getYesterdayData();
            getWeeklyData();
            getLastWeekData();
            getMonthlyData();
            getLastMonthData();
            getDailyCategoryData();
            getWeekCategoryData();
            getMonthCategoryData();
        }
    }, [gymId, csrfToken]);
    
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
                return WeekCategory;
            case 'month':
                return MonthCategory;
            default:
                return TodayCategory;
        }
    };

    // Function to handle font size for axis tick labels
    const getTickFontSize = () => {
        if (isXsScreen) return 10;
        return 12;
    };

    return (
        <Box display="flex" sx={{height: '100vh', overflowY: 'auto',}}>
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
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                ) : (
                <>
                    {gymName && (
                        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                            {gymName} Analytics
                        </Typography>
                    )}
                    
                    {/* Attendance Stats Cards */}
                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 6 }, width: '100%' }}>
                    <Grid>
                        <AttendanceStatsCard
                            title="Daily Attendance"
                            value={dailyAttendanceCount}
                            percentage={yesterdayAttendanceCount > 0 ? (dailyAttendanceCount - yesterdayAttendanceCount) / yesterdayAttendanceCount : -100}
                            timePeriod="Since yesterday"
                            data={dailyAttendanceCount}
                        />
                    </Grid>
                    <Grid>
                        <AttendanceStatsCard
                            title="Weekly Attendance"
                            value={WeeklyAttendanceCount}
                            percentage={LastWeekAttendanceCount > 0 ? (WeeklyAttendanceCount - LastWeekAttendanceCount) / LastWeekAttendanceCount : 100}
                            timePeriod="Since last week"
                            data={WeeklyAttendanceCount}
                        />
                    </Grid>
                    <Grid>
                        <AttendanceStatsCard
                            title="Monthly Attendance"
                            value={MonthlyAttendanceCount}
                            percentage={LastMonthAttendanceCount > 0 ? (MonthlyAttendanceCount - LastMonthAttendanceCount) / LastMonthAttendanceCount : 100}
                            timePeriod="Since last month"
                            data={MonthlyAttendanceCount}
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
                                        dataKey={false}
                                        tickLine={false}
                                        dy={10}
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
                                    <Bar dataKey="Fundamental" fill="#bdbdbd" />
                                    <Bar dataKey="Beginner" fill="#bdbdbd" />
                                    <Bar dataKey="Intermediate" fill="#9e9e9e" />
                                    <Bar dataKey="Advanced" fill="#757575" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Box>
                    </Box>
                </>
                )}
            </Container>
        </Box>
    );
}

export default Analytics; 