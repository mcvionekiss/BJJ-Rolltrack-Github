import React, {useState} from 'react';
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
    TableContainer
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigationMenu from "./NavigationMenu";

// Mock data for clients
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
    {
        id: 2,
        name: 'Emma White',
        age: 30,
        gender: 'Female',
        contact: 'emma.white@email.com',
        skillLevel: 'Advanced',
        lastTrainingDate: '2024-11-28',
        subscription: 'Annual (Active)'
    },
    {
        id: 3,
        name: 'Alex Smith',
        age: 25,
        gender: 'Male',
        contact: 'alex.smith@email.com',
        skillLevel: 'Advanced',
        lastTrainingDate: '2024-11-26',
        subscription: 'Quarterly (Active)'
    },
    {
        id: 4,
        name: 'Sarah Lee',
        age: 20,
        gender: 'Female',
        contact: 'sarah.lee@email.com',
        skillLevel: 'Beginner',
        lastTrainingDate: '2024-12-18',
        subscription: 'New'
    },
    {
        id: 5,
        name: 'Mike Johnson',
        age: 10,
        gender: 'Male',
        contact: 'parent: johnson@email.com',
        skillLevel: 'Beginner',
        lastTrainingDate: '2024-11-25',
        subscription: 'Monthly (Active)'
    }
];

function ClientsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(250);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box display="flex">
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box sx={{
                    flexGrow: 1,
                    padding: 3,
                    maxWidth: 1200,
                    transition: "margin-left 0.3s ease-in-out",
                    marginLeft: `${sidebarWidth}px`}}
            >
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 5 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                        Clients
                    </Typography>

                    {/* Search and Filter Bar */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 0 },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        mb: 4
                    }}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            sx={{
                                borderColor: 'grey.300',
                                color: 'grey.700',
                                textTransform: 'none',
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Filters
                        </Button>

                        <TextField
                            placeholder="Search"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                width: { xs: '100%', sm: '300px' }
                            }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Box>

                    {/* Table */}
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>NAME</TableCell>
                                    <TableCell>AGE</TableCell>
                                    <TableCell>GENDER</TableCell>
                                    <TableCell>CONTACT</TableCell>
                                    <TableCell>SKILL LEVEL</TableCell>
                                    <TableCell>LAST TRAINING DATE</TableCell>
                                    <TableCell>SUBSCRIPTION</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockClients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client.id}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client.name}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client.age}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client.gender}</TableCell>
                                        <TableCell sx={{
                                            whiteSpace: 'nowrap',
                                            maxWidth: '200px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {client.contact}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client.skillLevel}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client.lastTrainingDate}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client.subscription}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <IconButton
                                                size="small"
                                                onClick={handleMenuClick}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Actions Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
                    </Menu>
                </Paper>
            </Box>
        </Box>
    );
}

export default ClientsPage;