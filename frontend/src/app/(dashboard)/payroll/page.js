'use client';

import React, { useEffect, useState } from 'react';
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
  Alert,
  Snackbar,
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
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { selectUserRole } from '@/store/slices/authSlice';
import {
  fetchPayrolls,
  createPayroll,
  selectAllPayrolls,
  selectPayrollsStatus,
  selectPayrollsError,
  clearPayrollError,
} from '@/store/slices/payrollSlice';
import {
  fetchEmployees,
  selectAllEmployees,
} from '@/store/slices/employeeSlice';

export default function PayrollPage() {
  const dispatch = useDispatch();

  // Redux State
  const userRole = useSelector(selectUserRole);
  const payrolls = useSelector(selectAllPayrolls);
  const status = useSelector(selectPayrollsStatus);
  const payrollError = useSelector(selectPayrollsError);
  const employees = useSelector(selectAllEmployees);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [newPayroll, setNewPayroll] = useState({
    employeeId: '',
    period: '',
    grossSalary: '',
    netSalary: '',
  });

  // Sayfa yüklendiğinde bordro verilerini çek
  useEffect(() => {
    dispatch(fetchPayrolls());
  }, [dispatch]);

  // Yeni bordro ekleme modali açıldığında çalışan listesini çek
  useEffect(() => {
    if (isModalOpen && employees.length === 0) {
      dispatch(fetchEmployees());
    }
  }, [isModalOpen, employees.length, dispatch]);

  // Hata durumunda Snackbar göster
  useEffect(() => {
    if (payrollError) {
      setSnackbarOpen(true);
    }
  }, [payrollError]);

  // Yöneticiler (Bordro yönetimi yapabilecek olanlar): super_admin, hr_manager, finance, general_manager
  const isManager = ['super_admin', 'hr_manager', 'finance', 'general_manager'].includes(userRole);

  /**
   * PDF İndir Buton Tıklaması
   * @param {Object} row - Seçili bordro verisi
   */
  const handleDownloadPdf = (row) => {
    console.log('Download PDF for payroll:', row.id);
    alert(`PDF İndiriliyor: ${row.employeeName} - ${row.period} Dönemi Bordrosu`);
  };

  /**
   * Bordro Silme Tıklaması (Sadece yöneticiler)
   * @param {string} id - Bordro ID
   */
  const handleDeletePayroll = (id) => {
    console.log('Delete payroll:', id);
    if (confirm('Bu bordro kaydını silmek istediğinize emin misiniz?')) {
      // Not: İleride deletePayroll thunk entegre edilebilir.
      alert('Silme işlemi henüz entegre edilmedi.');
    }
  };

  /**
   * Yeni Bordro Ekleme Tıklaması (Modali açar)
   */
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  /**
   * Modali kapatıp form verilerini temizler
   */
  const handleCloseModal = () => {
    setNewPayroll({
      employeeId: '',
      period: '',
      grossSalary: '',
      netSalary: '',
    });
    setIsModalOpen(false);
    dispatch(clearPayrollError());
  };

  /**
   * Form Alanı Değişikliğini Yakala
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPayroll((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * YYYY-MM Formatındaki Dönem Bilgisini Türkçe Metne Çevirir
   * Örnek: "2026-07" -> "Temmuz 2026"
   */
  const formatPeriodToTR = (value) => {
    if (!value) return '';
    const [year, month] = value.split('-');
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const monthName = months[parseInt(month, 10) - 1];
    return `${monthName} ${year}`;
  };

  /**
   * Formu Gönder (Redux thunk dispatch eder)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedPeriod = formatPeriodToTR(newPayroll.period);
    const payrollData = {
      employeeId: newPayroll.employeeId,
      period: formattedPeriod,
      grossSalary: Number(newPayroll.grossSalary),
      netSalary: Number(newPayroll.netSalary),
      status: 'Bekliyor',
    };

    const result = await dispatch(createPayroll(payrollData));

    if (createPayroll.fulfilled.match(result)) {
      setSuccessSnackbarOpen(true);
      handleCloseModal();
    }
  };

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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearPayrollError());
  };

  // MUI DataGrid Sütun Tanımları
  const columns = [
    {
      field: 'id',
      headerName: 'Bordro ID',
      width: 150,
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
      field: 'period',
      headerName: 'Dönem',
      width: 150,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'grossSalary',
      headerName: 'Brüt Maaş',
      width: 160,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'netSalary',
      headerName: 'Net Maaş',
      width: 160,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 130,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const status = params.value;
        const isPaid = status === 'Ödendi';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={status}
              color={isPaid ? 'success' : 'warning'}
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
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      filterable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
            <Tooltip title="PDF İndir">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleDownloadPdf(params.row)}
                sx={{ '&:hover': { bgcolor: 'action.hover' } }}
              >
                <PdfIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* Silme butonu: Sadece bordro yönetim yetkisine sahip olan yöneticilere gösterilir */}
            {isManager && (
              <Tooltip title="Sil">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeletePayroll(params.row.id)}
                  sx={{ '&:hover': { bgcolor: 'error.lighter' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Üst Kısım: Sayfa Başlığı ve Ekle Butonu */}
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
            Maaş Bordroları
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Şantiye ve ofis personeline ait geçmiş dönem maaş bordrosu ve ödeme listesi
          </Typography>
        </Box>
        {isManager && (
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
            Yeni Bordro Ekle
          </Button>
        )}
      </Box>

      {/* Hata Durumunda Bildirim */}
      {payrollError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {payrollError}
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
          rows={payrolls}
          columns={columns}
          loading={status === 'loading' && payrolls.length === 0}
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

      {/* Yeni Bordro Ekleme Modali (Dialog) */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        aria-labelledby="add-payroll-dialog-title"
      >
        <DialogTitle id="add-payroll-dialog-title" sx={{ fontWeight: 700 }}>
          Yeni Bordro Ekle
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              {payrollError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {payrollError}
                </Alert>
              )}
              
              <FormControl fullWidth required>
                <InputLabel id="employee-select-label">Çalışan</InputLabel>
                <Select
                  labelId="employee-select-label"
                  label="Çalışan"
                  name="employeeId"
                  value={newPayroll.employeeId}
                  onChange={handleFormChange}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                type="month"
                label="Dönem"
                name="period"
                value={newPayroll.period}
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
                type="number"
                label="Brüt Maaş"
                name="grossSalary"
                value={newPayroll.grossSalary}
                onChange={handleFormChange}
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />

              <TextField
                required
                fullWidth
                type="number"
                label="Net Maaş"
                name="netSalary"
                value={newPayroll.netSalary}
                onChange={handleFormChange}
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }} disabled={status === 'loading'}>
              İptal
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }} disabled={status === 'loading' || !newPayroll.employeeId || !newPayroll.period || !newPayroll.grossSalary || !newPayroll.netSalary}>
              {status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {payrollError}
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
          Bordro başarıyla eklendi!
        </Alert>
      </Snackbar>
    </Box>
  );
}
