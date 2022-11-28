import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Country, Region } from "country-region-data";
import { IAddress } from "../../constants/interfaces";
import { ShippingType } from "../factories/shipping/ShippingFactory";

export interface CustomField {
    label: string;
    name: string;
    isRequired: boolean;
}

export interface PersonalInformationState {
    address: IAddress;
    email: string;
    shipping: IShipping;
    userId?: string;
    customFields: Record<string, string>;
    serverCustomFields: Array<CustomField>;
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
    customFields: {},
    serverCustomFields: [],
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
        setCustomFields: (state, action: PayloadAction<Record<string, string>>) => {
            state.customFields = action.payload;
        },
        setServerCustomFields: (state, action: PayloadAction<Array<CustomField>>) => {
            state.serverCustomFields = action.payload;
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
    resetPersonalInformation,
    setCustomFields,
    setServerCustomFields
} = personalInformationSlice.actions;
export const selectPersonalInformation = (state: RootState) =>
    state.personalInformation;
export default personalInformationSlice.reducer;
