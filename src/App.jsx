import React, { useState, useEffect, useCallback, } from 'react';
import {
  ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography,
  IconButton, Drawer, Snackbar, Alert, Chip, useMediaQuery, createTheme,
  LinearProgress, Badge
} from '@mui/material';
import { Menu as MenuIcon, Refresh as RefreshIcon, Sync as SyncIcon, Logout as LogoutIcon } from '@mui/icons-material';
import axios from 'axios';

// Components
import Dashboard from './components/Dashboard';
import Deposit from './components/Deposit';
import Transfer from './components/Transfer';
import STKPush from './components/STKPush';
import History from './components/History';
import Receipts from './components/Receipts';
import CreateUserDialog from './components/CreateUserDialog';
import DrawerContent from './components/DrawerContent';
import MerchantGateway from './components/MerchantGateway';
import Login from './components/Login';

import './App.css';

export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Cache for API responses
const cache = {
  users: { data: null, timestamp: 0 },
  history: {},
  receipts: {}
};
const CACHE_DURATION = 30000; // 30 seconds

function App() {
  // ============================================================
  // AUTHENTICATION STATE
  // ============================================================
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('levypesa_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('levypesa_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const currentUserName = currentUser?.full_name || currentUser?.username || currentUser?.email || '';

  const muiTheme = createTheme({
    palette: { primary: { main: '#115293' }, secondary: { main: '#066b27' } },
    typography: { fontFamily: '"Inter", sans-serif' },
  });

  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // --- STATE MANAGEMENT ---
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState({});
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, activeUsers: 0 });

  // Forms
  const [stkForm, setStkForm] = useState({ sender: '', receiver: '', amount: '', accountRef: 'LEVYPESA' });
  const [stkConfirm, setStkConfirm] = useState({ checkout_id: '', pin: '' });
  const [stkTab, setStkTab] = useState(0);
  const [depositForm, setDepositForm] = useState({ phone: '', amount: '' });
  const [transferForm, setTransferForm] = useState({ sender: '', receiver: '', amount: '', pin: '' });
  const [createUserForm, setCreateUserForm] = useState({
    full_name: '', phone_number: '', email: '', pin: '', confirm_pin: '', initial_balance: '1000'
  });

  // Optimized Snackbar
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // --- LOGOUT HANDLER ---
  const handleLogout = useCallback(() => {
    localStorage.removeItem('levypesa_auth');
    localStorage.removeItem('levypesa_admin');
    localStorage.removeItem('rememberedPhone');
    setIsAuthenticated(false);
    setCurrentUser(null);
    showSnackbar('Logged out successfully', 'info');
  }, [showSnackbar]);

  // --- OPTIMIZED LOAD USERS with Cache ---
  const loadUsers = useCallback(async (highlightPhones = [], forceRefresh = false) => {
    const now = Date.now();
    
    if (!forceRefresh && cache.users.data && (now - cache.users.timestamp) < CACHE_DURATION) {
      let data = cache.users.data;
      
      if (highlightPhones.length > 0) {
        setRecentlyUpdated(highlightPhones);
        data = [...data].sort((a, b) => {
          const aMatch = highlightPhones.includes(a.phone);
          const bMatch = highlightPhones.includes(b.phone);
          return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
        });
      } else if (recentlyUpdated.length > 0) {
        data = [...data].sort((a, b) => {
          const aMatch = recentlyUpdated.includes(a.phone);
          const bMatch = recentlyUpdated.includes(b.phone);
          return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
        });
      }
      
      setUsers(data);
      const total = data.reduce((s, u) => s + (u.balance || 0), 0);
      const activeUsers = data.filter(u => u.status === 'ACTIVE').length;
      setStats({ totalUsers: data.length, totalBalance: total, activeUsers });
      return;
    }

    setRefreshing(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`);
      let data = response.data.map(u => ({
        phone: u.phone_number, 
        name: u.full_name, 
        email: u.email, 
        balance: u.balance, 
        status: u.status || 'ACTIVE',
        syncing: false
      }));

      if (highlightPhones.length > 0) {
        setRecentlyUpdated(highlightPhones);
        data.sort((a, b) => {
          const aMatch = highlightPhones.includes(a.phone);
          const bMatch = highlightPhones.includes(b.phone);
          return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
        });
      } else if (recentlyUpdated.length > 0) {
        data.sort((a, b) => {
          const aMatch = recentlyUpdated.includes(a.phone);
          const bMatch = recentlyUpdated.includes(b.phone);
          return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
        });
      }

      cache.users = { data, timestamp: Date.now() };
      setUsers(data);
      
      const total = data.reduce((s, u) => s + (u.balance || 0), 0);
      const activeUsers = data.filter(u => u.status === 'ACTIVE').length;
      setStats({ totalUsers: data.length, totalBalance: total, activeUsers });
      
    } catch (error) {
      console.error('Failed to load users:', error);
      showSnackbar('Cannot connect to server. Please check if backend is running.', 'error'); 
    } finally {
      setRefreshing(false);
    }
  }, [recentlyUpdated, showSnackbar]);

  // --- OPTIMIZED CREATE USER ---
  const handleCreateUser = async () => {
    if (!createUserForm.full_name || !createUserForm.phone_number || !createUserForm.pin) {
      showSnackbar('Please fill all required fields', 'warning');
      return;
    }
    
    if (createUserForm.pin !== createUserForm.confirm_pin) {
      showSnackbar('PINs do not match', 'error');
      return;
    }
    
    if (createUserForm.pin.length < 4) {
      showSnackbar('PIN must be at least 4 digits', 'error');
      return;
    }

    const tempUser = {
      phone: createUserForm.phone_number,
      name: createUserForm.full_name,
      email: createUserForm.email,
      balance: parseFloat(createUserForm.initial_balance) || 0,
      status: 'ACTIVE',
      syncing: true
    };
    
    setUsers(prev => [tempUser, ...prev]);
    setSyncing({ [createUserForm.phone_number]: true });
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/users/register`, {
        phone_number: createUserForm.phone_number,
        full_name: createUserForm.full_name,
        email: createUserForm.email || '',
        pin: createUserForm.pin,
        initial_balance: parseFloat(createUserForm.initial_balance) || 0
      });
      
      showSnackbar('User created successfully!', 'success');
      setSyncing({});
      await loadUsers([createUserForm.phone_number], true);
      
      setCreateUserForm({
        full_name: '', phone_number: '', email: '', 
        pin: '', confirm_pin: '', initial_balance: '1000'
      });
      setOpenCreateUser(false);
      
    } catch {
      setSyncing({});
      await loadUsers([], true);
      showSnackbar('Failed to create user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- OPTIMIZED DEPOSIT ---
  const handleDeposit = async () => {
    if (!depositForm.phone || !depositForm.amount) {
      showSnackbar('Please select user and enter amount', 'warning');
      return;
    }
    
    const amount = parseFloat(depositForm.amount);
    if (amount <= 0) {
      showSnackbar('Amount must be greater than 0', 'warning');
      return;
    }

    setUsers(prev => prev.map(u => 
      u.phone === depositForm.phone 
        ? { ...u, balance: (u.balance || 0) + amount, syncing: true }
        : u
    ));
    setSyncing({ [depositForm.phone]: true });
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/deposit/`, {
        phone_number: depositForm.phone,
        amount
      });
      
      showSnackbar('Deposit Successful!', 'success');
      setDepositForm({ phone: '', amount: '' });
      setSyncing({});
      await loadUsers([depositForm.phone], true);
      
    } catch (error) {
      setSyncing({});
      await loadUsers([], true);
      showSnackbar(error.response?.data?.error || 'Deposit Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- OPTIMIZED TRANSFER ---
  const handleTransfer = async () => {
    if (!transferForm.sender || !transferForm.receiver || !transferForm.amount || !transferForm.pin) {
      showSnackbar('Please fill all fields', 'warning');
      return;
    }
    
    if (transferForm.sender === transferForm.receiver) {
      showSnackbar('Cannot transfer to yourself', 'error');
      return;
    }
    
    const amount = parseFloat(transferForm.amount);
    if (amount <= 0) {
      showSnackbar('Amount must be greater than 0', 'warning');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.phone === transferForm.sender) {
        return { ...u, balance: (u.balance || 0) - amount, syncing: true };
      }
      if (u.phone === transferForm.receiver) {
        return { ...u, balance: (u.balance || 0) + amount, syncing: true };
      }
      return u;
    }));
    setSyncing({ [transferForm.sender]: true, [transferForm.receiver]: true });
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/transfer/`, {
        sender_phone: transferForm.sender,
        receiver_phone: transferForm.receiver,
        amount,
        pin: transferForm.pin
      });
      
      showSnackbar('Transfer Successful!', 'success');
      setTransferForm({ sender: '', receiver: '', amount: '', pin: '' });
      setSyncing({});
      await loadUsers([transferForm.sender, transferForm.receiver], true);
      setActiveTab('dashboard');
      
    } catch (error) {
      setSyncing({});
      await loadUsers([], true);
      showSnackbar(error.response?.data?.error || 'Transfer Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- OPTIMIZED STK INITIATE ---
  const handleSTKInitiate = async () => {
    if (!stkForm.sender || !stkForm.receiver || !stkForm.amount) {
      showSnackbar('Please fill all fields (sender, receiver, amount)', 'warning');
      return;
    }
    
    const amount = parseFloat(stkForm.amount);
    if (amount <= 0) {
      showSnackbar('Amount must be greater than 0', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/stkpush/`, {
        sender_phone: stkForm.sender,
        receiver_phone: stkForm.receiver,
        amount,
        account_reference: stkForm.accountRef
      });
      
      setStkConfirm(prev => ({ ...prev, checkout_id: response.data.checkout_request_id }));
      setStkTab(1);
      showSnackbar('STK Push sent! Please enter PIN to confirm', 'info');
      
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'STK Push failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- OPTIMIZED STK CONFIRM ---
  const handleSTKConfirm = async () => {
    if (!stkConfirm.pin) {
      showSnackbar('PIN is required!', 'warning');
      return;
    }
    
    if (!stkConfirm.checkout_id) {
      showSnackbar('No checkout ID. Please restart STK Push.', 'error');
      return;
    }

    const amount = parseFloat(stkForm.amount);
    
    setUsers(prev => prev.map(u => {
      if (u.phone === stkForm.sender) {
        return { ...u, balance: (u.balance || 0) - amount, syncing: true };
      }
      if (u.phone === stkForm.receiver) {
        return { ...u, balance: (u.balance || 0) + amount, syncing: true };
      }
      return u;
    }));
    setSyncing({ [stkForm.sender]: true, [stkForm.receiver]: true });
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/stkpush/confirm/`, {
        checkout_request_id: stkConfirm.checkout_id,
        pin: stkConfirm.pin
      });

      showSnackbar('Payment completed successfully!', 'success');
      
      setStkTab(0);
      setStkConfirm({ checkout_id: '', pin: '' });
      setStkForm({ ...stkForm, amount: '' });
      setSyncing({});
      await loadUsers([stkForm.sender, stkForm.receiver], true);

    } catch (error) {
      setSyncing({});
      await loadUsers([], true);
      showSnackbar(error.response?.data?.error || 'Incorrect PIN or payment failed', 'error');
      setStkConfirm(prev => ({ ...prev, pin: '' }));
      
    } finally {
      setLoading(false);
    }
  };

  // --- STK STATUS CHECK ---
  const handleSTKStatus = async () => {
    if (!stkConfirm.checkout_id) {
      showSnackbar('No checkout ID. Please start STK Push first.', 'warning');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/stkpush/status/${stkConfirm.checkout_id}/`);
      showSnackbar(`Status: ${response.data.status}`, 'info');
    } catch {
      showSnackbar('Failed to get payment status', 'error');
    }
  };

  // --- STK CANCEL ---
  const handleSTKCancel = async () => {
    if (!stkConfirm.checkout_id) {
      showSnackbar('No checkout ID to cancel', 'warning');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/stkpush/cancel/${stkConfirm.checkout_id}/`);
      showSnackbar('Transaction cancelled', 'info');
      
      setStkTab(0);
      setStkConfirm({ checkout_id: '', pin: '' });
      
    } catch {
      showSnackbar('Failed to cancel transaction', 'error');
    }
  };

  // --- FETCH HISTORY (with cache) ---
  const fetchHistory = async (phone) => {
    if (!phone) return;
    
    const now = Date.now();
    if (cache.history[phone] && (now - cache.history[phone].timestamp) < CACHE_DURATION) {
      setTransactions(cache.history[phone].data);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${phone}/`);
      const data = response.data.transactions || [];
      cache.history[phone] = { data, timestamp: Date.now() };
      setTransactions(data);
    } catch {
      showSnackbar('Error fetching history', 'error');
    }
  };

  // --- FETCH RECEIPTS (with cache) ---
  const fetchReceipts = async (phone) => {
    if (!phone) return;
    
    const now = Date.now();
    if (cache.receipts[phone] && (now - cache.receipts[phone].timestamp) < CACHE_DURATION) {
      setReceipts(cache.receipts[phone].data);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/receipts/user/${phone}/`);
      const data = response.data.data || [];
      cache.receipts[phone] = { data, timestamp: Date.now() };
      setReceipts(data);
    } catch {
      showSnackbar('Error fetching receipts', 'error');
    }
  };

  // --- SEND RECEIPT EMAIL ---
  const handleSendReceiptEmail = async (receiptNumber) => {
    try {
      await axios.post(`${API_BASE_URL}/receipts/${receiptNumber}/email/`);
      showSnackbar('Receipt sent to email!', 'success');
      
      if (selectedUser) {
        delete cache.receipts[selectedUser];
        await fetchReceipts(selectedUser);
      }
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to send email', 'error');
    }
  };

  // --- RECEIPT HELPER FUNCTIONS ---
  const handleViewReceipt = (num) => window.open(`${API_BASE_URL}/receipts/${num}/view/`, '_blank');
  const handleDownloadReceipt = (num) => window.open(`${API_BASE_URL}/receipts/${num}/download/`, '_blank');
  const handlePrintReceipt = (num) => window.open(`${API_BASE_URL}/receipts/${num}/print/?print=true`, '_blank');
  const handleGetQRCode = (num) => window.open(`${API_BASE_URL}/receipts/${num}/qrcode/`, '_blank');

  // --- REFRESH ---
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers([], true);
    setRefreshing(false);
  };

  // Load users on mount if authenticated
  useEffect(() => { 
    if (isAuthenticated) {
      loadUsers(); 
    }
  }, [isAuthenticated, loadUsers]);

  // Calculate total syncing count
  const syncingCount = Object.keys(syncing).length;

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Login onLogin={(user) => {
          setIsAuthenticated(true);
          setCurrentUser(user);
          showSnackbar('Login successful!', 'success');
        }} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
        <AppBar position="fixed" sx={{ zIndex: 1300, background: 'linear-gradient(135deg, #115293 0%, #1a6bb5 100%)' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight="700">LevyPesa: Admin Portal</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User info */}
              {currentUserName && (
                <Chip 
                  label={currentUserName} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                  size="small"
                />
              )}
              {syncingCount > 0 && (
                <Badge badgeContent={syncingCount} color="warning">
                  <SyncIcon sx={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                </Badge>
              )}
              {!isMobile && (
                <Chip 
                  label={`TZS ${stats.totalBalance.toLocaleString()}`} 
                  sx={{ color: 'white', borderColor: 'white' }} 
                  variant="outlined" 
                />
              )}
              <IconButton 
                color="inherit" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
          {(loading || refreshing) && <LinearProgress sx={{ position: 'absolute', bottom: 0, width: '100%' }} />}
        </AppBar>
        <Toolbar />

        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <DrawerContent 
                activeTab={activeTab} 
                onNavigate={(tab) => { setActiveTab(tab); setDrawerOpen(false); }} 
                onCreateUser={() => { setOpenCreateUser(true); setDrawerOpen(false); }} 
            />
          </Drawer>

          <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, backgroundColor: '#f5f7fa' }}>
            <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
              
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <Dashboard 
                  users={users.map(u => ({ ...u, syncing: syncing[u.phone] || false }))} 
                  onDeposit={(p) => { 
                    setDepositForm({ ...depositForm, phone: p }); 
                    setActiveTab('deposit'); 
                  }} 
                  onViewHistory={(p) => { 
                    setSelectedUser(p); 
                    fetchHistory(p); 
                    setActiveTab('history'); 
                  }} 
                  onViewReceipts={(p) => { 
                    setSelectedUser(p); 
                    fetchReceipts(p); 
                    setActiveTab('receipts'); 
                  }} 
                  onRefresh={handleRefresh}
                  loading={loading || refreshing}
                />
              )}

              {/* STK PUSH TAB */}
              {activeTab === 'stkpush' && (
                <STKPush 
                  users={users} 
                  stkForm={stkForm} 
                  stkConfirm={stkConfirm} 
                  stkTab={stkTab} 
                  loading={loading} 
                  onStkTabChange={(e, v) => setStkTab(v)} 
                  onStkFormChange={(f, v) => setStkForm({ ...stkForm, [f]: v })} 
                  onStkConfirmChange={(f, v) => setStkConfirm({ ...stkConfirm, [f]: v })} 
                  onInitiate={handleSTKInitiate} 
                  onConfirm={handleSTKConfirm}
                  onCheckStatus={handleSTKStatus}
                  onCancel={handleSTKCancel}
                />
              )}

              {/* TRANSFER TAB */}
              {activeTab === 'transfer' && (
                <Transfer 
                  users={users} 
                  formData={transferForm} 
                  onFormChange={(f, v) => setTransferForm({ ...transferForm, [f]: v })} 
                  onSubmit={handleTransfer}
                  loading={loading}
                />
              )}

              {/* DEPOSIT TAB */}
              {activeTab === 'deposit' && (
                <Deposit 
                  users={users} 
                  formData={depositForm} 
                  onFormChange={(f, v) => setDepositForm({ ...depositForm, [f]: v })} 
                  onSubmit={handleDeposit} 
                  loading={loading}
                />
              )}

              {/* HISTORY TAB */}
              {activeTab === 'history' && (
                <History 
                  users={users} 
                  selectedUser={selectedUser} 
                  transactions={transactions} 
                  onUserSelect={(p) => { 
                    setSelectedUser(p); 
                    fetchHistory(p); 
                  }} 
                />
              )}

              {/* RECEIPTS TAB */}
              {activeTab === 'receipts' && (
                <Receipts 
                  users={users} 
                  selectedUser={selectedUser} 
                  receipts={receipts} 
                  onUserSelect={(p) => { 
                    setSelectedUser(p); 
                    fetchReceipts(p); 
                  }} 
                  onViewReceipt={handleViewReceipt} 
                  onDownloadReceipt={handleDownloadReceipt}
                  onPrintReceipt={handlePrintReceipt}
                  onGetQRCode={handleGetQRCode}
                  onSendEmail={handleSendReceiptEmail}
                />
              )}

              {/* MERCHANT GATEWAY TAB */}
              {activeTab === 'merchant' && (
                <MerchantGateway />
              )}

            </Box>
          </Box>
        </Box>

        {/* CREATE USER DIALOG */}
        <CreateUserDialog 
          open={openCreateUser} 
          onClose={() => setOpenCreateUser(false)} 
          formData={createUserForm} 
          onFormChange={(f, v) => setCreateUserForm({ ...createUserForm, [f]: v })} 
          onSubmit={handleCreateUser}
          loading={loading}
        />

        {/* SNACKBAR NOTIFICATIONS */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity} 
            variant="filled"
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ minWidth: '300px' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* CSS Animation for spinning sync icon */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </Box>
    </ThemeProvider>
  );
}

export default App;