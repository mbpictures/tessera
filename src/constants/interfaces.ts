import { Country, Region } from "country-region-data";

export interface IAddress {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zip: string;
    country: Country;
    region: Region;
}
