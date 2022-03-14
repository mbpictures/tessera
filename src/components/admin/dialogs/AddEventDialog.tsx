import { useState } from "react";
import { useSnackbar } from "notistack";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import axios from "axios";
import { SaveButton } from "../SaveButton";

export const AddEventDialog = ({ open, onClose, onChange }) => {
    const [name, setName] = useState("");
    const [seatType, setSeatType] = useState("free");
    const { enqueueSnackbar } = useSnackbar();

    const handleClose = () => {
        setName("");
        onClose();
    };

    const handleAdd = async () => {
        try {
            await axios.post("/api/admin/events", {
                title: name,
                seatType: seatType
            });
            onChange();
            handleClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogContent>
                    <Stack pt={1} pb={1} spacing={1}>
                        <TextField
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            label={"Name"}
                        />
                        <Select
                            value={seatType}
                            onChange={(event) =>
                                setSeatType(event.target.value)
                            }
                        >
                            <MenuItem value={"free"}>Free</MenuItem>
                            <MenuItem value={"seatmap"}>Seat map</MenuItem>
                        </Select>
                        <SaveButton action={handleAdd}>Add Event</SaveButton>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};
