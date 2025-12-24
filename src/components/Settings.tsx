import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Paper, Typography, Button, Box, Divider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { db } from '../db/db';

export const Settings = () => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        try {
            const data = {
                hives: await db.hives.toArray(),
                inspections: await db.inspections.toArray(),
                harvests: await db.harvests.toArray(),
                treatments: await db.treatments.toArray(),
                exportedAt: new Date().toISOString(),
                version: 1
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `apiary_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. See console.');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.hives || !data.version) {
                throw new Error('Invalid backup file format');
            }

            await db.transaction('rw', db.hives, db.inspections, db.harvests, db.treatments, async () => {
                await db.hives.clear();
                await db.inspections.clear();
                await db.harvests.clear();
                await db.treatments.clear();

                await db.hives.bulkAdd(data.hives);
                await db.inspections.bulkAdd(data.inspections || []);
                await db.harvests.bulkAdd(data.harvests || []);
                await db.treatments.bulkAdd(data.treatments || []);
            });

            alert('Import successful! Reloading...');
            window.location.reload();
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed. Invalid file?');
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                {t('app.settings')}
            </Typography>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Data Management
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Manage your local data. Export your database to a JSON file for backup or transfer to another device.
                </Typography>
                <Divider sx={{ my: 3 }} />

                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3}>
                    <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">Export Backup</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Download all your apiary data as a JSON file.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExport}
                            fullWidth
                        >
                            Export Data
                        </Button>
                    </Box>

                    <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">Import Backup</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Restore data from a backup file. <span style={{ color: 'red' }}>Warning: Overwrites current data.</span>
                        </Typography>
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<UploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            fullWidth
                        >
                            Import Data
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImport}
                        />
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    About
                </Typography>
                <Typography variant="body1">
                    Beekeeping Management App v0.1.0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Local-first, offline-capable apiary manager.
                </Typography>
            </Paper>
        </Container>
    );
};
