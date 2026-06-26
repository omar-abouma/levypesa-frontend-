import React from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { AccountBalance as BalanceIcon } from '@mui/icons-material';
import './Deposit.css';

const Deposit = ({ 
  users,
  formData, 
  onFormChange, 
  onSubmit, 
  loading 
}) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom className="form-title">
        <BalanceIcon />
        Deposit Money
      </Typography>
      <Box component="form" noValidate sx={{ mt: 2 }}>
        <TextField
          select
          fullWidth
          margin="normal"
          label="Select User"
          value={formData.phone}
          onChange={(e) => onFormChange('phone', e.target.value)}
          required
        >
          <MenuItem value="">Select a user</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.phone} value={user.phone}>
              {user.name} ({user.phone}) - Balance: {user.balance?.toLocaleString()} TZS
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          margin="normal"
          label="Amount (TZS)"
          type="number"
          value={formData.amount}
          onChange={(e) => onFormChange('amount', e.target.value)}
          required
          inputProps={{ min: 1 }}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={onSubmit}
          disabled={loading || !formData.phone || !formData.amount}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Deposit Money'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Deposit;