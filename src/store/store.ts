import { configureStore } from '@reduxjs/toolkit';
import nextStepAvailableReducer from "./reducers/nextStepAvailableReducer";

export function makeStore() {
    return configureStore({
        reducer: {
            nextStepAvailable: nextStepAvailableReducer,
        },
    })
}

export const store = makeStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
