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
  DialogContentText,
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
import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  selectAllEmployees,
  selectEmployeesStatus,
  selectEmployeesError,
  clearEmployeeError,
} from '@/store/slices/employeeSlice';

export default function EmployeesPage() {
  const dispatch = useDispatch();

  // Redux State
  const employees = useSelector(selectAllEmployees);
  const status = useSelector(selectEmployeesStatus);
  const employeeError = useSelector(selectEmployeesError);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    department: '',
    location: '',
  });

  // Sayfa yüklendiğinde çalışanları çek
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Hata durumunda Snackbar bildirimi göster
  useEffect(() => {
    if (employeeError) {
      setSnackbarOpen(true);
    }
  }, [employeeError]);

  /**
   * Çalışan Düzenleme Buton Tıklaması
   * @param {Object} employee 
   */
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormValues({
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      location: employee.location,
    });
    setIsModalOpen(true);
  };

  /**
   * Çalışan Silme Buton Tıklaması
   * @param {Object} employee 
   */
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteConfirmOpen(true);
  };

  /**
   * Silme İşlemini Onaylama ve Thunk Dispatch
   */
  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      const result = await dispatch(deleteEmployee(employeeToDelete.id));
      if (deleteEmployee.fulfilled.match(result)) {
        setSuccessMessage('Çalışan başarıyla silindi.');
        setSuccessSnackbarOpen(true);
      }
      setIsDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  /**
   * Yeni Çalışan Ekleme Buton Tıklaması (Modali açar)
   */
  const handleOpenModal = () => {
    setSelectedEmployee(null);
    setFormValues({
      fullName: '',
      email: '',
      department: '',
      location: '',
    });
    setIsModalOpen(true);
  };

  /**
   * Modali Kapatma
   */
  const handleCloseModal = () => {
    setFormValues({
      fullName: '',
      email: '',
      department: '',
      location: '',
    });
    setSelectedEmployee(null);
    setIsModalOpen(false);
    dispatch(clearEmployeeError());
  };

  /**
   * Form Input/Select Alanlarının Değişimini Yakalar
   * @param {React.ChangeEvent<{ name: string; value: unknown }>} e 
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Formu Kaydeder veya Günceller (Redux thunk dispatch eder)
   * @param {React.FormEvent} e 
   */
  const handleSave = async (e) => {
    e.preventDefault();

    if (selectedEmployee) {
      // Güncelleme Modu (Edit Mode)
      const result = await dispatch(
        updateEmployee({
          id: selectedEmployee.id,
          employeeData: formValues,
        })
      );

      if (updateEmployee.fulfilled.match(result)) {
        setSuccessMessage('Çalışan bilgileri güncellendi.');
        setSuccessSnackbarOpen(true);
        handleCloseModal();
      }
    } else {
      // Ekleme Modu (Create Mode)
      const result = await dispatch(addEmployee(formValues));

      if (addEmployee.fulfilled.match(result)) {
        setSuccessMessage('Yeni çalışan başarıyla eklendi!');
        setSuccessSnackbarOpen(true);
        handleCloseModal();
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearEmployeeError());
  };

  // MUI DataGrid Sütun Tanımları (Columns Definition)
  const columns = [
    {
      field: 'id',
      headerName: 'Sicil No / ID',
      width: 120,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'fullName',
      headerName: 'Ad Soyad',
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
      field: 'email',
      headerName: 'E-posta',
      width: 220,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'department',
      headerName: 'Departman',
      width: 180,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'location',
      headerName: 'Şantiye / Lokasyon',
      width: 180,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'isActive',
      headerName: 'Durum',
      width: 130,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const isActive = params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={isActive ? 'Aktif' : 'Pasif'}
              color={isActive ? 'success' : 'error'}
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
      width: 120,
      sortable: false,
      filterable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
            <Tooltip title="Düzenle">
              <IconButton
                size="small"
                onClick={() => handleEdit(params.row)}
                color="primary"
                sx={{ '&:hover': { bgcolor: 'action.hover' } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sil">
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(params.row)}
                color="error"
                sx={{ '&:hover': { bgcolor: 'error.lighter' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
            Çalışan Listesi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Şantiye ve ofis personellerinin genel listesi, durumları ve rolleri
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
          Yeni Çalışan Ekle
        </Button>
      </Box>

      {/* Hata Durumunda Bildirim */}
      {employeeError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {employeeError}
        </Alert>
      )}

      {/* Tablo Alanı: DataGrid */}
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          height: 600,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={employees}
          columns={columns}
          loading={status === 'loading' && employees.length === 0}
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

      {/* Yeni Çalışan Ekleme / Düzenleme Modali (Dialog) */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        aria-labelledby="employee-dialog-title"
      >
        <DialogTitle id="employee-dialog-title" sx={{ fontWeight: 700 }}>
          {selectedEmployee ? 'Çalışanı Düzenle' : 'Yeni Çalışan Ekle'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              {employeeError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {employeeError}
                </Alert>
              )}
              <TextField
                required
                fullWidth
                label="Ad Soyad"
                name="fullName"
                value={formValues.fullName}
                onChange={handleFormChange}
              />
              <TextField
                required
                fullWidth
                type="email"
                label="E-posta"
                name="email"
                value={formValues.email}
                onChange={handleFormChange}
              />
              <FormControl fullWidth required>
                <InputLabel id="department-select-label">Departman</InputLabel>
                <Select
                  labelId="department-select-label"
                  label="Departman"
                  name="department"
                  value={formValues.department}
                  onChange={handleFormChange}
                >
                  <MenuItem value="Bilgi Teknolojileri">Bilgi Teknolojileri</MenuItem>
                  <MenuItem value="İnsan Kaynakları">İnsan Kaynakları</MenuItem>
                  <MenuItem value="Şantiye Yönetimi">Şantiye Yönetimi</MenuItem>
                  <MenuItem value="İnşaat">İnşaat</MenuItem>
                  <MenuItem value="Finans">Finans</MenuItem>
                  <MenuItem value="İş Güvenliği">İş Güvenliği</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel id="location-select-label">Şantiye / Lokasyon</InputLabel>
                <Select
                  labelId="location-select-label"
                  label="Şantiye / Lokasyon"
                  name="location"
                  value={formValues.location}
                  onChange={handleFormChange}
                >
                  <MenuItem value="Merkez Ofis">Merkez Ofis</MenuItem>
                  <MenuItem value="Şantiye A">Şantiye A</MenuItem>
                  <MenuItem value="Şantiye B">Şantiye B</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }} disabled={status === 'loading'}>
              İptal
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Kaydediliyor...' : selectedEmployee ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Silme Onay Modali (Delete Confirmation Dialog) */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title" sx={{ fontWeight: 700 }}>
          Personeli Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-dialog-description">
            <strong>{employeeToDelete?.fullName}</strong> isimli personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsDeleteConfirmOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            İptal
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 600 }} autoFocus>
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {employeeError}
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
