import {
    Accordion, AccordionDetails, AccordionSummary,
    Button, ButtonGroup,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography
} from "@mui/material";
import React, { useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useSnackbar } from "notistack";
import { ShippingFactory } from "../../store/factories/shipping/ShippingFactory";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { hasPayed, hasShipped } from "../../constants/orderValidation";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

const JsonViewer = ({ paymentResult, paymentIntent }) => {
    if (typeof window === "undefined") return null;

    return (
        <ReactJson
            src={{ paymentResult, paymentIntent }}
            name={"details"}
            collapsed
        />
    );
};

export const hasPayedIcon = (order) => {
    return hasPayed(order) ? (
        <CheckIcon color={"success"} />
    ) : (
        <CloseIcon color={"error"} />
    );
};

export const OrderPaymentInformationDetails = ({order, onMarkAsPayed}) => {

    const {enqueueSnackbar} = useSnackbar();

    const handleMarkAsPayed = async () => {
        try {
            await axios.put("/api/admin/order/paid", { orderId: order.id });
            enqueueSnackbar("Marked as pay", { variant: "success" });
            onMarkAsPayed();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    return (
        <>
            <Typography>
                Payment Type: {order.paymentType}
                <br />
                Payed: {hasPayedIcon(order)}
                <br />
            </Typography>
            {order.paymentType === "invoice" &&
                !hasPayed(order) && (
                    <Button onClick={handleMarkAsPayed}>
                        Mark as payed
                    </Button>
                )}
            <Divider />
            <Typography>
                Detailed information (in case of payment errors
                for example)
            </Typography>
            <JsonViewer
                paymentIntent={JSON.parse(order.paymentIntent)}
                paymentResult={JSON.parse(order.paymentResult)}
            />
        </>
    )
}

export const OrderDeliveryInformationDetails = ({order, onMarkAsShipped, categories}) => {
    const {enqueueSnackbar} = useSnackbar();

    const handleMarkAsShipped = async () => {
        try {
            await axios.put("/api/admin/order/shipped", { orderId: order.id });
            enqueueSnackbar("Marked as shipped", { variant: "success" });
            onMarkAsShipped();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const getShippingAddress = () => {
        const shipping = JSON.parse(order.shipping);
        if (shipping.data === "mock" || shipping.data === null || !shipping.data.differentAddress) return order.user;
        return shipping.data.address;
    };

    const address = getShippingAddress();
    return (
        <Stack>
            <Typography>
                Delivery Type:{" "}
                {
                    ShippingFactory.getShippingInstance(
                        JSON.parse(order.shipping)
                    )?.DisplayName
                }
            </Typography>
            <Typography variant={"h6"}>Address</Typography>
            <Typography>
                {address.firstName} {address.lastName}<br />
                {address.address}<br/>
                {address.zip} {address.city}<br />
                {address.countryCode}-{address.regionCode}
            </Typography>
            <Divider sx={{mt: 2, mb: 2}} />
            <TicketList order={order} categories={categories} />
            {!hasShipped(order) && (
                <Button onClick={handleMarkAsShipped}>
                    Mark as shipped
                </Button>
            )}
            <Divider />
            <Typography>
                Detailed information
            </Typography>
            <ReactJson
                src={JSON.parse(order.shipping)}
                collapsed
            />
        </Stack>
    )
}

const TicketList = ({order, categories}) => {
    const {enqueueSnackbar} = useSnackbar();
    const [tickets, setTickets] = useState(order.tickets);

    const download = async (ticketId, fileType) => {
        const response = await axios.put("/api/admin/ticket/" + ticketId + "?type=" + fileType);
        const blob = await (await fetch(response.data)).blob()
        window.open(URL.createObjectURL(blob));
    }

    const generateTicket = async (ticket) => {
        if (ticketAvailable(ticket)) return;
        try {
            await axios.put("/api/admin/ticket/" + ticket.id);
            const copyTickets = Object.assign([], tickets);
            copyTickets.find(a => a.id === ticket.id).secretGenerated = true;
            setTickets(copyTickets);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    }

    const ticketAvailable = (ticket) => {
        return (ticket.secret !== null && ticket.secret !== "" && ticket.secret !== undefined) || ticket.secretGenerated;
    }

    const downloadAll = async (fileType) => {
        for (const ticket of tickets) {
            await download(ticket.id, fileType);
        }
    }

    return (
        <Accordion>
            <AccordionSummary>Tickets</AccordionSummary>
            <AccordionDetails>
                <List>
                    {
                        tickets.map((item, index) => {
                            const category = categories.find(category => category.id === item.categoryId)
                            return (
                                <ListItem key={index}>
                                    <ListItemText primary={category.label} secondary={item.seatId && ("Seat: " + item.seatId)} />
                                    <Typography>{item.firstName ?? order.user.firstName} {item.lastName ?? order.user.lastName}</Typography>
                                    {
                                        ticketAvailable(item) ? (
                                            <>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="download qr"
                                                    title="Download QR-Code only"
                                                    color={"primary"}
                                                    onClick={async () => await download(item.id, "qr")}
                                                >
                                                    <QrCode2Icon />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="generate ticket"
                                                    title="Download PDF Ticket"
                                                    color={"primary"}
                                                    onClick={async () => await download(item.id, "pdf")}
                                                >
                                                    <PictureAsPdfIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <IconButton
                                                edge="end"
                                                aria-label="generate ticket"
                                                color={"primary"}
                                                title={"Generate Ticket"}
                                                onClick={async () => await generateTicket(item)}
                                            >
                                                <BookOnlineIcon />
                                            </IconButton>
                                        )
                                    }
                                </ListItem>
                            )
                        })
                    }
                </List>
                <ButtonGroup fullWidth>
                    <Button onClick={async () => await downloadAll("qr")}>
                        Download All <QrCode2Icon />
                    </Button>
                    <Button onClick={async () => await downloadAll("pdf")}>
                        Download All <PictureAsPdfIcon />
                    </Button>
                </ButtonGroup>
                <Typography variant={"caption"}>
                    Make sure to allow the opening of new popups/tabs in your browser
                </Typography>
            </AccordionDetails>
        </Accordion>
    )
}

