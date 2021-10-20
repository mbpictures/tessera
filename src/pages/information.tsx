import {Step} from "../components/Step";
import {
    Card, Stack,
    TextField,
    Typography
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
import {disableNextStep, enableNextStep} from "../store/reducers/nextStepAvailableReducer";
import {validateAddress} from "../constants/util";
import {ShippingFactory, ShippingType} from "../store/factories/shipping/ShippingFactory";
import {AddressComponent} from "../components/form/AddressComponent";
import {PostalDeliveryShippingComponent} from "../components/shipping/PostalDeliveryShippingComponent";
import {BoxOfficeShippingComponent} from "../components/shipping/BoxOfficeShippingComponent";
import {DownloadShippingComponent} from "../components/shipping/DownloadShippingComponent";
import {Box} from "@mui/system";

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Information({direction}) {
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingType | null>(selector.shipping?.type ?? null);

    useEffect(() => {
        const valid = validateEmail(selector.email) &&
            validateAddress(selector.address) &&
            (ShippingFactory.getShippingInstance(selector.shipping)?.isValid() ?? false);

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

    return (
        <Step direction={direction} style={{width: "100%", maxHeight: "100%"}}>
            <Box paddingBottom={1} paddingTop={1}>
                <Card>
                    <Stack padding={1} spacing={1}>
                        <Typography>These address given will be used for invoice.</Typography>
                        <TextField label="E-Mail Address" type="email" value={selector.email} onChange={event => dispatch(setEmail(event.target.value))} />
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
