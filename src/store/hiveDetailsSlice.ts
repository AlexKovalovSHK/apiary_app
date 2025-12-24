import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, type Hive, type HiveBox, type HiveFrame } from '../db/db';

// UI Helper type: Box with Frames nested
export interface HiveBoxWithFrames extends HiveBox {
    frames: HiveFrame[];
}

export interface FullHiveDetails extends Hive {
    boxes: HiveBoxWithFrames[];
}

interface HiveDetailsState {
    currentHive: FullHiveDetails | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: HiveDetailsState = {
    currentHive: null,
    status: 'idle',
    error: null,
};

// Fetch Hive and assemble relational data
export const fetchHiveDetails = createAsyncThunk(
    'hiveDetails/fetchHiveDetails',
    async (hiveId: string) => {
        const hive = await db.hives.get(hiveId);
        if (!hive) throw new Error('Hive not found');

        const boxes = await db.boxes
            .where('hiveId').equals(hiveId)
            .sortBy('position'); // Ensure correct order

        const boxesWithFrames = await Promise.all(
            boxes.map(async (box) => {
                const frames = await db.frames
                    .where('boxId').equals(box.id)
                    .sortBy('position');
                return { ...box, frames };
            })
        );

        return { ...hive, boxes: boxesWithFrames };
    }
);

export const addBoxToHive = createAsyncThunk(
    'hiveDetails/addBox',
    async ({ hiveId, type, capacity }: { hiveId: string, type: 'deep' | 'medium', capacity: number }) => {
        // 1. Get current count to determine position
        const count = await db.boxes.where('hiveId').equals(hiveId).count();

        // 2. Create Box (Empty initially)
        const boxId = crypto.randomUUID();
        const newBox = {
            id: boxId,
            hiveId,
            type,
            position: count, // Add to top
            capacity
        };

        await db.boxes.add(newBox);
        return { ...newBox, frames: [] };
    }
);

export const addFrame = createAsyncThunk(
    'hiveDetails/addFrame',
    async ({ boxId, hiveId, position, content }: { boxId: string, hiveId: string, position: number, content: HiveFrame['content'] }) => {
        const newFrame: HiveFrame = {
            id: crypto.randomUUID(),
            boxId,
            hiveId,
            position,
            content
        };
        await db.frames.add(newFrame);
        return newFrame;
    }
);

export const deleteFrame = createAsyncThunk(
    'hiveDetails/deleteFrame',
    async (frameId: string) => {
        await db.frames.delete(frameId);
        return frameId;
    }
);

export const removeTopBox = createAsyncThunk(
    'hiveDetails/removeTopBox',
    async (hiveId: string) => {
        const boxes = await db.boxes
            .where('hiveId').equals(hiveId)
            .sortBy('position');

        if (boxes.length === 0) return null;

        const boxToRemove = boxes[boxes.length - 1]; // Last item is top

        // Transaction to delete box and its frames
        await db.transaction('rw', db.boxes, db.frames, async () => {
            await db.boxes.delete(boxToRemove.id);
            await db.frames.where('boxId').equals(boxToRemove.id).delete();
        });

        return boxToRemove.id;
    }
);

export const updateFrameContent = createAsyncThunk(
    'hiveDetails/updateFrameContent',
    async ({ frameId, content }: { frameId: string, content: HiveFrame['content'] }) => {
        await db.frames.update(frameId, { content });
        return { frameId, content };
    }
);


const hiveDetailsSlice = createSlice({
    name: 'hiveDetails',
    initialState,
    reducers: {
        clearCurrentHive: (state) => {
            state.currentHive = null;
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchHiveDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchHiveDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentHive = action.payload;
            })
            .addCase(fetchHiveDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error';
            })
            // Add Box
            .addCase(addBoxToHive.fulfilled, (state, action) => {
                if (state.currentHive && state.currentHive.id === action.meta.arg.hiveId) {
                    state.currentHive.boxes.push(action.payload);
                }
            })
            // Remove Box
            .addCase(removeTopBox.fulfilled, (state, action) => {
                if (state.currentHive && action.payload) {
                    state.currentHive.boxes = state.currentHive.boxes.filter(b => b.id !== action.payload);
                }
            })
            // Add Frame
            .addCase(addFrame.fulfilled, (state, action) => {
                if (state.currentHive) {
                    const box = state.currentHive.boxes.find(b => b.id === action.payload.boxId);
                    if (box) {
                        box.frames.push(action.payload);
                        box.frames.sort((a, b) => a.position - b.position);
                    }
                }
            })
            // Delete Frame
            .addCase(deleteFrame.fulfilled, (state, action) => {
                if (state.currentHive) {
                    for (const box of state.currentHive.boxes) {
                        const frameIndex = box.frames.findIndex(f => f.id === action.payload);
                        if (frameIndex !== -1) {
                            box.frames.splice(frameIndex, 1);
                            break;
                        }
                    }
                }
            })
            // Update Frame
            .addCase(updateFrameContent.fulfilled, (state, action) => {
                if (state.currentHive) {
                    for (const box of state.currentHive.boxes) {
                        const frame = box.frames.find(f => f.id === action.payload.frameId);
                        if (frame) {
                            frame.content = action.payload.content;
                            break;
                        }
                    }
                }
            });
    },
});

export const { clearCurrentHive } = hiveDetailsSlice.actions;
export default hiveDetailsSlice.reducer;
