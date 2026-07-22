'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { selectUserRole } from '@/store/slices/authSlice';
import {
  fetchLeaves,
  createLeave,
  selectAllLeaves,
  selectLeavesStatus,
  selectLeavesError,
  clearLeaveError,
} from '@/store/slices/leaveSlice';

export default function LeaveManagementPage() {
  const dispatch = useDispatch();

  // Redux State
  const userRole = useSelector(selectUserRole);
  const leaves = useSelector(selectAllLeaves);
  const status = useSelector(selectLeavesStatus);
  const leaveError = useSelector(selectLeavesError);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  // Sayfa açıldığında izin taleplerini çek
  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  // Hata durumunda Snackbar göster
  useEffect(() => {
    if (leaveError) {
      setSnackbarOpen(true);
    }
  }, [leaveError]);

  // İzin onaylama yetkisine sahip roller: super_admin, hr_manager, site_chief, dept_manager, general_manager
  const canApprove = ['super_admin', 'hr_manager', 'site_chief', 'dept_manager', 'general_manager'].includes(userRole);

  /**
   * İzin Talebini Onayla
   * @param {string} id - Talep ID
   */
  const handleApprove = (id) => {
    console.log('Approve leave request:', id);
    alert('Onaylama işlemi backend entegrasyonu aşamasında yapılacaktır.');
  };

  /**
   * İzin Talebini Reddet
   * @param {string} id - Talep ID
   */
  const handleReject = (id) => {
    console.log('Reject leave request:', id);
    alert('Reddetme işlemi backend entegrasyonu aşamasında yapılacaktır.');
  };

  /**
   * Yeni İzin Talebi Modalini Aç
   */
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  /**
   * Modali Kapat
   */
  const handleCloseModal = () => {
    setNewLeave({
      leaveType: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setIsModalOpen(false);
    dispatch(clearLeaveError());
  };

  /**
   * Form Alanı Değişikliğini Yakala
   * @param {React.ChangeEvent<{ name: string; value: unknown }>} e 
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewLeave((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Formu Gönder (Redux thunk dispatch eder)
   * @param {React.FormEvent} e 
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Yeni izin talebi gönderiliyor...', newLeave);

    const result = await dispatch(createLeave(newLeave));

    if (createLeave.fulfilled.match(result)) {
      setSuccessSnackbarOpen(true);
      handleCloseModal();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearLeaveError());
  };

  // MUI DataGrid Sütun Tanımları
  const columns = [
    {
      field: 'id',
      headerName: 'Talep ID',
      width: 120,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'employeeName',
      headerName: 'Çalışan Adı',
      width: 250,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const name = params.value || '';
        const initials = name
          ? name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : '?';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {name}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'leaveType',
      headerName: 'İzin Türü',
      width: 180,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'startDate',
      headerName: 'Başlangıç Tarihi',
      width: 160,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'endDate',
      headerName: 'Bitiş Tarihi',
      width: 160,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'duration',
      headerName: 'Süre (Gün)',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value} Gün
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 140,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const status = params.value;
        let color = 'default';

        if (status === 'Onaylandı') color = 'success';
        if (status === 'Bekliyor') color = 'warning';
        if (status === 'Reddedildi') color = 'error';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={status}
              color={color}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          </Box>
        );
      },
    },
    // İşlemler sütunu: Sadece izin onaylama yetkisi olan rollere gösterilir
    ...(canApprove
      ? [
          {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            sortable: false,
            filterable: false,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
              const isPending = params.row.status === 'Bekliyor';
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
                  <Tooltip title="Onayla">
                    <span>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(params.row.id)}
                        disabled={!isPending}
                        sx={{ '&:hover': { bgcolor: 'success.lighter' } }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Reddet">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleReject(params.row.id)}
                        disabled={!isPending}
                        sx={{ '&:hover': { bgcolor: 'error.lighter' } }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              );
            },
          },
        ]
      : []),
  ];

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
            İzin Talepleri
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Personeller tarafından oluşturulan yıllık izin, sağlık ve mazeret izni talepleri
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            py: 1,
            px: 2,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Yeni İzin Talebi
        </Button>
      </Box>

      {/* Hata Durumunda Bildirim */}
      {leaveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {leaveError}
        </Alert>
      )}

      {/* Tablo Alanı: DataGrid */}
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          height: 550,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={leaves}
          columns={columns}
          loading={status === 'loading' && leaves.length === 0}
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

      {/* Yeni İzin Talebi Modali (Dialog) */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        aria-labelledby="add-leave-dialog-title"
      >
        <DialogTitle id="add-leave-dialog-title" sx={{ fontWeight: 700 }}>
          Yeni İzin Talebi
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              {leaveError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {leaveError}
                </Alert>
              )}
              <FormControl fullWidth required>
                <InputLabel id="leave-type-select-label">İzin Türü</InputLabel>
                <Select
                  labelId="leave-type-select-label"
                  label="İzin Türü"
                  name="leaveType"
                  value={newLeave.leaveType}
                  onChange={handleFormChange}
                >
                  <MenuItem value="Yıllık İzin">Yıllık İzin</MenuItem>
                  <MenuItem value="Sağlık İzni">Sağlık İzni</MenuItem>
                  <MenuItem value="Mazeret İzni">Mazeret İzni</MenuItem>
                </Select>
              </FormControl>
              <TextField
                required
                fullWidth
                type="date"
                label="Başlangıç Tarihi"
                name="startDate"
                value={newLeave.startDate}
                onChange={handleFormChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
              <TextField
                required
                fullWidth
                type="date"
                label="Bitiş Tarihi"
                name="endDate"
                value={newLeave.endDate}
                onChange={handleFormChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Açıklama"
                name="description"
                value={newLeave.description}
                onChange={handleFormChange}
                placeholder="İzin talep gerekçesini buraya yazabilirsiniz..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }} disabled={status === 'loading'}>
              İptal
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }} disabled={status === 'loading' || !newLeave.leaveType || !newLeave.startDate || !newLeave.endDate}>
              {status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {leaveError}
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
          İzin talebiniz başarıyla oluşturuldu.
        </Alert>
      </Snackbar>
    </Box>
  );
}
