import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { ConfirmDialog } from "./ConfirmDialog";
import { useSnackbar } from "notistack";
import { SelectionList } from "../SelectionList";
import { PermissionSection } from "../../../constants/interfaces";
import { arrayEquals } from "../../../constants/util";

export const UserDetailsDialog = ({ user, onClose, onDelete, onChange }) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [readRights, setReadRights] = useState([]);
    const [writeRights, setWriteRights] = useState([]);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!user) return;
        setEmail(user.email);
        setUserName(user.userName);
        setReadRights(user.readRights);
        setWriteRights(user.writeRights);
    }, [user]);

    const handleCloseDeleteUser = () => {
        setDeleteOpen(false);
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete("/api/admin/user/" + user.id);
            handleCloseDeleteUser();
            onClose();
            onDelete();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.reponse.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const handleSave = async () => {
        try {
            await axios.put("/api/admin/user/" + user.id, {
                username: userName,
                email: email,
                writeRights: writeRights,
                readRights: readRights
            });
            onClose();
            onChange();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    if (user === null) return null;
    const hasChanges = email !== user.email || userName !== user.userName || !arrayEquals(user.writeRights, writeRights) || !arrayEquals(user.readRights, readRights);

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth>
                <DialogTitle>
                    {user.userName}
                    <IconButton
                        style={{ position: "absolute", top: 8, right: 8 }}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} p={2}>
                        <TextField
                            value={userName}
                            label={"Username"}
                            onChange={(event) =>
                                setUserName(event.target.value)
                            }
                        />
                        <TextField
                            value={email}
                            label={"E-Mail"}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                        <Stack direction={"row"} spacing={1} maxHeight={300} overflow={"auto"}>
                            <SelectionList
                                options={Object.values(PermissionSection).filter(x => x !== "none").map(permission => {
                                    return {
                                        value: permission,
                                        primaryLabel: permission.replace(/([A-Z])/g, ' $1')
                                    };
                                })}
                                selection={readRights}
                                onChange={(newValue) => setReadRights(newValue)}
                                header={"Read Rights"}
                                style={{
                                    flexGrow: 1,
                                    overflow: "visible",
                                    height: "fit-content"
                                }}
                            />
                            <SelectionList
                                options={Object.values(PermissionSection).filter(x => x !== "none").map(permission => {
                                    return {
                                        value: permission,
                                        primaryLabel: permission.replace(/([A-Z])/g, ' $1')
                                    };
                                })}
                                selection={writeRights}
                                onChange={(newValue) => setWriteRights(newValue)}
                                header={"Write Rights"}
                                style={{
                                    flexGrow: 1,
                                    overflow: "visible",
                                    height: "fit-content"
                                }}
                            />
                        </Stack>
                        <Stack direction={"row"}>
                            <Button
                                color={"success"}
                                disabled={!hasChanges}
                                fullWidth
                                onClick={handleSave}
                                id={"edit-user-save"}
                            >
                                Save Changes
                            </Button>
                            <Button
                                color={"error"}
                                fullWidth
                                onClick={() => setDeleteOpen(true)}
                                id={"edit-user-delete"}
                            >
                                Delete User
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                text={`Confirm delete of user <b>${user.userName}</b>`}
                open={deleteOpen}
                onClose={handleCloseDeleteUser}
                onConfirm={handleDeleteUser}
            />
        </>
    );
};
