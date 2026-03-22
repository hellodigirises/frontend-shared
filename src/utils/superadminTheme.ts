/**
 * superadminTheme.ts — MUI theme for the SuperAdmin module
 * Import and pass to <ThemeProvider> in your App.tsx
 */
import { createTheme } from '@mui/material/styles';

export const superAdminTheme = createTheme({
  palette: {
    primary:    { main: '#6366F1', dark: '#4F46E5', light: '#818CF8' },
    secondary:  { main: '#10B981' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text:       { primary: '#0F172A', secondary: '#64748B' },
    divider:    '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard:    { styleOverrides: { root: { borderRadius: 10, boxShadow: 'none' } } },
    MuiButton:  {
      styleOverrides: {
        root:      { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.3)' } },
      },
    },
    MuiChip:      { styleOverrides: { root: { borderRadius: 6 } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: '#F1F5F9' } } },
    MuiAppBar:    { styleOverrides: { root: { borderRadius: 0 } } },
  },
});