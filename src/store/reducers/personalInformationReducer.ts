import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {Country, Region} from "country-region-data";

interface PersonalInformationState {
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    zip: string;
    city: string;
    country: Country;
    region: Region;
    shipping: IShipping;
}

export interface IShipping {
    data: any;
    type: string;
}

export abstract class Shipping {
    shippingData: IShipping;

    constructor(shipping: IShipping) {
        this.shippingData = shipping;
    }

    get Shipping(): IShipping {
        return this.shippingData;
    }

    abstract isValid(): boolean;
}

export class MockShipping extends Shipping {
    isValid(): boolean {
        return true;
    }
}

const initialState: PersonalInformationState = {
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    zip: "",
    city: "",
    country: null,
    region: null,
    shipping: null
};

export const personalInformationSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setFirstName: (state, action: PayloadAction<string>) => {
            state.firstName = action.payload;
        },
        setLastName: (state, action: PayloadAction<string>) => {
            state.lastName = action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setStreet: (state, action: PayloadAction<string>) => {
            state.street = action.payload;
        },
        setZip: (state, action: PayloadAction<string>) => {
            state.zip = action.payload;
        },
        setCity: (state, action: PayloadAction<string>) => {
            state.city = action.payload;
        },
        setCountry: (state, action: PayloadAction<Country>) => {
            state.country = action.payload;
        },
        setRegion: (state, action: PayloadAction<Region>) => {
            state.region = action.payload;
        },
        setShipping: (state, action: PayloadAction<IShipping>) => {
            state.shipping = action.payload;
        },
    }
});

export const {setFirstName, setLastName, setEmail, setStreet, setZip, setCity, setCountry, setRegion, setShipping} = personalInformationSlice.actions;
export const selectPersonalInformation = (state: RootState) => state.personalInformation;
export default personalInformationSlice.reducer;
