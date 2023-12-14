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
import React, { useState } from "react";
import { OrderDeliveryInformationDetails, OrderPaymentInformationDetails } from "../OrderInformationDetails";
import { getEventTitle } from "../../../constants/util";
import { ConfirmDialog } from "./ConfirmDialog";
import { useSnackbar } from "notistack";
import axios from "axios";

export const OrderDetailsDialog = ({
    order,
    onClose,
    onMarkAsPayed,
    onMarkAsShipped,
    onDelete,
    categories
}) => {
    const [detailsTab, setDetailsTab] = useState("overview");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    if (order === null) return null;

    const handleDetailsTabChange = (event, newValue) => {
        setDetailsTab(newValue);
    };

    const handleClose = () => {
        setDetailsTab("overview");
        if (onClose) onClose();
    };

    const handleDeleteOrder = async () => {
        try {
            await axios.delete("/api/admin/order/" + order.id);
            setDeleteOpen(false);
            onClose();
            onDelete();
        } catch (e) {
            enqueueSnackbar("Error deleting order: " + (e?.response?.data), {variant: "error"});
        }
    }

    return (
        <>
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
                                        Event: {getEventTitle(order.eventDate)}
                                        <br />
                                        Event Date: {new Date(order.eventDate.date).toLocaleString()}
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
                                        {order.user.regionCode}<br />
                                        <br />
                                        {
                                            order.user.customFields && Object.entries(JSON.parse(order.user.customFields)).map(field => `${field[0]}: ${field[1]}`)
                                        }
                                    </Typography>
                                    <Button color={"error"} onClick={() => setDeleteOpen(true)}>
                                        Delete
                                    </Button>
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
                                    categories={categories}
                                />
                            </Stack>
                        </TabPanel>
                    </TabContext>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteOrder}
                text={"Confirm delete this order?"}
            />
        </>
    );
};
