import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHives } from '../store/hivesSlice';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import HiveIcon from '@mui/icons-material/Hive';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export const Dashboard = () => {
    const dispatch = useAppDispatch();
    const { items: hives, status } = useAppSelector((state) => state.hives);
    const { t } = useTranslation();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchHives());
        }
    }, [status, dispatch]);

    const stats = {
        totalHives: hives.length,
        activeHives: hives.filter(h => h.status === 'active').length,
        // Mock data for honey and inspections for now
        totalHoney: 0,
        needsInspection: 0
    };

    const SummaryCard = ({ title, value, icon: Icon, color, to }: any) => (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="subtitle2" fontWeight="bold">
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ color: color }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: `${color}20`,
                            borderRadius: '50%',
                            p: 1.5,
                            display: 'flex',
                            color: color
                        }}
                    >
                        <Icon fontSize="large" />
                    </Box>
                </Box>
                {to && (
                    <Button component={RouterLink} to={to} size="small" sx={{ mt: 2 }} color="secondary">
                        View Details
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="row g-4"> {/* Bootstrap Grid with Gap */}
            <div className="col-12 mb-2">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {t('app.dashboard')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        component={RouterLink}
                        to="/hives/new"
                        size="large"
                    >
                        {t('dashboard.addHive')}
                    </Button>
                </Box>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <SummaryCard
                    title={t('dashboard.totalHives')}
                    value={stats.totalHives}
                    icon={HiveIcon}
                    color="#f59e0b" // Amber
                    to="/hives"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <SummaryCard
                    title={t('dashboard.totalHoney')}
                    value={`${stats.totalHoney} kg`}
                    icon={EqualizerIcon}
                    color="#3b82f6" // Blue
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <SummaryCard
                    title={t('dashboard.needsInspection')}
                    value={stats.needsInspection}
                    icon={WarningAmberIcon}
                    color="#ef4444" // Red
                />
            </div>
        </div>
    );
};
