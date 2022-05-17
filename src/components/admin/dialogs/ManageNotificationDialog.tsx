import {
    Accordion, AccordionDetails, AccordionSummary,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack, Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { CategorySelection } from "../CategorySelection";
import {
    NotificationDataFields,
    NotificationHandler,
    Notifications
} from "../../../lib/notifications/NotificationTypes";
import axios from "axios";
import { useSnackbar } from "notistack";
import { GenericDataCollector } from "../../GenericDataCollector";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    const [data, setData] = useState({});
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!notification) return;
        const services = JSON.parse(notification?.data).services;
        setCurrentServices(encodeServices(services));
        setType(notification?.type);
        setData(JSON.parse(notification?.data).data);
    }, [notification]);

    const handleSave = async () => {
        try {
            const body = {type, data: {services: decodeServices(currentServices), data: data}};
            if (notification)
                await axios.put("/api/admin/notifications/" + notification.id, body);
            else
                await axios.post("/api/admin/notifications", body);

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
                            id={"notification-type"}
                        >
                            {
                                Object.entries(NotificationHandler).map((entry, index) => {
                                    return (
                                        <MenuItem key={index} value={entry[1]} id={"notification-type-" + entry[1]}>{entry[0]}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                    {
                        (type !== "" && NotificationDataFields[type] && Object.entries(NotificationDataFields[type]).length > 0) && (
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Typography id={"manage-notification-details"}>Details</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <GenericDataCollector
                                        currentData={data}
                                        data={NotificationDataFields[type]}
                                        onChange={(name, newValue) => {
                                            const newObject = Object.assign({}, data);
                                            newObject[name] = newValue;
                                            setData(newObject);
                                        }}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        )
                    }
                    <CategorySelection onChange={setCurrentServices} currentValues={currentServices} selectionValues={Notifications} />
                    <Button color={"primary"} id={"save-notification"} onClick={handleSave} disabled={!Object.values(currentServices).some((val: Array<string>) => val.length > 0)}>Save</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
};
