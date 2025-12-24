import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, type Hive } from '../db/db';

export const fetchHives = createAsyncThunk('hives/fetchHives', async () => {
    return await db.hives.toArray();
});

export const addHive = createAsyncThunk('hives/addHive', async (hive: Hive) => {
    await db.hives.add(hive);
    return hive;
});

export const updateHive = createAsyncThunk('hives/updateHive', async (hive: Hive) => {
    await db.hives.put(hive);
    return hive;
});

export const deleteHive = createAsyncThunk('hives/deleteHive', async (id: string) => {
    await db.transaction('rw', [db.hives, db.boxes, db.frames, db.inspections, db.harvests, db.treatments], async () => {
        await db.hives.delete(id);
        await db.boxes.where('hiveId').equals(id).delete();
        await db.frames.where('hiveId').equals(id).delete();
        await db.inspections.where('hiveId').equals(id).delete();
        await db.harvests.where('hiveId').equals(id).delete();
        await db.treatments.where('hiveId').equals(id).delete();
    });
    return id;
});

interface HivesState {
    items: Hive[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: HivesState = {
    items: [],
    status: 'idle',
    error: null,
};

const hivesSlice = createSlice({
    name: 'hives',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchHives.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchHives.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchHives.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch hives';
            })
            // Add
            .addCase(addHive.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateHive.fulfilled, (state, action) => {
                const index = state.items.findIndex(h => h.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteHive.fulfilled, (state, action) => {
                state.items = state.items.filter(h => h.id !== action.payload);
            });
    },
});

export default hivesSlice.reducer;
