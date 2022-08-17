import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle, FormControlLabel,
    Grid,
    Stack,
    TextField, Tooltip,
    Typography
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { validate as uuidValidate } from 'uuid';
import { hasPayed } from "../../../constants/util";
import { hasPayedIcon } from "../OrderInformationDetails";

export const MarkOrdersAsPayedDialog = ({open, onClose}) => {
    const [orderId, setOrderId] = useState("");
    const [autoMarkAsPaid, setAutoMarkAsPaid] = useState(false);
    const [order, setOrder] = useState(null);
    const {enqueueSnackbar} = useSnackbar();

    const getUrl = () => {
        const baseUrl = "/api/admin/order/paid?";
        if (uuidValidate(orderId)) {
            return baseUrl + "orderId=" + orderId
        }
        return baseUrl + "invoicePurpose=" + orderId;
    };

    const handleMarkAsPaid = async () => {
        try {
            await axios.put(getUrl());
            enqueueSnackbar("Successfully marked as paid", {
                variant: "success"
            });
            setOrder(null);
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response?.message ?? e.message), {
                variant: "error"
            });
        }
    };

    const handleAccept = async () => {
        if (autoMarkAsPaid) return await handleMarkAsPaid();

        try {
            const response = await axios.get(getUrl());
            setOrder(response.data[0]);
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response?.message ?? e.message), {
                variant: "error"
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle align={"center"}>
                Mark orders as paid!
            </DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid item xs={12} md={autoMarkAsPaid ? 12 : 6} p={1}>
                        <Stack spacing={2}>
                            <Typography>Please enter the purpose of the received bank transfer or the order id below</Typography>
                            <TextField
                                label={"Order ID/Invoice Purpose"}
                                value={orderId}
                                onChange={(event) => setOrderId(event.target.value)}
                            />
                            <Button onClick={handleAccept}>
                                {autoMarkAsPaid ? "Mark as paid" : "Search"}
                            </Button>
                            <Tooltip title={"Activate this checkbox, to automatically mark the provided order as paid, instead of searching first."}>
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={autoMarkAsPaid}
                                        onChange={(event) => setAutoMarkAsPaid(event.target.checked)}
                                    />}
                                    label="Auto mark orders as paid"
                                />
                            </Tooltip>
                        </Stack>
                    </Grid>
                    {
                        !autoMarkAsPaid && (
                            <Grid item xs={12} md={6} p={1}>
                                {
                                    order ? (
                                        <Stack>
                                            <OrderDisplay order={order} />
                                            {
                                                hasPayed(order) ? (
                                                    <Typography>{hasPayedIcon(order)} This order is already paid</Typography>
                                                ) : (
                                                    <Button onClick={handleMarkAsPaid}>
                                                        Mark as paid
                                                    </Button>
                                                )
                                            }
                                        </Stack>
                                    ) : <Typography>No order found</Typography>
                                }
                            </Grid>
                        )
                    }
                </Grid>
            </DialogContent>
        </Dialog>
    )
};

const OrderDisplay = ({order}) => {
    return (
        <Stack>
            <Typography>OrderID: {order.id}</Typography>
            <Typography>TicketAmount: {JSON.parse(order.order)["ticketAmount"]}</Typography>
            <Typography>Total Price: {JSON.parse(order.order)["totalPrice"]}</Typography>
            <Typography>Date: {new Date(order.date).toLocaleString()}</Typography>
        </Stack>
    )
};
