import {
    Alert,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Snackbar,
    Stack,
    TextField
} from "@mui/material";
import {useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import {ConfirmDialog} from "./ConfirmDialog";

export const UserDetailsDialog = ({user, onClose, onDelete, onChange}) => {
    if (user === null) return null;
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [error, setError] = useState(false);
    const [email, setEmail] = useState(user.email);
    const [userName, setUserName] = useState(user.userName);

    const handleCloseDeleteUser = () => {
        setDeleteOpen(false);
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete("/api/admin/user", {data: {id: user.id}});
            handleCloseDeleteUser();
            onClose();
            onDelete();
        } catch (e) {
            setError(true);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put("/api/admin/user", {id: user.id, username: userName, email: email});
            onClose();
            onChange();
        } catch (e) {
            setError(true);
        }
    };

    const hasChanges = email !== user.email || userName !== user.userName;

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth>
                <DialogTitle>
                    {user.userName}
                    <IconButton style={{position: "absolute", top: 8, right: 8}} onClick={onClose}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} p={2}>
                        <TextField value={userName} label={"Username"} onChange={(event) => setUserName(event.target.value)} />
                        <TextField value={email} label={"E-Mail"} onChange={(event) => setEmail(event.target.value)} />
                        <Stack direction={"row"}>
                            <Button color={"success"} disabled={!hasChanges} fullWidth onClick={handleSave}>Save Changes</Button>
                            <Button color={"error"} fullWidth onClick={() => setDeleteOpen(true)}>Delete User</Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <ConfirmDialog text={`Confirm delete of user <b>${user.userName}</b>`} open={deleteOpen} onClose={handleCloseDeleteUser} onConfirm={handleDeleteUser} />
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert severity="error">Error occurred!</Alert>
            </Snackbar>
        </>
    );
}
