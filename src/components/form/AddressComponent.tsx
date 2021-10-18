import {Autocomplete, Grid, Stack, TextField} from "@mui/material";
import {IAddress} from "../../constants/interfaces";
import {ZIP} from "./ZIP";
import {useState} from "react";
import countryRegionData, {Country, Region} from "country-region-data";

export const AddressComponent = ({value, onChange}: {value: IAddress, onChange: (newAddress: IAddress) => unknown}) => {
    const [localZip, setLocalZip] = useState<string>(value.zip ?? "");

    const handleUpdate = (property, newValue) => {
        const newAddress: IAddress = Object.assign({}, value);
        newAddress[property] = newValue;
        onChange(newAddress);
    };

    const handleChangeZip = (newValue: string, valid: boolean) => {
        setLocalZip(newValue);
        if (!valid) return;
        handleUpdate("zip", newValue);
    }

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
    }

    return (
        <Stack spacing={1}>
            <TextField label="Firstname" value={value.firstName ?? ""} onChange={event => handleUpdate("firstName", event.target.value)} />
            <TextField label="Lastname" value={value.lastName ?? ""} onChange={event => handleUpdate("lastName", event.target.value)} />
            <TextField label="Address" value={value.address ?? ""} onChange={event => handleUpdate("address", event.target.value)} />
            <Grid container rowSpacing={1}>
                <Grid item md={4} xs={12}>
                    <ZIP value={localZip} onChange={handleChangeZip} />
                </Grid>
                <Grid item md={8} xs={12}>
                    <TextField label="City" fullWidth value={value.city ?? ""} onChange={event => handleUpdate("city", event.target.value)} />
                </Grid>
            </Grid>
            <Grid container rowSpacing={1}>
                <Grid item md={6} xs={12}>
                    <Autocomplete
                        renderInput={(params) => <TextField {...params} label="Country" />}
                        options={countryRegionData}
                        fullWidth
                        onChange={handleChangeCountry}
                        getOptionLabel={(option: Country) => option.countryName}
                        isOptionEqualToValue={(option, value) => option?.countryName === value?.countryName && option?.countryShortCode === value?.countryShortCode}
                        value={value.country ?? {countryName: "", countryShortCode: ""}}
                    />
                </Grid>
                <Grid item md={6} xs={12}>
                    {
                        (value.country != null && value.country.regions.length > 0) && (
                            <Autocomplete
                                renderInput={(params) => <TextField {...params} label="Region" />}
                                options={value.country.regions}
                                fullWidth
                                onChange={handleChangeRegion}
                                getOptionLabel={(option: Region) => option.name}
                                isOptionEqualToValue={(option, value) => option?.name === value?.name && option?.shortCode === value?.shortCode}
                                value={value.region ?? {name: "", shortCode: ""}}
                            />
                        )
                    }
                </Grid>
            </Grid>
        </Stack>
    );
}