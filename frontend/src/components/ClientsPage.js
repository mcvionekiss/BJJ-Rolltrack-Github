import React, {useState, useEffect} from 'react';
import axios from 'axios';
import config from '../config';
import { 
    Box,
    Paper, 
    Typography, 
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Menu,
    MenuItem,
    TableContainer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Chip,
    Avatar,
    InputAdornment,
    Divider,
    Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import NavigationMenu from "./NavigationMenu";

// Mock data for clients - keeping for reference, not using
const mockClients = [
    {
        id: 1,
        name: 'Jonny Doe',
        age: 15,
        gender: 'Male',
        contact: 'jonny.doe@email.com',
        skillLevel: 'Beginner',
        lastTrainingDate: '2024-11-27',
        subscription: 'Monthly (Active)'
    },
    // ... other mock clients
];

function ClientsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [filter, setFilter] = useState('id');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [editClient, setEditClient] = useState(null);
    const [filteredClients, setFilteredClients] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [csrfToken, setCsrfToken] = useState(null);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterSelect = (filterType) => {
        setFilter(filterType);
        setFilterAnchorEl(null);
    };

    const handleEdit = (client) => {
        console.log('Editing client:', client);
        setEditClient({
            ...client,
            // Split date strings for the date inputs
            date_of_birth: client.date_of_birth ? client.date_of_birth.split('T')[0] : '',
            date_enrolled: client.date_enrolled ? client.date_enrolled.split('T')[0] : '',
        });
    };

    const handleDelete = (clientId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this client?');
        if (confirmDelete) {
            const updatedClients = filteredClients.filter(client => client.id !== clientId);
            console.log('Deleted client ID:', clientId);
            // You would also update your state or backend here
        }
    };

    // Get initial letter of name for avatar
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    // Format date to be more readable
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }).format(date);
    };

    useEffect(() => {
        // Fetch CSRF token when component mounts
        fetchCsrfToken();
    }, []);

    const fetchCsrfToken = async () => {
        try {
            // Use config object for consistent URL patterns
            const response = await axios.get(config.endpoints.auth.csrf, { withCredentials: true });
            setCsrfToken(response.data.csrfToken);
            console.log("CSRF token fetched successfully:", response.data.csrfToken);
            return response.data.csrfToken;
        } catch (error) {
            console.error("Failed to fetch CSRF token", error);
        }
    };

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(config.endpoints.api.getClients);
                console.log('Fetched clients data:', response.data);
                setClients(response.data.clients);
                setFilteredClients(response.data.clients);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching clients:', error);
                setError('Failed to fetch clients');
                setLoading(false);
            }
        };

        fetchClients();
    }, [retryCount]);

    // Handle search input changes
    useEffect(() => {
        if (clients.length > 0) {
            const query = searchQuery.toLowerCase().trim();
            if (query === '') {
                setFilteredClients(clients);
            } else {
                const filtered = clients.filter(client => 
                    client.first_name?.toLowerCase().includes(query) || 
                    client.last_name?.toLowerCase().includes(query) || 
                    client.email?.toLowerCase().includes(query) ||
                    client.username?.toLowerCase().includes(query)
                );
                setFilteredClients(filtered);
            }
        }
    }, [searchQuery, clients]);

    return (
        <Box display="flex">
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box sx={{
                    flexGrow: 1,
                    px: { xs: 2, sm: 3, md: 4 },
                    pt: { xs: 2, sm: 3, md: 4 },
                    marginLeft: `${sidebarWidth}px`,
                    transition: "margin-left 0.3s ease-in-out",
                    height: '100vh',
                    overflowY: 'auto',
                }}
            >
                <Paper elevation={0} sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                    bgcolor: 'white'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center', 
                        mb: 4
                    }}>
                        <Typography variant="h5" fontWeight="700" color="black" sx={{ mb: 0 }}>
                            Clients
                        </Typography>
                        
                        <Button
                            variant="contained"
                            color="grey.600"
                            startIcon={<PersonAddIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 2
                            }}
                            onClick={handleOpen}
                        >
                            Add New Client
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Search and Filter Bar */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 2 },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        mb: 3,
                        mt: 2
                    }}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={handleFilterClick}
                            sx={{
                                borderColor: 'grey.300',
                                color: 'grey.700',
                                textTransform: 'none',
                                width: { xs: '100%', sm: 'auto' },
                                borderRadius: 2,
                                fontWeight: 500,
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                            }}
                        >
                            Filter
                        </Button>
                        <Menu
                            anchorEl={filterAnchorEl}
                            open={Boolean(filterAnchorEl)}
                            onClose={handleFilterClose}
                            PaperProps={{
                                elevation: 2,
                                sx: { borderRadius: 1, maxWidth: 200 }
                            }}
                        >
                            <MenuItem onClick={() => handleFilterSelect('id')}>ID</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('name')}>Name</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('email')}>Email</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('username')}>Username</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('date_enrolled')}>Date Enrolled</MenuItem>
                        </Menu>

                        <TextField
                            placeholder="Search clients..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                width: { xs: '100%', sm: '300px' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                        borderWidth: '1px'
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Table */}
                    <TableContainer 
                        sx={{ 
                            overflowX: 'auto', 
                            maxHeight: '65vh',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                            '&::-webkit-scrollbar': {
                                width: '10px',
                                height: '10px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#bdbdbd',
                                borderRadius: '5px'
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>NAME</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>EMAIL</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>USERNAME</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>DATE ENROLLED</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>DATE OF BIRTH</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>

                            {/* Loading state */}
                            {loading && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Box
                                                display="flex"
                                                flexDirection="column"
                                                alignItems="center"
                                                justifyContent="center"
                                                minHeight="40vh"
                                                textAlign="center"
                                            >
                                                <CircularProgress size={40} sx={{ mb: 2, color: 'primary.main' }} />
                                                <Typography variant="h6" color="text.secondary">
                                                    Loading clients...
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}

                            {/* Error message */}
                            {error && !loading && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Box
                                                display="flex"
                                                flexDirection="column"
                                                alignItems="center"
                                                justifyContent="center"
                                                minHeight="20vh"
                                                textAlign="center"
                                                sx={{ my: 2 }}
                                            >
                                                <Typography color="error" variant="body1" sx={{ mb: 2 }}>
                                                    {error}
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => setRetryCount(count => count + 1)}
                                                    sx={{ 
                                                        textTransform: 'none',
                                                        borderRadius: 2,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Retry
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}

                            {/* Clients list */}
                            {!loading && !error && Array.isArray(filteredClients) && filteredClients.length > 0 ? (
                                <TableBody>
                                    {filteredClients.map((client) => (
                                        <TableRow
                                            key={client.id}
                                            hover
                                            sx={{ 
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '&:hover': { backgroundColor: '#f9fafb' },
                                                transition: 'background-color 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                        >
                                        <TableCell sx={{ py: 2 }}>{client.id}</TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {client.first_name} {client.last_name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EmailIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {client.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {client.username}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Chip
                                                icon={<CalendarTodayIcon />}
                                                label={formatDate(client.date_enrolled)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ 
                                                    borderRadius: 1,
                                                    fontWeight: 500,
                                                    color: 'black',
                                                    borderColor: 'grey.600'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography variant="body2">
                                                {formatDate(client.date_of_birth)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(client.id)}
                                                        sx={{ 
                                                            color: 'error.main',
                                                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(211, 47, 47, 0.15)',
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            ) : !loading && !error && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Box
                                                display="flex"
                                                flexDirection="column"
                                                alignItems="center"
                                                justifyContent="center"
                                                minHeight="40vh"
                                                textAlign="center"
                                            >
                                                <Typography variant="h6" color="text.secondary" fontWeight="bold">
                                                    No clients found.
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                                                    Try adjusting your search or add a new client.
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<PersonAddIcon />}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        boxShadow: 2
                                                    }}
                                                >
                                                    Add New Client
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>

                    {/* Client count info */}
                    {!loading && !error && filteredClients.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Typography variant="body2" color="text.secondary">
                                Showing {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
                                {searchQuery && ` for search "${searchQuery}"`}
                            </Typography>
                        </Box>
                    )}

                </Paper>
            </Box>
        </Box>
    );
}

export default ClientsPage;