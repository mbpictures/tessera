import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {Country, Region} from "country-region-data";
import {IAddress} from "../../constants/interfaces";

interface PersonalInformationState {
    address: IAddress;
    email: string;
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
    address: {
        firstName: "",
        lastName: "",
        address: "",
        country: null,
        region: null,
        zip: "",
        city: ""
    },
    email: "",
    shipping: null
};

export const personalInformationSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setFirstName: (state, action: PayloadAction<string>) => {
            state.address.firstName = action.payload;
        },
        setLastName: (state, action: PayloadAction<string>) => {
            state.address.lastName = action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setAddress: (state, action: PayloadAction<string>) => {
            state.address.address = action.payload;
        },
        setZip: (state, action: PayloadAction<string>) => {
            state.address.zip = action.payload;
        },
        setCity: (state, action: PayloadAction<string>) => {
            state.address.city = action.payload;
        },
        setCountry: (state, action: PayloadAction<Country>) => {
            state.address.country = action.payload;
        },
        setRegion: (state, action: PayloadAction<Region>) => {
            state.address.region = action.payload;
        },
        setShipping: (state, action: PayloadAction<IShipping>) => {
            state.shipping = action.payload;
        },
    }
});

export const {setFirstName, setLastName, setEmail, setAddress, setZip, setCity, setCountry, setRegion, setShipping} = personalInformationSlice.actions;
export const selectPersonalInformation = (state: RootState) => state.personalInformation;
export default personalInformationSlice.reducer;
