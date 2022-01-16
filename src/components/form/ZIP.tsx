import { TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import zip from "zippo";

export const ZIP = ({
    value,
    onChange
}: {
    value: string;
    onChange: (newValue: string, valid: boolean) => unknown;
}) => {
    const [error, setError] = useState<string | undefined>(undefined);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const isValid = zip.validate(event.target.value);
        onChange(event.target.value, isValid);
        if (isValid) {
            setError(undefined);
            return;
        }
        setError("Please enter a valid ZIP Code");
    };

    return (
        <TextField
            label="ZIP"
            fullWidth
            error={error != undefined}
            helperText={error}
            onChange={handleChange}
            value={value}
        />
    );
};
