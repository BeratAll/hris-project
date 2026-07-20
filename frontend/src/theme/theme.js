'use client';

import { createTheme } from '@mui/material/styles';

/**
 * HRIS Kurumsal MUI Teması
 *
 * Tasarım ilkeleri:
 * - Sade, göz yormayan, iş odaklı
 * - Koyu mavi ana renk — güven ve kurumsal ciddiyet
 * - Gri tonları — profesyonel, nötr
 * - Kompakt (dense) bileşenler — veri yoğun ekranlar için
 * - Minimal gölgeler ve yuvarlatılmış köşeler
 */

const theme = createTheme({
  // --- Renk Paleti ---
  palette: {
    mode: 'light',
    primary: {
      main: '#1B3A5C',       // Koyu mavi — kurumsal güven
      light: '#2E5A88',
      dark: '#0F2440',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5C7A99',       // Gri-mavi — destekleyici ton
      light: '#7A9ABB',
      dark: '#3D5A73',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',       // Yeşil — onay, aktif
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: '#E65100',       // Turuncu — uyarı
      light: '#FF9800',
      dark: '#BF360C',
    },
    error: {
      main: '#C62828',       // Kırmızı — hata, acil
      light: '#EF5350',
      dark: '#8E0000',
    },
    info: {
      main: '#1565C0',       // Bilgi mavisi
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    background: {
      default: '#F4F6F8',    // Açık gri arka plan
      paper: '#FFFFFF',      // Kart/panel arka planı
    },
    text: {
      primary: '#1A2027',    // Koyu metin
      secondary: '#5A6A7A',  // İkincil metin
      disabled: '#A0AEC0',
    },
    divider: '#E2E8F0',
  },

  // --- Tipografi ---
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,

    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: '#1A2027',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.35,
      color: '#1A2027',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 500,
      color: '#5A6A7A',
    },
    subtitle2: {
      fontSize: '0.85rem',
      fontWeight: 500,
      color: '#5A6A7A',
    },
    body1: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.825rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',  // Buton metinleri büyük harfe çevrilmesin
      fontWeight: 500,
    },
  },

  // --- Şekil ---
  shape: {
    borderRadius: 8,
  },

  // --- Gölgeler (Minimal) ---
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 2px 6px rgba(0,0,0,0.08)',
    '0px 3px 8px rgba(0,0,0,0.10)',
    '0px 4px 12px rgba(0,0,0,0.10)',
    '0px 6px 16px rgba(0,0,0,0.10)',
    ...Array(19).fill('0px 6px 16px rgba(0,0,0,0.12)'),
  ],

  // --- Bileşen Varsayılanları ---
  components: {
    // CssBaseline — global reset
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6F8',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#C4CDD5',
            borderRadius: '3px',
          },
        },
      },
    },

    // Butonlar — sade, kompakt
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        size: 'medium',
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 20px',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#2E5A88',
          },
        },
      },
    },

    // Metin Alanları — outlined, kompakt
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },

    // Kartlar — hafif gölge
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 10,
        },
      },
    },

    // Tablolar — kompakt, zebra çizgili
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F4F6F8',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#1A2027',
            fontSize: '0.825rem',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#FAFBFC',
          },
          '&:hover': {
            backgroundColor: '#F0F4F8 !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          fontSize: '0.825rem',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },

    // Chip — kompakt
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },

    // AppBar — beyaz, alt çizgi
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A2027',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },

    // Drawer — sidebar stili
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E2E8F0',
        },
      },
    },

    // Dialog — sade
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
