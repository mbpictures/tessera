import { Autocomplete, Grid, Stack, TextField } from "@mui/material";
import { IAddress } from "../../constants/interfaces";
import { ZIP } from "./ZIP";
import { useState } from "react";
import countryRegionData, { Country, Region } from "country-region-data";
import { addressValidatorMap } from "../../constants/util";

const validateAddressComponent = (address: IAddress, property: string) => {
    if (addressValidatorMap[property](address)) return null;
    if (property === "firstName") return "Please enter your firstname here!";
    if (property === "lastName") return "Please enter your lastname here!";
    if (property === "address") return "Please enter street and house number!";
    if (property === "city") return "Please enter your city!";
    if (property === "country") return "Select your country!";
    if (property === "region") return "Select your region!";
};

export const AddressComponent = ({
    value,
    onChange
}: {
    value: IAddress;
    onChange: (newAddress: IAddress) => unknown;
}) => {
    const [localZip, setLocalZip] = useState<string>(value.zip ?? "");
    const [firstNameError, setFirstNameError] = useState<string>(null);
    const [lastNameError, setLastNameError] = useState<string>(null);
    const [addressError, setAddressError] = useState<string>(null);
    const [cityError, setCityError] = useState<string>(null);

    const handleUpdate = (property, newValue) => {
        const newAddress: IAddress = Object.assign({}, value);
        newAddress[property] = newValue;
        onChange(newAddress);
        if (property === "firstName")
            setFirstNameError(validateAddressComponent(newAddress, property));
        if (property === "lastName")
            setLastNameError(validateAddressComponent(newAddress, property));
        if (property === "address")
            setAddressError(validateAddressComponent(newAddress, property));
        if (property === "city")
            setCityError(validateAddressComponent(newAddress, property));
    };

    const handleChangeZip = (newValue: string, valid: boolean) => {
        setLocalZip(newValue);
        if (!valid) return;
        handleUpdate("zip", newValue);
    };

    const handleChangeCountry = (event: any, newValue: Country) => {
        const newAddress: IAddress = Object.assign({}, value);
        if (newValue == null) {
            newAddress.country = newAddress.region = null;
            onChange(newAddress);
            return;
        }
        newAddress.country = newValue;
        newAddress.region = null;
        onChange(newAddress);
    };

    const handleChangeRegion = (event: any, newValue: Region) => {
        handleUpdate("region", newValue);
    };

    return (
        <Stack spacing={1}>
            <TextField
                label="Firstname"
                value={value.firstName ?? ""}
                onChange={(event) =>
                    handleUpdate("firstName", event.target.value)
                }
                helperText={firstNameError}
                error={firstNameError !== null}
                name={"address-firstname"}
            />
            <TextField
                label="Lastname"
                value={value.lastName ?? ""}
                onChange={(event) =>
                    handleUpdate("lastName", event.target.value)
                }
                helperText={lastNameError}
                error={lastNameError !== null}
                name={"address-lastname"}
            />
            <TextField
                label="Address"
                value={value.address ?? ""}
                onChange={(event) =>
                    handleUpdate("address", event.target.value)
                }
                helperText={addressError}
                error={addressError !== null}
                name={"address-address"}
            />
            <Grid container rowSpacing={1}>
                <Grid item md={4} xs={12}>
                    <ZIP
                        value={localZip}
                        onChange={handleChangeZip}
                        name={"address-zip"}
                    />
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField
                        label="City"
                        fullWidth
                        value={value.city ?? ""}
                        onChange={(event) =>
                            handleUpdate("city", event.target.value)
                        }
                        helperText={cityError}
                        error={cityError !== null}
                        name={"address-city"}
                    />
                </Grid>
            </Grid>
            <Grid container rowSpacing={1}>
                <Grid item md={6} xs={12}>
                    <Autocomplete
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Country"
                                name={"address-country-text"}
                            />
                        )}
                        options={countryRegionData}
                        fullWidth
                        onChange={handleChangeCountry}
                        getOptionLabel={(option: Country) => option.countryName}
                        isOptionEqualToValue={(option, value) =>
                            option?.countryName === value?.countryName &&
                            option?.countryShortCode === value?.countryShortCode
                        }
                        value={value.country}
                    />
                </Grid>
                <Grid item md={6} xs={12}>
                    {value.country != null &&
                        value.country.regions.length > 0 && (
                            <Autocomplete
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Region"
                                        name={"address-region-text"}
                                    />
                                )}
                                options={value.country.regions}
                                fullWidth
                                onChange={handleChangeRegion}
                                getOptionLabel={(option: Region) => option.name}
                                isOptionEqualToValue={(option, value) =>
                                    option?.name === value?.name &&
                                    option?.shortCode === value?.shortCode
                                }
                                value={value.region}
                            />
                        )}
                </Grid>
            </Grid>
        </Stack>
    );
};
