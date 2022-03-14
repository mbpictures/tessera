import style from "../../style/GalleryEventSelection.module.scss";
import { GalleryEventSelectionEntry } from "./GalleryEventSelectionEntry";

export const GalleryEventSelection = ({events, onChange}) => {
    return (
        <div className={style.eventSelectionGallery}>
            {
                events.map((event, index) => <GalleryEventSelectionEntry key={index} event={event} index={event.id} onChange={onChange} />)
            }
        </div>
    );
}
