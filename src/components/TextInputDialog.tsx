import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";

export const TextInputDialog = ({ open, onTextInput, onClose, title, placeholder }) => {
    const [value, setValue] = useState("");

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    placeholder={placeholder}
                    multiline
                    style={{width: "100%"}}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    id={"text-input-dialog-input"}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onTextInput(value);
                        onClose();
                    }}
                    id={"text-input-dialog-continue"}
                >
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
    )
}
