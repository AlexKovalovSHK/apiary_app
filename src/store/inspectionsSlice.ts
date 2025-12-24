import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, type Inspection } from '../db/db';

export const fetchInspections = createAsyncThunk(
    'inspections/fetchInspections',
    async (hiveId: string) => {
        return await db.inspections
            .where('hiveId').equals(hiveId)
            .reverse() // Newest first
            .sortBy('date');
    }
);

export const addInspection = createAsyncThunk(
    'inspections/addInspection',
    async (inspection: Inspection) => {
        await db.inspections.add(inspection);
        return inspection;
    }
);

interface InspectionsState {
    items: Inspection[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: InspectionsState = {
    items: [],
    status: 'idle',
    error: null,
};

const inspectionsSlice = createSlice({
    name: 'inspections',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchInspections.pending, (state) => {
                state.status = 'loading';
                state.items = []; // Clear old items on new fetch start (simple approach) or handle smarter
            })
            .addCase(fetchInspections.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchInspections.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed';
            })
            // Add
            .addCase(addInspection.fulfilled, (state, action) => {
                // Verify if the added inspection belongs to the currently viewed hive (if we were tracking that here)
                // For now, simple unshift to keep it at top if it matches
                state.items.unshift(action.payload);
            });
    },
});

export default inspectionsSlice.reducer;
