import style from "../../style/GalleryEventSelection.module.scss";
import { GalleryEventSelectionEntry } from "./GalleryEventSelectionEntry";
import { useEffect, useState } from "react";

export const GalleryEventSelection = ({events, onChange}) => {
    const [currentEvent, setCurrentEvent] = useState(null);

    const needsDateSelection = (event) => event && event.dates.length > 1;

    useEffect(() => {
        if (!currentEvent || needsDateSelection(currentEvent)) {
            onChange(-1);
            return;
        }
        onChange(currentEvent.dates[0].id);
    }, [currentEvent]);


    return (
        <div style={{
            position: "relative"
        }}>
            <div className={style.eventSelectionGallery}>
                {
                    events.map((event, index) => (
                        <GalleryEventSelectionEntry
                            key={index}
                            event={event}
                            onChange={setCurrentEvent}
                            selected={currentEvent?.id === event.id}
                            onDateChange={onChange}
                        />
                    ))
                }
            </div>
        </div>
    );
}
