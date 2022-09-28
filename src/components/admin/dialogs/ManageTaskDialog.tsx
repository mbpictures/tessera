import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Divider, IconButton, InputAdornment, List, ListItem, ListItemText, Step,
    StepLabel,
    Stepper, TextField,
    Typography
} from "@mui/material";
import { OrderDeliveryInformationDetails, OrderPaymentInformationDetails } from "../OrderInformationDetails";
import { useEffect, useState } from "react";
import { getTaskType } from "../../../constants/orderValidation";
import axios from "axios";
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SendIcon from '@mui/icons-material/Send';

const STEP_ORDER = ["Payment", "Shipping", null];

export const ManageTaskDialog = ({task, onClose, categories}) => {
    const [taskType, setTaskType] = useState<null | "shipping" | "payment">(null);
    const [notesOpen, setNotesOpen] = useState(false);

    const updateState = async () => {
        try {
            const response = await axios.get("/api/admin/task/" + task.id);
            setTaskType(response.status === 404 ? null : getTaskType(response.data));
        }
        catch (e) {
            if (e.response.status !== 404) return;
            setTaskType(null)
        }
    }

    useEffect(() => {
        if (!task) return;
        setTaskType(getTaskType(task));
    }, [task]);

    if (task === null) return null;

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth>
                <DialogTitle>
                    Manage Task
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={taskType === null ? 2 : STEP_ORDER.findIndex((val) => val?.toLowerCase() === taskType)}>
                        {
                            STEP_ORDER.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label ?? "Finished"}</StepLabel>
                                </Step>
                            ))
                        }
                    </Stepper>
                    <Divider sx={{mt: 2, mb: 2}} />
                    {
                        taskType === "payment" && (
                            <>
                                <Typography>This task has not been marked as paid!</Typography>
                                <OrderPaymentInformationDetails
                                    order={task.order}
                                    onMarkAsPayed={updateState}
                                />
                            </>
                        )
                    }
                    {
                        taskType === "shipping" && (
                            <>
                                <Typography>The tickets for this task need to be shipped!</Typography>
                                <OrderDeliveryInformationDetails
                                    order={task.order}
                                    onMarkAsShipped={updateState}
                                    categories={categories}
                                />
                            </>
                        )
                    }
                    {
                        !taskType && (
                            <>
                                <Typography>This task has been completed!</Typography>
                            </>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <IconButton color={"primary"} onClick={() => setNotesOpen(true)}>
                        <NoteAltIcon />
                    </IconButton>
                    <Button onClick={onClose} color={"secondary"}>Close</Button>
                </DialogActions>
            </Dialog>
            <NoteDialog task={task} onClose={() => setNotesOpen(false)} open={notesOpen} />
        </>
    );
};

const NoteDialog = ({task, onClose, open}) => {
    const [notes, setNotes] = useState([]);
    const [note, setNote] = useState("");

    useEffect(() => {
        setNotes(task?.notes ?? []);
        setNote("");
    }, [task]);

    const sendNote = async () => {
        const newNotes = Object.assign([], notes);
        newNotes.push(note);
        const response = await axios.put("/api/admin/task/" + task.id, {
            notes: newNotes
        });
        setNotes(response.data.notes);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Notes</DialogTitle>
            <DialogContent>
                {
                    notes.length === 0 ? (
                        <Typography>No notes available yet!</Typography>
                    ) : (
                        <List>
                            {
                                notes.map((note, index) => (
                                    <ListItem key={index}>
                                        <ListItemText>{(index + 1)}. {note}</ListItemText>
                                    </ListItem>
                                ))
                            }
                        </List>
                    )
                }
                <TextField
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={sendNote}
                                    edge="end"
                                    color="primary"
                                    title={"Send"}
                                >
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    fullWidth
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                />
            </DialogContent>
        </Dialog>
    )
};
