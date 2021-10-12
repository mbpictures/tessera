import {Step} from "../components/Step";
import {
    Autocomplete,
    Card,
    Grid, Stack,
    TextField,
    Typography
} from "@mui/material";
import {useEffect, useState} from "react";
import {CheckboxAccordion} from "../components/CheckboxAccordion";
import {ZIP} from "../components/form/ZIP";
import countryRegionData, {Country, Region} from "country-region-data";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {
    MockShipping,
    selectPersonalInformation, setCity, setCountry, setEmail,
    setFirstName,
    setLastName, setRegion, setShipping, setAddress,
    setZip
} from "../store/reducers/personalInformationReducer";
import {disableNextStep, enableNextStep} from "../store/reducers/nextStepAvailableReducer";
import {validateAddress} from "../constants/util";

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Information({direction}) {
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const [localZip, setLocalZip] = useState<string>(selector.address.zip);

    const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>(selector.shipping?.type ?? null);

    useEffect(() => {
        const valid = validateEmail(selector.email) &&
            validateAddress(selector.address) &&
            selector.shipping != null &&
            new MockShipping(selector.shipping).isValid();

        if (valid)
            dispatch(enableNextStep());
        else
            dispatch(disableNextStep());
    }, [selector]);

    useEffect(() => {
        if (selectedShippingMethod === null) {
            dispatch(setShipping(null));
            return;
        }
        dispatch(setShipping({
            type: selectedShippingMethod,
            data: "mock"
        }));
    }, [selectedShippingMethod]);

    const handleChangeCountry = (event: any, newValue: Country) => {
        if (newValue == null) {
            dispatch(setCountry(null));
            dispatch(setRegion(null));
            return;
        }
        dispatch(setCountry(newValue));
        dispatch(setRegion(null));
    };

    const handleChangeRegion = (event: any, newValue: Region) => {
        if (newValue == null) {
            dispatch(setRegion(null));
            return;
        }
        dispatch(setRegion(newValue));
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
                    <TextField label="Firstname" value={selector.address.firstName} onChange={event => dispatch(setFirstName(event.target.value))} />
                    <TextField label="Lastname" value={selector.address.lastName} onChange={event => dispatch(setLastName(event.target.value))} />
                    <TextField label="E-Mail Address" type="email" value={selector.email} onChange={event => dispatch(setEmail(event.target.value))} />
                    <TextField label="Address" value={selector.address} onChange={event => dispatch(setAddress(event.target.value))} />
                    <Grid container rowSpacing={1}>
                        <Grid item md={4} xs={12}>
                            <ZIP value={localZip} onChange={handleChangeZip} />
                        </Grid>
                        <Grid item md={8} xs={12}>
                            <TextField label="City" fullWidth value={selector.address.city} onChange={event => dispatch(setCity(event.target.value))} />
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
                                isOptionEqualToValue={(option, value) => option.countryName === value.countryName && option.countryShortCode === value.countryShortCode}
                                value={selector.address.country}
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            {
                                (selector.address.country != null && selector.address.country.regions.length > 0) && (
                                    <Autocomplete
                                        renderInput={(params) => <TextField {...params} label="Region" />}
                                        options={selector.address.country.regions}
                                        fullWidth
                                        onChange={handleChangeRegion}
                                        getOptionLabel={(option: Region) => option.name}
                                        isOptionEqualToValue={(option, value) => option.name === value.name && option.shortCode === value.shortCode}
                                        value={selector.address.region}
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
