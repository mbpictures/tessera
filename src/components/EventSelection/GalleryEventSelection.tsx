import style from "../../style/GalleryEventSelection.module.scss";
import { GalleryEventSelectionEntry } from "./GalleryEventSelectionEntry";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";

export const GalleryEventSelection = ({events, onChange}) => {
    const currentSelectedDate = useAppSelector(selectEventSelected);
    const [currentEvent, setCurrentEvent] = useState(null);

    const needsDateSelection = (event) => event && event.dates.length > 1;

    useEffect(() => {
        if (currentSelectedDate === -1) return;
        setCurrentEvent(events.find(event => event.dates.some(date => date.id === currentSelectedDate)));
    }, []);

    const handleChange = (event) => {
        setCurrentEvent(event);
        if (!event || needsDateSelection(event))
            onChange(-1);
        else
            onChange(event.dates[0].id);
    }

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
                            onChange={handleChange}
                            selected={currentEvent?.id === event.id}
                            onDateChange={onChange}
                        />
                    ))
                }
            </div>
        </div>
    );
}
