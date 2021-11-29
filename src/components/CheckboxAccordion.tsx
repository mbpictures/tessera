import {Accordion, AccordionDetails, AccordionSummary, Checkbox, Typography} from "@mui/material";
import React from "react";

export const CheckboxAccordion = (
    {
        label,
        name,
        selectedItem,
        onSelect,
        children
    }: {
        label: string | React.ReactNode | React.Component,
        name: string,
        selectedItem: string,
        onSelect: (checkedItem) => unknown,
        children: React.ReactNode
    }) => {

    const onCheckChange = (event) => {
        onSelect(event.target.checked ? name : null);
    };

    const handleChange = (_, isSelected) => {
        onSelect(isSelected ? name : null);
    };

    return (
        <Accordion onChange={handleChange} expanded={name === selectedItem}>
            <AccordionSummary>
                <Checkbox checked={name === selectedItem} onChange={onCheckChange} />
                <Typography alignItems="center" display="flex" variant="subtitle1">{label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {children}
            </AccordionDetails>
        </Accordion>
    );
};
