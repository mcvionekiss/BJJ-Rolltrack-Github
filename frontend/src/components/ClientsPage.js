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
    TableContainer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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
    const [filter, setFilter] = useState('id');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [editClient, setEditClient] = useState(null);

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
        setEditClient(client);
    };

    const handleDelete = (clientId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this client?');
        if (confirmDelete) {
            const updatedClients = sortedClients.filter(client => client.id !== clientId);
            console.log('Deleted client ID:', clientId);
            // You would also update your state or backend here
        }
    };

    const sortedClients = [...mockClients].sort((a, b) => {
        if (filter === 'name' || filter === 'gender' || filter === 'skillLevel') {
            return a[filter].localeCompare(b[filter]);
        } else {
            return a[filter] - b[filter];
        }
    });

    return (
        <Box display="flex">
            <NavigationMenu onWidthChange={setSidebarWidth} />
            <Box sx={{
                    flexGrow: 1,
                    px: { xs: 2, sm: 3, md: 5 },
                    pt: { xs: 2, sm: 3, md: 5 },
                    maxWidth: "1400px",
                    marginLeft: `${sidebarWidth}px`,
                    transition: "margin-left 0.3s ease-in-out",
                }}
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
                            onClick={handleFilterClick}
                            sx={{
                                borderColor: 'grey.300',
                                color: 'grey.700',
                                textTransform: 'none',
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Filter
                        </Button>
                        <Menu
                            anchorEl={filterAnchorEl}
                            open={Boolean(filterAnchorEl)}
                            onClose={handleFilterClose}
                        >
                            <MenuItem onClick={() => handleFilterSelect('id')}>ID</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('name')}>Name</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('age')}>Age</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('gender')}>Gender</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('skillLevel')}>Skill Level</MenuItem>
                        </Menu>

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
                                {sortedClients.map((client) => (
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
                                                onClick={(e) => {
                                                    setAnchorEl({ anchor: e.currentTarget, client });
                                                }}
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
                        anchorEl={anchorEl?.anchor}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { handleEdit(anchorEl.client); handleMenuClose(); }}>Edit</MenuItem>
                        <MenuItem onClick={() => { handleDelete(anchorEl.client.id); handleMenuClose(); }}>Delete</MenuItem>
                    </Menu>

                    {/* Edit Client Modal */}
                    <Dialog open={Boolean(editClient)} onClose={() => setEditClient(null)}>
                        <DialogTitle>Edit Client</DialogTitle>
                        <DialogContent>
                            <TextField label="Name" fullWidth margin="dense" value={editClient?.name || ''} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} />
                            <TextField label="Age" type="number" fullWidth margin="dense" value={editClient?.age || ''} onChange={(e) => setEditClient({ ...editClient, age: parseInt(e.target.value) })} />
                            <TextField label="Gender" fullWidth margin="dense" value={editClient?.gender || ''} onChange={(e) => setEditClient({ ...editClient, gender: e.target.value })} />
                            <TextField label="Contact" fullWidth margin="dense" value={editClient?.contact || ''} onChange={(e) => setEditClient({ ...editClient, contact: e.target.value })} />
                            <TextField label="Skill Level" fullWidth margin="dense" value={editClient?.skillLevel || ''} onChange={(e) => setEditClient({ ...editClient, skillLevel: e.target.value })} />
                            <TextField label="Last Training Date" type="date" fullWidth margin="dense" value={editClient?.lastTrainingDate || ''} onChange={(e) => setEditClient({ ...editClient, lastTrainingDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                            <TextField label="Subscription" fullWidth margin="dense" value={editClient?.subscription || ''} onChange={(e) => setEditClient({ ...editClient, subscription: e.target.value })} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditClient(null)}>Cancel</Button>
                            <Button onClick={() => {
                                console.log('Updated client:', editClient);
                                setEditClient(null);
                            }} color="primary">Save</Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </Box>
        </Box>
    );
}

export default ClientsPage;