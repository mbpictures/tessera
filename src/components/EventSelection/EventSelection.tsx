import { EventSelectionEntry } from "./EventSelectionEntry";
import { Stack } from "@mui/material";
import React from "react";
import style from "../../style/EventSelection.module.scss";

export const EventSelection = ({events, onChange}) => {
    return (
        <Stack
            spacing={2}
            className={style.eventSelectionWrapper}
        >
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
