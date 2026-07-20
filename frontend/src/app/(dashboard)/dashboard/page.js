'use client';

import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as LeaveIcon,
  Construction as SiteIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { selectUser } from '@/store/slices/authSlice';

/**
 * Dashboard Sayfası — Gösterge Paneli
 *
 * Hoşgeldin kartı ve özet istatistik kartları.
 * İleride gerçek verilerle dolacak.
 */

const STAT_CARDS = [
  {
    title: 'Toplam Personel',
    value: '—',
    icon: <PeopleIcon />,
    color: '#1B3A5C',
    bgColor: '#EBF0F5',
  },
  {
    title: 'Aktif İzinler',
    value: '—',
    icon: <LeaveIcon />,
    color: '#2E7D32',
    bgColor: '#E8F5E9',
  },
  {
    title: 'Aktif Şantiyeler',
    value: '—',
    icon: <SiteIcon />,
    color: '#E65100',
    bgColor: '#FFF3E0',
  },
  {
    title: 'Aylık Giriş',
    value: '—',
    icon: <TrendingIcon />,
    color: '#1565C0',
    bgColor: '#E3F2FD',
  },
];

export default function DashboardPage() {
  const user = useSelector(selectUser);
  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Kullanıcı';

  return (
    <Box>
      {/* Hoşgeldin */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Hoş geldiniz, {fullName}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          HRIS Gösterge Paneli — Bugünkü özet bilgiler
        </Typography>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={2.5}>
        {STAT_CARDS.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.title}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
