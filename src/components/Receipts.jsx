import React, { useState } from 'react';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../App';

// Receipt Detail Dialog Component
const ReceiptDetailDialog = ({ 
  open, 
  onClose, 
  selectedReceipt, 
  onViewReceipt, 
  onDownloadReceipt, 
  onPrintReceipt,
  formatDate 
}) => (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      {selectedReceipt && (
        <>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <ReceiptIcon sx={{ color: '#4CAF50' }} />
              <Typography variant="h6">Receipt Details</Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Receipt Header */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    bgcolor: '#f5f5f5', 
                    p: 2, 
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Receipt Number
                    </Typography>
                    <Typography variant="h6">
                      {selectedReceipt.receipt_number}
                    </Typography>
                  </Box>
                  <Chip 
                    label={selectedReceipt.email_sent ? 'Email Sent' : 'Email Not Sent'}
                    color={selectedReceipt.email_sent ? 'success' : 'default'}
                    icon={selectedReceipt.email_sent ? <CheckCircleIcon /> : <CancelIcon />}
                  />
                </Box>
              </Grid>

              {/* Transaction Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Transaction Information
                </Typography>
                <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Reference:</strong> {selectedReceipt.transaction_reference}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedReceipt.transaction_type || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Amount:</strong> 
                    <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {selectedReceipt.amount?.toLocaleString()} TZS
                    </span>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {formatDate(selectedReceipt.payment_date)}
                  </Typography>
                </Box>
              </Grid>

              {/* Sender Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Sender Information
                </Typography>
                <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedReceipt.sender_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedReceipt.sender_phone}
                  </Typography>
                  {selectedReceipt.sender_email && (
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedReceipt.sender_email}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Receiver Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Receiver Information
                </Typography>
                <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedReceipt.receiver_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedReceipt.receiver_phone}
                  </Typography>
                </Box>
              </Grid>

              {/* Timestamps */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Timestamps
                </Typography>
                <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Payment Date:</strong> {formatDate(selectedReceipt.payment_date)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Generated:</strong> {formatDate(selectedReceipt.generated_at)}
                  </Typography>
                  {selectedReceipt.email_sent_at && (
                    <Typography variant="body2">
                      <strong>Email Sent:</strong> {formatDate(selectedReceipt.email_sent_at)}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* QR Code Preview */}
              {selectedReceipt.qr_code && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    QR Code
                  </Typography>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <img 
                      src={`data:image/png;base64,${selectedReceipt.qr_code}`} 
                      alt="Receipt QR Code"
                      style={{ width: 150, height: 150 }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
              <Button 
                startIcon={<ViewIcon />}
                onClick={() => {
                  onViewReceipt(selectedReceipt.receipt_number);
                  onClose();
                }}
              >
                View Full Receipt
              </Button>
              <Button 
                startIcon={<DownloadIcon />}
                onClick={() => {
                  onDownloadReceipt(selectedReceipt.receipt_number);
                  onClose();
                }}
                color="primary"
              >
                Download
              </Button>
              <Button 
                startIcon={<PrintIcon />}
                onClick={() => {
                  onPrintReceipt(selectedReceipt.receipt_number);
                  onClose();
                }}
              >
                Print
              </Button>
              <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </>
      )}
    </Dialog>
);
  
const Receipts = ({ 
    users, 
    selectedUser, 
    receipts, 
    loading, 
    onUserSelect,
    onViewReceipt,
    onDownloadReceipt,
    onPrintReceipt,
    onGetQRCode,
    onSendEmail
  }) => {
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
  
    const handleViewDetails = (receipt) => {
      setSelectedReceipt(receipt);
      setOpenDetailDialog(true);
    };
  
    const handleCloseDetails = () => {
      setOpenDetailDialog(false);
      setSelectedReceipt(null);
    };
  
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString();
    };
  
    const getStatusIcon = (emailSent) => {
      return emailSent ? 
        <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 18 }} /> : 
        <CancelIcon sx={{ color: '#f44336', fontSize: 18 }} />;
    };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" gutterBottom>
            <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4CAF50' }} />
            Receipts
          </Typography>
          <Chip 
            label={`${receipts.length} Receipts`}
            color="primary"
            size="small"
          />
        </Box>
        
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
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                  {user.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2">{user.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user.phone} {user.email && `- ${user.email}`}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : receipts.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440, overflowY: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Receipt Number</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipts.map((receipt, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ReceiptIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                          <Typography variant="body2">
                            {receipt.receipt_number}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {receipt.amount?.toLocaleString()} TZS
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(receipt.payment_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={receipt.email_sent ? 'Email Sent' : 'Email Not Sent'}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getStatusIcon(receipt.email_sent)}
                            <Typography variant="caption">
                              {receipt.email_sent ? 'Sent' : 'Pending'}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewDetails(receipt)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Receipt">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => onViewReceipt(receipt.receipt_number)}
                            >
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => onDownloadReceipt(receipt.receipt_number)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => onPrintReceipt(receipt.receipt_number)}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="QR Code">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => onGetQRCode(receipt.receipt_number)}
                            >
                              <QrCodeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {receipt.sender_email && (
                            <Tooltip title="Send to Email">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => onSendEmail(receipt.receipt_number)}
                              >
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              {selectedUser ? 'No receipts found for this user.' : 'Select a user to view receipts.'}
            </Alert>
          )}
        </Box>

        {/* Quick Stats - IMEREKEBISHWA ILI ISICHAFUE UI */}
        {receipts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                    {receipts.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Total Receipts</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {receipts.filter(r => r.email_sent).length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Emails Sent</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography 
                    variant="subtitle2" 
                    color="warning.main" 
                    sx={{ 
                      fontWeight: 'bold', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {/* Jicalculate na formatting kwa ajili ya UI safi */}
                    {receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Total TZS</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 'bold' }}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Last Sync</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <ReceiptDetailDialog 
        open={openDetailDialog}
        onClose={handleCloseDetails}
        selectedReceipt={selectedReceipt}
        onViewReceipt={onViewReceipt}
        onDownloadReceipt={onDownloadReceipt}
        onPrintReceipt={onPrintReceipt}
        formatDate={formatDate}
      />
    </>
  );
};

export default Receipts;