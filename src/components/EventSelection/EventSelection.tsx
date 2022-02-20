import { EventSelectionEntry } from "./EventSelectionEntry";
import { Stack } from "@mui/material";
import React from "react";

export const EventSelection = ({events, onChange}) => {
    return (
        <Stack spacing={2}>
            {events.map((event, index) => {
                return (
                    <EventSelectionEntry
                        label={event.title}
                        name={"event_selection"}
                        index={event.id}
                        key={index}
                        onChange={onChange}
                    />
                );
            })}
        </Stack>
    )
}
