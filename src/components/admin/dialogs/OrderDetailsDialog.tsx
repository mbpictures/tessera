import {
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
import React, { useState } from "react";
import { OrderDeliveryInformationDetails, OrderPaymentInformationDetails } from "../OrderInformationDetails";

export const OrderDetailsDialog = ({
    order,
    onClose,
    onMarkAsPayed,
    onMarkAsShipped
}) => {
    const [detailsTab, setDetailsTab] = useState("overview");

    if (order === null) return null;

    const handleDetailsTabChange = (event, newValue) => {
        setDetailsTab(newValue);
    };

    const handleClose = () => {
        setDetailsTab("overview");
        if (onClose) onClose();
    };

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
                                    Event: {order.event.title}
                                    <br />
                                    OrderID: {order.id}
                                    <br />
                                    Date: {new Date(order.date).toLocaleString()}
                                </Typography>
                                <Divider />
                                <Typography>
                                    {order.user.firstName} {order.user.lastName}
                                    <br />
                                    {order.user.email}
                                    <br />
                                    {order.user.address}
                                    <br />
                                    {order.user.zip} {order.user.city}
                                    <br />
                                    {order.user.countryCode}{" "}
                                    {order.user.regionCode}
                                </Typography>
                            </Stack>
                        </DialogContentText>
                    </TabPanel>
                    <TabPanel value={"payment"}>
                        <Stack spacing={1}>
                            <OrderPaymentInformationDetails
                                order={order}
                                onMarkAsPayed={onMarkAsPayed}
                            />
                        </Stack>
                    </TabPanel>
                    <TabPanel value={"delivery"}>
                        <Stack spacing={1}>
                            <OrderDeliveryInformationDetails
                                order={order}
                                onMarkAsShipped={onMarkAsShipped}
                            />
                        </Stack>
                    </TabPanel>
                </TabContext>
            </DialogContent>
        </Dialog>
    );
};
