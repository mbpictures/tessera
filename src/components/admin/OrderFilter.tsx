import {
    Button,
    FormControl,
    IconButton,
    InputLabel,
    ListItemIcon,
    Menu,
    MenuItem,
    Select,
    TextField, Typography
} from "@mui/material";
import { ShippingType } from "../../store/factories/shipping/ShippingFactory";
import { Clear } from "@mui/icons-material";
import * as React from "react";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useState } from "react";

export const OrderFilter = ({filter, onResetFilters, onFilterChange}) => {
    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
    return (
        <>
            <Button
                startIcon={<FilterAltIcon />}
                onClick={(event) => setFilterAnchor(event.currentTarget)}
            >
                Filter
            </Button>
            <Menu
                open={filterAnchor !== null}
                onClose={() => setFilterAnchor(null)}
                anchorEl={filterAnchor}
                disableAutoFocusItem
            >
                <MenuItem disableRipple disableTouchRipple>
                    <FormControl fullWidth>
                        <InputLabel id="filter-shipping">Shipping</InputLabel>
                        <Select labelId={"filter-shipping"} label={"Shipping"} value={filter?.shipping ?? ""} onChange={async (event) => await onFilterChange("shipping", event.target.value)}>
                            {
                                Object.entries(ShippingType).map((value, index) => {
                                    return (
                                        <MenuItem value={value[1]} key={index}>{value[0]}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                    <ListItemIcon>
                        <IconButton onClick={async () => await onFilterChange("shipping", undefined)}>
                            <Clear />
                        </IconButton>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem disableRipple disableTouchRipple>
                    <TextField
                        value={filter?.eventId ?? ""}
                        type="number"
                        label={"Event Id"}
                        onChange={async (event) => await onFilterChange("eventId", event.target.value)}
                    />
                    <ListItemIcon>
                        <IconButton onClick={async () => await onFilterChange("eventId", undefined)}>
                            <Clear />
                        </IconButton>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem disableRipple disableTouchRipple>
                    <TextField
                        value={filter?.event ?? ""}
                        label={"Event Title"}
                        onChange={async (event) => await onFilterChange("event", event.target.value)}
                    />
                    <ListItemIcon>
                        <IconButton onClick={async () => await onFilterChange("event", undefined)}>
                            <Clear />
                        </IconButton>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem divider />
                <MenuItem onClick={async () => {
                    setFilterAnchor(null);
                    await onResetFilters();
                }} color={"error"}>
                    <ListItemIcon><Clear /></ListItemIcon>
                    <Typography>Reset all Filters</Typography>
                </MenuItem>
            </Menu>
        </>
    )
}
