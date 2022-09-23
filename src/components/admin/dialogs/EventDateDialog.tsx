import {
    Accordion, AccordionDetails, AccordionSummary,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from "dayjs";
import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const EventDateEntry = ({date, onChange, onDelete, index}) => {

    const handleChange = (key, value) => {
        const newDate = Object.assign({}, date);
        newDate[key] = value;
        onChange(index, newDate);
    };

    return (
        <Accordion>
            <AccordionSummary>
                {date.title} ({dayjs(date.date).toDate().toLocaleString()})
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <Stack direction={"row"} spacing={2}>
                        <TextField
                            value={date.title}
                            label={"Title"}
                            onChange={(event) => handleChange("title", event.target.value === "" ? null : event.target.value)}
                        />
                        <DateTimePicker
                            label="Event Date"
                            value={dayjs(date.date)}
                            onChange={(newValue) => handleChange("date", newValue?.toISOString())}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </Stack>
                    <DateTimePicker
                        label="Ticket Sale Start Date (optional)"
                        value={date.ticketSaleStartDate ? dayjs(date.ticketSaleStartDate) : null}
                        onChange={(newValue) => handleChange("ticketSaleStartDate", newValue?.toISOString())}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <DateTimePicker
                        label="Ticket Sale End Date (optional)"
                        value={date.ticketSaleStartDate ? dayjs(date.ticketSaleEndDate) : null}
                        onChange={(newValue) => handleChange("ticketSaleEndDate", newValue?.toISOString())}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <Button onClick={() => onDelete(index)} color={"error"} fullWidth>
                        <DeleteIcon /> Delete
                    </Button>
                </Stack>
            </AccordionDetails>

        </Accordion>
    );
};

const AddEventDate = ({onAdd}) => {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState<dayjs.Dayjs>(null);
    const [ticketSaleStartDate, setTicketSaleStartDate] = useState<dayjs.Dayjs>(null);
    const [ticketSaleEndDate, setTicketSaleEndDate] = useState<dayjs.Dayjs>(null);

    const handleAdd = () => {
        onAdd({
            title: title === "" ? null : title,
            date: date?.toISOString(),
            ticketSaleStartDate: ticketSaleStartDate?.toISOString(),
            ticketSaleEndDate: ticketSaleEndDate?.toISOString()
        });
        setTitle("");
        setDate(null);
        setTicketSaleStartDate(null);
        setTicketSaleEndDate(null);
    };

    return (
        <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
                <TextField
                    value={title}
                    label={"Title (optional)"}
                    onChange={(event) => setTitle(event.target.value)}
                    fullWidth
                />
                <DateTimePicker
                    label="Event Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    renderInput={(params) => <TextField fullWidth {...params} />}
                />
            </Stack>
            <DateTimePicker
                label="Ticket Sale Start Date (optional)"
                value={ticketSaleStartDate}
                onChange={(newValue) => setTicketSaleStartDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
            />
            <DateTimePicker
                label="Ticket Sale End Date (optional)"
                value={ticketSaleEndDate}
                onChange={(newValue) => setTicketSaleEndDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
            />
            <Button onClick={handleAdd}>
                Add
            </Button>
        </Stack>
    );
};

export const EventDateDialog = ({dates, onChange, open, onClose}) => {

    const handleChange = (index, newDate) => {
        const newDates = Object.assign([], dates);
        newDates[index] = newDate;
        onChange(newDates);
    }

    const handleDelete = (index) => {
        const newDates = Object.assign([], dates);
        newDates.splice(index, 1);
        onChange(newDates);
    }

    const handleAdd = (newDate) => {
        const newDates = Object.assign([], dates);
        newDates.push(newDate);
        onChange(newDates);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Event Dates
            </DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {
                        dates.map((date, index) => (
                            <EventDateEntry
                                onChange={handleChange}
                                onDelete={handleDelete}
                                date={date}
                                key={index}
                                index={index}
                            />
                        ))
                    }
                    <Divider sx={{mt: 2, mb: 2}} />
                    <AddEventDate onAdd={handleAdd} />
                </LocalizationProvider>
            </DialogContent>
        </Dialog>
    )
}
