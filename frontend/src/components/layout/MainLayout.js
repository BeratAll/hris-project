'use client';

import { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Header from './Header';

/**
 * MainLayout — Ana Sayfa Düzeni
 *
 * Yapı:
 * ┌─────────┬─────────────────────────────┐
 * │         │         Header              │
 * │ Sidebar ├─────────────────────────────┤
 * │         │                             │
 * │ (260px) │       Content Area          │
 * │         │                             │
 * └─────────┴─────────────────────────────┘
 *
 * Responsive:
 * - Masaüstü (md+): Sabit sidebar
 * - Mobil (<md): Toggle edilebilir drawer
 */
export default function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerClose}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Ana İçerik Alanı */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Header onMenuToggle={handleMenuToggle} />

        {/* Toolbar Spacer — AppBar yüksekliği kadar boşluk */}
        <Toolbar />

        {/* Sayfa İçeriği */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
