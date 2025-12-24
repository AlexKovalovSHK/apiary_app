import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchHives } from '../../store/hivesSlice';
import { fetchHiveDetails, clearCurrentHive } from '../../store/hiveDetailsSlice';
import { fetchInspections, addInspection } from '../../store/inspectionsSlice';
import { useTranslation } from 'react-i18next';
import { Typography, Box, Tabs, Tab, Paper, Button, Divider, Chip, List, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, TextField, useMediaQuery, Select, MenuItem, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { v4 as uuidv4 } from 'uuid';
import { HiveVisualizer } from './HiveVisualizer';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
            style={{ padding: '20px 0' }}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const HiveDetails = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const { items: hives, status: hivesStatus } = useAppSelector((state) => state.hives);
    // Also connect to details slice for configuration view
    const { currentHive: hiveConfig, status: configStatus } = useAppSelector((state) => state.hiveDetails);
    const { items: inspections } = useAppSelector((state) => state.inspections);

    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);
    const [openInspectionDialog, setOpenInspectionDialog] = useState(false);
    const [newInspectionNote, setNewInspectionNote] = useState('');

    const hive = hives.find(h => h.id === id);

    useEffect(() => {
        if (hivesStatus === 'idle') {
            dispatch(fetchHives());
        }
        if (id) {
            dispatch(fetchHiveDetails(id));
            dispatch(fetchInspections(id));
        }
        return () => {
            dispatch(clearCurrentHive());
        };
    }, [hivesStatus, dispatch, id]);

    const handleAddManualInspection = async () => {
        if (!id) return;

        await dispatch(addInspection({
            id: uuidv4(),
            hiveId: id,
            date: new Date().toISOString(),
            type: 'general',
            queenSeen: false,
            framesOfBrood: 0,
            honeyStores: 'med',
            temperament: 3,
            notes: newInspectionNote
        }));
        setOpenInspectionDialog(false);
        setNewInspectionNote('');
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (hivesStatus === 'loading') return <div>Loading...</div>;
    if (!hive) return <div>Hive not found</div>;

    return (
        <div>
            <Button
                startIcon={<ArrowBackIcon />}
                component={RouterLink}
                to="/hives"
                sx={{ mb: 2 }}
            >
                {t('app.hives')}
            </Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" fontWeight="bold">
                    Hive #{hive.number}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    component={RouterLink}
                    to={`/hives/edit/${hive.id}`}
                >
                    {t('common.edit')}
                </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
                {useMediaQuery('(max-width:500px)') ? (
                    <Box p={2}>
                        <FormControl fullWidth size="small">
                            {/* <InputLabel>View</InputLabel> */}
                            <Select
                                value={tabValue}
                                onChange={(e) => setTabValue(Number(e.target.value))}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select tab' }}
                            >
                                <MenuItem value={0}>{t('tabs.overview')}</MenuItem>
                                <MenuItem value={1}>{t('tabs.inspections')}</MenuItem>
                                <MenuItem value={2}>{t('tabs.harvests')}</MenuItem>
                                <MenuItem value={3}>{t('tabs.treatments')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                ) : (
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label={t('tabs.overview')} />
                        <Tab label={t('tabs.inspections')} />
                        <Tab label={t('tabs.harvests')} />
                        <Tab label={t('tabs.treatments')} />
                    </Tabs>
                )}
            </Paper>

            <CustomTabPanel value={tabValue} index={0}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">Hive Profile</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <div className="row g-3">
                        <div className="col-12 col-sm-6">
                            <Typography color="text.secondary">Type</Typography>
                            <Typography variant="h6">{hive.type}</Typography>
                        </div>
                        <div className="col-12 col-sm-6">
                            <Typography color="text.secondary">Status</Typography>
                            <Chip label={hive.status} color={hive.status === 'active' ? 'success' : 'default'} size="small" sx={{ mt: 0.5 }} />
                        </div>
                        <div className="col-12 col-sm-6">
                            <Typography color="text.secondary">Queen Breed</Typography>
                            <Typography variant="h6">{hive.breed}</Typography>
                        </div>
                        <div className="col-12 col-sm-6">
                            <Typography color="text.secondary">Queen Year</Typography>
                            <Typography variant="h6">{hive.queenYear}</Typography>
                        </div>
                    </div>

                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Configuration</Typography>
                        <Divider sx={{ mb: 2 }} />
                        {configStatus === 'loading' ? (
                            <Typography>Loading configuration...</Typography>
                        ) : (
                            <HiveVisualizer boxes={hiveConfig?.boxes || []} readonly />
                        )}
                    </Box>
                </Paper>
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Inspection Log</Typography>
                    <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => setOpenInspectionDialog(true)}>
                        Log Inspection
                    </Button>
                </Box>

                <List>
                    {inspections.map((insp) => (
                        <Paper key={insp.id} sx={{ mb: 2, p: 2 }}>
                            <ListItem alignItems="flex-start" disablePadding>
                                <ListItemIcon>
                                    {insp.type === 'config_change' ? <BuildIcon color="action" /> : <AssignmentIcon color="primary" />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography fontWeight="bold">
                                                {new Date(insp.date).toLocaleDateString()} - {insp.type === 'config_change' ? 'Configuration Update' : 'Manual Inspection'}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                            {insp.notes || "No notes recorded."}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </Paper>
                    ))}
                    {inspections.length === 0 && <Typography color="text.secondary">No inspections recorded.</Typography>}
                </List>

                <Dialog open={openInspectionDialog} onClose={() => setOpenInspectionDialog(false)} fullWidth>
                    <DialogTitle>Log Manual Inspection</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Notes / Observations"
                            fullWidth
                            multiline
                            rows={4}
                            value={newInspectionNote}
                            onChange={(e) => setNewInspectionNote(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenInspectionDialog(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleAddManualInspection}>Log</Button>
                    </DialogActions>
                </Dialog>
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={2}>
                <Typography variant="body1">Harvests List (Coming Soon)</Typography>
                <Button variant="contained" sx={{ mt: 2 }}>Add Harvest</Button>
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={3}>
                <Typography variant="body1">Treatments List (Coming Soon)</Typography>
                <Button variant="contained" sx={{ mt: 2 }}>Add Treatment</Button>
            </CustomTabPanel>



        </div>
    );
};
