'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { selectUserRole, selectUser } from '@/store/slices/authSlice';
import {
  fetchAdvances,
  createAdvance,
  approveAdvance,
  rejectAdvance,
  selectAllAdvances,
  selectAdvancesStatus,
  selectAdvancesError,
  clearAdvancesError,
} from '@/store/slices/advanceSlice';

/**
 * Avans Statü Yapılandırması (Türkçe Karşılıkları & Renkler)
 */
const STATUS_CONFIG = {
  PENDING_MANAGER_APPROVAL: { label: 'Yönetici Onayı Bekliyor', color: 'warning' },
  PENDING_HR_APPROVAL: { label: 'İK Onayı Bekliyor', color: 'secondary' },
  PENDING_GM_APPROVAL: { label: 'Genel Müdür Onayı Bekliyor', color: 'primary' },
  PENDING_FINANCE: { label: 'Finans Ödemesi Bekliyor', color: 'info' },
  PAID: { label: 'Ödendi', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
};

export default function AdvancesPage() {
  const dispatch = useDispatch();

  // Redux State
  const userRole = useSelector(selectUserRole);
  const currentUser = useSelector(selectUser);
  const advances = useSelector(selectAllAdvances);
  const status = useSelector(selectAdvancesStatus);
  const advancesError = useSelector(selectAdvancesError);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formValues, setFormValues] = useState({
    amount: '',
    reason: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');

  // Sayfa yüklendiğinde talepleri çek
  useEffect(() => {
    dispatch(fetchAdvances());
  }, [dispatch]);

  // Hata durumunda Snackbar göster
  useEffect(() => {
    if (advancesError) {
      setSnackbarOpen(true);
    }
  }, [advancesError]);

  const handleOpenAddModal = () => {
    setFormValues({ amount: '', reason: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormValues({ amount: '', reason: '' });
    dispatch(clearAdvancesError());
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createAdvance({
        amount: Number(formValues.amount),
        reason: formValues.reason,
      })
    );
    if (createAdvance.fulfilled.match(result)) {
      setSuccessMessage('Avans talebi başarıyla gönderildi.');
      setSuccessSnackbarOpen(true);
      handleCloseModal();
    }
  };

  const handleApprove = async (id) => {
    const result = await dispatch(approveAdvance(id));
    if (approveAdvance.fulfilled.match(result)) {
      setSuccessMessage('Talep başarıyla onaylandı.');
      setSuccessSnackbarOpen(true);
    }
  };

  const handleOpenReject = (row) => {
    setSelectedAdvance(row);
    setRejectionReason('');
    setIsRejectOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedAdvance) {
      const result = await dispatch(
        rejectAdvance({
          id: selectedAdvance.id,
          rejectionReason,
        })
      );
      if (rejectAdvance.fulfilled.match(result)) {
        setSuccessMessage('Talep reddedildi.');
        setSuccessSnackbarOpen(true);
      }
      setIsRejectOpen(false);
      setSelectedAdvance(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearAdvancesError());
  };

  /**
   * Onay yetkisi kontrolü (Kullanıcı bu satıra onay/red verebilir mi?)
   */
  const canApproveOrReject = (row) => {
    const role = userRole;
    if (role === 'super_admin') return true;

    switch (row.status) {
      case 'PENDING_MANAGER_APPROVAL':
        return ['site_chief', 'dept_manager'].includes(role);
      case 'PENDING_HR_APPROVAL':
        return role === 'hr_manager';
      case 'PENDING_GM_APPROVAL':
        return role === 'general_manager';
      case 'PENDING_FINANCE':
        return role === 'finance';
      default:
        return false;
    }
  };

  // MUI DataGrid Sütun Tanımları
  const columns = [
    {
      field: 'employeeName',
      headerName: 'Çalışan',
      width: 200,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {params.value || 'Bilinmeyen Çalışan'}
        </Typography>
      ),
    },
    {
      field: 'amount',
      headerName: 'Tutar',
      width: 140,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value)}
        </Typography>
      ),
    },
    {
      field: 'reason',
      headerName: 'Gerekçe',
      width: 250,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'requestDate',
      headerName: 'Talep Tarihi',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 220,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const conf = STATUS_CONFIG[params.value] || { label: params.value, color: 'default' };
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={conf.label}
              color={conf.color}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Box>
        );
      },
    },
  ];

  // Eğer kullanıcı çalışan değilse, onaylama kolonunu ekle
  if (userRole !== 'employee') {
    columns.push({
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      filterable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const actionable = canApproveOrReject(params.row);
        if (!actionable) return null;

        const isPaymentStage = params.row.status === 'PENDING_FINANCE';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
            <Tooltip title={isPaymentStage ? 'Ödeme Yap' : 'Onayla'}>
              <IconButton
                size="small"
                color="success"
                onClick={() => handleApprove(params.row.id)}
              >
                {isPaymentStage ? <PaymentIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Reddet">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenReject(params.row)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    });
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Üst Kısım: Sayfa Başlığı ve Talep Butonu */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Avans & Harcama Talepleri
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Şirket içi onay aşamalı avans ve masraf taleplerinin takibi
          </Typography>
        </Box>
        {userRole === 'employee' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{
              py: 1,
              px: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Yeni Avans Talep Et
          </Button>
        )}
      </Box>

      {/* Hata Durumunda Bildirim */}
      {advancesError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {advancesError}
        </Alert>
      )}

      {/* Tablo Alanı: DataGrid */}
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          height: 500,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={advances}
          columns={columns}
          loading={status === 'loading' && advances.length === 0}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            border: 'none',
            '& .super-app-theme--header': {
              backgroundColor: 'background.neutral',
              color: 'text.primary',
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      </Paper>

      {/* Ekle Modali (Yeni Avans Talebi) */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        aria-labelledby="advance-dialog-title"
      >
        <DialogTitle id="advance-dialog-title" sx={{ fontWeight: 700 }}>
          Yeni Avans Talebi
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              {advancesError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {advancesError}
                </Alert>
              )}

              <TextField
                required
                fullWidth
                type="number"
                label="Avans Tutarı (₺)"
                name="amount"
                value={formValues.amount}
                onChange={handleFormChange}
                placeholder="Örn: 5000"
                inputProps={{ min: 1 }}
              />

              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Gerekçe / Açıklama"
                name="reason"
                value={formValues.reason}
                onChange={handleFormChange}
                placeholder="Talebinizin gerekçesini açıklayınız..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }} disabled={status === 'loading'}>
              İptal
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }} disabled={status === 'loading' || !formValues.amount || !formValues.reason.trim()}>
              {status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Red Gerekçe Modali */}
      <Dialog
        open={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title" sx={{ fontWeight: 700 }}>
          Talebi Reddet
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <Typography>
              Bu avans talebini reddetmek için lütfen bir gerekçe yazınız:
            </Typography>
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Red Gerekçesi"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Red nedenini açıklayınız..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsRejectOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Vazgeç
          </Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error" sx={{ fontWeight: 600 }} disabled={!rejectionReason.trim()}>
            Reddet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {advancesError}
        </Alert>
      </Snackbar>

      {/* Snackbar Başarı Bildirimi */}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
