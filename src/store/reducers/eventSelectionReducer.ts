import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";

interface EventSelectionState {
    selectedEvent: number;
};

const initialState: EventSelectionState = {
    selectedEvent: -1
};

export const eventSelectionSlice = createSlice({
    name: "nextStepAvailable",
    initialState,
    reducers: {
        setEvent: (state, action: PayloadAction<number>) => {
            state.selectedEvent = action.payload;
        }
    }
});

export const {setEvent} = eventSelectionSlice.actions;
export const selectEventSelected = (state: RootState) => state.selectedEvent.selectedEvent;
export default eventSelectionSlice.reducer;
