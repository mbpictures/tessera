import {Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, Switch, Typography} from "@mui/material";
import {RootStyle} from "../../components/admin/layout";
import { QrReader } from 'react-qr-reader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import {useRouter} from "next/router";
import {Box} from "@mui/system";
import {useSnackbar} from "notistack";
import {useRef, useState} from "react";

export default function TicketScan({permissionDenied}){
    const router = useRouter();
    const {enqueueSnackbar} = useSnackbar();
    const isError = useRef<boolean>(false);
    const [autoSend, setAutoSend] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    const onBack = () => {
        router.back();
    };

    const onScan = (result, error) => {
        isError.current = error;
        if (error) return;

        console.log(result);
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
                    <FormControlLabel
                        control={
                            <Switch
                                value={autoSend}
                                onChange={(event) => setAutoSend(event.target.checked)}
                            />
                        }
                        label="Auto. Send Tickets"
                    />
                </DialogContent>
            </Dialog>
            <Box style={{width: "100%", height: "100%", overflow: "hidden"}}>
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
            <IconButton
                onClick={onBack}
                style={{position: "absolute", top: 0, left: 0}}
            >
                <ArrowBackIcon />
            </IconButton>
            <IconButton
                onClick={() => setSettingsOpen(true)}
                style={{position: "absolute", top: 0, right: 0}}
            >
                <SettingsIcon />
            </IconButton>

            <QrReader
                constraints={{facingMode: "environment"}}
                videoId={"video"}
                onResult={onScan}
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
                <Typography align={"center"}>Please center the QR-Code of the ticket in the cameras viewport</Typography>
            </Box>
        </RootStyle>
    );
}