import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchHives } from '../../store/hivesSlice';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Chip, Box, Card, CardContent, CardActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';

export const HiveList = () => {
    const dispatch = useAppDispatch();
    const { items: hives, status } = useAppSelector((state) => state.hives);
    const { t } = useTranslation();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchHives());
        }
    }, [status, dispatch]);

    const HiveCard = ({ hive }: { hive: any }) => (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <CircleIcon sx={{ color: hive.color || 'grey', fontSize: 16, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%' }} />
                        <Typography variant="h5" component="div" fontWeight="bold">
                            #{hive.number}
                        </Typography>
                    </Box>
                    <Chip
                        label={hive.status}
                        color={hive.status === 'active' ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                <Typography color="text.secondary" variant="body2">
                    {t('hives.type')}: {hive.type}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t('hives.breed')}: {hive.breed}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t('hives.queenYear')}: {hive.queenYear}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={RouterLink} to={`/hives/${hive.id}`}>
                    View
                </Button>
                <Button size="small" component={RouterLink} to={`/hives/edit/${hive.id}`}>
                    Edit
                </Button>
            </CardActions>
        </Card>
    );

    return (
        <div>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    {t('app.hives')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/hives/new"
                >
                    {t('common.add')}
                </Button>
            </Box>

            {hives.length === 0 && status === 'succeeded' ? (
                <Box textAlign="center" py={5} sx={{ opacity: 0.6 }}>
                    <Typography variant="h6">No hives yet.</Typography>
                    <Typography variant="body1">Click "Add" to start monitoring your apiary.</Typography>
                </Box>
            ) : (
                <div className="row g-3">
                    {hives.map(hive => (
                        <div key={hive.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <HiveCard hive={hive} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
