import { RootState } from "../../store";

export abstract class NextAvailable {
    state: RootState;

    constructor(state: RootState) {
        this.state = state;
    }

    abstract isNextAvailable(): boolean;
}
