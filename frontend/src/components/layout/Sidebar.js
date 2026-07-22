'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as LeaveIcon,
  AccountBalance as PayrollIcon,
  Business as DepartmentIcon,
  Construction as SiteIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Security as AuditIcon,
} from '@mui/icons-material';
import { selectUserRole } from '@/store/slices/authSlice';

/**
 * Sidebar — Sol Navigasyon Menüsü
 *
 * Özellikler:
 * - Rol bazlı menü filtreleme (RBAC)
 * - Aktif sayfa highlight
 * - Logo ve şirket adı
 * - Responsive: mobilde Drawer, masaüstünde sabit
 */

const SIDEBAR_WIDTH = 260;

/**
 * Menü yapılandırması — Rol Bazlı Erişim Kontrolü (RBAC)
 *
 * Her menü öğesinin özellikleri:
 * - label:        Menüde görünecek başlık
 * - path:         Next.js route yolu
 * - icon:         Material UI ikon bileşeni
 * - allowedRoles: Bu öğeyi görebilecek roller (boş dizi = tüm roller)
 *
 * Roller: super_admin, hr_manager, hr_specialist, general_manager,
 *         site_chief, dept_manager, finance, employee
 */
const MENU_ITEMS = [
  {
    section: 'Ana Menü',
    items: [
      {
        label: 'Gösterge Paneli',
        path: '/dashboard',
        icon: <DashboardIcon />,
        allowedRoles: [],  // Tüm roller görebilir
      },
    ],
  },
  {
    section: 'İnsan Kaynakları',
    items: [
      {
        label: 'Çalışan Listesi',
        path: '/employees',
        icon: <PeopleIcon />,
        allowedRoles: ['super_admin', 'hr_manager', 'hr_specialist', 'general_manager', 'site_chief'],
      },
      {
        label: 'İzin Yönetimi',
        path: '/leaves',
        icon: <LeaveIcon />,
        allowedRoles: ['super_admin', 'hr_manager', 'hr_specialist', 'general_manager', 'site_chief', 'dept_manager'],
      },
      {
        label: 'Bordro',
        path: '/payroll',
        icon: <PayrollIcon />,
        allowedRoles: ['super_admin', 'hr_manager', 'finance', 'general_manager'],
      },
    ],
  },
  {
    section: 'Organizasyon',
    items: [
      {
        label: 'Departmanlar',
        path: '/departments',
        icon: <DepartmentIcon />,
        allowedRoles: ['super_admin', 'hr_manager', 'general_manager'],
      },
      {
        label: 'Şantiyeler',
        path: '/sites',
        icon: <SiteIcon />,
        allowedRoles: ['super_admin', 'hr_manager', 'general_manager', 'site_chief'],
      },
    ],
  },
  {
    section: 'Yönetim',
    items: [
      {
        label: 'Finans Raporları',
        path: '/reports/finance',
        icon: <ReportIcon />,
        allowedRoles: ['super_admin', 'finance', 'general_manager'],
      },
      {
        label: 'Denetim Kayıtları',
        path: '/audit-logs',
        icon: <AuditIcon />,
        allowedRoles: ['super_admin', 'general_manager'],
      },
      {
        label: 'Sistem Ayarları',
        path: '/settings',
        icon: <SettingsIcon />,
        allowedRoles: ['super_admin'],  // Sadece Süper Admin
      },
    ],
  },
];

/**
 * Menü öğesinin kullanıcının rolüne göre görünür olup olmadığını kontrol eder.
 * @param {Array} allowedRoles - İzin verilen roller (boşsa tüm roller)
 * @param {string} userRole - Kullanıcının rolü
 * @returns {boolean}
 */
const isMenuItemVisible = (allowedRoles, userRole) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (userRole === 'super_admin') {
    return true;
  }
  return allowedRoles.includes(userRole);
};

export default function Sidebar({ open, onClose, variant = 'permanent' }) {
  const pathname = usePathname();
  const userRole = useSelector(selectUserRole);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo ve Şirket Adı */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          HR
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            HRIS
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            İnsan Kaynakları Yönetimi
          </Typography>
        </Box>
      </Box>

      {/* Menü Öğeleri */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {MENU_ITEMS.map((section) => {
          const visibleItems = section.items.filter((item) =>
            isMenuItemVisible(item.allowedRoles, userRole)
          );

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <Box key={section.section}>
              <Typography
                variant="overline"
                sx={{
                  px: 2.5,
                  pt: 2,
                  pb: 0.5,
                  display: 'block',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  letterSpacing: '0.08em',
                }}
              >
                {section.section}
              </Typography>

              <List disablePadding>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);

                  return (
                    <ListItem key={item.path} disablePadding sx={{ px: 1.5, py: 0.25 }}>
                      <ListItemButton
                        component={Link}
                        href={item.path}
                        onClick={onClose}
                        selected={isActive}
                        sx={{
                          borderRadius: 1.5,
                          py: 0.9,
                          px: 1.5,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '& .MuiListItemIcon-root': { color: 'white' },
                            '&:hover': { bgcolor: 'primary.dark' },
                          },
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'inherit' : 'text.secondary' }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: {
                              fontSize: '0.825rem',
                              fontWeight: isActive ? 600 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* Alt Bilgi */}
      <Divider />
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          HRIS v1.0.0 — © 2026
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={variant === 'temporary' ? open : true}
      onClose={onClose}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      {drawerContent}
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
