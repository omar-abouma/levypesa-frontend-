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
import { Send as SendIcon } from '@mui/icons-material';
import './Transfer.css';

const Transfer = ({ 
  users,
  formData, 
  onFormChange, 
  onSubmit, 
  loading 
}) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom className="form-title">
        <SendIcon />
        Transfer Money
      </Typography>
      <Box component="form" noValidate sx={{ mt: 2 }}>
        <TextField
          select
          fullWidth
          margin="normal"
          label="Sender"
          value={formData.sender}
          onChange={(e) => onFormChange('sender', e.target.value)}
          required
        >
          <MenuItem value="">Select sender</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.phone} value={user.phone}>
              {user.name} ({user.phone}) - Balance: {user.balance?.toLocaleString()} TZS
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          margin="normal"
          label="Receiver"
          value={formData.receiver}
          onChange={(e) => onFormChange('receiver', e.target.value)}
          required
        >
          <MenuItem value="">Select receiver</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.phone} value={user.phone}>
              {user.name} ({user.phone})
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
        <TextField
          fullWidth
          margin="normal"
          label="PIN"
          type="password"
          value={formData.pin}
          onChange={(e) => onFormChange('pin', e.target.value)}
          required
          inputProps={{ maxLength: 6 }}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={onSubmit}
          disabled={loading || !formData.sender || !formData.receiver || !formData.amount || !formData.pin}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Money'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Transfer;