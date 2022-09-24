import { EventSelectionEntry, EventSelectionMultiple } from "./EventSelectionEntry";
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
                if (event.dates && event.dates.length > 1) {
                    return <EventSelectionMultiple dates={event.dates} label={event.title} onChange={onChange} key={index} />
                }
                let title = event.dates[0]?.title ?? event.title;
                if (event.dates[0].date)
                    title += ` (${new Date(event.dates[0].date).toLocaleString()})`
                return (
                    <EventSelectionEntry
                        label={title}
                        name={"event_selection"}
                        index={event.dates[0]?.id ?? event.id}
                        key={index}
                        onChange={onChange}
                    />
                );
            })}
        </Stack>
    )
}
