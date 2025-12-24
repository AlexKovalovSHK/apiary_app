import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addHive } from '../../store/hivesSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    TextField, Button, Paper, Typography, Box, MenuItem, FormControl, InputLabel, Select, Container
} from '@mui/material';
import { type Hive } from '../../db/db';

export const HiveForm = () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Hive>>({
        number: '',
        type: 'Dadant',
        status: 'active',
        breed: 'Carpathian',
        color: '#ffffff',
        queenYear: new Date().getFullYear(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newHive: Hive = {
            id: uuidv4(),
            number: formData.number!, // Basic validation needed
            type: formData.type!,
            status: (formData.status as 'active' | 'archived')!,
            breed: formData.breed!,
            color: formData.color!,
            queenYear: Number(formData.queenYear),
        };

        await dispatch(addHive(newHive));
        navigate('/hives');
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, mt: 2 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    {t('dashboard.addHive')}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <TextField
                        label={t('hives.number')}
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="e.g. 001"
                    />

                    <FormControl fullWidth>
                        <InputLabel>{t('hives.type')}</InputLabel>
                        <Select
                            name="type"
                            value={formData.type}
                            label={t('hives.type')}
                            onChange={(e) => handleChange(e as any)}
                        >
                            <MenuItem value="Dadant">Dadant (Дадан)</MenuItem>
                            <MenuItem value="Langstroth">Langstroth (Рут)</MenuItem>
                            <MenuItem value="Alpine">Alpine (Альпийский)</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label={t('hives.breed')}
                        name="breed"
                        value={formData.breed}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label={t('hives.queenYear')}
                        name="queenYear"
                        type="number"
                        value={formData.queenYear}
                        onChange={handleChange}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>{t('hives.status')}</InputLabel>
                        <Select
                            name="status"
                            value={formData.status}
                            label={t('hives.status')}
                            onChange={(e) => handleChange(e as any)}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                    </FormControl>

                    <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="contained" type="submit" size="large">
                            {t('common.save')}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};


