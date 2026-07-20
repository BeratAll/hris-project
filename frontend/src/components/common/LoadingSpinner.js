'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingSpinner — Ortak Yükleme Göstergesi
 *
 * Tam ekran veya inline kullanım modları.
 *
 * @param {Object} props
 * @param {boolean} [props.fullScreen=false] - Tam ekran overlay mi
 * @param {string} [props.message] - Yükleme mesajı
 * @param {number} [props.size=40] - Spinner boyutu
 */
export default function LoadingSpinner({ fullScreen = false, message = '', size = 40 }) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: fullScreen ? 0 : 6,
      }}
    >
      <CircularProgress size={size} thickness={3} sx={{ color: 'primary.main' }} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}
