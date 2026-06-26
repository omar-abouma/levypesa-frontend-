import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const CreateUserDialog = ({ 
  open, 
  onClose, 
  formData, 
  onFormChange, 
  onSubmit, 
  loading 
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <PersonAddIcon sx={{ mr: 1, color: 'primary.main' }} />
          Create New User
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Full Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => onFormChange('full_name', e.target.value)}
                required
                variant="outlined"
                placeholder="Enter full name"
              />
            </Grid>
            
            {/* Phone Number */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone_number}
                onChange={(e) => onFormChange('phone_number', e.target.value)}
                required
                variant="outlined"
                placeholder="e.g., 0772117784"
              />
            </Grid>
            
            {/* NEW: Email Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={(e) => onFormChange('email', e.target.value)}
                variant="outlined"
                placeholder="e.g., user@example.com"
                helperText="Optional - for receipt delivery"
              />
            </Grid>
            
            {/* PIN */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PIN (4-6 digits)"
                type="password"
                value={formData.pin}
                onChange={(e) => onFormChange('pin', e.target.value)}
                inputProps={{ maxLength: 6 }}
                required
                variant="outlined"
              />
            </Grid>
            
            {/* Confirm PIN */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm PIN"
                type="password"
                value={formData.confirm_pin}
                onChange={(e) => onFormChange('confirm_pin', e.target.value)}
                inputProps={{ maxLength: 6 }}
                required
                error={formData.pin !== formData.confirm_pin}
                helperText={formData.pin !== formData.confirm_pin ? "PINs do not match" : ""}
                variant="outlined"
              />
            </Grid>
            
            {/* Initial Balance */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Initial Balance"
                type="number"
                value={formData.initial_balance}
                onChange={(e) => onFormChange('initial_balance', e.target.value)}
                variant="outlined"
                helperText="Starting balance in TZS"
              />
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>User will be created with:</strong>
            <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 20 }}>
              <li>A wallet with the specified initial balance</li>
              <li>Hashed PIN for security</li>
              {formData.email && <li>Email for receipt delivery: <strong>{formData.email}</strong></li>}
            </ul>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          variant="contained" 
          color="primary"
          disabled={
            loading || 
            !formData.full_name || 
            !formData.phone_number || 
            !formData.pin || 
            formData.pin !== formData.confirm_pin
          }
        >
          {loading ? <CircularProgress size={24} /> : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;