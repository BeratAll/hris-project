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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  AssignmentReturn as ReturnIcon,
} from '@mui/icons-material';
import { selectUserRole } from '@/store/slices/authSlice';
import { fetchEmployees, selectAllEmployees } from '@/store/slices/employeeSlice';
import {
  fetchAssets,
  createAsset,
  returnAsset,
  selectAllAssets,
  selectAssetsStatus,
  selectAssetsError,
  clearAssetsError,
} from '@/store/slices/assetSlice';

/**
 * Zimmet Durum Yapılandırması (Türkçe Karşılıkları & Renkler)
 */
const STATUS_CONFIG = {
  IN_USE: { label: 'Kullanımda', color: 'warning' },
  RETURNED: { label: 'İade Edildi', color: 'success' },
  LOST: { label: 'Kayıp / Hasarlı', color: 'error' },
};

/**
 * Ekipman Türleri (Seçenekler)
 */
const ASSET_TYPES = [
  { value: 'laptop', label: 'Laptop / Bilgisayar' },
  { value: 'telefon', label: 'Cep Telefonu' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'baret', label: 'İş Güvenliği Bareti' },
  { value: 'monitor', label: 'Monitör' },
  { value: 'other', label: 'Diğer Araç/Gereç' },
];

export default function AssetsPage() {
  const dispatch = useDispatch();

  // Redux State
  const userRole = useSelector(selectUserRole);
  const assets = useSelector(selectAllAssets);
  const employees = useSelector(selectAllEmployees);
  const status = useSelector(selectAssetsStatus);
  const assetsError = useSelector(selectAssetsError);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formValues, setFormValues] = useState({
    employeeId: '',
    assetName: '',
    assetType: 'laptop',
    serialNumber: '',
    issueDate: new Date().toISOString().substring(0, 10),
  });

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    dispatch(fetchAssets());
    if (['super_admin', 'hr_manager'].includes(userRole)) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, userRole]);

  // Hata durumunda Snackbar göster
  useEffect(() => {
    if (assetsError) {
      setSnackbarOpen(true);
    }
  }, [assetsError]);

  const handleOpenAddModal = () => {
    setFormValues({
      employeeId: '',
      assetName: '',
      assetType: 'laptop',
      serialNumber: '',
      issueDate: new Date().toISOString().substring(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearAssetsError());
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
    const result = await dispatch(createAsset(formValues));
    if (createAsset.fulfilled.match(result)) {
      setSuccessMessage('Ekipman başarıyla zimmetlendi.');
      setSuccessSnackbarOpen(true);
      handleCloseModal();
    }
  };

  const handleReturn = async (id) => {
    const result = await dispatch(returnAsset(id));
    if (returnAsset.fulfilled.match(result)) {
      setSuccessMessage('Ekipman başarıyla iade alındı.');
      setSuccessSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearAssetsError());
  };

  const isManager = ['super_admin', 'hr_manager'].includes(userRole);

  // MUI DataGrid Sütun Tanımları
  const columns = [
    {
      field: 'assetName',
      headerName: 'Demirbaş Adı',
      width: 200,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'assetType',
      headerName: 'Ekipman Türü',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const found = ASSET_TYPES.find((t) => t.value === params.value);
        return <Typography variant="body2">{found ? found.label : params.value}</Typography>;
      },
    },
    {
      field: 'serialNumber',
      headerName: 'Seri Numarası',
      width: 180,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'employeeName',
      headerName: 'Zimmetli Personel',
      width: 200,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'issueDate',
      headerName: 'Zimmet Tarihi',
      width: 130,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'returnDate',
      headerName: 'İade Tarihi',
      width: 130,
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
      width: 140,
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

  // Yönetici ise İade Al butonunu ekle
  if (isManager) {
    columns.push({
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      sortable: false,
      filterable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        if (params.row.status !== 'IN_USE') return null;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
            <Tooltip title="İade Al">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleReturn(params.row.id)}
              >
                <ReturnIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    });
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Üst Kısım: Sayfa Başlığı ve Buton */}
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
            Zimmet ve Ekipman Takibi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Personellere zimmetli bilgisayar, telefon, baret ve saha ekipmanlarının yönetimi
          </Typography>
        </Box>
        {isManager && (
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
            Yeni Ekipman Zimmetle
          </Button>
        )}
      </Box>

      {/* Hata Durumunda Bildirim */}
      {assetsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {assetsError}
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
          rows={assets}
          columns={columns}
          loading={status === 'loading' && assets.length === 0}
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

      {/* Ekle Modali (Yeni Ekipman Zimmetle) */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        aria-labelledby="asset-dialog-title"
      >
        <DialogTitle id="asset-dialog-title" sx={{ fontWeight: 700 }}>
          Ekipman Zimmetle
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              {assetsError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {assetsError}
                </Alert>
              )}

              <FormControl fullWidth required>
                <InputLabel id="employee-select-label">Zimmetlenecek Personel</InputLabel>
                <Select
                  labelId="employee-select-label"
                  label="Zimmetlenecek Personel"
                  name="employeeId"
                  value={formValues.employeeId}
                  onChange={handleFormChange}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                label="Demirbaş / Cihaz Adı"
                name="assetName"
                value={formValues.assetName}
                onChange={handleFormChange}
                placeholder="Örn: Lenovo ThinkPad P16"
              />

              <FormControl fullWidth required>
                <InputLabel id="asset-type-select-label">Ekipman Türü</InputLabel>
                <Select
                  labelId="asset-type-select-label"
                  label="Ekipman Türü"
                  name="assetType"
                  value={formValues.assetType}
                  onChange={handleFormChange}
                >
                  {ASSET_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Seri Numarası"
                name="serialNumber"
                value={formValues.serialNumber}
                onChange={handleFormChange}
                placeholder="Örn: SN-987654321"
              />

              <TextField
                required
                fullWidth
                type="date"
                label="Veriliş Tarihi"
                name="issueDate"
                value={formValues.issueDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }} disabled={status === 'loading'}>
              İptal
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }} disabled={status === 'loading' || !formValues.employeeId || !formValues.assetName.trim()}>
              {status === 'loading' ? 'Kaydediliyor...' : 'Zimmetle'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {assetsError}
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
