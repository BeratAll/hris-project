'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { selectUser, logoutUser } from '@/store/slices/authSlice';
import { SIDEBAR_WIDTH } from './Sidebar';

/**
 * Header — Üst Navigasyon Çubuğu
 *
 * Özellikler:
 * - Kullanıcı adı, rolü ve avatar
 * - Bildirim ikonu (placeholder)
 * - Profil dropdown menüsü (profil, şifre değiştir, çıkış)
 * - Mobilde hamburger menü tetikleyici
 */

/**
 * Rol kodunu okunabilir Türkçe etikete çevirir.
 */
const ROLE_LABELS = {
  super_admin: 'Süper Admin',
  hr_manager: 'İK Müdürü',
  hr_specialist: 'İK Uzmanı',
  general_manager: 'Genel Müdür',
  site_chief: 'Şantiye Şefi',
  dept_manager: 'Departman Müdürü',
  finance: 'Finans',
  employee: 'Çalışan',
};

export default function Header({ onMenuToggle }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logoutUser());
    router.push('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push('/profile');
  };

  // Kullanıcı adının baş harfleri (avatar)
  const userInitials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : '?';

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Kullanıcı';

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || '';

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { md: `${SIDEBAR_WIDTH}px` },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Sol: Mobil menü butonu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            onClick={onMenuToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Sağ: Bildirim + Kullanıcı */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Bildirim İkonu */}
          <Tooltip title="Bildirimler">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Kullanıcı Bilgisi */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              borderRadius: 2,
              px: 1,
              py: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={handleMenuOpen}
          >
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3, color: 'text.primary' }}>
                {fullName}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              />
            </Box>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {userInitials}
            </Avatar>
          </Box>

          {/* Dropdown Menü */}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            slotProps={{
              paper: {
                sx: {
                  width: 200,
                  mt: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profilim
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <LockIcon fontSize="small" />
              </ListItemIcon>
              Şifre Değiştir
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
