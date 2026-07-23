'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Grid,
  Divider,
} from '@mui/material';
import { selectUserRole } from '@/store/slices/authSlice';
import {
  fetchSettings,
  updateSettingByKey,
  selectAllSettings,
  selectSettingsStatus,
  selectSettingsError,
  clearSettingsError,
} from '@/store/slices/settingsSlice';

/**
 * Custom TabPanel Component
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const dispatch = useDispatch();

  // Redux State
  const userRole = useSelector(selectUserRole);
  const settings = useSelector(selectAllSettings);
  const status = useSelector(selectSettingsStatus);
  const settingsError = useSelector(selectSettingsError);

  // Local State
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State (Local copies of values)
  const [leaveTypes, setLeaveTypes] = useState('');
  const [seniorityRates, setSeniorityRates] = useState([]);
  
  const [sgkEmployee, setSgkEmployee] = useState('');
  const [sgkEmployer, setSgkEmployer] = useState('');
  const [unemploymentEmployee, setUnemploymentEmployee] = useState('');
  const [unemploymentEmployer, setUnemploymentEmployer] = useState('');

  const [allowMeal, setAllowMeal] = useState(false);
  const [defaultMeal, setDefaultMeal] = useState('');
  const [allowAdvance, setAllowAdvance] = useState(false);

  const [leaveWorkflow, setLeaveWorkflow] = useState('');
  const [advanceWorkflow, setAdvanceWorkflow] = useState('');

  // Sayfa yüklendiğinde ayarları çek
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Redux'tan gelen ayarları local state'lere yükle
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      // 1. İzin Politikaları
      if (settings.leave_policy?.value) {
        const lp = settings.leave_policy.value;
        setLeaveTypes(lp.types ? lp.types.join(', ') : '');
        setSeniorityRates(lp.seniorityRates || []);
      }

      // 2. Bordro Oranları & Kesintiler
      if (settings.payroll_params?.value) {
        const pp = settings.payroll_params.value;
        setSgkEmployee(pp.sgkEmployeeRate || '');
        setSgkEmployer(pp.sgkEmployerRate || '');
        setUnemploymentEmployee(pp.unemploymentEmployeeRate || '');
        setUnemploymentEmployer(pp.unemploymentEmployerRate || '');
      }
      if (settings.deduction_rules?.value) {
        const dr = settings.deduction_rules.value;
        setAllowMeal(!!dr.allowMealDeductions);
        setDefaultMeal(dr.defaultMealAllowance || '');
        setAllowAdvance(!!dr.allowAdvanceDeductions);
      }

      // 3. Onay Akışları
      if (settings.approval_workflows?.value) {
        const aw = settings.approval_workflows.value;
        setLeaveWorkflow(aw.leave ? aw.leave.join(', ') : '');
        setAdvanceWorkflow(aw.advance ? aw.advance.join(', ') : '');
      }
    }
  }, [settings]);

  // Hata durumunda Snackbar göster
  useEffect(() => {
    if (settingsError) {
      setSnackbarOpen(true);
    }
  }, [settingsError]);

  // Yetki Kontrolü: super_admin ve hr_manager değiştirebilir. Diğerleri salt okunur görebilir.
  const isAuthorized = ['super_admin', 'hr_manager'].includes(userRole);
  const isLoading = status === 'loading';

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  /**
   * İzin Politikalarını Kaydet
   */
  const handleSaveLeavePolicy = async (e) => {
    e.preventDefault();
    const updatedValue = {
      types: leaveTypes.split(',').map((t) => t.trim()).filter(Boolean),
      seniorityRates: seniorityRates.map((rate) => ({
        minYears: Number(rate.minYears),
        maxYears: Number(rate.maxYears),
        days: Number(rate.days),
      })),
    };
    const result = await dispatch(updateSettingByKey({ key: 'leave_policy', value: updatedValue }));
    if (updateSettingByKey.fulfilled.match(result)) {
      setSuccessMessage('İzin politikası başarıyla güncellendi.');
      setSuccessSnackbarOpen(true);
    }
  };

  /**
   * Bordro ve Kesinti Parametrelerini Kaydet
   */
  const handleSavePayrollDeductions = async (e) => {
    e.preventDefault();
    
    // payroll_params
    const updatedPayroll = {
      ...settings.payroll_params?.value,
      sgkEmployeeRate: Number(sgkEmployee),
      sgkEmployerRate: Number(sgkEmployer),
      unemploymentEmployeeRate: Number(unemploymentEmployee),
      unemploymentEmployerRate: Number(unemploymentEmployer),
    };
    
    // deduction_rules
    const updatedDeductions = {
      allowMealDeductions: allowMeal,
      defaultMealAllowance: Number(defaultMeal),
      allowAdvanceDeductions: allowAdvance,
    };

    const res1 = await dispatch(updateSettingByKey({ key: 'payroll_params', value: updatedPayroll }));
    const res2 = await dispatch(updateSettingByKey({ key: 'deduction_rules', value: updatedDeductions }));

    if (updateSettingByKey.fulfilled.match(res1) && updateSettingByKey.fulfilled.match(res2)) {
      setSuccessMessage('Bordro ve kesinti ayarları başarıyla güncellendi.');
      setSuccessSnackbarOpen(true);
    }
  };

  /**
   * Onay Akışlarını Kaydet
   */
  const handleSaveWorkflows = async (e) => {
    e.preventDefault();
    const updatedValue = {
      leave: leaveWorkflow.split(',').map((w) => w.trim()).filter(Boolean),
      advance: advanceWorkflow.split(',').map((w) => w.trim()).filter(Boolean),
    };
    const result = await dispatch(updateSettingByKey({ key: 'approval_workflows', value: updatedValue }));
    if (updateSettingByKey.fulfilled.match(result)) {
      setSuccessMessage('Onay akış şablonları başarıyla güncellendi.');
      setSuccessSnackbarOpen(true);
    }
  };

  /**
   * Kıdem Hakediş Günlerini Güncelle
   */
  const handleSeniorityChange = (index, field, value) => {
    setSeniorityRates((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearSettingsError());
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Üst Başlık */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Sistem Ayarları
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          İK kuralları, bordro katsayıları, onay hiyerarşisi ve izin politikalarının yönetimi
        </Typography>
      </Box>

      {/* Yetki Uyarı Bannerı */}
      {!isAuthorized && (
        <Alert severity="info" sx={{ mb: 3, fontWeight: 500 }}>
          Salt Okunur Mod — Sistem yapılandırma ayarlarını değiştirmek için yetkiniz bulunmamaktadır.
        </Alert>
      )}

      {/* Tabs Yapısı */}
      <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs" sx={{ px: 2 }}>
            <Tab label="İzin Politikaları" id="settings-tab-0" aria-controls="settings-tabpanel-0" sx={{ fontWeight: 600, py: 2 }} />
            <Tab label="Bordro & Kesinti Parametreleri" id="settings-tab-1" aria-controls="settings-tabpanel-1" sx={{ fontWeight: 600, py: 2 }} />
            <Tab label="Onay Akış Şablonları" id="settings-tab-2" aria-controls="settings-tabpanel-2" sx={{ fontWeight: 600, py: 2 }} />
          </Tabs>
        </Box>

        <Box sx={{ px: 4 }}>
          {/* TAB 1: İzin Politikaları */}
          <TabPanel value={activeTab} index={0}>
            <Box component="form" onSubmit={handleSaveLeavePolicy}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Tanımlı İzin Türleri
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Sistemde talep edilebilecek izin türleri (Virgülle ayırarak giriniz)
                  </Typography>
                  <TextField
                    fullWidth
                    value={leaveTypes}
                    onChange={(e) => setLeaveTypes(e.target.value)}
                    disabled={!isAuthorized || isLoading}
                    placeholder="Yıllık İzin, Sağlık İzni, Mazeret İzni"
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Kıdem Bazlı Gün Hakediş Kuralları
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Çalışanın kıdem yılına göre hak kazandığı yıllık izin süreleri
                  </Typography>
                  
                  <Stack spacing={2.5}>
                    {seniorityRates.map((rate, index) => (
                      <Grid container spacing={2} key={index} alignItems="center">
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Min Kıdem (Yıl)"
                            value={rate.minYears}
                            onChange={(e) => handleSeniorityChange(index, 'minYears', e.target.value)}
                            disabled={!isAuthorized || isLoading}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Max Kıdem (Yıl)"
                            value={rate.maxYears}
                            onChange={(e) => handleSeniorityChange(index, 'maxYears', e.target.value)}
                            disabled={!isAuthorized || isLoading}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="İzin Gün Sayısı"
                            value={rate.days}
                            onChange={(e) => handleSeniorityChange(index, 'days', e.target.value)}
                            disabled={!isAuthorized || isLoading}
                          />
                        </Grid>
                      </Grid>
                    ))}
                  </Stack>
                </Box>

                {isAuthorized && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 600 }}>
                      {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </TabPanel>

          {/* TAB 2: Bordro & Kesinti Parametreleri */}
          <TabPanel value={activeTab} index={1}>
            <Box component="form" onSubmit={handleSavePayrollDeductions}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                    SGK & İşsizlik Sigortası Katsayıları (%)
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="SGK Çalışan Payı (%)"
                        value={sgkEmployee}
                        onChange={(e) => setSgkEmployee(e.target.value)}
                        disabled={!isAuthorized || isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="SGK İşveren Payı (%)"
                        value={sgkEmployer}
                        onChange={(e) => setSgkEmployer(e.target.value)}
                        disabled={!isAuthorized || isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="İşsizlik Çalışan Payı (%)"
                        value={unemploymentEmployee}
                        onChange={(e) => setUnemploymentEmployee(e.target.value)}
                        disabled={!isAuthorized || isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="İşsizlik İşveren Payı (%)"
                        value={unemploymentEmployer}
                        onChange={(e) => setUnemploymentEmployer(e.target.value)}
                        disabled={!isAuthorized || isLoading}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Kesinti ve Ek Ödeme Kuralları
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Özlük hesaplama ve maaş kesintilerinin davranış biçimleri
                  </Typography>

                  <Stack spacing={2.5}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={allowAdvance}
                          onChange={(e) => setAllowAdvance(e.target.checked)}
                          disabled={!isAuthorized || isLoading}
                          color="primary"
                        />
                      }
                      label="Avans Kesintilerine İzin Ver"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={allowMeal}
                          onChange={(e) => setAllowMeal(e.target.checked)}
                          disabled={!isAuthorized || isLoading}
                          color="primary"
                        />
                      }
                      label="Yemek Kesintilerine İzin Ver"
                    />
                    <TextField
                      type="number"
                      label="Varsayılan Günlük Yemek Yardımı (₺)"
                      value={defaultMeal}
                      onChange={(e) => setDefaultMeal(e.target.value)}
                      disabled={!isAuthorized || isLoading || !allowMeal}
                      sx={{ maxWidth: 300 }}
                    />
                  </Stack>
                </Box>

                {isAuthorized && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 600 }}>
                      {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </TabPanel>

          {/* TAB 3: Onay Akış Şablonları */}
          <TabPanel value={activeTab} index={2}>
            <Box component="form" onSubmit={handleSaveWorkflows}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    İzin Talep Onay Akış Sırası
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    İzin taleplerinde sırasıyla onay verecek roller (Virgülle ayırarak giriniz)
                  </Typography>
                  <TextField
                    fullWidth
                    value={leaveWorkflow}
                    onChange={(e) => setLeaveWorkflow(e.target.value)}
                    disabled={!isAuthorized || isLoading}
                    placeholder="dept_manager, hr_manager, general_manager"
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Avans & Harcama Onay Akış Sırası
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Avans ve harcama taleplerinde onay sırası (Virgülle ayırarak giriniz)
                  </Typography>
                  <TextField
                    fullWidth
                    value={advanceWorkflow}
                    onChange={(e) => setAdvanceWorkflow(e.target.value)}
                    disabled={!isAuthorized || isLoading}
                    placeholder="dept_manager, hr_manager, general_manager"
                  />
                </Box>

                {isAuthorized && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 600 }}>
                      {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </TabPanel>
        </Box>
      </Paper>

      {/* Snackbar Hata Bildirimi */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {settingsError}
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
