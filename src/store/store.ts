import { configureStore } from '@reduxjs/toolkit';
import nextStepAvailableReducer from "./reducers/nextStepAvailableReducer";
import eventSelectionReducer from "./reducers/eventSelectionReducer";

export function makeStore() {
    return configureStore({
        reducer: {
            nextStepAvailable: nextStepAvailableReducer,
            selectedEvent: eventSelectionReducer
        },
    })
}

export const store = makeStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
