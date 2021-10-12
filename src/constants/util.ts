import {IAddress} from "./interfaces";
import zippo from "zippo";

export const validateAddress = (address: IAddress) => {
    if (!address || !address.firstName || !address.lastName || !address.address || !address.country) return false;
    return address.firstName.length > 3 &&
        address.lastName.length > 3 &&
        address.address.length > 5 &&
        hasNumber(address.address) &&
        zippo.validate(address.zip) &&
        address.city.length > 3 &&
        address.country != null &&
        address.region != null;
};

export const hasNumber = (myString) => {
    return /\d/.test(myString);
}