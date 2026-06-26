import React from 'react';
import {
  Paper, Typography, Box, TextField, Button, CircularProgress,
  Grid, Tabs, Tab, Alert, MenuItem,
} from '@mui/material';
import { Payment as PaymentIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import './STKPush.css'; 

const STKPush = ({ 
  users, stkForm, stkConfirm, stkTab, onStkTabChange, 
  onStkFormChange, onStkConfirmChange, onInitiate, onConfirm, 
  onCheckStatus, onCancel, loading 
}) => {

  // Hii itasaidia kuzuia double-click lakini bila kuleta "lag" ya kuchelewa
  const handleConfirmClick = () => {
    if (!stkConfirm.pin || loading) return;
    onConfirm(); // Inaita handleSTKConfirm ya kwenye App.jsx
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: '15px' }}>
          <Typography variant="h6" gutterBottom className="form-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            STK Push (Instant Pay)
          </Typography>
          
          <Tabs value={stkTab} onChange={onStkTabChange} sx={{ mb: 3 }}>
            <Tab label="1. Initiate" />
            <Tab label="2. Confirm PIN" disabled={!stkConfirm.checkout_id} />
          </Tabs>

          {/* STEP 1: INITIATE */}
          {stkTab === 0 && (
            <Box>
              <TextField
                select fullWidth margin="normal" label="Sender (Customer)"
                value={stkForm.sender}
                onChange={(e) => onStkFormChange('sender', e.target.value)}
                required
              >
                <MenuItem value="">Select sender</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.phone} value={user.phone}>
                    {user.name} ({user.phone})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select fullWidth margin="normal" label="Receiver (Merchant)"
                value={stkForm.receiver}
                onChange={(e) => onStkFormChange('receiver', e.target.value)}
                required
              >
                {users.map((user) => (
                  <MenuItem key={user.phone} value={user.phone}>
                    {user.name} ({user.phone})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth margin="normal" label="Amount (TZS)" type="number"
                value={stkForm.amount}
                onChange={(e) => onStkFormChange('amount', e.target.value)}
                required
              />

              <Button
                fullWidth variant="contained" size="large"
                onClick={onInitiate}
                disabled={loading || !stkForm.sender || !stkForm.amount}
                sx={{ mt: 3, height: '55px', fontWeight: 'bold', borderRadius: '10px' }}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : 'Send STK Push'}
              </Button>
            </Box>
          )}

          {/* STEP 2: CONFIRM PIN - HAPA NDIPO KUNA SPEED */}
          {stkTab === 1 && stkConfirm.checkout_id && (
            <Box>
              <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  ID: {stkConfirm.checkout_id}
                </Typography>
              </Alert>
              
              <TextField
                fullWidth margin="normal" label="PIN" type="password" autoFocus
                value={stkConfirm.pin}
                onChange={(e) => onStkConfirmChange('pin', e.target.value)}
                placeholder="****"
                inputProps={{ 
                  maxLength: 4, 
                  style: { textAlign: 'center', fontSize: '25px', letterSpacing: '15px' } 
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmClick()}
              />
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Button
                    fullWidth variant="contained" color="secondary" size="large"
                    onClick={handleConfirmClick}
                    disabled={loading || stkConfirm.pin.length < 4}
                    startIcon={!loading && <CheckCircleIcon />}
                    sx={{ height: '55px', fontWeight: 'bold', borderRadius: '10px', fontSize: '1.1rem' }}
                  >
                    {loading ? <CircularProgress size={26} color="inherit" /> : 'CONFIRM NOW'}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button fullWidth variant="text" onClick={() => onCheckStatus(stkConfirm.checkout_id)}>
                    Check Status
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button fullWidth variant="text" color="error" onClick={() => onCancel(stkConfirm.checkout_id)}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default STKPush;