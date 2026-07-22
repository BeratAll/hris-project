'use client';

import React, { useState } from 'react';
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

/**
 * Mock Çalışan Verisi (Mock Employee Data)
 * Backend entegrasyonu tamamlanana kadar gösterilecek veri seti.
 */
const MOCK_EMPLOYEES = [
  {
    id: 'EMP-001',
    fullName: 'Sistem Yöneticisi',
    email: 'admin@hris.com',
    department: 'Bilgi Teknolojileri',
    location: 'Merkez Ofis',
    isActive: true,
  },
  {
    id: 'EMP-002',
    fullName: 'Ayşe Yılmaz',
    email: 'ik@hris.com',
    department: 'İnsan Kaynakları',
    location: 'Merkez Ofis',
    isActive: true,
  },
  {
    id: 'EMP-003',
    fullName: 'Mehmet Demir',
    email: 'santiye@hris.com',
    department: 'Şantiye Yönetimi',
    location: 'Şantiye A',
    isActive: true,
  },
  {
    id: 'EMP-004',
    fullName: 'Ali Kaya',
    email: 'calisan@hris.com',
    department: 'İnşaat',
    location: 'Şantiye A',
    isActive: true,
  },
  {
    id: 'EMP-005',
    fullName: 'Zeynep Çelik',
    email: 'zeynep.celik@hris.com',
    department: 'Finans',
    location: 'Merkez Ofis',
    isActive: false,
  },
  {
    id: 'EMP-006',
    fullName: 'Mustafa Öztürk',
    email: 'mustafa.ozturk@hris.com',
    department: 'İş Güvenliği',
    location: 'Şantiye B',
    isActive: true,
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    department: '',
    location: '',
  });

  /**
   * Çalışan Düzenleme Buton Tıklaması
   * @param {Object} employee 
   */
  const handleEdit = (employee) => {
    console.log('Edit employee:', employee);
    alert(`Düzenle: ${employee.fullName}`);
  };

  /**
   * Çalışan Silme Buton Tıklaması
   * @param {Object} employee 
   */
  const handleDelete = (employee) => {
    console.log('Delete employee:', employee);
    if (confirm(`${employee.fullName} isimli personeli silmek istediğinize emin misiniz?`)) {
      setEmployees((prev) => prev.filter((item) => item.id !== employee.id));
    }
  };

  /**
   * Yeni Çalışan Ekleme Buton Tıklaması (Modali açar)
   */
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  /**
   * Modali Kapatma
   */
  const handleCloseModal = () => {
    setNewEmployee({
      fullName: '',
      email: '',
      department: '',
      location: '',
    });
    setIsModalOpen(false);
  };

  /**
   * Form Input/Select Alanlarının Değişimini Yakalar
   * @param {React.ChangeEvent<{ name: string; value: unknown }>} e 
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Yeni Çalışanı Kaydeder
   * @param {React.FormEvent} e 
   */
  const handleSave = (e) => {
    e.preventDefault();
    console.log('Yeni çalışan kaydediliyor...', newEmployee);

    // Yeni çalışan için geçici benzersiz sicil no üretimi
    const nextId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;

    // Yeni çalışanı mock state'e ekle
    setEmployees((prev) => [
      ...prev,
      {
        id: nextId,
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        department: newEmployee.department,
        location: newEmployee.location,
        isActive: true,
      },
    ]);

    // Modali kapat ve form state'ini sıfırla
    handleCloseModal();
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
                onClick={() => handleDelete(params.row)}
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

      {/* Yeni Çalışan Ekleme Modali (Dialog) */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
        aria-labelledby="add-employee-dialog-title"
      >
        <DialogTitle id="add-employee-dialog-title" sx={{ fontWeight: 700 }}>
          Yeni Çalışan Ekle
        </DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              <TextField
                required
                fullWidth
                label="Ad Soyad"
                name="fullName"
                value={newEmployee.fullName}
                onChange={handleFormChange}
              />
              <TextField
                required
                fullWidth
                type="email"
                label="E-posta"
                name="email"
                value={newEmployee.email}
                onChange={handleFormChange}
              />
              <FormControl fullWidth required>
                <InputLabel id="department-select-label">Departman</InputLabel>
                <Select
                  labelId="department-select-label"
                  label="Departman"
                  name="department"
                  value={newEmployee.department}
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
                  value={newEmployee.location}
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
            <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }}>
              İptal
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }}>
              Kaydet
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
