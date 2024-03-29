import { Autocomplete, Grid, Stack, TextField } from "@mui/material";
import { IAddress } from "../../constants/interfaces";
import { ZIP } from "./ZIP";
import { ChangeEvent, useEffect, useState } from "react";
import countryRegionData, { Country, Region } from "country-region-data";
import { addressValidatorMap } from "../../constants/util";
import useTranslation from "next-translate/useTranslation";
import informationText from "../../../locale/en/information.json";
import countryLocalize from "i18n-iso-countries";

const validateAddressComponent = (address: IAddress, property: string) => {
    if (addressValidatorMap[property](address)) return null;
    if (property === "firstName") return "information:firstname-error";
    if (property === "lastName") return "information:lastname-error";
    if (property === "address") return "information:address-error";
    if (property === "city") return "information:city-error";
    if (property === "country") return "information:country-error";
    if (property === "region") return "information:region-error";
};

type LocalizedCountry = Country & {localizedCountryName: string | undefined};

export const AddressComponent = ({
    value,
    onChange
}: {
    value: IAddress;
    onChange: (newAddress: IAddress) => unknown;
}) => {
    const { t, lang } = useTranslation();
    const [localZip, setLocalZip] = useState<string>(value.zip ?? "");
    const [firstNameError, setFirstNameError] = useState<string>(null);
    const [lastNameError, setLastNameError] = useState<string>(null);
    const [addressError, setAddressError] = useState<string>(null);
    const [cityError, setCityError] = useState<string>(null);
    const [touched, setTouched] = useState<string[]>([]);
    const [localizedCountryData, setLocalizedCountryData] = useState<LocalizedCountry[]>([]);

    useEffect(() => {
        countryLocalize.registerLocale(require(`i18n-iso-countries/langs/${lang}.json`));
        setLocalizedCountryData(countryRegionData.map(d => ({...d, localizedCountryName: countryLocalize.getName(d.countryShortCode, lang)})));
    }, [lang]);

    const handleUpdate = (property, newValue) => {
        const newAddress: IAddress = Object.assign({}, value);
        newAddress[property] = newValue;
        onChange(newAddress);

        const error = validateAddressComponent(newAddress, property);
        if (property === "firstName")
            setFirstNameError(error ? t(error, null, {fallback: informationText[error.replace("information:", "")]}) : null);
        if (property === "lastName")
            setLastNameError(error ? t(error, null, {fallback: informationText[error.replace("information:", "")]}) : null);
        if (property === "address")
            setAddressError(error ? t(error, null, {fallback: informationText[error.replace("information:", "")]}) : null);
        if (property === "city")
            setCityError(error ? t(error, null, {fallback: informationText[error.replace("information:", "")]}) : null);
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

    const handleTouched = (name) => {
        if (touched.includes(name)) return;
        const newPush = touched.map(x => x);
        newPush.push(name);
        setTouched(newPush);
    }

    const handleChangeRegion = (event: any, newValue: Region) => {
        handleUpdate("region", newValue);
    };

    return (
        <Stack spacing={1}>
            <TextField
                label={t("information:firstname", null, {fallback: informationText.firstname})}
                value={value.firstName ?? ""}
                onChange={(event) =>
                    handleUpdate("firstName", event.target.value)
                }
                helperText={touched.includes("firstname") && firstNameError}
                error={firstNameError !== null}
                name={"address-firstname"}
                onBlur={() => handleTouched("firstname")}
            />
            <TextField
                label={t("information:lastname", null, {fallback: informationText.lastname})}
                value={value.lastName ?? ""}
                onChange={(event) =>
                    handleUpdate("lastName", event.target.value)
                }
                helperText={touched.includes("lastname") && lastNameError}
                error={lastNameError !== null}
                name={"address-lastname"}
                onBlur={() => handleTouched("lastname")}
            />
            <TextField
                label={t("information:address", null, {fallback: informationText.address})}
                value={value.address ?? ""}
                onChange={(event) =>
                    handleUpdate("address", event.target.value)
                }
                helperText={touched.includes("address") && addressError}
                error={addressError !== null}
                name={"address-address"}
                onBlur={() => handleTouched("address")}
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
                        label={t("information:city", null, {fallback: informationText.city})}
                        fullWidth
                        value={value.city ?? ""}
                        onChange={(event) =>
                            handleUpdate("city", event.target.value)
                        }
                        helperText={touched.includes("city") && cityError}
                        error={cityError !== null}
                        name={"address-city"}
                        onBlur={() => handleTouched("city")}
                    />
                </Grid>
            </Grid>
            <Grid container rowSpacing={1}>
                <Grid item md={6} xs={12}>
                    <Autocomplete
                        renderInput={({inputProps, ...params}) => (
                            <TextField
                                {...params}
                                label={t("information:country", null, {fallback: informationText.country})}
                                name={"address-country-text"}
                                inputProps={{
                                    ...inputProps,
                                    autoComplete: "off",
                                    onChange: (event: ChangeEvent<HTMLInputElement>) => {
                                        const value = localizedCountryData.find(a => a.localizedCountryName === event.target.value || a.countryName === event.target.value);
                                        if (!value) {
                                            inputProps.onChange(event);
                                            return;
                                        }
                                        handleChangeCountry(event, value);
                                    }
                                }}
                            />
                        )}
                        options={
                            localizedCountryData
                                .sort((a, b) => (a.localizedCountryName ?? a.countryName) > (b.localizedCountryName ?? b.countryName) ? 1 : -1)
                        }
                        noOptionsText={t("information:no-options")}
                        fullWidth
                        autoSelect
                        onChange={handleChangeCountry}
                        getOptionLabel={(option: LocalizedCountry) => option.localizedCountryName ?? option.countryName}
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
                                        label={t("information:region", null, {fallback: informationText.region})}
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
