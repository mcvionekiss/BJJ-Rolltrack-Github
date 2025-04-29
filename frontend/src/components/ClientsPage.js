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
import AddIcon from '@mui/icons-material/Add';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [filter, setFilter] = useState('id');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [editClient, setEditClient] = useState(null);
    const [filteredClients, setFilteredClients] = useState(mockClients);
    const [addClientOpen, setAddClientOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        email: '',
        name: '',
        age: '',
        gender: '',
        skillLevel: 'Beginner',
        subscription: 'New'
    });

    const [errors, setErrors] = useState({
        email: false,
        name: false,
        age: false,
        gender: false
    });

    const validateForm = () => {
        const newErrors = {
            email: !newClient.email,
            name: !newClient.name,
            age: !newClient.age,
            gender: !newClient.gender
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

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
            const updatedClients = filteredClients.filter(client => client.id !== clientId);
            setFilteredClients(updatedClients);
        }
    };

    const handleAddClient = () => {
        if (validateForm()) {
            const newId = Math.max(...mockClients.map(client => client.id)) + 1;
            const clientToAdd = {
                ...newClient,
                id: newId,
                contact: newClient.email,
                lastTrainingDate: new Date().toISOString().split('T')[0]
            };
            setFilteredClients([...filteredClients, clientToAdd]);
            setAddClientOpen(false);
            setNewClient({
                email: '',
                name: '',
                age: '',
                gender: '',
                skillLevel: 'Beginner',
                subscription: 'New'
            });
            setErrors({
                email: false,
                name: false,
                age: false,
                gender: false
            });
        }
    };

    const sortedClients = [...filteredClients].sort((a, b) => {
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Clients
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setAddClientOpen(true)}
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                                "&:hover": { backgroundColor: "#333" }
                            }}
                        >
                            Add Client
                        </Button>
                    </Box>

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
                            onChange={(e) => {
                                const query = e.target.value.toLowerCase().trim();
                                setSearchQuery(query);
                                const filtered = mockClients.filter(client =>
                                    client.name.toLowerCase().includes(query)
                                );
                                setFilteredClients(filtered);
                            }}
                            sx={{
                                width: { xs: '100%', sm: '300px' }
                            }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Box>

                    {/* Table */}
                    <TableContainer sx={{ overflowX: 'auto', height: '70vh' }}>
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

                    {/* Add Client Modal */}
                    <Dialog open={addClientOpen} onClose={() => setAddClientOpen(false)}>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Email"
                                fullWidth
                                margin="dense"
                                value={newClient.email}
                                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                required
                                error={errors.email}
                                helperText={errors.email ? "Email is required" : ""}
                            />
                            <TextField
                                label="Name"
                                fullWidth
                                margin="dense"
                                value={newClient.name}
                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                required
                                error={errors.name}
                                helperText={errors.name ? "Name is required" : ""}
                            />
                            <TextField
                                label="Age"
                                type="number"
                                fullWidth
                                margin="dense"
                                value={newClient.age}
                                onChange={(e) => setNewClient({ ...newClient, age: e.target.value })}
                                required
                                error={errors.age}
                                helperText={errors.age ? "Age is required" : ""}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                            <TextField
                                label="Gender"
                                fullWidth
                                margin="dense"
                                value={newClient.gender}
                                onChange={(e) => setNewClient({ ...newClient, gender: e.target.value })}
                                required
                                error={errors.gender}
                                helperText={errors.gender ? "Gender is required" : ""}
                            />
                            <TextField
                                label="Skill Level"
                                fullWidth
                                margin="dense"
                                value={newClient.skillLevel}
                                onChange={(e) => setNewClient({ ...newClient, skillLevel: e.target.value })}
                                select
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </TextField>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAddClientOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={handleAddClient}
                                disabled={!newClient.email || !newClient.name || !newClient.age || !newClient.gender}
                                sx={{
                                    backgroundColor: "black",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#333" }
                                }}
                            >
                                Add Client
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Edit Client Modal */}
                    <Dialog open={Boolean(editClient)} onClose={() => setEditClient(null)}>
                        <DialogTitle>Edit Client</DialogTitle>
                        <DialogContent>
                            <TextField 
                                label="Name" 
                                fullWidth 
                                margin="dense" 
                                value={editClient?.name || ''} 
                                onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} 
                                required
                            />
                            <TextField 
                                label="Age" 
                                type="number" 
                                fullWidth 
                                margin="dense" 
                                value={editClient?.age || ''} 
                                onChange={(e) => setEditClient({ ...editClient, age: parseInt(e.target.value) })} 
                                required
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                            <TextField 
                                label="Gender" 
                                fullWidth 
                                margin="dense" 
                                value={editClient?.gender || ''} 
                                onChange={(e) => setEditClient({ ...editClient, gender: e.target.value })} 
                                required
                            />
                            <TextField 
                                label="Contact" 
                                fullWidth 
                                margin="dense" 
                                value={editClient?.contact || ''} 
                                onChange={(e) => setEditClient({ ...editClient, contact: e.target.value })} 
                                required
                            />
                            <TextField 
                                label="Skill Level" 
                                fullWidth 
                                margin="dense" 
                                value={editClient?.skillLevel || ''} 
                                onChange={(e) => setEditClient({ ...editClient, skillLevel: e.target.value })} 
                                select
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </TextField>
                            <TextField 
                                label="Last Training Date" 
                                type="date" 
                                fullWidth 
                                margin="dense" 
                                value={editClient?.lastTrainingDate || ''} 
                                onChange={(e) => setEditClient({ ...editClient, lastTrainingDate: e.target.value })} 
                                InputLabelProps={{ shrink: true }} 
                                required
                            />
                            <TextField 
                                label="Subscription" 
                                fullWidth 
                                margin="dense" 
                                value={editClient?.subscription || ''} 
                                onChange={(e) => setEditClient({ ...editClient, subscription: e.target.value })} 
                                required
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditClient(null)}>Cancel</Button>
                            <Button 
                                onClick={() => {
                                    const updatedClients = filteredClients.map(client => 
                                        client.id === editClient.id ? editClient : client
                                    );
                                    setFilteredClients(updatedClients);
                                    setEditClient(null);
                                }}
                                sx={{
                                    backgroundColor: "black",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#333" }
                                }}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </Box>
        </Box>
    );
}

export default ClientsPage;