import {TextField} from "@mui/material";
import {ChangeEvent, useState} from "react";
import zip from "zippo";

export const ZIP = () => {
    const [value, setValue] = useState<string>();
    const [error, setError] = useState<string | undefined>(undefined);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
        if (zip.validate(event.target.value)){
            setError(undefined);
            return;
        }
        setError("Please enter a valid ZIP Code")
    }

    return (
        <TextField label="ZIP" fullWidth error={error != undefined} helperText={error} onChange={handleChange} value={value} />
    )
};
