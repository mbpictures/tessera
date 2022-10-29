import { Step } from "../components/Step";
import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    useMediaQuery
} from "@mui/material";
import { Box, useTheme } from "@mui/system";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/router";
import { PaymentMethods } from "../components/payment/PaymentMethods";
import { selectPayment, setPaymentStatus } from "../store/reducers/paymentReducer";
import prisma from "../lib/prisma";
import { PaymentFactory } from "../store/factories/payment/PaymentFactory";
import { PaymentOverview } from "../components/PaymentOverview";
import { PayButton } from "../components/payment/button/PayButton";
import { getOption } from "../lib/options";
import { Options } from "../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";
import { selectEventSelected } from "../store/reducers/eventSelectionReducer";
import { getEventTitle } from "../constants/util";
import { AcceptGTC } from "../components/form/AcceptGTC";

export default function Payment({ categories, direction, paymentMethods, paymentFees, shippingFees, events }) {
    const payment = useAppSelector(selectPayment);
    const selectedEventId = useAppSelector(selectEventSelected);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [eventTitle, setEventTitle] = useState<string | null>(null);

    const theme = useTheme();
    const containerStyling: React.CSSProperties = useMediaQuery(
        theme.breakpoints.up("md")
    )
        ? { flexWrap: "nowrap" }
        : {
              flexDirection: "column-reverse",
              overflowY: "auto",
              flexWrap: "nowrap"
          };

    useEffect(() => {
        if (payment.state !== "finished") return;
        router.push("/checkout").catch(console.log);
    }, [payment, router]);

    useEffect(() => {
        setEventTitle(getEventTitle(events.find(e => e.id === selectedEventId)));
    }, [events, selectedEventId]);

    const openSeatSelectionPage = () => {
        router.push("/seatselection").catch(console.log);
    };

    return (
        <Step
            direction={direction}
            style={{
                width: "100%",
                maxHeight: "100%",
                flex: "1 1 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <>
                <Dialog open={payment.state === "failure"}>
                    <DialogTitle>Payment failed!</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            An error occured while processing your payment.
                            Please try again, choose a different payment method
                            or contact us!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant={"outlined"}
                            onClick={() => dispatch(setPaymentStatus("none"))}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
            <Grid
                container
                spacing={2}
                style={{ ...containerStyling, maxHeight: "100%" }}
            >
                <Grid
                    item
                    md={12}
                    lg={8}
                    style={{
                        maxHeight: "100%",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    <Box
                        style={{
                            maxHeight: "100%",
                            overflowY: "auto",
                            padding: "2px 5px",
                            width: "100%"
                        }}
                    >
                        <Card>
                            <PaymentMethods paymentMethods={paymentMethods} paymentFees={paymentFees} categories={categories} />
                        </Card>
                    </Box>
                </Grid>
                <Grid
                    item
                    md={12}
                    lg={4}
                    display="flex"
                    alignItems="center"
                    style={{ paddingLeft: "21px", marginRight: "5px" }}
                >
                    <Card style={{ flex: "1 1 auto", padding: "10px" }}>
                        <PaymentOverview
                            categories={categories}
                            hideEmptyCategories
                            withEditButton
                            onEdit={openSeatSelectionPage}
                            paymentFees={paymentFees}
                            shippingFees={shippingFees}
                            eventName={eventTitle}
                        />
                        <AcceptGTC />
                        {PaymentFactory.getPaymentInstance(
                            payment.payment
                        )?.getPaymentButton() ?? <PayButton />}
                    </Card>
                </Grid>
            </Grid>
        </Step>
    );
}

export async function getStaticProps({ locale }) {
    const categories = await prisma.category.findMany();
    const paymentMethods = await getOption(Options.PaymentProviders);
    const events = await prisma.eventDate.findMany({
        select: {
            title: true,
            event: {
                select: {
                    title: true
                }
            },
            id: true
        }
    });

    return {
        props: {
            disableOverflow: true,
            noNext: true,
            categories: categories,
            paymentMethods,
            paymentFees: await getOption(Options.PaymentFeesPayment),
            shippingFees: await getOption(Options.PaymentFeesShipping),
            theme: await getOption(Options.Theme),
            ...(await loadNamespaces({ locale, pathname: '/payment' })),
            events
        }
    };
}
