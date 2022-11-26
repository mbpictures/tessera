import {
    Accordion, AccordionDetails, AccordionSummary,
    Button, Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider, FormControlLabel,
    Stack,
    TextField
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";

const CustomFieldEntry = ({customField, onChange, onDelete, index}) => {

    const handleChange = (key, value) => {
        const newField = Object.assign({}, customField);
        newField[key] = value;
        onChange(index, newField);
    };

    return (
        <Accordion>
            <AccordionSummary>
                {customField.label}
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    <Stack direction={"row"} spacing={2}>
                        <TextField
                            value={customField.label}
                            label={"Label"}
                            onChange={(event) => handleChange("label", event.target.value)}
                            fullWidth
                        />
                        <TextField
                            value={customField.name}
                            label={"Name (unique for each event)"}
                            onChange={(event) => handleChange("name", event.target.value.toLowerCase().trim())}
                            fullWidth
                            helperText={"Only lowercase, no whitespaces"}
                        />
                    </Stack>
                    <FormControlLabel
                        control={<Checkbox
                            checked={customField.isRequired}
                            onChange={(event) => handleChange("isRequired", event.target.checked)}
                        />}
                        label="Is Required"
                    />
                    <Button onClick={() => onDelete(index)} color={"error"} fullWidth>
                        <DeleteIcon /> Delete
                    </Button>
                </Stack>
            </AccordionDetails>

        </Accordion>
    );
};

const AddCustomField = ({onAdd}) => {
    const [label, setLabel] = useState("");
    const [name, setName] = useState("");
    const [isRequired, setIsRequired] = useState(false);

    const handleAdd = () => {
        onAdd({
            label,
            name,
            isRequired
        });
        setLabel("");
        setName("");
        setIsRequired(false);
    };

    return (
        <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
                <TextField
                    value={label}
                    label={"Label"}
                    onChange={(event) => setLabel(event.target.value)}
                    fullWidth
                />
                <TextField
                    value={name}
                    label={"Name (unique for each event)"}
                    onChange={(event) => setName(event.target.value.toLowerCase().trim())}
                    fullWidth
                    helperText={"Only lowercase, no whitespaces"}
                />
            </Stack>
            <FormControlLabel
                control={<Checkbox
                    checked={isRequired}
                    onChange={(event) => setIsRequired(event.target.checked)}
                />}
                label="Is Required"
            />
            <Button onClick={handleAdd}>
                Add
            </Button>
        </Stack>
    );
};

export const EventCustomFieldsDialog = ({customFields, onChange, open, onClose}) => {

    const handleChange = (index, newField) => {
        const newFields = Object.assign([], customFields);
        newFields[index] = newField;
        onChange(newFields);
    }

    const handleDelete = (index) => {
        const newFields = Object.assign([], customFields);
        newFields.splice(index, 1);
        onChange(newFields);
    }

    const handleAdd = (newField) => {
        const newFields = Object.assign([], customFields);
        newFields.push(newField);
        onChange(newFields);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Custom Fields
            </DialogTitle>
            <DialogContent>
                {
                    customFields.map((field, index) => (
                        <CustomFieldEntry
                            onChange={handleChange}
                            onDelete={handleDelete}
                            customField={field}
                            key={index}
                            index={index}
                        />
                    ))
                }
                <Divider sx={{mt: 2, mb: 2}} />
                <p>
                    Custom fields are additional input fields customer can/must fill out in the personal information step of a order.
                </p>
                <AddCustomField onAdd={handleAdd} />
            </DialogContent>
        </Dialog>
    )
}
