import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper, Typography, TextField, Button, Box, Grid, Alert, CircularProgress,
  Card, CardContent, Divider, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Zoom,
  LinearProgress, Avatar, Tab, Tabs, FormControlLabel, Switch,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Storefront, Add, Refresh, AccountBalanceWallet, History, Receipt,
  Phone, AttachMoney, Lock, Visibility, Download,
  EmojiEvents, Edit, Block, CheckCircle, Search,
  Close, ContentCopy, Check, Warning, Delete, Key, Link, People,
  Print as PrintIcon, PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../App';
import './MerchantGateway.css';

const MerchantGateway = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [allMerchants, setAllMerchants] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  const [regenerateKeysDialogOpen, setRegenerateKeysDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apiKeysDialogOpen, setApiKeysDialogOpen] = useState(false);
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    email: '',
    callback_url: 'https://yourdomain.com/api/levypesa/callback/'
  });
  const [formErrors, setFormErrors] = useState({});
  const [registeredApiKeys, setRegisteredApiKeys] = useState(null);
  
  const [editForm, setEditForm] = useState({
    name: '',
    callback_url: '',
    is_active: true
  });
  
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalBalance: 0
  });

  const BASE_GATEWAY_URL = 'https://api.levypesa.com/v1';

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  
  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const showError = useCallback((message) => {
    alert(message);
  }, []);

  const handleCopy = useCallback(async (text, type) => {
    await navigator.clipboard.writeText(text);
    showSuccess(`${type} copied!`);
  }, [showSuccess]);

  // ============================================================
  // CREDENTIALS DOWNLOAD & PRINT (Only in Dialogs)
  // ============================================================
  
  const handleDownloadPDF = (merchant) => {
    window.open(`${API_BASE_URL}/gateway/admin/merchants/${merchant.id}/credentials/pdf/`, '_blank');
    showSuccess('Downloading PDF credentials...');
  };
  
  const handlePrintCredentials = (merchant) => {
    window.open(`${API_BASE_URL}/gateway/admin/merchants/${merchant.id}/print/`, '_blank');
    showSuccess('Opening credentials for printing...');
  };

  // ============================================================
  // API CALLS
  // ============================================================
  
  const filterMerchantsList = useCallback((merchants, search, status) => {
    let filtered = [...merchants];
    if (status === 'active') {
      filtered = filtered.filter(m => m.is_active);
    } else if (status === 'inactive') {
      filtered = filtered.filter(m => !m.is_active);
    }
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.client_id?.toLowerCase().includes(term) ||
        m.owner_phone?.toLowerCase().includes(term)
      );
    }
    setFilteredMerchants(filtered);
  }, []);

  const fetchAllMerchants = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/gateway/admin/merchants/`);
      setAllMerchants(response.data);
      
      const active = response.data.filter(m => m.is_active).length;
      const inactive = response.data.filter(m => !m.is_active).length;
      const totalBalance = response.data.reduce((sum, m) => sum + (m.balance || 0), 0);
      
      setStats({
        total: response.data.length,
        active,
        inactive,
        totalBalance
      });
      
      filterMerchantsList(response.data, searchTerm, statusFilter);
    } catch (_error) {
      console.error('Failed to fetch merchants:', _error);
      showError('Failed to load merchants');
    } finally {
      setRefreshing(false);
    }
  }, [searchTerm, statusFilter, filterMerchantsList, showError]);

  const fetchMerchantDetails = useCallback(async (merchant) => {
    setSelectedMerchant(merchant);
    setEditForm({
      name: merchant.name,
      callback_url: merchant.callback_url || '',
      is_active: merchant.is_active
    });
  }, []);

  const fetchMerchantTransactionsAdmin = useCallback(async (merchantId) => {
    setTransactionsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/gateway/admin/merchants/${merchantId}/transactions/`);
      setAdminTransactions(response.data);
    } catch {
      showError('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, [showError]);

  const handleUpdateMerchant = useCallback(async () => {
    if (!selectedMerchant) return;
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/gateway/admin/merchants/${selectedMerchant.id}/`, editForm);
      showSuccess('Merchant updated successfully!');
      setEditDialogOpen(false);
      fetchAllMerchants();
    } catch {
      showError('Failed to update merchant');
    } finally {
      setLoading(false);
    }
  }, [selectedMerchant, editForm, fetchAllMerchants, showSuccess, showError]);

  const handleToggleStatus = useCallback(async (merchant) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/gateway/admin/merchants/${merchant.id}/toggle-status/`);
      showSuccess(`${merchant.name} ${merchant.is_active ? 'deactivated' : 'activated'}!`);
      fetchAllMerchants();
    } catch {
      showError('Failed to toggle status');
    } finally {
      setLoading(false);
    }
  }, [fetchAllMerchants, showSuccess, showError]);

  const handleRegenerateKeys = useCallback(async () => {
    if (!selectedMerchant) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/gateway/admin/merchants/${selectedMerchant.id}/regenerate-keys/`);
      showSuccess('API Keys regenerated!');
      setRegenerateKeysDialogOpen(false);
      fetchAllMerchants();
      
      if (selectedMerchant) {
        setSelectedMerchant({
          ...selectedMerchant,
          api_key: response.data.api_key,
          secret_key: response.data.secret_key,
          client_id: response.data.client_id
        });
      }
    } catch {
      showError('Failed to regenerate keys');
    } finally {
      setLoading(false);
    }
  }, [selectedMerchant, fetchAllMerchants, showSuccess, showError]);
  
  const handleDeleteMerchant = useCallback(async () => {
    if (!selectedMerchant) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/gateway/admin/merchants/${selectedMerchant.id}/`);
      showSuccess('Merchant deleted!');
      setDeleteDialogOpen(false);
      fetchAllMerchants();
    } catch {
      showError('Failed to delete merchant');
    } finally {
      setLoading(false);
    }
  }, [selectedMerchant, fetchAllMerchants, showSuccess, showError]);

  const validateRegisterForm = useCallback(() => {
    const errors = {};
    if (!registerForm.name.trim()) errors.name = 'Business name is required';
    if (!registerForm.phone.trim()) errors.phone = 'Phone number is required';
    if (registerForm.phone && !/^0[0-9]{9}$/.test(registerForm.phone)) {
      errors.phone = 'Phone number must be 10 digits starting with 0';
    }
    if (registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      errors.email = 'Invalid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [registerForm]);

  const handleRegister = useCallback(async () => {
    if (!validateRegisterForm()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/gateway/v1/merchant/register/`, registerForm);
      setRegisteredApiKeys(response.data);
      showSuccess('Merchant registered successfully!');
      fetchAllMerchants();
      
      setRegisterForm({
        name: '',
        phone: '',
        email: '',
        callback_url: 'https://yourdomain.com/api/levypesa/callback/'
      });
    } catch (error) {
      showError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [registerForm, validateRegisterForm, fetchAllMerchants, showSuccess, showError]);

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    fetchAllMerchants();
  }, [fetchAllMerchants]);
  
  useEffect(() => {
    filterMerchantsList(allMerchants, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, allMerchants, filterMerchantsList]);

  // ============================================================
  // RENDER
  // ============================================================
  
  const SuccessToast = () => (
    <Zoom in={!!successMessage}>
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <Alert className="mg-alert-success" sx={{ boxShadow: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      </Box>
    </Zoom>
  );

  if (loading) {
    return (
      <Box className="merchant-gateway">
        <div className="mg-loading-overlay">
          <Card className="mg-card" sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress size={60} sx={{ color: '#115293' }} />
            <Typography variant="h6" sx={{ mt: 2 }}>Processing...</Typography>
          </Card>
        </div>
      </Box>
    );
  }

  return (
    <Box className="merchant-gateway">
      {/* Header */}
      <Paper className="mg-header-paper">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 50, height: 50, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Storefront sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>Merchant Gateway</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Register and Manage All Merchants
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={<People />} 
            label={`${stats.total} Total Merchants`} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1rem', py: 2 }}
          />
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper className="mg-tabs-paper">
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<Add />} label="Register Merchant" />
          <Tab icon={<Storefront />} label="Manage Merchants" />
        </Tabs>
      </Paper>

      {/* ============================================================ */}
      {/* TAB 0: REGISTER MERCHANT */}
      {/* ============================================================ */}
      {activeTab === 0 && (
        <div className="mg-tab-content">
          <Card className="mg-card mg-register-card">
            <div className="mg-card-header">
              <Typography variant="h5" fontWeight="bold" color="#115293">
                Register New Merchant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new merchant account and generate API keys for them
              </Typography>
            </div>
            <div className="mg-card-body">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Storefront /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone || 'Format: 0712345678'}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email (Optional)"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    InputProps={{ startAdornment: <InputAdornment position="start">@</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Callback URL"
                    value={registerForm.callback_url}
                    onChange={(e) => setRegisterForm({ ...registerForm, callback_url: e.target.value })}
                    helperText="URL where LevyPesa will send payment notifications"
                    InputProps={{ startAdornment: <InputAdornment position="start"><Link /></InputAdornment> }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button className="mg-btn-primary" size="large" onClick={handleRegister} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Register Merchant'}
                </Button>
              </Box>

              {registeredApiKeys && (
                <Alert className="mg-alert-success" sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Merchant Registered Successfully!</Typography>
                  <Typography variant="caption" color="text.secondary">Provide these credentials to the merchant:</Typography>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="caption">Client ID:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography fontFamily="monospace" sx={{ flex: 1 }}>{registeredApiKeys.client_id}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(registeredApiKeys.client_id, 'Client ID')}>
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Typography variant="caption">API Key:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography fontFamily="monospace" sx={{ flex: 1 }}>{registeredApiKeys.api_key}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(registeredApiKeys.api_key, 'API Key')}>
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Typography variant="caption">Secret Key:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography fontFamily="monospace" sx={{ flex: 1 }}>{registeredApiKeys.secret_key}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(registeredApiKeys.secret_key, 'Secret Key')}>
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Typography variant="caption">Base URL:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontFamily="monospace" sx={{ flex: 1 }}>{BASE_GATEWAY_URL}</Typography>
                      <IconButton size="small" onClick={() => handleCopy(BASE_GATEWAY_URL, 'Base URL')}>
                        <ContentCopy />
                      </IconButton>
                    </Box>
                  </Box>
                  <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
                    Store these credentials securely. The API Key and Secret Key will not be shown again!
                  </Alert>
                </Alert>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: MANAGE MERCHANTS */}
      {/* ============================================================ */}
      {activeTab === 1 && (
        <div className="mg-tab-content">
          {/* Stats Cards Row */}
          <div className="mg-stats-container">
            <Card className="mg-stat-card mg-bg-success">
              <Storefront className="mg-stat-icon" />
              <div className="mg-stat-value">{stats.total}</div>
              <div className="mg-stat-label">Total Merchants</div>
            </Card>
            <Card className="mg-stat-card mg-bg-info">
              <CheckCircle className="mg-stat-icon" />
              <div className="mg-stat-value">{stats.active}</div>
              <div className="mg-stat-label">Active Merchants</div>
            </Card>
            <Card className="mg-stat-card mg-bg-warning">
              <Block className="mg-stat-icon" />
              <div className="mg-stat-value">{stats.inactive}</div>
              <div className="mg-stat-label">Inactive Merchants</div>
            </Card>
            <Card className="mg-stat-card mg-bg-purple">
              <AccountBalanceWallet className="mg-stat-icon" />
              <div className="mg-stat-value">TZS {stats.totalBalance.toLocaleString()}</div>
              <div className="mg-stat-label">Total Balance</div>
            </Card>
          </div>

          {/* Search and Filter */}
          <Paper className="mg-search-paper">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, client ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                    <MenuItem value="all">All Merchants</MenuItem>
                    <MenuItem value="active">Active Only</MenuItem>
                    <MenuItem value="inactive">Inactive Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth className="mg-btn-primary" onClick={fetchAllMerchants} startIcon={<Refresh />}>
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Merchants Table - NO PDF, NO PRINT, NO HTML buttons here */}
          <Card className="mg-card mg-manage-card">
            <div className="mg-card-body">
              {refreshing && <LinearProgress />}
              <div className="mg-table-container">
                <table className="mg-table">
                  <thead>
                    <tr>
                      <th className="col-name">Business Name</th>
                      <th className="col-client-id">Client ID</th>
                      <th className="col-phone">Phone</th>
                      <th className="col-balance" align="right">Balance</th>
                      <th className="col-status" align="center">Status</th>
                      <th className="col-created" align="center">Created</th>
                      <th className="col-actions" align="center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMerchants.map((merchant) => (
                      <tr key={merchant.id}>
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#115293' }}>
                              <Storefront sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography fontWeight="500">{merchant.name}</Typography>
                          </Box>
                        </td>
                        <td className="mg-client-id" style={{ fontFamily: 'monospace', fontSize: 12 }}>{merchant.client_id}</td>
                        <td>{merchant.owner_phone}</td>
                        <td align="right">TZS {merchant.balance?.toLocaleString() || '0'}</td>
                        <td align="center">
                          <Chip 
                            label={merchant.is_active ? 'Active' : 'Inactive'} 
                            size="small" 
                            className={merchant.is_active ? 'mg-chip-success' : 'mg-chip-default'} 
                          />
                        </td>
                        <td align="center" style={{ fontSize: 12, color: '#666' }}>
                          {new Date(merchant.created_at).toLocaleDateString()}
                        </td>
                        <td align="center">
                          <div className="mg-action-buttons">
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => { fetchMerchantDetails(merchant); setDetailsDialogOpen(true); }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View API Keys">
                              <IconButton size="small" onClick={() => { setSelectedMerchant(merchant); setApiKeysDialogOpen(true); }} color="primary">
                                <Key fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Transactions">
                              <IconButton size="small" onClick={() => { fetchMerchantDetails(merchant); fetchMerchantTransactionsAdmin(merchant.id); setTransactionsDialogOpen(true); }}>
                                <History fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={merchant.is_active ? 'Deactivate' : 'Activate'}>
                              <IconButton size="small" onClick={() => handleToggleStatus(merchant)}>
                                {merchant.is_active ? <Block fontSize="small" sx={{ color: '#dc3545' }} /> : <CheckCircle fontSize="small" sx={{ color: '#066b27' }} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => { fetchMerchantDetails(merchant); setEditDialogOpen(true); }}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Regenerate Keys">
                              <IconButton size="small" onClick={() => { setSelectedMerchant(merchant); setRegenerateKeysDialogOpen(true); }} color="warning">
                                <Refresh fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMerchants.length === 0 && !refreshing && (
                <Typography textAlign="center" py={5} color="text.secondary">
                  No merchants found. Try adjusting your search or register a new merchant.
                </Typography>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* DIALOGS */}
      {/* ============================================================ */}
      
      {/* Merchant Details Dialog - PDF and Print buttons HERE */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="mg-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Storefront /> Merchant Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMerchant && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" color="#115293">Business Information</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}><Typography variant="caption">Business Name</Typography><Typography><strong>{selectedMerchant.name}</strong></Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption">Status</Typography><Chip label={selectedMerchant.is_active ? 'Active' : 'Inactive'} size="small" className={selectedMerchant.is_active ? 'mg-chip-success' : 'mg-chip-default'} /></Grid>
                      <Grid item xs={6}><Typography variant="caption">Phone</Typography><Typography>{selectedMerchant.owner_phone}</Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption">Email</Typography><Typography>{selectedMerchant.owner_email || 'N/A'}</Typography></Grid>
                      <Grid item xs={12}><Typography variant="caption">Callback URL</Typography><Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{selectedMerchant.callback_url || 'Not set'}</Typography></Grid>
                    </Grid>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="#115293">Financial Summary</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}><Typography variant="caption">Current Balance</Typography><Typography variant="h6" color="#066b27">TZS {selectedMerchant.balance?.toLocaleString() || '0'}</Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption">Created</Typography><Typography>{new Date(selectedMerchant.created_at).toLocaleString()}</Typography></Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button variant="outlined" onClick={() => handleDownloadPDF(selectedMerchant)} startIcon={<PdfIcon />}>PDF</Button>
          <Button variant="outlined" onClick={() => handlePrintCredentials(selectedMerchant)} startIcon={<PrintIcon />}>Print</Button>
        </DialogActions>
      </Dialog>

      {/* API Keys Dialog - PDF and Print buttons HERE */}
      <Dialog open={apiKeysDialogOpen} onClose={() => setApiKeysDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="mg-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Key /> API Keys - {selectedMerchant?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMerchant && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" className="mg-alert-info" sx={{ mb: 3 }}>
                These credentials should be shared securely with the merchant.
              </Alert>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Client ID</Typography>
                <Box className="mg-api-key-display" sx={{ mb: 2 }}>
                  <Typography fontFamily="monospace">{selectedMerchant.client_id}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(selectedMerchant.client_id, 'Client ID')}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">API Key</Typography>
                <Box className="mg-api-key-display" sx={{ mb: 2 }}>
                  <Typography fontFamily="monospace">{selectedMerchant.api_key}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(selectedMerchant.api_key, 'API Key')}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">Secret Key</Typography>
                <Box className="mg-api-key-display" sx={{ mb: 2 }}>
                  <Typography fontFamily="monospace">{selectedMerchant.secret_key || 'N/A'}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(selectedMerchant.secret_key, 'Secret Key')}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">Base URL</Typography>
                <Box className="mg-api-key-display">
                  <Typography fontFamily="monospace">{BASE_GATEWAY_URL}</Typography>
                  <IconButton size="small" onClick={() => handleCopy(BASE_GATEWAY_URL, 'Base URL')}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button fullWidth variant="outlined" onClick={() => handleDownloadPDF(selectedMerchant)} startIcon={<PdfIcon />}>PDF</Button>
                <Button fullWidth variant="outlined" onClick={() => handlePrintCredentials(selectedMerchant)} startIcon={<PrintIcon />}>Print</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeysDialogOpen(false)}>Close</Button>
          <Button className="mg-btn-warning" onClick={() => { setApiKeysDialogOpen(false); setRegenerateKeysDialogOpen(true); }}>
            Regenerate Keys
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Merchant Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="mg-dialog-title">Edit Merchant</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Business Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
          <TextField fullWidth label="Callback URL" value={editForm.callback_url} onChange={(e) => setEditForm({ ...editForm, callback_url: e.target.value })} sx={{ mb: 2 }} />
          <FormControlLabel control={<Switch checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} />} label="Active" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button className="mg-btn-primary" onClick={handleUpdateMerchant}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Transactions Dialog */}
      <Dialog open={transactionsDialogOpen} onClose={() => setTransactionsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle className="mg-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History /> Transactions for {selectedMerchant?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {transactionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : adminTransactions.length === 0 ? (
            <Typography textAlign="center" py={4} color="text.secondary">No transactions found for this merchant.</Typography>
          ) : (
            <div className="mg-table-container">
              <table className="mg-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th align="right">Amount</th>
                    <th align="center">Status</th>
                    <th align="right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {adminTransactions.map((tx) => (
                    <tr key={tx.reference_number}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.reference_number?.substring(0, 8)}...</td>
                      <td>{tx.customer_phone}</td>
                      <td align="right">TZS {tx.amount?.toLocaleString()}</td>
                      <td align="center">
                        <Chip label={tx.status} size="small" className={tx.status === 'SUCCESS' ? 'mg-chip-success' : 'mg-chip-default'} />
                      </td>
                      <td align="right">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Regenerate Keys Dialog */}
      <Dialog open={regenerateKeysDialogOpen} onClose={() => setRegenerateKeysDialogOpen(false)}>
        <DialogTitle className="mg-dialog-title">Regenerate API Keys</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="mg-alert-warning" sx={{ mb: 2 }}>
            <strong>Warning!</strong> Current API keys will be invalidated immediately.
          </Alert>
          <Typography>Are you sure you want to regenerate API keys for <strong>{selectedMerchant?.name}</strong>?</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            The merchant will need to update their integration with the new keys.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateKeysDialogOpen(false)}>Cancel</Button>
          <Button className="mg-btn-danger" onClick={handleRegenerateKeys}>
            Regenerate Keys
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Merchant Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle className="mg-dialog-title">Delete Merchant</DialogTitle>
        <DialogContent>
          <Alert severity="error" className="mg-alert-error" sx={{ mb: 2 }}>
            <strong>Danger!</strong> This action cannot be undone!
          </Alert>
          <Typography>Are you sure you want to delete <strong>{selectedMerchant?.name}</strong>?</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            All data associated with this merchant will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button className="mg-btn-danger" onClick={handleDeleteMerchant}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      <SuccessToast />
    </Box>
  );
};

export default MerchantGateway;