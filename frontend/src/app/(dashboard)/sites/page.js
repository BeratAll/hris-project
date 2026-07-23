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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { selectUserRole } from '@/store/slices/authSlice';
import {
  fetchSites,
  addSite,
  updateSite,
  deleteSite,
  selectAllSites,
  selectSitesStatus,
  selectSitesError,
  clearSiteError,
} from '@/store/slices/siteSlice';

export default function SitesPage() {
  const dispatch = useDispatch();

  // Redux State
  const userRole = useSelector(selectUserRole);
  const sites = useSelector(selectAllSites);
  const status = useSelector(selectSitesStatus);
  const siteError = useSelector(selectSitesError);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formValues, setFormValues] = useState({
    name: '',
    isActive: true,
  });

  // Sayfa yüklendiğinde şantiyeleri çek
  useEffect(() => {
    dispatch(fetchSites());
  }, [dispatch]);

  // Hata durumunda Snackbar göster
  useEffect(() => {
    if (siteError) {
      setSnackbarOpen(true);
    }
  }, [siteError]);

  // Sayfa yetkisi kontrolü: Sadece super_admin ve hr_manager
  const isAuthorized = ['super_admin', 'hr_manager'].includes(userRole);

  if (!isAuthorized) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Bu sayfaya erişim yetkiniz bulunmamaktadır.</Alert>
      </Box>
    );
  }

  /**
   * Yeni Şantiye Ekleme Modalini Aç
   */
  const handleOpenAddModal = () => {
    setSelectedSite(null);
    setFormValues({ name: '', isActive: true });
    setIsModalOpen(true);
  };

  /**
   * Şantiye Düzenleme Modalini Aç
   */
  const handleOpenEditModal = (row) => {
    setSelectedSite(row);
    setFormValues({
      name: row.name,
      isActive: row.isActive,
    });
    setIsModalOpen(true);
  };

  /**
   * Modali Kapat
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSite(null);
    setFormValues({ name: '', isActive: true });
    dispatch(clearSiteError());
  };

  /**
   * Form Alanı Değişikliğini Yakala
   */
  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Formu Gönder (Ekle/Güncelle)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (selectedSite) {
      result = await dispatch(
        updateSite({
          id: selectedSite.id,
          name: formValues.name,
          isActive: formValues.isActive,
        })
      );
      if (updateSite.fulfilled.match(result)) {
        setSuccessMessage('Şantiye başarıyla güncellendi.');
        setSuccessSnackbarOpen(true);
        handleCloseModal();
      }
    } else {
      result = await dispatch(addSite(formValues.name));
      if (addSite.fulfilled.match(result)) {
        setSuccessMessage('Şantiye başarıyla oluşturuldu.');
        setSuccessSnackbarOpen(true);
        handleCloseModal();
      }
    }
  };

  /**
   * Silme Onayını Başlat
   */
  const handleOpenDeleteConfirm = (row) => {
    setSiteToDelete(row);
    setIsDeleteConfirmOpen(true);
  };

  /**
   * Şantiyeyi Sil
   */
  const handleDeleteConfirm = async () => {
    if (siteToDelete) {
      const result = await dispatch(deleteSite(siteToDelete.id));
      if (deleteSite.fulfilled.match(result)) {
        setSuccessMessage('Şantiye başarıyla silindi.');
        setSuccessSnackbarOpen(true);
      }
      setIsDeleteConfirmOpen(false);
      setSiteToDelete(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearSiteError());
  };

  // MUI DataGrid Sütun Tanımları
  const columns = [
    {
      field: 'id',
      headerName: 'Şantiye ID',
      width: 250,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'name',
      headerName: 'Şantiye Adı',
      width: 300,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Durum',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={params.value ? 'Aktif' : 'Pasif'}
            color={params.value ? 'success' : 'error'}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      filterable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
          <Tooltip title="Düzenle">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditModal(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleOpenDeleteConfirm(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
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
            Şantiyeler
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Şantiyelerin, fiziksel saha lokasyonlarının ve depoların yönetimi
          </Typography>
        </Box>
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
          Yeni Şantiye Ekle
        </Button>
      </Box>

      {/* Hata Durumunda Bildirim */}
      {siteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {siteError}
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
          rows={sites}
          columns={columns}
          loading={status === 'loading' && sites.length === 0}
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

      {/* Ekle/Düzenle Modali */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        aria-labelledby="site-dialog-title"
      >
        <DialogTitle id="site-dialog-title" sx={{ fontWeight: 700 }}>
          {selectedSite ? 'Şantiye Düzenle' : 'Yeni Şantiye Ekle'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              {siteError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {siteError}
                </Alert>
              )}
              
              <TextField
                required
                fullWidth
                label="Şantiye Adı"
                name="name"
                value={formValues.name}
                onChange={handleFormChange}
                placeholder="Örn: Şantiye A"
              />

              {selectedSite && (
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formValues.isActive}
                      onChange={handleFormChange}
                      color="primary"
                    />
                  }
                  label="Aktif / Pasif"
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }} disabled={status === 'loading'}>
              İptal
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }} disabled={status === 'loading' || !formValues.name.trim()}>
              {status === 'loading' ? 'Kaydediliyor...' : selectedSite ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Silme Onay Modali */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        aria-labelledby="delete-confirm-dialog-title"
      >
        <DialogTitle id="delete-confirm-dialog-title" sx={{ fontWeight: 700 }}>
          Şantiyeyi Sil
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{siteToDelete?.name}</strong> şantiyesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsDeleteConfirmOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Vazgeç
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 600 }}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {siteError}
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
