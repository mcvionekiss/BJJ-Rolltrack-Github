import React, { useState } from 'react';
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
    Box
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis,
    ResponsiveContainer 
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Attendance Stats Card Component
const AttendanceStatsCard = ({ title }) => (
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
        <Typography variant="h2" sx={{ my: 3 }}>
            
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="success" />
            <Typography color="success.main">
                
            </Typography>
            <Typography color="text.secondary">
                
            </Typography>
        </Box>
    </Paper>
);

function Analytics() {
    const [timeRange, setTimeRange] = useState('day');

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" sx={{ mb: 6 }}>
                Analytics
            </Typography>

            {/* Attendance Stats Cards */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid xs={12} md={4}>
                    <AttendanceStatsCard title="Daily Attendance" />
                </Grid>
                <Grid xs={12} md={4}>
                    <AttendanceStatsCard title="Weekly Attendance" />
                </Grid>
                <Grid xs={12} md={4}>
                    <AttendanceStatsCard title="Monthly Attendance" />
                </Grid>
            </Grid>

            {/* Today's Classes and Trends */}
            <Grid container spacing={4}>
                {/* Today's Classes */}
                <Grid xs={12} md={5}>
                    <Paper 
                        sx={{ 
                            p: 4, 
                            borderRadius: 3,
                            minHeight: '400px'
                        }}
                    >
                        <Typography variant="h5" sx={{ mb: 4 }}>
                            Today's Classes
                        </Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CLASS NAME</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CHECK-INS</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TIME</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                {/* Trends */}
                <Grid xs={12} md={7}>
                    <Paper 
                        sx={{ 
                            p: 4, 
                            borderRadius: 3,
                            minHeight: '400px'
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 4 
                        }}>
                            <Typography variant="h5">
                                Trends
                            </Typography>
                            <ToggleButtonGroup
                                size="small"
                                value={timeRange}
                                exclusive
                                onChange={(e, newValue) => setTimeRange(newValue)}
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        textTransform: 'none',
                                        px: 3
                                    }
                                }}
                            >
                                <ToggleButton value="day">Day</ToggleButton>
                                <ToggleButton value="week">Week</ToggleButton>
                                <ToggleButton value="month">Month</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart>
                                <XAxis />
                                <YAxis />
                                <Bar dataKey="value" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Analytics;
