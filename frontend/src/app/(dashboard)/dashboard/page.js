'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as LeaveIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { selectUser, selectUserRole } from '@/store/slices/authSlice';
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectDashboardStatus,
} from '@/store/slices/dashboardSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();

  // Redux State
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const stats = useSelector(selectDashboardStats);
  const status = useSelector(selectDashboardStatus);

  // Hoşgeldin başlığı için isim
  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Kullanıcı';

  // Sayfa yüklendiğinde istatistikleri çek
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const isLoading = status === 'loading';

  /**
   * Sayısal Değerleri Para Birimi (TRY) Olarak Formatlar
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // İstatistik Kartı Verileri (Kullanıcı rolüne göre dinamik başlıklar ve değerler)
  const isEmployee = userRole === 'employee';

  const statCards = [
    {
      title: isEmployee ? 'Çalışan Statüsü' : 'Toplam Personel',
      value: isEmployee ? 'Aktif' : stats.totalEmployees,
      icon: <PeopleIcon />,
      color: '#1B3A5C',
      bgColor: '#EBF0F5',
      isCurrency: false,
    },
    {
      title: isEmployee ? 'Bekleyen İzin Taleplerim' : 'Bekleyen İzin Talepleri',
      value: stats.pendingLeaves,
      icon: <LeaveIcon />,
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      isCurrency: false,
    },
    {
      title: isEmployee ? 'Aylık Net Maaşım' : 'Aylık Net Maaş Gideri',
      value: stats.totalPayrollExpense,
      icon: <PaymentsIcon />,
      color: '#E65100',
      bgColor: '#FFF3E0',
      isCurrency: true,
    },
  ];

  return (
    <Box>
      {/* Hoşgeldin Başlığı */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Hoş geldiniz, {fullName}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          HRIS Gösterge Paneli — Bugünkü özet bilgiler
        </Typography>
      </Box>

      {/* İstatistik Kartları Grid Yapısı */}
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, py: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
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
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  
                  {isLoading ? (
                    <Skeleton variant="text" width="60%" height={32} animation="wave" />
                  ) : (
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                      {card.isCurrency ? formatCurrency(card.value) : card.value}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
