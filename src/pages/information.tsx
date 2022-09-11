import { Step } from "../components/Step";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Button,
    Stack,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
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
import useTranslation from "next-translate/useTranslation";
import loadNamespaces from "next-translate/loadNamespaces";
import { TicketNames } from "../components/form/TicketNames";
import prisma from "../lib/prisma";
import { setTicketPersonalizationRequired } from "../store/reducers/orderReducer";
import { useRouter } from "next/router";

const validateEmail = (email) => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export default function Information({ direction, deliveryMethods, categories, events }) {
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(0);
    const router = useRouter();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        setEvent(events.find(event => event.id === parseInt(router.query.event as string)));
    }, [events])

    const [selectedShippingMethod, setSelectedShippingMethod] =
        useState<ShippingType | null>(selector.shipping?.type ?? null);
    const [emailError, setEmailError] = useState<string>(null);
    const [emailTouched, setEmailTouched] = useState<boolean>(false);

    const theme = useTheme();
    const boxStyling = useMediaQuery(theme.breakpoints.up("md"))
        ? { width: "60%" }
        : { width: "100%" };

    useEffect(() => {
        const emailValid = validateEmail(selector.email);

        setEmailError(
            selector.email.length == 0 || emailValid
                ? null
                : t("information:e-mail-error")
        );
    }, [selector]);

    useEffect(() => {
        if (!event) return;
        dispatch(setTicketPersonalizationRequired(event.personalTicket));
    }, [event]);

    useEffect(() => {
        if (selectedShippingMethod === null) {
            dispatch(setShipping(null));
            return;
        }
        dispatch(
            setShipping({
                type: selectedShippingMethod,
                data: {}
            })
        );
    }, [selectedShippingMethod, dispatch]);

    const handleAccordionChange = (index) => (event, isExpanded) => {
        if (!isExpanded) return;
        setExpanded(index);
    }

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
                <Accordion expanded={expanded === 0} onChange={handleAccordionChange(0)}>
                    <AccordionSummary>{t("information:address")}</AccordionSummary>
                    <AccordionDetails>
                        <Stack padding={1} spacing={1}>
                            <Typography>
                                {t("information:address-for-invoice")}
                            </Typography>
                            <TextField
                                label={t("information:e-mail")}
                                type="email"
                                value={selector.email}
                                onChange={(event) =>
                                    dispatch(setEmail(event.target.value))
                                }
                                error={emailError != null}
                                helperText={emailTouched && emailError}
                                name={"address-email"}
                                onBlur={() => setEmailTouched(true)}
                            />
                            <AddressComponent
                                value={selector.address}
                                onChange={(newValue) =>
                                    dispatch(setAddress(newValue))
                                }
                            />
                            <Button onClick={() => setExpanded(1)} fullWidth={true}>{t("common:next")}</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                {
                    event?.personalTicket && (
                        <Accordion expanded={expanded === 1} onChange={handleAccordionChange(1)}>
                            <AccordionSummary>{t("information:tickets")}</AccordionSummary>
                            <AccordionDetails>
                                <TicketNames categories={categories} />
                                <Button onClick={() => setExpanded(2)} fullWidth={true}>{t("common:next")}</Button>
                            </AccordionDetails>
                        </Accordion>
                    )
                }
                <Accordion expanded={expanded === 2} onChange={handleAccordionChange(2)}>
                    <AccordionSummary>{t("information:delivery")}</AccordionSummary>
                    <AccordionDetails>
                        {
                            // iterate through enum and filter to keep order constant
                            Object.values(ShippingType)
                                .filter((type) => deliveryMethods.includes(type))
                                .map((shippingType) => {
                                    const instance = ShippingFactory.getShippingInstance({type: shippingType, data: null});
                                    return (
                                        <CheckboxAccordion
                                            label={t(`information:${instance.DisplayName}`)}
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
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Step>
    );
}

export async function getStaticProps({ locale }) {
    const deliveryMethods = await getOption(Options.Delivery);
    return {
        props: {
            deliveryMethods,
            categories: await prisma.category.findMany(),
            events: await prisma.event.findMany({
                select: {
                    personalTicket: true,
                    id: true
                }
            }),
            theme: await getOption(Options.Theme),
            ...(await loadNamespaces({ locale, pathname: '/information' }))
        }
    };
}
