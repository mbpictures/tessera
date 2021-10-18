import {IAddress} from "./interfaces";
import zippo from "zippo";

export type AddressValidator = (address: IAddress) => boolean;
export const addressValidatorMap: Record<string, AddressValidator> = {
    "FirstName": (address) => address.firstName != null && address.firstName.length > 3,
    "LastName": address => address.lastName != null && address.lastName.length > 3,
    "Address": address =>  address.address != null && address.address.length > 5 && hasNumber(address.address),
    "Zip": address => zippo.validate(address.zip),
    "City": address => address.city != null && address.city.length > 3,
    "Country": address => address.country != null,
    "Region": address => address.region != null || address.country.regions.length == 0
}

export const validateAddress = (address: IAddress) => {
    return Object.values(addressValidatorMap).every((addressValidator) => addressValidator(address));
};

export const hasNumber = (myString) => {
    return /\d/.test(myString);
}
