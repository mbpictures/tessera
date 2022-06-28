import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack, TextField
} from "@mui/material";
import { EventSelection } from "../../EventSelection/EventSelection";
import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "../../../store/store";
import { setAddress, setEmail } from "../../../store/reducers/personalInformationReducer";
import { AddressComponent } from "../../form/AddressComponent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { SeatSelectionFactory } from "../../seatselection/SeatSelectionFactory";

interface props {
    open: boolean;
    events: Array<any>;
    categories: Array<any>;
}

const AddOrderInner = ({open, events, categories}: props) => {
    const selector = useAppSelector((state) => state);
    const [event, setEvent] = useState(null);
    const dispatch = useAppDispatch();

    return (
        <Dialog open={open} fullWidth>
            <DialogTitle>Add Order</DialogTitle>
            <DialogContent>
                <Accordion>
                    <AccordionSummary>Seat Selection</AccordionSummary>
                    <AccordionDetails>
                        <Stack>
                            <EventSelection events={events} onChange={(id) => setEvent(events.find(event => event.id === id))} />
                            {
                                event && (
                                    <SeatSelectionFactory
                                        categories={categories}
                                        seatType={event.seatType}
                                        seatSelectionDefinition={event.seatMap ? JSON.parse(event.seatMap?.definition) : null}
                                        noWrap
                                        hideSummary
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
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary>Payment Information</AccordionSummary>
                    <AccordionDetails>

                    </AccordionDetails>
                </Accordion>
            </DialogContent>
        </Dialog>
    )
}

export const AddOrder = (props: props) => {
    return (
        <Provider store={store}>
            <AddOrderInner {...props} />
        </Provider>
    )
}
