import { TextField } from "@mui/material";

export const CustomFields = ({customFields, value, onChange}) => {

    const handleUpdate = (property, newValue) => {
        const newValues = Object.assign({}, value);
        newValues[property] = newValue;
        onChange(newValues);
    };

    if (!customFields) return null;

    return (
        <>
            {
                customFields.map((customField, index) => (
                    <TextField
                        key={index}
                        value={value[customField.name] ?? ""}
                        label={customField.label}
                        onChange={(event) =>
                            handleUpdate(customField.name, event.target.value)
                        }
                    />
                ))
            }
        </>
    )
}
