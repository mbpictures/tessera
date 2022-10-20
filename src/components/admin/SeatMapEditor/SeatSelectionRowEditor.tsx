import { OnContextMenu, OnSeatSelect, Seat } from "../../seatselection/seatmap/SeatMapSeat";
import { SeatRow, SeatSelectionRow } from "../../seatselection/seatmap/SeatSelectionRow";
import {
    Box,
    Button,
    ButtonGroup,
    IconButton,
    Popover,
    Stack, TextField,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RemoveIcon from "@mui/icons-material/Remove";

export type OnAddSeat = (seat: Seat, index: number) => unknown;
export type OnChangeSeat = (newSeat: Seat, index) => unknown;

export const SeatSelectionRowEditor = ({
    row,
    categories,
    onSelectSeat,
    onAddSeat,
    onChangeSeat
}: {
    row: SeatRow;
    categories: Array<any>;
    onSelectSeat?: OnSeatSelect;
    onAddSeat?: OnAddSeat;
    onChangeSeat?: OnChangeSeat;
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | HTMLDivElement | null>(null);
    const [newSeatIndex, setNewSeatIndex] = useState<number>(-1);
    const [seatAmount, setSeatAmount] = useState<number>(0);
    const [seatContext, setSeatContext] = useState(null);
    const [seatId, setSeatId] = useState("");

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setSeatAmount(1);
        setNewSeatIndex(row.length);
    };

    const handleContextMenu: OnContextMenu = (event, seat, indexInRow) => {
        setAnchorEl(event.currentTarget);
        setSeatContext(seat);
        setNewSeatIndex(indexInRow);
        setSeatAmount(seat.amount);
        setSeatId(seat.id.toString() ?? "");
    };

    const handleClose = () => {
        setAnchorEl(null);
        setNewSeatIndex(-1);
        setSeatContext(null);
        setSeatId("");
        setSeatAmount(1);
    };

    const handleAddSeat = (category) => {
        if (seatContext) {
            onChangeSeat({
                category: category?.id,
                amount: seatAmount,
                type: category === undefined ? "space" : "seat",
                id: parseInt(seatId)
            }, newSeatIndex);
            handleClose();
            return;
        }
        onAddSeat(
            {
                category: category?.id,
                amount: seatAmount,
                type: category === undefined ? "space" : "seat",
                ...(seatId !== "" && ({id: parseInt(seatId)}))
            },
            newSeatIndex
        );
        handleClose();
    };

    const handleLeft = () => {
        if (newSeatIndex <= 0) return;
        setNewSeatIndex((prev) => prev - 1);
    };

    const handleRight = () => {
        if (newSeatIndex >= row.length) return;
        setNewSeatIndex((prev) => prev + 1);
    };

    const mutatedRow = row.map((a) => {
        return { ...a };
    });
    if (newSeatIndex >= 0 && !seatContext) {
        mutatedRow.splice(newSeatIndex, 0, {
            type: "seat",
            category: -1,
            amount: seatAmount
        });
    }
    if (seatContext) {
        mutatedRow[newSeatIndex] = {
            id: seatContext.id,
            type: "seat",
            category: seatContext.category,
            amount: seatAmount
        };
    }

    const mutatedCategories = categories.map((a) => {
        return { ...a };
    });
    mutatedCategories.push({
        id: -1,
        label: "New Seat",
        color: "#333333",
        price: 0,
        currency: "USD"
    });

    return (
        <Box display={"flex"}>
            <SeatSelectionRow
                row={mutatedRow}
                categories={mutatedCategories}
                forceNoRedux
                onSelectSeat={onSelectSeat}
                onContextMenu={handleContextMenu}
            />
            <IconButton onClick={handleOpenMenu}>
                <AddIcon />
            </IconButton>
            <Popover
                open={anchorEl !== null}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                }}
            >
                <Stack p={1} alignItems={"center"} spacing={1}>
                    <TextField
                        label={"Id"}
                        value={seatId}
                        onChange={event => setSeatId(event.target.value)}
                        size={"small"}
                    />
                    {
                        !seatContext && (
                            <>
                                <Typography>Position:</Typography>
                                <ButtonGroup orientation="horizontal" fullWidth>
                                    <Button
                                        onClick={handleLeft}
                                        disabled={newSeatIndex <= 0}
                                    >
                                        <ChevronLeftIcon />
                                    </Button>
                                    <Button
                                        onClick={handleRight}
                                        disabled={newSeatIndex >= row.length}
                                    >
                                        <ChevronRightIcon />
                                    </Button>
                                </ButtonGroup>
                            </>
                        )
                    }
                    <Typography>Amount:</Typography>
                    <ButtonGroup orientation="horizontal" fullWidth>
                        <Button
                            onClick={() => setSeatAmount((prev) => prev - 1)}
                            disabled={seatAmount <= 1}
                        >
                            <RemoveIcon />
                        </Button>
                        <Button
                            onClick={() => setSeatAmount((prev) => prev + 1)}
                        >
                            <AddIcon />
                        </Button>
                    </ButtonGroup>
                    <Typography align={"center"}>
                        Choose Category
                        <br />
                        to Add Seat:
                    </Typography>
                    <ButtonGroup orientation="vertical" fullWidth>
                        {categories.map((category, index) => (
                            <Button
                                key={index}
                                onClick={() => handleAddSeat(category)}
                            >
                                {category.label}
                            </Button>
                        ))}
                        <Button onClick={() => handleAddSeat(undefined)}>
                            Spacing
                        </Button>
                    </ButtonGroup>
                </Stack>
            </Popover>
        </Box>
    );
};
