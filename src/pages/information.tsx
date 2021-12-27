import {Step} from "../components/Step";
import {
    Card, Stack,
    TextField,
    Typography, useMediaQuery
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {CheckboxAccordion} from "../components/CheckboxAccordion";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {
    selectPersonalInformation,
    setAddress,
    setEmail,
    setShipping,
} from "../store/reducers/personalInformationReducer";
import {ShippingType} from "../store/factories/shipping/ShippingFactory";
import {AddressComponent} from "../components/form/AddressComponent";
import {PostalDeliveryShippingComponent} from "../components/shipping/PostalDeliveryShippingComponent";
import {BoxOfficeShippingComponent} from "../components/shipping/BoxOfficeShippingComponent";
import {DownloadShippingComponent} from "../components/shipping/DownloadShippingComponent";
import {Box, useTheme} from "@mui/system";

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Information({direction}) {
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingType | null>(selector.shipping?.type ?? null);
    const [emailError, setEmailError] = useState<string>(null);

    const theme = useTheme();
    const boxStyling = useMediaQuery(theme.breakpoints.up("md")) ? {width: "60%"} : {width: "100%"};

    useEffect(() => {
        const emailValid = validateEmail(selector.email);

        setEmailError(selector.email.length == 0 || emailValid ? null : "Please enter valid email address");
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

    return (
        <Step direction={direction} style={{width: "100%", maxHeight: "100%", display: "flex", justifyContent: "center"}}>
            <Box style={boxStyling} sx={{py: 2}}>
                <Card>
                    <Stack padding={1} spacing={1}>
                        <Typography>These address given will be used for invoice.</Typography>
                        <TextField
                            label="E-Mail Address"
                            type="email"
                            value={selector.email}
                            onChange={event => dispatch(setEmail(event.target.value))}
                            error={emailError != null}
                            helperText={emailError}
                        />
                        <AddressComponent value={selector.address} onChange={newValue => dispatch(setAddress(newValue))} />
                    </Stack>
                </Card>
                <CheckboxAccordion
                    label={"Postal delivery"}
                    name={ShippingType.Post}
                    selectedItem={selectedShippingMethod}
                    onSelect={setSelectedShippingMethod}
                >
                    <PostalDeliveryShippingComponent />
                </CheckboxAccordion>
                <CheckboxAccordion
                    label={"Download"}
                    name={ShippingType.Download}
                    selectedItem={selectedShippingMethod}
                    onSelect={setSelectedShippingMethod}
                >
                    <DownloadShippingComponent />
                </CheckboxAccordion>
                <CheckboxAccordion
                    label={"Box-Office"}
                    name={ShippingType.BoxOffice}
                    selectedItem={selectedShippingMethod}
                    onSelect={setSelectedShippingMethod}
                >
                    <BoxOfficeShippingComponent />
                </CheckboxAccordion>
            </Box>
        </Step>
    );
}
