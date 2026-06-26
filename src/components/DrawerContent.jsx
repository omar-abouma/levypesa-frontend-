import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as BalanceIcon,
  Send as SendIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  PersonAdd as PersonAddIcon,
  Storefront as StorefrontIcon,  // ← Icon kwa Merchant Gateway
} from '@mui/icons-material';

const DrawerContent = ({ onNavigate, onCreateUser, activeTab }) => {
  // Menu items zote
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'deposit', label: 'Deposit', icon: <BalanceIcon /> },
    { id: 'transfer', label: 'Transfer', icon: <SendIcon /> },
    { id: 'stkpush', label: 'STK Push', icon: <PaymentIcon /> },
    { id: 'history', label: 'History', icon: <HistoryIcon /> },
    { id: 'receipts', label: 'Receipts', icon: <ReceiptIcon /> },
    { id: 'merchant', label: 'Merchant Gateway', icon: <StorefrontIcon /> },  // ← Merchant Gateway
  ];

  return (
    <Box sx={{ width: 280 }}>
      {/* Header ya Drawer */}
      <Box 
        className="drawer-header" 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
          color: 'white' 
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>LevyPesa</Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>Mobile Money Services provider</Typography>
      </Box>

      <List sx={{ p: 1 }}>
        {/* Menu Items - Looping through menuItems */}
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton 
              selected={activeTab === item.id} 
              onClick={() => onNavigate(item.id)}
              sx={{ 
                borderRadius: '8px', 
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: '#1e3c72',
                  '&:hover': {
                    backgroundColor: '#2a5298',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontWeight: '600',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: activeTab === item.id ? 'white' : 'inherit',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: activeTab === item.id ? '600' : '400',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Create New User - Separate button */}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={onCreateUser}
            sx={{ 
              borderRadius: '8px', 
              color: '#1e3c72',
              backgroundColor: '#f0f7ff',
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            }}
          >
            <ListItemIcon>
              <PersonAddIcon sx={{ color: '#1e3c72' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Create New User" 
              primaryTypographyProps={{ 
                fontWeight: '600',
                fontSize: '0.9rem',
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer ya Drawer - API Info */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2, 
        textAlign: 'center',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
      }}>
        <Typography variant="caption" color="text.secondary">
          API Gateway v1
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          /api/gateway/v1/
        </Typography>
      </Box>
    </Box>
  );
};

export default DrawerContent;