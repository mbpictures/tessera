import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

export const ChangePasswordDialog = ({ open, user, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!open) return;
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    }, [open]);

    const canChange =
        confirmNewPassword === newPassword &&
        newPassword.length > 6 &&
        currentPassword.length > 6;

    const changePassword = async () => {
        if (!canChange) return;
        try {
            await axios.put("/api/admin/user/" + user.id, {
                username: user.username,
                email: user.email,
                password: newPassword,
                oldPassword: currentPassword
            });
            onClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response?.data ?? e.message), {
                variant: "error"
            });
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
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            label={"Current Password"}
                            type={"password"}
                            id={"change-password-current"}
                        />
                        <TextField
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            label={"New Password"}
                            type={"password"}
                            id={"change-password-new"}
                        />
                        <TextField
                            value={confirmNewPassword}
                            onChange={(event) =>
                                setConfirmNewPassword(event.target.value)
                            }
                            label={"Confirm New Password"}
                            type={"password"}
                            id={"change-password-new-confirm"}
                        />
                        <Button
                            onClick={changePassword}
                            disabled={!canChange}
                            id={"change-password-button"}
                        >
                            Change Password
                        </Button>
                        {!canChange && (
                            <Typography color={"error"}>
                                Passwords need to match and have to be minimum
                                of 7 characters long!
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};
