import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl,
    FormControlLabel,
    IconButton, InputLabel, MenuItem, Select, Stack,
    Switch,
    Typography
} from "@mui/material";
import {RootStyle} from "../../components/admin/layout";
import { QrReader } from 'react-qr-reader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import {useRouter} from "next/router";
import {Box} from "@mui/system";
import {useSnackbar} from "notistack";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import style from "../../style/TicketScan.module.scss";

export default function TicketScan({permissionDenied}){
    const router = useRouter();
    const {enqueueSnackbar} = useSnackbar();
    const isError = useRef<boolean>(false);
    const [autoSend, setAutoSend] = useState(true);
    const autoSendRef = useRef(autoSend);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [ticket, setTicket] = useState(null);
    const ticketId = useRef(null);
    const [deviceId, setDeviceId] = useState(null);
    const [devices, setDevices] = useState(null);

    useEffect(() => {
        if (!navigator.mediaDevices) return;
        navigator.mediaDevices.enumerateDevices().then((devices) => setDevices(devices));
    }, []);

    const onBack = () => {
        router.back();
    };

    const updateAutoSend = (value) => {
        autoSendRef.current = value;
        setAutoSend(value);
    };

    const closeTicketDetails = () => {
        ticketId.current = null;
        setTicket(null);
    }

    const accept = async () => {
        try {
            await axios.put("/api/admin/ticket/" + ticketId.current);
            enqueueSnackbar("Ticket accepted", {variant: "success"})
            setTimeout(() => {
                ticketId.current = null;
            }, 500);
        } catch (e) {
            if (e.response.status === 400) {
                enqueueSnackbar("Ticket already used", {variant: "info"});
                return;
            }
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {variant: "error"})
        }
    }

    const onScan = async (result, error) => {
        isError.current = error;
        if (error) return;
        if (ticketId.current) return;

        const text: string = result.getText();
        if (!text.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            ticketId.current = "N/A";
            setTimeout(() => {
                ticketId.current = null;
            }, 1000)
            enqueueSnackbar("Scanned QR-Code is no ticket", {variant: "info"});
            return;
        }

        ticketId.current = text;
        if (autoSendRef.current) {
            await accept();
            return;
        }

        try {
            const ticket = await axios.get("/api/admin/ticket/" + ticketId.current);
            setTicket(ticket);
        } catch (e) {
            enqueueSnackbar("Error loading ticket information. You can enable auto accept tickets in settings.", {variant: "error"})
        }
    };

    if (permissionDenied)
        return (
            <Typography>You don&apos;t have permission to access the Ticket Scan!</Typography>
        );

    return (
        <RootStyle>
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                    <Stack pt={2} pb={2} spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel id="options-devices-label">Device</InputLabel>
                            <Select fullWidth value={deviceId} onChange={(event) => setDeviceId(event.target.value)} label={"Device"} labelId={"options-devices-label"}>
                                {
                                    devices?.filter((device) => device.kind === "videoinput").map((device) => <MenuItem value={device.deviceId} key={device.deviceId}>{device.label ?? device.deviceId}</MenuItem>)
                                }
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoSend}
                                    onChange={(event) => updateAutoSend(event.target.checked)}
                                />
                            }
                            label="Auto. Send Tickets"
                        />
                    </Stack>
                </DialogContent>
            </Dialog>
            <Dialog open={ticket !== null}>
                <DialogTitle>Ticket</DialogTitle>
                <DialogContent>
                    {
                        ticket && (
                            <Stack>
                                <Typography>Ticket valid: {ticket.used ? <ClearIcon /> : <CheckIcon />}</Typography>
                                <Typography>Name: {ticket.order.user.firstName} {ticket.order.user.lastName}</Typography>
                                <Typography>Id: {ticket.id}</Typography>
                            </Stack>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button color={"error"} onClick={closeTicketDetails}>
                        Cancel
                    </Button>
                    <Button color={"success"} onClick={accept}>
                        Accept
                    </Button>
                </DialogActions>
            </Dialog>
            <Box style={{width: "100%", height: "100%", overflow: "hidden", position: "absolute"}}>
                <video id={"video"} style={{
                    minWidth: "100%",
                    minHeight: "100%",
                    transform: "translateX(-50%) translateY(-50%)",
                    height: "auto",
                    width: "auto",
                    top: "50%",
                    left: "50%",
                    position: "absolute"
                }} />
            </Box>
            <Box
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
            >
                <IconButton
                    onClick={onBack}
                >
                    <ArrowBackIcon />
                </IconButton>
                <IconButton
                    onClick={() => setSettingsOpen(true)}
                    color={"primary"}
                >
                    <SettingsIcon />
                </IconButton>
            </Box>
            <div id={style.qrMarker}><div /></div>
            <QrReader
                constraints={!deviceId ? {facingMode: "environment"} : {deviceId}}
                videoId={"video"}
                onResult={onScan}
                key={deviceId ?? "default"}
            />
            <Box
                sx={{
                    position: "absolute",
                    left: "5%",
                    bottom: 20,
                    width: "90%",
                    bgcolor: "rgba(128, 128, 128, 0.7)",
                    borderRadius: 1,
                    p: 1
                }}
            >
                <Typography align={"center"} color={"#fff"}>Please center the QR-Code of the ticket in the cameras viewport</Typography>
            </Box>
        </RootStyle>
    );
}
