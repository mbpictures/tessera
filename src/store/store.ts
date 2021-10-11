import { configureStore } from '@reduxjs/toolkit';
import nextStepAvailableReducer from "./reducers/nextStepAvailableReducer";
import eventSelectionReducer from "./reducers/eventSelectionReducer";
import orderReducer from "./reducers/orderReducer";
import personalInformationReducer from "./reducers/personalInformationReducer";

export function makeStore() {
    return configureStore({
        reducer: {
            nextStepAvailable: nextStepAvailableReducer,
            selectedEvent: eventSelectionReducer,
            order: orderReducer,
            personalInformation: personalInformationReducer
        },
    })
}

export const store = makeStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
