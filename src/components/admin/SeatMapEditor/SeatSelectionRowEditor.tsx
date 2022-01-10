import {OnSeatSelect, Seat} from "../../seatmap/SeatMapSeat";
import {SeatRow, SeatSelectionRow} from "../../seatmap/SeatSelectionRow";
import {Box, Button, ButtonGroup, IconButton, Popover, Stack, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import React, {useState} from "react";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RemoveIcon from '@mui/icons-material/Remove';

export type OnAddSeat = (seat: Seat, index: number) => unknown;

export const SeatSelectionRowEditor = ({row, categories, onSelectSeat, onAddSeat}: {row: SeatRow, categories: Array<any>, onSelectSeat?: OnSeatSelect, onAddSeat?: OnAddSeat}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [newSeatIndex, setNewSeatIndex] = useState<number>(-1);
    const [seatAmount, setSeatAmount] = useState<number>(0);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setSeatAmount(1);
        setNewSeatIndex(row.length);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setNewSeatIndex(-1);
    };

    const handleAddSeat = (category) => {
        onAddSeat({
            category: category?.id,
            amount: seatAmount,
            type: category === undefined ? "space" : "seat"
        }, newSeatIndex);
        handleClose();
    };

    const handleLeft = () => {
        if (newSeatIndex <= 0) return;
        setNewSeatIndex(prev => prev - 1);
    };

    const handleRight = () => {
        if (newSeatIndex >= row.length) return;
        setNewSeatIndex(prev => prev + 1);
    }

    const mutatedRow = row.map(a => {return {...a}});
    if (newSeatIndex >= 0) {
        mutatedRow.splice(newSeatIndex, 0, {
            type: "seat",
            category: -1,
            amount: seatAmount
        })
    }

    const mutatedCategories = categories.map(a => {return {...a}});
    mutatedCategories.push({
        id: -1,
        label: "New Seat",
        color: "#333333",
        price: 0,
        currency: "USD"
    })

    return (
        <Box display={"flex"}>
            <SeatSelectionRow row={mutatedRow} categories={mutatedCategories} forceNoRedux onSelectSeat={onSelectSeat} />
            <IconButton onClick={handleOpenMenu}><AddIcon /></IconButton>
            <Popover
                open={anchorEl !== null}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Stack p={1} alignItems={"center"} spacing={1}>
                    <Typography>Position:</Typography>
                    <ButtonGroup orientation="horizontal">
                        <Button onClick={handleLeft} disabled={newSeatIndex <= 0}><ChevronLeftIcon /></Button>
                        <Button onClick={handleRight} disabled={newSeatIndex >= row.length}><ChevronRightIcon /></Button>
                    </ButtonGroup>
                    <Typography>Amount:</Typography>
                    <ButtonGroup orientation="horizontal">
                        <Button onClick={() => setSeatAmount(prev => prev - 1)} disabled={seatAmount <= 1}><RemoveIcon /></Button>
                        <Button onClick={() => setSeatAmount(prev => prev + 1)}><AddIcon /></Button>
                    </ButtonGroup>
                    <Typography align={"center"}>Choose Category<br />to Add Seat:</Typography>
                    <ButtonGroup orientation="vertical">
                        {
                            categories.map((category, index) => <Button key={index} onClick={() => handleAddSeat(category)}>{category.label}</Button>)
                        }
                        <Button onClick={() => handleAddSeat(undefined)}>Spacing</Button>
                    </ButtonGroup>
                </Stack>
            </Popover>
        </Box>
    )
}
