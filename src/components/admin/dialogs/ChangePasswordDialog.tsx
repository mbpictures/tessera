import {Alert, Button, Dialog, DialogContent, DialogTitle, Snackbar, Stack, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import axios from "axios";

export const ChangePasswordDialog = ({open, user, onClose}) => {
    const [error, setError] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useEffect(() => {
        if (!open) return;
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    }, [open]);

    const canChange = confirmNewPassword === newPassword && newPassword.length > 6 && currentPassword.length > 6;

    const changePassword = async () => {
        if (!canChange) return;
        try {
            await axios.put("/api/admin/user", {id: user.id, username: user.username, email: user.email, password: newPassword, oldPassword: currentPassword});
            onClose();
        } catch (e) {
            setError(e.response?.data ?? e.message);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} pt={1} pb={1}>
                        <TextField
                            value={currentPassword}
                            onChange={event => setCurrentPassword(event.target.value)}
                            label={"Current Password"}
                            type={"password"}
                        />
                        <TextField
                            value={newPassword}
                            onChange={event => setNewPassword(event.target.value)}
                            label={"New Password"}
                            type={"password"}
                        />
                        <TextField
                            value={confirmNewPassword}
                            onChange={event => setConfirmNewPassword(event.target.value)}
                            label={"Confirm New Password"}
                            type={"password"}
                        />
                        <Button onClick={changePassword} disabled={!canChange}>Change Password</Button>
                        {
                            !canChange && (
                                <Typography color={"error"}>Passwords need to much and have to be minimum 7 characters long!</Typography>
                            )
                        }
                    </Stack>
                </DialogContent>
            </Dialog>
            <Snackbar open={error !== null} autoHideDuration={6000} onClose={() => setError(null)}>
                <Alert severity="error">Error: {error}</Alert>
            </Snackbar>
        </>
    );
}
