import {Step} from "../components/Step";
import React, {useEffect} from "react";
import {
    Button,
    Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Typography, useMediaQuery,
} from "@mui/material";
import {Box, useTheme} from "@mui/system";
import {Edit} from "@mui/icons-material";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {FreeSeatOrder, selectOrder, setOrderId} from "../store/reducers/orderReducer";
import {selectNextStateAvailable} from "../store/reducers/nextStepAvailableReducer";
import {useRouter} from "next/router";
import {PaymentMethods} from "../components/payment/PaymentMethods";
import {selectPayment, setPaymentStatus} from "../store/reducers/paymentReducer";
import {LoadingButton} from "@mui/lab";
import PaymentIcon from '@mui/icons-material/Payment';
import prisma from "../lib/prisma";
import {storeOrderAndUser} from "../constants/util";
import {selectEventSelected} from "../store/reducers/eventSelectionReducer";
import {selectPersonalInformation, setUserId} from "../store/reducers/personalInformationReducer";


export default function Payment({categories, direction}) {
    const nextEnabled = useAppSelector(selectNextStateAvailable);
    const selectedEvent = useAppSelector(selectEventSelected);
    const userInformation = useAppSelector(selectPersonalInformation);
    const order = useAppSelector(selectOrder) as FreeSeatOrder;
    const payment = useAppSelector(selectPayment);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const theme = useTheme();
    const containerStyling: React.CSSProperties = useMediaQuery(theme.breakpoints.up("md")) ? {flexWrap: "nowrap"} : {flexDirection: "column-reverse", overflowY: "auto", flexWrap: "nowrap"};

    useEffect(() => {
        if (payment.state !== "finished") return;
        router.push("/checkout")
    }, [payment]);

    const openSeatSelectionPage = () => {
        router.push("/seatselection");
    };

    const onPay = async () => {
        const {userId, orderId} = await storeOrderAndUser(order, userInformation, selectedEvent);
        dispatch(setUserId(userId));
        dispatch(setOrderId(orderId));
        dispatch(setPaymentStatus("initiate"));
    }

    return (
        <Step direction={direction} style={{width: "100%", maxHeight: "100%", flex: "1 1 auto", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <>
                <Dialog open={payment.state === "failure"}>
                    <DialogTitle>Payment failed!</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            An error occured while processing your payment. Please try again, choose a different payment method or contact us!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant={"outlined"} onClick={() => dispatch(setPaymentStatus("none"))}>Close</Button>
                    </DialogActions>
                </Dialog>
            </>
            <Grid container spacing={2} style={{ ...containerStyling, maxHeight: "100%"}}>
                <Grid item md={12} lg={8} style={{maxHeight: "100%", display: "flex", alignItems: "center"}}>
                    <Box style={{maxHeight: "100%", overflowY: "auto", padding: "2px 10px", width: "100%"}}>
                        <Card>
                            <PaymentMethods />
                        </Card>
                    </Box>
                </Grid>
                <Grid item md={12} lg={4} display="flex" alignItems="center" padding="2px 10px">
                    <Card style={{flex: "1 1 auto", padding: "10px"}}>
                        <List subheader={<ListSubheader><Typography variant="h5">Summary</Typography></ListSubheader>}>
                            {
                                order.orders?.map((order, index) => {
                                    return (
                                        <ListItem
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="edit" color={"primary"} onClick={openSeatSelectionPage}>
                                                    <Edit />
                                                </IconButton>
                                            }
                                            key={index}
                                        >
                                            <ListItemText
                                                secondary={<span>{categories.find(cat => cat.id == order.categoryId).price} &#8364;</span>}
                                                primary={`${order.amount}x: ${categories.find(cat => cat.id == order.categoryId).label}`}
                                            />
                                        </ListItem>
                                    )
                                })
                            }
                            <Divider />
                            <ListItem>
                                <ListItemText primary={<strong>Total:</strong>} secondary={<span>{order.totalPrice} &euro;</span>} />
                            </ListItem>
                        </List>
                        <LoadingButton
                            loadingPosition="start"
                            variant="outlined"
                            fullWidth
                            disabled={!nextEnabled}
                            onClick={onPay}
                            loading={payment.state === "processing"}
                            startIcon={<PaymentIcon />}
                        >
                            {payment.state === "processing" ? "Processing" : "Pay now"}
                        </LoadingButton>
                    </Card>
                </Grid>
            </Grid>
        </Step>
    );
}

export async function getStaticProps() {
    const categories = await prisma.category.findMany();

    return {
        props: {
            disableOverflow: true,
            noNext: true,
            categories: categories
        }
    }
}
