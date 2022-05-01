import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack
} from "@mui/material";
import { useEffect, useState } from "react";
import { CategorySelection } from "../CategorySelection";
import { NotificationHandler, Notifications } from "../../../lib/notifications/NotificationTypes";
import axios from "axios";
import { useSnackbar } from "notistack";

const encodeServices = (services) => {
    const encodedServices = Object.keys(Notifications).reduce((obj, val) => {
        if (val in obj) return obj;
        obj[val] = [];
        return obj;
    }, {});
    for (let service of services) {
        encodedServices[service[0]].push(service[1]);
    }
    return encodedServices;
};

const decodeServices = (services) => {
    return Object.entries(services).map((val: [string, Array<string>]) => val[1].map(a => [val[0], a])).flat(1);
};

export const ManageNotificationDialog = ({open, notification, onClose, onChange}) => {
    const [type, setType] = useState("");
    const [currentServices, setCurrentServices] = useState(Object.keys(Notifications).reduce((obj, val) => {
        if (val in obj) return obj;
        obj[val] = [];
        return obj;
    }, {}));
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!notification) return;
        const services = JSON.parse(notification?.data).services;
        setCurrentServices(encodeServices(services));
        setType(notification?.type);
    }, [notification]);

    const handleSave = async () => {
        try {
            const data = {type, data: {services: decodeServices(currentServices)}};
            if (notification)
                await axios.put("/api/admin/notifications/" + notification.id, data);
            else
                await axios.post("/api/admin/notifications", data);

            onChange();
            onClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{notification ? "Edit" : "Add"} Notification</DialogTitle>
            <DialogContent>
                <Stack spacing={2} pt={2} pb={2}>
                    <FormControl fullWidth>
                        <InputLabel id={"notification-dialog-type-label"}>Notification Type</InputLabel>
                        <Select
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                            labelId={"notification-dialog-type-label"}
                            label={"Notification Type"}
                        >
                            {
                                Object.entries(NotificationHandler).map((entry, index) => {
                                    return (
                                        <MenuItem key={index} value={entry[1]}>{entry[0]}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                    <CategorySelection onChange={setCurrentServices} currentValues={currentServices} selectionValues={Notifications} />
                    <Button color={"primary"} onClick={handleSave} disabled={!Object.values(currentServices).some((val: Array<string>) => val.length > 0)}>Save</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
};
