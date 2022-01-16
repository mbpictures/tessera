import { useState } from "react";
import { useSnackbar } from "notistack";
import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import axios from "axios";
import { SeatMapDialog } from "./SeatMapDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { formatPrice } from "../../../constants/util";

const arrayEquals = (a, b) => {
    return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val) => b.indexOf(val) !== -1)
    );
};

export const EditEventDialog = ({
    event,
    seatmaps,
    categories,
    onClose,
    onChange
}) => {
    if (event === null) return null;

    const originalSelectedCategories = event.categories.map(
        (category) => category.category.id
    );

    const [name, setName] = useState<string>(event.title);
    const [seatType, setSeatType] = useState<string>(event.seatType);
    const [seatMap, setSeatMap] = useState<number>(event.seatMapId);
    const [openPreview, setOpenPreview] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<number[]>(
        originalSelectedCategories
    );
    const { enqueueSnackbar } = useSnackbar();

    const handleSave = async () => {
        try {
            await axios.put("/api/admin/events/" + event.id, {
                title: name,
                seatMapId: seatMap,
                seatType,
                ...(seatType === "free" && { categories: selectedCategories })
            });
            onChange();
            onClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete("/api/admin/events/" + event.id);
            onChange();
            onClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const clickCategoryList = (id: number) => {
        let newCategories = selectedCategories.map((a) => a);
        if (newCategories.includes(id)) {
            newCategories = newCategories.filter((a) => a !== id);
        } else {
            newCategories.push(id);
        }
        setSelectedCategories(newCategories);
    };

    const hasChanges =
        name !== event.title ||
        seatType !== event.seatType ||
        seatMap !== event.seatMapId ||
        !arrayEquals(originalSelectedCategories, selectedCategories);

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogContent>
                    <Stack pt={1} pb={1} spacing={1}>
                        <TextField
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            label={"Name"}
                        />
                        <FormControl variant={"filled"}>
                            <InputLabel id={"seatMapTypeLabel"}>
                                Seat Map Type
                            </InputLabel>
                            <Select
                                value={seatType}
                                onChange={(event) =>
                                    setSeatType(event.target.value)
                                }
                                labelId={"seatMapTypeLabel"}
                                id={"seatMapType"}
                            >
                                <MenuItem value={"free"}>Free</MenuItem>
                                <MenuItem value={"seatmap"}>Seat map</MenuItem>
                            </Select>
                        </FormControl>
                        {seatType === "seatmap" && (
                            <Grid container>
                                <Grid item lg={6} md={12}>
                                    <FormControl variant={"filled"} fullWidth>
                                        <InputLabel id={"seatMapLabel"}>
                                            Seat Map
                                        </InputLabel>
                                        <Select
                                            value={seatMap}
                                            onChange={(event) =>
                                                setSeatMap(
                                                    typeof event.target
                                                        .value === "string"
                                                        ? parseInt(
                                                              event.target.value
                                                          )
                                                        : event.target.value
                                                )
                                            }
                                            labelId={"seatMapLabel"}
                                            id={"seatMap"}
                                        >
                                            {seatmaps.map((seatMap) => (
                                                <MenuItem
                                                    value={seatMap.id}
                                                    key={seatMap.id}
                                                >
                                                    {seatMap.id}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid
                                    item
                                    lg={6}
                                    md={12}
                                    display={"flex"}
                                    justifyContent={"center"}
                                >
                                    <Button
                                        fullWidth
                                        onClick={() => setOpenPreview(true)}
                                        disabled={seatMap <= 0}
                                    >
                                        Preview
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                        {seatType === "free" && (
                            <List
                                sx={{
                                    width: "100%",
                                    maxHeight: 230,
                                    bgcolor: "rgba(0, 0, 0, 0.06)",
                                    borderRadius: 1,
                                    overflow: "auto"
                                }}
                                component={"div"}
                                role={"list"}
                            >
                                <ListSubheader
                                    style={{ backgroundColor: "transparent" }}
                                >
                                    Select Categories
                                </ListSubheader>
                                {categories.map((category) => {
                                    return (
                                        <ListItem
                                            key={category.id}
                                            button
                                            onClick={() =>
                                                clickCategoryList(category.id)
                                            }
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    checked={
                                                        selectedCategories.indexOf(
                                                            category.id
                                                        ) !== -1
                                                    }
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`Category: ${category.label}`}
                                                secondary={formatPrice(
                                                    category.price,
                                                    category.currency
                                                )}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                        <Stack direction={"row"}>
                            <Button
                                color={"success"}
                                disabled={!hasChanges}
                                fullWidth
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button
                                color={"error"}
                                fullWidth
                                onClick={() => setDeleteOpen(true)}
                            >
                                Delete Event
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <SeatMapDialog
                categories={categories}
                onChange={() => setOpenPreview(false)}
                onClose={() => setOpenPreview(false)}
                seatmap={
                    openPreview ? seatmaps.find((x) => x.id === seatMap) : null
                }
            />
            <ConfirmDialog
                open={deleteOpen}
                onConfirm={handleDelete}
                onClose={() => setDeleteOpen(false)}
                text={`Confirm delete of category <b>${event.title}</b>`}
            />
        </>
    );
};
