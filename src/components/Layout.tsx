import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HiveIcon from '@mui/icons-material/Hive';
import DashboardIcon from '@mui/icons-material/Dashboard';

export const Layout = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ru' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <>
            <AppBar position="sticky" elevation={2}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        component={RouterLink}
                        to="/"
                        sx={{ mr: 1 }}
                    >
                        <HiveIcon />
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        {t('app.title')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            startIcon={<DashboardIcon />}
                            sx={{
                                backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            {t('app.dashboard')}
                        </Button>

                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/hives"
                            startIcon={<HiveIcon />}
                            sx={{
                                backgroundColor: location.pathname.startsWith('/hives') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            {t('app.hives')}
                        </Button>

                        <IconButton color="inherit" onClick={toggleLanguage} title="Toggle Language">
                            <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                                {i18n.language?.toUpperCase().substring(0, 2)}
                            </Typography>
                        </IconButton>

                        {/* Mobile Menu could go here, keeping it simple for now */}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Bootstrap Container for Layout */}
            <div className="container py-4">
                <Outlet />
            </div>
        </>
    );
};
