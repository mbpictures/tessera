import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField, ToggleButton,
    ToggleButtonGroup, Typography
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";

const templateGenerators = [
    (data, categoryId) => {
        return Array.from(Array(data.rows).keys()).map(() => Array.from(Array(data.cols).keys()).map(() => ({
            type: "seat",
            category: categoryId,
            amount: 1
        })))
    },
    (data, categoryId) => {
        return Array.from(Array(data.rows).keys()).map(() => {
            let currentBlockWidth = 0;
            return Array.from(Array(data.cols).keys()).map(() => {
                if (currentBlockWidth < data.blockWidth) {
                    currentBlockWidth++;
                    return {
                        type: "seat",
                        category: categoryId,
                        amount: 1
                    }
                }
                currentBlockWidth = 0;
                return {
                    type: "space",
                    amount: data.spacing
                }
            })
        });
    }
];

const countingGenerators = {
    "rows": (definition) => {
        let index = 0;
        return definition.map(row => row.map(seat => {
            if (seat.type !== "seat") return seat;
            index++;
            return {
                ...seat,
                id: index
            }
        }))
    },
    "cols": (definition, templateData) => {
        let index = 0;
        const newDefinition = definition.map(row => row.map(col => col));
        for (let col = 0; col < templateData.cols; col++) {
            for (let row of newDefinition) {
                if (row[col].type !== "seat") continue;
                index++;
                row[col].id = index;
            }
        }
        return newDefinition;
    },
    "block": (definition, templateData) => {
        let index = 0;
        const newDefinition = definition.map(row => row.map(col => col));
        for (let block = 0; block < Math.ceil(templateData.cols / templateData.blockWidth); block++) {
            for (let row of newDefinition) {
                for (let col = 0; col < templateData.blockWidth; col++) {
                    const rowIndex = col + (templateData.blockWidth + 1) * block;
                    if (row.length <= rowIndex || row[rowIndex].type !== "seat") continue;
                    index++;
                    row[rowIndex].id = index;
                }
            }
        }
        return newDefinition;
    }
}

export const SeatMapTemplateEditor = ({onSeatMapChange, categories, seatDefinition}) => {
    const [value, setValue] = useState(0);
    const [templateData, setTemplateData] = useState(null);
    const [category, setCategory] = useState(categories[0].id);
    const [countingValue, setCountingValue] = useState("rows");

    const apply = () => {
        onSeatMapChange(templateGenerators[value](templateData, category));
    }

    const applyCounting = () => {
        onSeatMapChange(countingGenerators[countingValue](seatDefinition, templateData));
    }

    return (
        <Stack spacing={2}>
            <Stack spacing={1}>
                <Typography variant={"h6"} align={"center"}>Template</Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={(_, newValue) => setValue(newValue)} aria-label="basic tabs example" variant="fullWidth">
                        <Tab label="Rows" />
                        <Tab label="Blocks" />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <DataInput
                        initialData={{
                            rows: 5,
                            cols: 5
                        }}
                        onChange={(data) => setTemplateData(data)}
                    />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <DataInput
                        initialData={{
                            rows: 5,
                            cols: 5,
                            blockWidth: 2,
                            spacing: 1
                        }}
                        onChange={(data) => setTemplateData(data)}
                    />
                </TabPanel>
                <FormControl fullWidth>
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                        labelId="category-select-label"
                        id="category-select"
                        value={category}
                        label="Age"
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        {
                            categories.map(category => <MenuItem value={category.id} key={category.id}>{category.label}</MenuItem>)
                        }
                    </Select>
                </FormControl>
                <Button onClick={apply}>Apply Template</Button>
            </Stack>
            <Stack>
                <Typography variant={"h6"} align={"center"}>Seat ID Counting</Typography>
                <ToggleButtonGroup value={countingValue} onChange={(_, newValue) => setCountingValue(newValue)} exclusive fullWidth>
                    <ToggleButton value={"rows"}>
                        Rows
                    </ToggleButton>
                    <ToggleButton value={"cols"}>
                        Columns
                    </ToggleButton>
                    <ToggleButton value={"block"}>
                        Blocks
                    </ToggleButton>
                </ToggleButtonGroup>
                <Button onClick={applyCounting}>Apply Counting</Button>
            </Stack>
        </Stack>
    );
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const DataInput = ({initialData, onChange}) => {
    const [data, setData] = useState(initialData);

    const handleChange = (key) => (event) => {
        setData({
            ...data,
            ...({[key]: parseInt(event.target.value)})
        });
    }

    useEffect(() => {
        onChange(data);
    }, [data]);

    return (
        <Stack spacing={1}>
            {
                Object.entries(data).map(entries => {
                    let labelResult = entries[0].replace(/([A-Z])/g, " $1");
                    labelResult = labelResult.charAt(0).toUpperCase() + labelResult.slice(1);
                    return (
                        <TextField
                            label={labelResult}
                            value={entries[1]}
                            onChange={handleChange(entries[0])}
                            key={entries[0]}
                        />
                    )
                })
            }
        </Stack>
    )
}
