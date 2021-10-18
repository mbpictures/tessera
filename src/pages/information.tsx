import {Step} from "../components/Step";
import {
    Button,
    Card, Divider,
    Grid, IconButton,
    List,
    ListItem,
    ListItemText, ListSubheader,
    Stack,
    TextField,
    Typography, useMediaQuery
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {CheckboxAccordion} from "../components/CheckboxAccordion";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {
    selectPersonalInformation,
    setAddress,
    setEmail,
    setShipping,
} from "../store/reducers/personalInformationReducer";
import {disableNextStep, enableNextStep, selectNextStateAvailable} from "../store/reducers/nextStepAvailableReducer";
import {validateAddress} from "../constants/util";
import {ShippingFactory, ShippingType} from "../store/factories/shipping/ShippingFactory";
import {AddressComponent} from "../components/form/AddressComponent";
import {PostalDeliveryShippingComponent} from "../components/shipping/PostalDeliveryShippingComponent";
import {BoxOfficeShippingComponent} from "../components/shipping/BoxOfficeShippingComponent";
import {DownloadShippingComponent} from "../components/shipping/DownloadShippingComponent";
import {Box, useTheme} from "@mui/system";
import {FreeSeatOrder, selectOrder} from "../store/reducers/orderReducer";
import {Edit} from "@mui/icons-material";

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Information({categories, direction}) {
    const selector = useAppSelector(selectPersonalInformation);
    const order = useAppSelector(selectOrder) as FreeSeatOrder;
    const nextEnabled = useAppSelector(selectNextStateAvailable);
    const dispatch = useAppDispatch();

    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingType | null>(selector.shipping?.type ?? null);

    const theme = useTheme();
    const containerStyling: React.CSSProperties = useMediaQuery(theme.breakpoints.up("md")) ? {flexWrap: "nowrap"} : {flexDirection: "column-reverse", overflowY: "auto", flexWrap: "nowrap"};

    useEffect(() => {
        const valid = validateEmail(selector.email) &&
            validateAddress(selector.address) &&
            (ShippingFactory.getShippingInstance(selector.shipping)?.isValid() ?? false);

        if (valid)
            dispatch(enableNextStep());
        else
            dispatch(disableNextStep());
    }, [selector]);

    useEffect(() => {
        if (selectedShippingMethod === null) {
            dispatch(setShipping(null));
            return;
        }
        dispatch(setShipping({
            type: selectedShippingMethod,
            data: "mock"
        }));
    }, [selectedShippingMethod]);

    return (
        <Step direction={direction} style={{width: "100%", maxHeight: "100%"}}>
            <Grid container spacing={2} style={{ ...containerStyling, maxHeight: "100%"}}>
                <Grid item md={12} lg={8} style={{maxHeight: "100%"}}>
                    <Box style={{maxHeight: "100%", overflowY: "auto", padding: "2px 10px"}}>
                        <Card>
                            <Stack padding={1} spacing={1}>
                                <Typography>These address given will be used for invoice.</Typography>
                                <TextField label="E-Mail Address" type="email" value={selector.email} onChange={event => dispatch(setEmail(event.target.value))} />
                                <AddressComponent value={selector.address} onChange={newValue => dispatch(setAddress(newValue))} />
                            </Stack>
                        </Card>
                        <CheckboxAccordion
                            label={"Postal delivery"}
                            name={ShippingType.Post}
                            selectedItem={selectedShippingMethod}
                            onSelect={setSelectedShippingMethod}
                        >
                            <PostalDeliveryShippingComponent />
                        </CheckboxAccordion>
                        <CheckboxAccordion
                            label={"Download"}
                            name={ShippingType.Download}
                            selectedItem={selectedShippingMethod}
                            onSelect={setSelectedShippingMethod}
                        >
                            <DownloadShippingComponent />
                        </CheckboxAccordion>
                        <CheckboxAccordion
                            label={"Box-Office"}
                            name={ShippingType.BoxOffice}
                            selectedItem={selectedShippingMethod}
                            onSelect={setSelectedShippingMethod}
                        >
                            <BoxOfficeShippingComponent />
                        </CheckboxAccordion>
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
                                                <IconButton edge="end" aria-label="delete" color={"primary"}>
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
