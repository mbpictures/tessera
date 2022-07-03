import { TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import zip from "zippo";
import { useTranslation } from "next-i18next";
import informationText from "../../../locale/en/information.json";

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
    const [touched, setTouched] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const isValid = zip.validate(event.target.value);
        onChange(event.target.value, isValid);
        if (isValid) {
            setError(undefined);
            return;
        }
        setError(t("information:zip-error", null, {fallback: informationText["zip-error"]}));
    };

    return (
        <TextField
            label={t("information:zip", null, {fallback: informationText.zip})}
            fullWidth
            error={error != undefined}
            helperText={touched && error}
            onChange={handleChange}
            value={value}
            name={name}
            onBlur={() => setTouched(true)}
        />
    );
};
