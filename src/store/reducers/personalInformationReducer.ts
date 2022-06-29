import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Country, Region } from "country-region-data";
import { IAddress } from "../../constants/interfaces";
import { ShippingType } from "../factories/shipping/ShippingFactory";

export interface PersonalInformationState {
    address: IAddress;
    email: string;
    shipping: IShipping;
    userId?: string;
}

export interface IShipping {
    data: any;
    type: ShippingType;
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
    shipping: null,
    userId: null
};

export const personalInformationSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setAddress: (state, action: PayloadAction<IAddress>) => {
            state.address = action.payload;
        },
        setFirstName: (state, action: PayloadAction<string>) => {
            state.address.firstName = action.payload;
        },
        setLastName: (state, action: PayloadAction<string>) => {
            state.address.lastName = action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setAddressAddress: (state, action: PayloadAction<string>) => {
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
        setUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
        resetPersonalInformation: () => initialState
    }
});

export const {
    setFirstName,
    setLastName,
    setEmail,
    setAddress,
    setAddressAddress,
    setZip,
    setCity,
    setCountry,
    setRegion,
    setShipping,
    setUserId,
    resetPersonalInformation
} = personalInformationSlice.actions;
export const selectPersonalInformation = (state: RootState) =>
    state.personalInformation;
export default personalInformationSlice.reducer;
