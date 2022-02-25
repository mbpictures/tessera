import { Step } from "../components/Step";
import { Card, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CheckboxAccordion } from "../components/CheckboxAccordion";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
    selectPersonalInformation,
    setAddress,
    setEmail,
    setShipping
} from "../store/reducers/personalInformationReducer";
import { ShippingFactory, ShippingType } from "../store/factories/shipping/ShippingFactory";
import { AddressComponent } from "../components/form/AddressComponent";
import { Box, useTheme } from "@mui/system";
import { getOption } from "../lib/options";
import { Options } from "../constants/Constants";

const validateEmail = (email) => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export default function Information({ direction, deliveryMethods }) {
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const [selectedShippingMethod, setSelectedShippingMethod] =
        useState<ShippingType | null>(selector.shipping?.type ?? null);
    const [emailError, setEmailError] = useState<string>(null);

    const theme = useTheme();
    const boxStyling = useMediaQuery(theme.breakpoints.up("md"))
        ? { width: "60%" }
        : { width: "100%" };

    useEffect(() => {
        const emailValid = validateEmail(selector.email);

        setEmailError(
            selector.email.length == 0 || emailValid
                ? null
                : "Please enter valid email address"
        );
    }, [selector]);

    useEffect(() => {
        if (selectedShippingMethod === null) {
            dispatch(setShipping(null));
            return;
        }
        dispatch(
            setShipping({
                type: selectedShippingMethod,
                data: "mock"
            })
        );
    }, [selectedShippingMethod, dispatch]);

    return (
        <Step
            direction={direction}
            style={{
                width: "100%",
                maxHeight: "100%",
                display: "flex",
                justifyContent: "center"
            }}
        >
            <Box style={boxStyling} sx={{ py: 2 }}>
                <Card>
                    <Stack padding={1} spacing={1}>
                        <Typography>
                            These address given will be used for invoice.
                        </Typography>
                        <TextField
                            label="E-Mail Address"
                            type="email"
                            value={selector.email}
                            onChange={(event) =>
                                dispatch(setEmail(event.target.value))
                            }
                            error={emailError != null}
                            helperText={emailError}
                            name={"address-email"}
                        />
                        <AddressComponent
                            value={selector.address}
                            onChange={(newValue) =>
                                dispatch(setAddress(newValue))
                            }
                        />
                    </Stack>
                </Card>
                {
                    // iterate through enum and filter to keep order constant
                    Object.values(ShippingType)
                        .filter((type) => deliveryMethods.includes(type))
                        .map((shippingType) => {
                            const instance = ShippingFactory.getShippingInstance({type: shippingType, data: null});
                            return (
                                <CheckboxAccordion
                                    label={instance.DisplayName}
                                    name={shippingType}
                                    selectedItem={selectedShippingMethod}
                                    onSelect={setSelectedShippingMethod}
                                    key={shippingType}
                                >
                                    {instance.Component}
                                </CheckboxAccordion>
                            )
                        })
                }
            </Box>
        </Step>
    );
}

export async function getStaticProps() {
    const deliveryMethods = await getOption(Options.Delivery);
    return {
        props: {
            deliveryMethods,
            theme: await getOption(Options.Theme)
        }
    };
}
