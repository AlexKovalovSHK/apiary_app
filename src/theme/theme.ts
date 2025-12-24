import { createTheme } from '@mui/material/styles';
import { ruRU } from '@mui/material/locale';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#f59e0b', // Amber 500
            contrastText: '#fff',
        },
        secondary: {
            main: '#64748b', // Slate 500
        },
        background: {
            default: '#fffbeb', // Amber 50
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: { fontWeight: 600 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12, // Rounded buttons
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
            },
        },
    },
}, ruRU);
