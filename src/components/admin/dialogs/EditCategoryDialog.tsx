import {
    Autocomplete,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ConfirmDialog } from "./ConfirmDialog";
import { useEffect, useState } from "react";
// @ts-ignore
import { ColorPicker } from "mui-color";
import currencyToSymbolMap from "currency-symbol-map/map";
import axios from "axios";
import { useSnackbar } from "notistack";

export const EditCategoryDialog = ({ category, onClose, onChange }) => {
    const [currency, setCurrency] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [price, setPrice] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [normalColor, setNormalColor] = useState("");
    const [activeColor, setActiveColor] = useState("");
    const [occupiedColor, setOccupiedColor] = useState("");
    const { enqueueSnackbar } = useSnackbar();
    const isLgUp = useMediaQuery((theme: any) =>
        theme.breakpoints.up("lg")
    );

    useEffect(() => {
        if (category == null) return;
        console.log(category);
        setCurrency(category.currency);
        setCategoryName(category.label);
        setPrice(category.price);
        setNormalColor(category.color);
        setActiveColor(category.activeColor);
        setOccupiedColor(category.occupiedColor);
    }, [category]);

    const handleSave = async () => {
        try {
            await axios.put("/api/admin/category/" + category.id, {
                label: categoryName,
                price,
                currency,
                color: normalColor,
                activeColor,
                occupiedColor
            });
            onClose();
            onChange();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete("/api/admin/category/" + category.id);
            onClose();
            onChange();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    if (category === null) return null;

    const hasChanges =
        categoryName !== category.label ||
        price !== category.price ||
        normalColor !== category.color ||
        activeColor !== category.activeColor ||
        occupiedColor !== category.occupiedColor ||
        currency !== category.currency;
    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth>
                <DialogTitle>
                    Category {categoryName}
                    <IconButton
                        style={{ position: "absolute", top: 8, right: 8 }}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} p={2}>
                        <TextField
                            value={categoryName}
                            label={"Name"}
                            onChange={(event) =>
                                setCategoryName(event.target.value)
                            }
                        />
                        <Stack
                            direction={
                                isLgUp ? "row" : "column"
                            }
                            spacing={2}
                        >
                            <TextField
                                value={price}
                                label={"Price"}
                                onChange={(event) =>
                                    setPrice(parseFloat(event.target.value))
                                }
                                sx={{ flexGrow: 1 }}
                            />
                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={Object.keys(currencyToSymbolMap)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Currency" />
                                )}
                                getOptionLabel={(option) =>
                                    `${currencyToSymbolMap[option]} (${option})`
                                }
                                isOptionEqualToValue={(option, value) =>
                                    option === value
                                }
                                value={currency}
                                onChange={(event, newValue) =>
                                    setCurrency(newValue)
                                }
                                sx={{ flexGrow: 1 }}
                            />
                        </Stack>
                        <Stack direction={"row"}>
                            <Typography
                                flexGrow={1}
                                display={"flex"}
                                alignItems={"center"}
                            >
                                Color:
                            </Typography>
                            <ColorPicker
                                value={normalColor}
                                onChange={(value) =>
                                    setNormalColor(value.css.backgroundColor)
                                }
                                disableAlpha
                                hideTextfield
                            />
                        </Stack>
                        <Stack direction={"row"}>
                            <Typography
                                flexGrow={1}
                                display={"flex"}
                                alignItems={"center"}
                            >
                                Active Color:
                            </Typography>
                            <ColorPicker
                                value={activeColor}
                                onChange={(value) =>
                                    setActiveColor(value.css.backgroundColor)
                                }
                                disableAlpha
                                hideTextfield
                            />
                        </Stack>
                        <Stack direction={"row"}>
                            <Typography
                                flexGrow={1}
                                display={"flex"}
                                alignItems={"center"}
                            >
                                Occupied Color:
                            </Typography>
                            <ColorPicker
                                value={occupiedColor}
                                onChange={(value) =>
                                    setOccupiedColor(value.css.backgroundColor)
                                }
                                disableAlpha
                                hideTextfield
                            />
                        </Stack>

                        <Stack direction={"row"}>
                            <Button
                                color={"success"}
                                disabled={!hasChanges}
                                fullWidth
                                onClick={handleSave}
                            >
                                Save Changes
                            </Button>
                            <Button
                                color={"error"}
                                fullWidth
                                onClick={() => setDeleteOpen(true)}
                            >
                                Delete Category
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                text={`Confirm delete of category <b>${category.label}</b>`}
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteUser}
            />
        </>
    );
};
