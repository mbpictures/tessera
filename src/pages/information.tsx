import {Step} from "../components/Step";
import {
    Autocomplete,
    Card,
    Grid, Stack,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";
import {CheckboxAccordion} from "../components/CheckboxAccordion";
import {ZIP} from "../components/form/ZIP";
import countryRegionData, {Country, Region} from "country-region-data";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {
    selectPersonalInformation, setCity, setCountry, setEmail,
    setFirstName,
    setLastName, setRegion, setStreet,
    setZip
} from "../store/reducers/personalInformationReducer";

const countryFilter = (searchCountry: Country) => (country: Country) => country.countryName == (searchCountry?.countryName ?? "");
const regionFilter = (searchRegion: Region) => (region: Region) => region.name == (searchRegion?.name ?? "");

interface AutocompleteObject {
    label: string;
    id: number;
}

export default function Information({direction}) {
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const [localZip, setLocalZip] = useState<string>(selector.zip);

    const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>(selector.shipping?.type ?? null);
    const [countryId, setCountryId] = useState<number>(countryRegionData.findIndex(countryFilter(selector.country)));
    const [regionId, setRegionId] = useState<number>(countryRegionData.find(countryFilter(selector.country))?.regions.findIndex(regionFilter(selector.region)) ?? -1);

    const handleChangeCountry = (event: any, newValue: AutocompleteObject) => {
        if (newValue == null) {
            setCountryId(-1);
            dispatch(setCountry(null));
            setRegionId(-1);
            dispatch(setRegion(null));
            return;
        }
        setCountryId(newValue.id);
        dispatch(setCountry(countryRegionData[newValue.id]));
        setRegionId(-1);
        dispatch(setRegion(null));
    };

    const handleChangeRegion = (event: any, newValue: AutocompleteObject) => {
        if (newValue == null) {
            setRegionId(-1);
            dispatch(setRegion(null));
            return;
        }
        setRegionId(newValue.id);
        dispatch(setRegion(countryRegionData[countryId].regions[newValue.id]));
    }

    const handleChangeZip = (newValue: string, valid: boolean) => {
        setLocalZip(newValue);
        if (!valid) return;
        dispatch(setZip(newValue));
    };

    return (
        <Step direction={direction} style={{width: "100%"}}>
            <Card >
                <Stack padding={1} spacing={1}>
                    <Typography>These address given will be used for invoice.</Typography>
                    <TextField label="Firstname" value={selector.firstName} onChange={event => dispatch(setFirstName(event.target.value))} />
                    <TextField label="Lastname" value={selector.lastName} onChange={event => dispatch(setLastName(event.target.value))} />
                    <TextField label="E-Mail Address" type="email" value={selector.email} onChange={event => dispatch(setEmail(event.target.value))} />
                    <TextField label="Street" value={selector.street} onChange={event => dispatch(setStreet(event.target.value))} />
                    <Grid container rowSpacing={1}>
                        <Grid item md={4} xs={12}>
                            <ZIP value={localZip} onChange={handleChangeZip} />
                        </Grid>
                        <Grid item md={8} xs={12}>
                            <TextField label="City" fullWidth value={selector.city} onChange={event => dispatch(setCity(event.target.value))} />
                        </Grid>
                    </Grid>
                    <Grid container rowSpacing={1}>
                        <Grid item md={6} xs={12}>
                            <Autocomplete
                                renderInput={(params) => <TextField {...params} label="Country" />}
                                options={countryRegionData.map((country, index) => {
                                    return {label: country.countryName, id: index};
                                })}
                                fullWidth
                                onChange={handleChangeCountry}
                                getOptionLabel={(option: AutocompleteObject) => option.label}
                                isOptionEqualToValue={(option, value) => option.label === value.label && option.id === value.id}
                                value={countryId >= 0 ? {label: countryRegionData[countryId]?.countryName ?? "", id: countryId} : null}
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            {
                                (countryId >= 0 && countryRegionData[countryId].regions.length > 0) && (
                                    <Autocomplete
                                        renderInput={(params) => <TextField {...params} label="Region" />}
                                        options={countryRegionData[countryId].regions.map((region, index) => {
                                            return {label: region.name, id: index};
                                        })}
                                        fullWidth
                                        onChange={handleChangeRegion}
                                        getOptionLabel={(option: AutocompleteObject) => option.label}
                                        isOptionEqualToValue={(option, value) => option.label === value.label && option.id === value.id}
                                        value={countryId >= 0 && regionId >= 0 ? {label: countryRegionData[countryId]?.regions[regionId]?.name ?? "", id: countryId} : null}
                                    />
                                )
                            }
                        </Grid>
                    </Grid>
                </Stack>
            </Card>
            <CheckboxAccordion
                label={"Postal delivery"}
                name={"post"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">The ticket will be sent to your home.</Typography>
            </CheckboxAccordion>
            <CheckboxAccordion
                label={"Download"}
                name={"download"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">The ticket will be sent to your email address.</Typography>
            </CheckboxAccordion>
            <CheckboxAccordion
                label={"Box-Office"}
                name={"boxoffice"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">You can pick up your ticket at the Box-Office</Typography>
            </CheckboxAccordion>
        </Step>
    );
}
