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
import { SeatSelectionMap } from "../../seatmap/SeatSelectionMap";
import { SeatSelectionFree } from "../../SeatSelectionFree";
import { Provider } from "react-redux";
import { store } from "../../../store/store";
import { setAddress, setEmail } from "../../../store/reducers/personalInformationReducer";
import { AddressComponent } from "../../form/AddressComponent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

interface props {
    open: boolean;
    events: Array<any>;
    categories: Array<any>;
}

const AddOrderInner = ({open, events, categories}: props) => {
    const selector = useAppSelector((state) => state);
    const [event, setEvent] = useState(null);
    const dispatch = useAppDispatch();

    let seatSelection;
    let containerStyles: React.CSSProperties = {
        alignItems: "center",
        justifyContent: "center"
    };

    if (event) {
        switch (event?.seatType) {
            case "seatmap":
                seatSelection = (
                    <SeatSelectionMap
                        categories={categories}
                        seatSelectionDefinition={JSON.parse(event.seatMap.definition)}
                        hideSummary
                    />
                );
                containerStyles.width = "100%";
                break;
            case "free":
            default:
                seatSelection = <SeatSelectionFree categories={categories} />;
        }
    }

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
                                    seatSelection
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
