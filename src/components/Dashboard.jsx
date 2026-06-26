import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Chip,
  Paper,
  CircularProgress,
  Tooltip,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  History as HistoryIcon,
  AccountBalance as BalanceIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import './Dashboard.css';

const Dashboard = ({ 
  users, 
  onViewHistory, 
  onViewReceipts,
  onDeposit,
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const usersWithEmail = users.filter(u => u.email).length;

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Box className="dashboard-layout">
      {/* Container ya Stats ikiwa na nafasi (Margin) kutoka juu */}
      <Box className="stats-fixed-bar">
        <Box className="stats-container">
          {/* Total Users */}
          <Paper className="stat-card-compact" elevation={0}>
            <Box className="stat-icon stat-icon-primary">
              <PeopleIcon />
            </Box>
            <Box className="stat-content">
              <Typography className="stat-label">Total Users</Typography>
              <Typography className="stat-value">{users.length}</Typography>
            </Box>
          </Paper>

          {/* Total Balance */}
          <Paper className="stat-card-compact" elevation={0}>
            <Box className="stat-icon stat-icon-secondary">
              <WalletIcon />
            </Box>
            <Box className="stat-content">
              <Typography className="stat-label">Total Balance</Typography>
              <Typography className="stat-value">{totalBalance.toLocaleString()} TZS</Typography>
            </Box>
          </Paper>

          {/* Active Users */}
          <Paper className="stat-card-compact" elevation={0}>
            <Box className="stat-icon stat-icon-primary">
              <TrendingUpIcon />
            </Box>
            <Box className="stat-content">
              <Typography className="stat-label">Active Users</Typography>
              <Typography className="stat-value">{activeUsers}</Typography>
            </Box>
          </Paper>

          {/* With Email */}
          <Paper className="stat-card-compact" elevation={0}>
            <Box className="stat-icon stat-icon-secondary">
              <EmailIcon />
            </Box>
            <Box className="stat-content">
              <Typography className="stat-label">With Email</Typography>
              <Typography className="stat-value">{usersWithEmail}</Typography>
            </Box>
          </Paper>

          {/* Search User - Added at the right of trending card */}
          <Paper className="stat-card-compact search-card" elevation={0}>
            <Box className="stat-icon stat-icon-search">
              <SearchIcon />
            </Box>
            <Box className="stat-content search-content">
              <TextField
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="standard"
                size="small"
                className="search-input"
                InputProps={{
                  disableUnderline: true,
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch} edge="end">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {searchTerm && (
                <Typography className="search-result-count">
                  Found {filteredUsers.length} users
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Sehemu ya Watumiaji */}
      <Box className="users-scrollable-container">
        {filteredUsers.length === 0 ? (
          <Box className="no-results-container">
            <SearchIcon className="no-results-icon" />
            <Typography variant="h6" className="no-results-title">
              No users found
            </Typography>
            <Typography variant="body2" className="no-results-subtitle">
              Try searching with a different name, phone number, or email
            </Typography>
            <Button 
              variant="outlined" 
              onClick={handleClearSearch}
              className="clear-search-btn"
            >
              Clear Search
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredUsers.map((user, index) => (
              <Grid item xs={12} md={6} lg={4} key={user.phone || index}>
                <Card className="user-card" elevation={0}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar className="user-avatar">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box ml={2} sx={{ overflow: 'hidden', flex: 1 }}>
                        <Typography variant="h6" noWrap className="user-name">{user.name || 'Unknown User'}</Typography>
                        <Typography variant="body2" color="textSecondary" display="flex" alignItems="center">
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                          {user.phone || 'No phone'}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider className="user-divider" />
                    
                    <Box className="user-balance-container">
                      <Typography className="user-balance-label">Current Balance</Typography>
                      <Typography className="user-balance-value">
                        {(user.balance || 0).toLocaleString()} TZS
                      </Typography>
                    </Box>

                    <Box className="action-buttons">
                      <Button
                        variant="outlined"
                        className="action-button"
                        startIcon={<HistoryIcon />}
                        onClick={() => onViewHistory(user.phone)}
                      >
                        History
                      </Button>
                      <Button
                        variant="outlined"
                        className="action-button action-receipt"
                        startIcon={<ReceiptIcon />}
                        onClick={() => onViewReceipts(user.phone)}
                      >
                        Receipts
                      </Button>
                      <Button
                        variant="outlined"
                        className="action-button"
                        startIcon={<BalanceIcon />}
                        onClick={() => onDeposit(user.phone)}
                      >
                        Deposit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;