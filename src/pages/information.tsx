import {Step} from "../components/Step";
import {
    Card,
    Grid,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";
import {CheckboxAccordion} from "../components/CheckboxAccordion";
import {ZIP} from "../components/form/ZIP";

export default function Information({direction}) {
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>(null);

    return (
        <Step direction={direction} style={{width: "100%"}}>
            <Card >
                <Stack padding={1} spacing={1}>
                    <Typography>These address given will be used for invoice.</Typography>
                    <TextField label="Firstname" />
                    <TextField label="Lastname" />
                    <TextField label="E-Mail Address" type="email" />
                    <TextField label="Street" />
                    <Grid container>
                        <Grid item md={4} xs={12}>
                            <ZIP />
                        </Grid>
                        <Grid item md={8} xs={12}>
                            <TextField label="City" fullWidth />
                        </Grid>
                    </Grid>
                </Stack>
            </Card>
            <CheckboxAccordion
                label={"Postal delivery"}
                name={"post"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">The ticket will be sent to your home.</Typography>
            </CheckboxAccordion>
            <CheckboxAccordion
                label={"Download"}
                name={"download"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">The ticket will be sent to your email address.</Typography>
            </CheckboxAccordion>
            <CheckboxAccordion
                label={"Box-Office"}
                name={"boxoffice"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">You can pick up your ticket at the Box-Office</Typography>
            </CheckboxAccordion>
        </Step>
    );
}
