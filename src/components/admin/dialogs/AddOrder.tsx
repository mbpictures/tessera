import {
    Accordion,
    AccordionDetails,
    AccordionSummary, AppBar,
    Dialog,
    DialogContent,
    IconButton, Slide,
    Stack, TextField, Toolbar, Typography
} from "@mui/material";
import { EventSelection } from "../../EventSelection/EventSelection";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../../../store/store";
import {
    resetPersonalInformation,
    setAddress,
    setEmail,
    setShipping, setUserId
} from "../../../store/reducers/personalInformationReducer";
import { AddressComponent } from "../../form/AddressComponent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { SeatSelectionFactory } from "../../seatselection/SeatSelectionFactory";
import { ShippingFactory, ShippingType } from "../../../store/factories/shipping/ShippingFactory";
import { CheckboxAccordion } from "../../CheckboxAccordion";
import informationText from "../../../../locale/en/information.json";
import { PaymentMethods } from "../../payment/PaymentMethods";
import { Box } from "@mui/system";
import { NextAvailableFactory } from "../../../store/factories/nextAvailable/NextAvailableFactory";
import { STEP_URLS } from "../../../constants/Constants";
import { resetEvent, setEvent } from "../../../store/reducers/eventSelectionReducer";
import { storeOrderAndUser } from "../../../constants/util";
import { useSnackbar } from "notistack";
import { ConfirmDialog } from "./ConfirmDialog";
import { resetOrder, setOrderId } from "../../../store/reducers/orderReducer";
import { resetPayment, setPaymentStatus } from "../../../store/reducers/paymentReducer";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionProps } from "@mui/material/transitions";
import { v4 as uuid } from "uuid";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props}>{props.children}</Slide>;
});

interface props {
    open: boolean;
    events: Array<any>;
    eventDates: Array<any>;
    categories: Array<any>;
    onClose: () => unknown;
    onAdd: () => unknown;
    paymentFees: any;
    currency: string;
}

const AddOrderInner = ({open, events, eventDates, categories, onClose, onAdd, paymentFees, currency}: props) => {
    const selector = useAppSelector((state) => state);
    const [orderStored, setOrderStored] = useState(false);
    const dispatch = useAppDispatch();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (selector.payment.state !== "finished") return;
        setOrderStored(true)
    }, [selector.payment]);

    const storeOrder = async () => {
        try {
            const { userId, orderId } = await storeOrderAndUser(
                selector.order,
                selector.personalInformation,
                selector.selectedEvent.selectedEvent,
                selector.payment.payment.type,
                uuid()
            );
            dispatch(setUserId(userId));
            dispatch(setOrderId(orderId));
            dispatch(setPaymentStatus("initiate"));
        } catch (e) {
            enqueueSnackbar("Error: " + e.message, {variant: "error"})
        }
    };

    const handleCloseConfirmation = () => {
        setOrderStored(false);
        dispatch(resetEvent());
        dispatch(resetOrder());
        dispatch(resetPayment());
        dispatch(resetPersonalInformation());
        onAdd();
    }

    const canStore = STEP_URLS.every(value => NextAvailableFactory.getInstance(value, selector)?.isNextAvailable() ?? true);

    const event = eventDates.find(event => event.id === selector.selectedEvent.selectedEvent);

    return (
        <>
            <Dialog open={open} fullScreen onClose={onClose} TransitionComponent={Transition}>
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <Typography
                            sx={{ ml: 2, flex: 1 }}
                            variant="h6"
                            component="div"
                        >
                            Add Order
                        </Typography>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <Accordion>
                        <AccordionSummary>Seat Selection</AccordionSummary>
                        <AccordionDetails>
                            <Stack>
                                <EventSelection events={events} onChange={(id) => dispatch(setEvent(id))} />
                                {
                                    event && (
                                        <SeatSelectionFactory
                                            categories={categories[selector.selectedEvent.selectedEvent]}
                                            seatType={event.seatType}
                                            seatSelectionDefinition={event.seatMap?.definition}
                                            noWrap
                                            hideSummary
                                            currency={currency}
                                            noReservation
                                        />
                                    )
                                }
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>Personal Information</AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={1}>
                                <TextField
                                    label={"E-Mail"}
                                    type="email"
                                    value={selector.personalInformation.email}
                                    onChange={(event) =>
                                        dispatch(setEmail(event.target.value))
                                    }
                                    fullWidth
                                />
                                <AddressComponent
                                    value={selector.personalInformation.address}
                                    onChange={(newValue) =>
                                        dispatch(setAddress(newValue))
                                    }
                                />
                                {
                                    Object.values(ShippingType)
                                        .map((shippingType) => {
                                            const instance = ShippingFactory.getShippingInstance({type: shippingType, data: null});
                                            return (
                                                <CheckboxAccordion
                                                    label={informationText[instance.DisplayName]}
                                                    name={shippingType}
                                                    selectedItem={selector.personalInformation?.shipping?.type}
                                                    onSelect={method => {
                                                        dispatch(
                                                            setShipping({
                                                                type: method,
                                                                data: {}
                                                            })
                                                        )
                                                    }}
                                                    key={shippingType}
                                                >
                                                    {instance.Component}
                                                </CheckboxAccordion>
                                            )
                                        })
                                }
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>Payment Information</AccordionSummary>
                        <AccordionDetails>
                            <PaymentMethods
                                paymentMethods={["invoice"]}
                                paymentFees={paymentFees}
                            />
                        </AccordionDetails>
                    </Accordion>
                    <Box pt={2}>
                        <LoadingButton
                            fullWidth
                            onClick={storeOrder}
                            disabled={!canStore}
                            loading={
                                selector.payment.state === "processing" ||
                                selector.payment.state === "persist" ||
                                selector.payment.state === "initiate"
                            }
                        >
                            Store Order
                        </LoadingButton>
                    </Box>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={orderStored}
                onConfirm={handleCloseConfirmation}
                onClose={handleCloseConfirmation}
                text={"Successfully stored order!"}
            />
        </>
    )
}

export const AddOrder = (props: props) => {
    return (
        <Provider store={store}>
            <AddOrderInner {...props} />
        </Provider>
    )
}
