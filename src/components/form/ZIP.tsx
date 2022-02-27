import { TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import zip from "zippo";
import useTranslation from "next-translate/useTranslation";

export const ZIP = ({
    value,
    onChange,
    name
}: {
    value: string;
    onChange: (newValue: string, valid: boolean) => unknown;
    name?: string;
}) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const { t } = useTranslation();

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const isValid = zip.validate(event.target.value);
        onChange(event.target.value, isValid);
        if (isValid) {
            setError(undefined);
            return;
        }
        setError(t("information:zip-error"));
    };

    return (
        <TextField
            label={t("information:zip")}
            fullWidth
            error={error != undefined}
            helperText={error}
            onChange={handleChange}
            value={value}
            name={name}
        />
    );
};
