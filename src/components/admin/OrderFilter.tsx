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
import { useRef, useState } from "react";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import { WaitingTextField } from "../WaitingTextField";

export const OrderFilter = ({filterChanged}) => {
    const filter = useRef<Record<string, string>>({});
    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

    const resetFilters = async () => {
        filter.current = {};
        await filterChanged(filter.current);
    };

    const handleFilterChange = async (name: string, value: string | undefined) => {
        console.log("HANDLE FILTER " + value)
        if (value)
            filter.current[name] = value;
        else
            delete filter.current[name];
        await filterChanged(filter.current);
    };

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
                        <Select labelId={"filter-shipping"} label={"Shipping"} value={filter.current?.shipping ?? ""} onChange={async (event) => await handleFilterChange("shipping", event.target.value)}>
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
                        <IconButton onClick={async () => await handleFilterChange("shipping", undefined)}>
                            <Clear />
                        </IconButton>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem disableRipple disableTouchRipple>
                    <TextField
                        value={filter.current?.eventId ?? ""}
                        type="number"
                        label={"Event Id"}
                        onChange={async (event) => await handleFilterChange("eventId", event.target.value)}
                    />
                    <ListItemIcon>
                        <IconButton onClick={async () => await handleFilterChange("eventId", undefined)}>
                            <Clear />
                        </IconButton>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem disableRipple disableTouchRipple>
                    <WaitingTextField
                        value={filter.current?.event ?? ""}
                        label={"Event Title"}
                        onChange={async (event) => await handleFilterChange("event", event.target.value)}
                    />
                    <ListItemIcon>
                        <IconButton onClick={async () => await handleFilterChange("event", undefined)}>
                            <Clear />
                        </IconButton>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem disableRipple disableTouchRipple>
                    <FormControl fullWidth>
                        <InputLabel id="filter-payment">Payment</InputLabel>
                        <Select labelId={"filter-payment"} label={"Payment"} value={filter.current?.payment ?? ""} onChange={async (event) => await handleFilterChange("payment", event.target.value)}>
                            {
                                Object.entries(PaymentType).map((value, index) => {
                                    return (
                                        <MenuItem value={value[1]} key={index}>{value[0]}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                    <ListItemIcon>
                        <IconButton onClick={async () => await handleFilterChange("payment", undefined)}>
                            <Clear />
                        </IconButton>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem divider />
                <MenuItem onClick={async () => {
                    setFilterAnchor(null);
                    await resetFilters();
                }} color={"error"}>
                    <ListItemIcon><Clear /></ListItemIcon>
                    <Typography>Reset all Filters</Typography>
                </MenuItem>
            </Menu>
        </>
    )
}
