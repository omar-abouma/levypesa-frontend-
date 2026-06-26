import React from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import './History.css'; 

const History = ({ users, selectedUser, transactions, loading, onUserSelect }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom className="form-title">
        <HistoryIcon />
        Transaction History
      </Typography>
      
      <TextField
        select
        fullWidth
        margin="normal"
        label="Select User"
        value={selectedUser || ''}
        onChange={(e) => onUserSelect(e.target.value)}
      >
        <MenuItem value="">Select a user</MenuItem>
        {users.map((user) => (
          <MenuItem key={user.phone} value={user.phone}>
            {user.name} ({user.phone})
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ mt: 3, maxHeight: 500, overflow: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <Card 
              key={index} 
              className={`transaction-item ${tx.status?.toLowerCase() || 'pending'}`}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <Chip
                      label={tx.transaction_type}
                      size="small"
                      color={
                        tx.transaction_type === 'DEPOSIT' ? 'success' : 
                        tx.transaction_type === 'TRANSFER' ? 'primary' : 
                        tx.transaction_type === 'STK_PUSH' ? 'secondary' : 'default'
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography variant="body2" fontWeight="bold">
                      {tx.amount?.toLocaleString()} TZS
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Chip
                      label={tx.status}
                      size="small"
                      color={
                        tx.status === 'SUCCESS' ? 'success' : 
                        tx.status === 'FAILED' ? 'error' : 
                        tx.status === 'PENDING' ? 'warning' : 'default'
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" display="block">
                      <strong>From:</strong> {tx.sender_phone || 'CASH'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>To:</strong> {tx.receiver_phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" display="block">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" noWrap>
                      Ref: {tx.reference_number?.substring(0, 8)}...
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            No transactions found. Select a user and make some transactions!
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default History;