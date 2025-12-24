import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { CssBaseline } from '@mui/material';
import './i18n'; // Initialize i18n
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap grid only (mostly)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
