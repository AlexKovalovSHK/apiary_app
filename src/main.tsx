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

// ===== PWA Service Worker =====
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onRegistered(r) {
    console.log('Service worker registered:', r);
  },
  onNeedRefresh() {
    // Здесь можно показать пользователю уведомление о новой версии
    console.log('New content available. Please refresh the page.');
    // Например, можно использовать MUI Snackbar или окно confirm
    if (window.confirm('Новая версия приложения доступна. Обновить?')) {
      updateSW?.();
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  }
});

// ===== Render App =====
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
