import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

export const ConfirmDialog = ({ text, open, onConfirm, onClose }) => {
    return (
        <Dialog open={open}>
            <DialogTitle dangerouslySetInnerHTML={{ __html: text }} />
            <DialogActions>
                <Button onClick={onConfirm}>Confirm</Button>
                <Button color={"error"} onClick={onClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};
