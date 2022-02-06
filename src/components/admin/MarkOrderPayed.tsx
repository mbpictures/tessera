import { Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

export const MarkOrderPayed = ({onMarkAsPayed}: {onMarkAsPayed?: Function}) => {
    const [invoicePurpose, setInvoicePurpose] = useState("");
    const { enqueueSnackbar } = useSnackbar();

    const handleClick = async () => {
        try {
            await axios.put("/api/admin/order/paid", {
                invoicePurpose: invoicePurpose
            });
            enqueueSnackbar("Marked as payed: " + invoicePurpose, {
                variant: "success"
            });
            setInvoicePurpose("");

            if (onMarkAsPayed) onMarkAsPayed();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    return (
        <Grid container>
            <Grid item md={6} xs={12}>
                <TextField
                    label={"Invoice Purpose"}
                    value={invoicePurpose}
                    onChange={(event) => setInvoicePurpose(event.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item md={6} xs={12}>
                <Button onClick={handleClick} fullWidth style={{height: "100%"}}>Mark Orders as payed</Button>
            </Grid>
        </Grid>
    );
};
