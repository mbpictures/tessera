import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Stack,
    Tab,
    Typography
} from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import React, {useState} from "react";
import dynamic from "next/dynamic";
import {ShippingFactory} from "../../../store/factories/shipping/ShippingFactory";

const ReactJson = dynamic(
    () => import("react-json-view"),
    { ssr: false }
)

const JsonViewer = ({paymentResult, paymentIntent}) => {
    if (typeof window === "undefined")
        return null;

    return <ReactJson src={{paymentResult, paymentIntent}} name={"details"} collapsed />;
}

export const OrderDetailsDialog = ({order, onClose, hasPayedIcon, hasPayed}) => {
    const [detailsTab, setDetailsTab] = useState("overview");

    if (order === null) return null;

    const handleMarkAsPayed = () => {
        // TODO
    }

    const handleDetailsTabChange = (event, newValue) => {
        setDetailsTab(newValue);
    }

    const handleClose = () => {
        setDetailsTab("overview");
        if(onClose) onClose();
    }

    return (
        <Dialog open={true} onClose={handleClose} fullWidth>
            <DialogTitle>Order Details</DialogTitle>
            <DialogContent>
                <TabContext value={detailsTab}>
                    <TabList onChange={handleDetailsTabChange} centered>
                        <Tab value="overview" label="Overview" />
                        <Tab value="payment" label="Payment" />
                        <Tab value="delivery" label="Delivery" />
                    </TabList>
                    <TabPanel value={"overview"}>
                        <DialogContentText>
                            <Stack spacing={1}>
                                <Typography>
                                    Event: {order.event.title}<br />
                                    OrderID: {order.id}<br />
                                </Typography>
                                <Divider />
                                <Typography>
                                    {order.user.firstName} {order.user.lastName}<br />
                                    {order.user.email}<br />
                                    {order.user.address}<br />
                                    {order.user.zip} {order.user.city}<br />
                                    {order.user.countryCode} {order.user.regionCode}
                                </Typography>
                            </Stack>
                        </DialogContentText>
                    </TabPanel>
                    <TabPanel value={"payment"}>
                        <Stack spacing={1}>
                            <Typography>
                                Payment Type: {order.paymentType}<br />
                                Payed: {hasPayedIcon(order)}<br />
                            </Typography>
                            {
                                (order.paymentType === "invoice" && !hasPayed(order)) && (
                                    <Button onClick={handleMarkAsPayed}>Mark as payed</Button>
                                )
                            }
                            <Divider />
                            <Typography>Detailed information (in case of payment errors for example)</Typography>
                            <JsonViewer paymentIntent={JSON.parse(order.paymentIntent)} paymentResult={JSON.parse(order.paymentResult)} />
                        </Stack>
                    </TabPanel>
                    <TabPanel value={"delivery"}>
                        <Stack spacing={1}>
                            <Typography>
                                Delivery Type: {ShippingFactory.getShippingInstance(JSON.parse(order.shipping))?.DisplayName}
                            </Typography>
                            <Divider />
                            <Typography>Detailed information (in case of payment errors for example)</Typography>
                            <ReactJson src={JSON.parse(order.shipping)} collapsed />
                        </Stack>
                    </TabPanel>
                </TabContext>
            </DialogContent>
        </Dialog>
    );
};
