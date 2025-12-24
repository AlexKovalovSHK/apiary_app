import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchHiveDetails, addBoxToHive, removeTopBox, updateFrameContent, addFrame, deleteFrame, clearCurrentHive } from '../../store/hiveDetailsSlice';
import { addInspection } from '../../store/inspectionsSlice';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Box, Paper, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem, Divider, TextField } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { type HiveFrame } from '../../db/db';
import { HiveVisualizer } from './HiveVisualizer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { deleteHive } from '../../store/hivesSlice';

export const HiveEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentHive, status } = useAppSelector((state) => state.hiveDetails);
    const { t } = useTranslation();

    const [selectedTool, setSelectedTool] = useState<HiveFrame['content'] | 'delete-frame'>('foundation');
    const [newBoxType, setNewBoxType] = useState<'deep' | 'medium'>('deep');
    const [newBoxCapacity, setNewBoxCapacity] = useState<number>(10);
    const [notes, setNotes] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchHiveDetails(id));
        }
        return () => {
            dispatch(clearCurrentHive());
        };
    }, [id, dispatch]);

    const handleAddBox = async () => {
        if (!currentHive) return;
        // Add empty box. Frames are added manually by user clicking slots (or we could pre-fill, but user wants "filling one frame at a time")
        // Let's stick to user request: "filling the case one frame at a time". So we add empty box.
        await dispatch(addBoxToHive({ hiveId: currentHive.id, type: newBoxType, capacity: newBoxCapacity }));
    };

    const handleRemoveBox = async () => {
        if (!currentHive || currentHive.boxes.length === 0) return;
        await dispatch(removeTopBox(currentHive.id));
    };

    const handleFrameClick = async (boxId: string, payload: string) => {
        if (!currentHive) return;

        // Check if clicking a ghost slot
        if (payload.startsWith('slot:')) {
            // "Add Frame" Action
            const position = parseInt(payload.split(':')[1], 10);

            // Cannot add if tool is 'delete-frame'
            if (selectedTool === 'delete-frame') return;

            await dispatch(addFrame({
                boxId,
                hiveId: currentHive.id,
                position,
                content: selectedTool as HiveFrame['content']
            })).unwrap();
        } else {
            // "Update/Delete Frame" Action (payload is frameId)
            if (selectedTool === 'delete-frame') {
                await dispatch(deleteFrame(payload)).unwrap();
            } else {
                await dispatch(updateFrameContent({
                    frameId: payload,
                    content: selectedTool as HiveFrame['content']
                })).unwrap();
            }
        }
    };

    const handleSave = async () => {
        if (currentHive && id) {
            // 1. Create Auto-Inspection Record
            await dispatch(addInspection({
                id: uuidv4(),
                hiveId: id,
                date: new Date().toISOString(),
                type: 'config_change',
                queenSeen: false, // Default false for config only
                framesOfBrood: 0, // Default 0 or calculate?
                honeyStores: 'med', // Default
                temperament: 3,
                notes: `Configuration Changed. ${notes}`
            }));

            navigate(`/hives/${currentHive.id}`);
        }
    };

    const handleDelete = async () => {
        if (id) {
            await dispatch(deleteHive(id));
            navigate('/hives');
        }
    };

    if (status === 'loading' || !currentHive) return <div>Loading...</div>;

    return (
        <div>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    {t('common.cancel')}
                </Button>
                <Typography variant="h5" fontWeight="bold">
                    {t('hives.configuration')} #{currentHive.number}
                </Typography>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                    {t('common.save')}
                </Button>
            </Box>

            <div className="row g-4">
                {/* Helper Panel */}
                <div className="col-12 col-md-4 order-md-2">
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom>{t('hives.addBox')}</Typography>
                        <Box display="flex" flexDirection="column" gap={2} mb={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('hives.boxType')}</InputLabel>
                                <Select
                                    value={newBoxType}
                                    label={t('hives.boxType')}
                                    onChange={(e) => setNewBoxType(e.target.value as any)}
                                >
                                    <MenuItem value="deep">Deep (Brood)</MenuItem>
                                    <MenuItem value="medium">Medium (Honey)</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Capacity</InputLabel>
                                <Select
                                    value={newBoxCapacity}
                                    label="Capacity"
                                    onChange={(e) => setNewBoxCapacity(Number(e.target.value))}
                                >
                                    <MenuItem value={8}>8 Frames</MenuItem>
                                    <MenuItem value={10}>10 Frames</MenuItem>
                                    <MenuItem value={12}>12 Frames</MenuItem>
                                </Select>
                            </FormControl>

                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddBox}>
                                Add Box
                            </Button>
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            startIcon={<RemoveIcon />}
                            onClick={handleRemoveBox}
                            disabled={currentHive.boxes.length === 0}
                        >
                            {t('hives.removeBox')}
                        </Button>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>Frame Tool</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Click empty slots to add frames. Click frames to change type or remove.
                        </Typography>

                        <ToggleButtonGroup
                            orientation="vertical"
                            value={selectedTool}
                            exclusive
                            onChange={(_, val) => val && setSelectedTool(val)}
                            fullWidth
                            sx={{ mt: 1 }}
                        >
                            <ToggleButton value="foundation" sx={{ justifyContent: 'flex-start', gap: 1 }}>
                                <Box width={16} height={16} bgcolor="#e2e8f0" border="1px solid #ccc" />
                                {t('hives.frameContent.foundation')}
                            </ToggleButton>
                            <ToggleButton value="honey" sx={{ justifyContent: 'flex-start', gap: 1 }}>
                                <Box width={16} height={16} bgcolor="#fbbf24" border="1px solid #ccc" />
                                {t('hives.frameContent.honey')}
                            </ToggleButton>
                            <ToggleButton value="brood" sx={{ justifyContent: 'flex-start', gap: 1 }}>
                                <Box width={16} height={16} bgcolor="#92400e" border="1px solid #ccc" />
                                {t('hives.frameContent.brood')}
                            </ToggleButton>
                            <ToggleButton value="empty" sx={{ justifyContent: 'flex-start', gap: 1 }}>
                                <Box width={16} height={16} bgcolor="#ffffff" border="1px solid #ccc" />
                                {t('hives.frameContent.empty')}
                            </ToggleButton>
                            <ToggleButton value="delete-frame" color="error" sx={{ justifyContent: 'flex-start', gap: 1 }}>
                                <RemoveIcon fontSize="small" />
                                Remove Frame
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            label={t('common.notes')}
                            multiline
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            inputProps={{ style: { overflow: 'auto' } }}
                            className='mt-3 w-100'
                        />

                        <Divider sx={{ my: 3 }} />

                        <Button
                            variant="text"
                            color="error"
                            fullWidth
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Delete Hive
                        </Button>

                    </Paper>
                </div>

                {/* Visualizer Panel */}
                <div className="col-12 col-md-8 order-md-1">
                    <Paper sx={{ p: 4, minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', bgcolor: '#f1f5f9' }}>
                        <HiveVisualizer
                            boxes={currentHive.boxes}
                            onFrameClick={handleFrameClick}
                        />
                    </Paper>
                </div>
            </div>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Hive?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete Hive #{currentHive.number}? This action cannot be undone and will remove all associated history (inspections, harvest, treatments).
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
