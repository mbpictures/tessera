import {Step} from "../components/Step";
import React from "react";
import {
    Button,
    Card, Divider,
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
import {useAppSelector} from "../store/hooks";
import {FreeSeatOrder, selectOrder} from "../store/reducers/orderReducer";
import {selectNextStateAvailable} from "../store/reducers/nextStepAvailableReducer";
import {useRouter} from "next/router";
import {PaymentMethods} from "../components/payment/PaymentMethods";


export default function Payment({categories, direction}) {
    const nextEnabled = useAppSelector(selectNextStateAvailable);
    const order = useAppSelector(selectOrder) as FreeSeatOrder;
    const router = useRouter();

    const theme = useTheme();
    const containerStyling: React.CSSProperties = useMediaQuery(theme.breakpoints.up("md")) ? {flexWrap: "nowrap"} : {flexDirection: "column-reverse", overflowY: "auto", flexWrap: "nowrap"};

    const openSeatSelectionPage = () => {
        router.push("/seatselection");
    };

    return (
        <Step direction={direction} style={{width: "100%", maxHeight: "100%"}}>
            <Grid container spacing={2} style={{ ...containerStyling, maxHeight: "100%"}}>
                <Grid item md={12} lg={8} style={{maxHeight: "100%"}}>
                    <Box style={{maxHeight: "100%", overflowY: "auto", padding: "2px 10px"}}>
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
                                                secondary={<span>{order.price} &#8364;</span>}
                                                primary={`${order.amount}x: ${categories.find(cat => cat.id == order.categoryId).name}`}
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
                        <Button variant="outlined" style={{width: "100%"}} disabled={!nextEnabled}>Pay now</Button>
                    </Card>
                </Grid>
            </Grid>
        </Step>
    );
}

export async function getStaticProps() {
    return {
        props: {
            disableOverflow: true,
            noNext: true,
            categories: [
                {
                    id: 1,
                    name: "Premium",
                    price: 60.99
                },
                {
                    id: 2,
                    name: "Economy",
                    price: 30.99
                }
            ]
        }
    }
}
