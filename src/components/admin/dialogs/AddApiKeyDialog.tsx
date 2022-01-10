import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle, IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";
import axios from "axios";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useSnackbar} from "notistack";

export const AddApiKeyDialog = ({open, onClose, onKeyGenerated}) => {
    const [name, setName] = useState("");
    const [token, setToken] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(token);
        enqueueSnackbar("Copied to clipboard!", {variant: "info"});
    };

    const handleClose = () => {
        if (token !== null) onKeyGenerated();
        setToken(null);
        setName("");
        onClose();
    };

    const generateApiKey = async () => {
        try {
            const response = await axios.post("/api/admin/user/apiKey", {name: name});
            setToken(response.data.token);
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response?.data ?? e.message), {variant: "error"});
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogContent>
                    <Stack pt={1} pb={1} spacing={1}>
                        {
                            token === null ? (
                                <>
                                    <TextField value={name} onChange={event => setName(event.target.value)} label={"Name"} />
                                    <Button onClick={generateApiKey}>Generate</Button>
                                </>
                            ) : (
                                <>
                                    <Typography>After clicking Close, the API Key will disappear and is not recoverable. So keep him save.</Typography>
                                    <Stack flexGrow={1} bgcolor={"gray"} borderRadius={1} p={1} color={"white"} textAlign={"center"} direction={"row"}>
                                        <Typography flexGrow={1} alignItems={"center"} display={"flex"} justifyContent={"center"}>{token}</Typography>
                                        <IconButton color={"info"} onClick={copyToClipboard}><ContentCopyIcon /></IconButton>
                                    </Stack>
                                    <Button onClick={handleClose}>Close</Button>
                                </>
                            )
                        }
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};
