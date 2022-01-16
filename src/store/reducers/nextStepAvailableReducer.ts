import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface NextStepAvailableState {
    available: boolean;
}

const initialState: NextStepAvailableState = {
    available: false
};

export const nextStepAvailableSlice = createSlice({
    name: "nextStepAvailable",
    initialState,
    reducers: {
        enableNextStep: (state) => {
            state.available = true;
        },
        disableNextStep: (state) => {
            state.available = false;
        }
    }
});

export const { enableNextStep, disableNextStep } =
    nextStepAvailableSlice.actions;
export const selectNextStateAvailable = (state: RootState) =>
    state.nextStepAvailable.available;
export default nextStepAvailableSlice.reducer;
