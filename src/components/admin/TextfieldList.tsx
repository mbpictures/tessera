import { Button, IconButton, InputAdornment, List, ListSubheader, TextField } from "@mui/material";
import { DeleteOutlined, Add } from "@mui/icons-material";

export const TextfieldList = ({
    values,
    onChange,
    header
}: {
    values: Array<string>,
    onChange: (newValue: Array<string>) => unknown,
    header: string
}) => {
    const getCopy = () => {
        return values.map(value => value);
    }

    const handleChange = (value, index) => {
        const newValue = getCopy();
        newValue[index] = value;
        onChange(newValue);
    };

    const handleDelete = (index) => {
        const newValue = getCopy();
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const handleAdd = () => {
        const newValue = getCopy();
        newValue.push("");
        onChange(newValue);
    }

    return (
        <List
            sx={{
                bgcolor: "rgba(0, 0, 0, 0.06)",
                borderRadius: 1,
                overflow: "auto"
            }}
            component={"div"}
            role={"list"}
        >
            <ListSubheader style={{ backgroundColor: "transparent" }} disableSticky>
                {header}
            </ListSubheader>
            {
                values.map((value, index) => {
                    return (
                        <TextField
                            value={value}
                            onChange={(event) => handleChange(event.target.value, index)}
                            key={index}
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => handleDelete(index)} color={"error"}>
                                            <DeleteOutlined />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{pt: 1, pb: 1, pl: 2, pr: 2}}
                        />
                    )
                })
            }
            <Button color={"success"} onClick={handleAdd} fullWidth>
                <Add /> Add
            </Button>
        </List>
    )
}
