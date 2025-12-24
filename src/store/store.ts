import { configureStore } from '@reduxjs/toolkit';
import hivesReducer from './hivesSlice';
import hiveDetailsReducer from './hiveDetailsSlice';
import inspectionsReducer from './inspectionsSlice';

export const store = configureStore({
    reducer: {
        hives: hivesReducer,
        hiveDetails: hiveDetailsReducer,
        inspections: inspectionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
