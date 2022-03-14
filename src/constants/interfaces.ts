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

export enum PermissionType {
    Read = "Read",
    Write = "Write"
}

export enum PermissionSection {
    None = "none",
    UserManagement = "UserManagement",
    EventManagement = "EventManagement",
    EventCategories = "EventCategories",
    EventSeatMaps = "EventSeatMaps",
    Orders = "Orders",
    OrderMarkAsPayed = "OrderMarkAsPayed",
    Options = "Options",
    Translation = "Translation"
}

export interface Permission {
    permissionType: PermissionType;
    permission: PermissionSection;
}
