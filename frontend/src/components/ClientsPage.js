import { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    Clients
                </Typography>

                {/* Search and Filter Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        sx={{ borderColor: 'rgba(0, 0, 0, 0.23)' }}
                    >
                        Filters
                    </Button>

                    <TextField
                        placeholder="Search"
                        variant="outlined"
                        size="small"
                        sx={{ width: '300px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                </div>

                {/* Table */}
                <TableContainer>
                    <Table>
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
                            <TableRow hover>
                                <TableCell>1</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                    <IconButton size="small">
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}

export default ClientsPage;