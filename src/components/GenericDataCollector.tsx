import { Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";

export type DataTypeNames = "string" | "boolean";
export type DataTypes = string | boolean;


export const GenericDataCollector = ({currentData, data, onChange}: {currentData: Record<string, DataTypes>, data: Record<string, DataTypeNames>, onChange: (name, newValue) => unknown}) => {
    if (!data || Object.entries(data).length === 0)
        return <Typography>No additional data available</Typography>;

    currentData = currentData ?? {};
    return (
        <Stack spacing={2}>
            {
                Object.entries(data).map(val => {
                    if (val[1] === "string")
                        return <StringCollector name={val[0]} value={currentData[val[0]]} onChange={(value) => onChange(val[0], value)} />
                    if (val[1] === "boolean")
                        return <BooleanCollector name={val[0]} value={currentData[val[0]]} onChange={(value) => onChange(val[0], value)} />
                    return null;
                })
            }
        </Stack>
    );
};

const StringCollector = ({name, value, onChange}) => {
    return (
        <TextField value={value ?? ""} label={name} onChange={(event) => onChange(event.target.value)} />
    )
}

const BooleanCollector = ({name, value, onChange}) => {
    return (
        <FormControlLabel control={<Checkbox checked={value} onChange={(event) => onChange(event.target.checked)} />} label={name} />
    )
};
