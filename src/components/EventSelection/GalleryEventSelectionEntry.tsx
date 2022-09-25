import Image from "next/image";
import { Typography } from "@mui/material";
import { useRef, useState } from "react";
import Tilt from 'react-parallax-tilt';
import style from "../../style/GalleryEventSelection.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import { EventSelectionEntry } from "./EventSelectionEntry";
import { useTheme } from "@mui/system";

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const GalleryEventSelectionEntryInner = ({event, onChange, selected, expanded}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [clickFeedback, setClickFeedback] = useState<boolean>(false);

    const handleClick = () => {
        setClickFeedback(true);
        setTimeout(() =>{
            setClickFeedback(false);
        }, 300);
        onChange(event);
    }

    const classNames = style.eventSelectionItem + " " + (isHovering || selected ? style.active : "") + " " +
        (selected ? style.selected : "");

    const tiltClassNames = style.tilt + " " + (expanded ? style.expanded : "");

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                zIndex: isHovering || expanded ? 110 : 100
            }}
            className={classNames}
            onClick={handleClick}
        >
            <Tilt
                scale={expanded ? 1 : 1.1}
                tiltMaxAngleX={2.5}
                tiltMaxAngleY={2.5}
                onEnter={() => setIsHovering(true)}
                onLeave={() => setIsHovering(false)}
                glareEnable={true}
                glareMaxOpacity={0.2}
                glareColor="lightblue"
                glarePosition="bottom"
                perspective={500}
                className={tiltClassNames}
                tiltEnable={!expanded}
            >
                <div className={style.border} />
                <motion.div
                    className={style.flashHighlight}
                    variants={{
                        stop: { opacity: 0 },
                        flash: { opacity: [0, 0.1, 0], transition: { duration: 0.3 } }
                    }}
                    animate={clickFeedback ? "flash" : "stop"}
                    onAnimationEnd={() => {
                        setClickFeedback(false)
                    }}
                />
                <Image src={event.coverImage} layout={"fill"} alt="Event Preview" />
                <Typography
                    variant={"h4"}
                >
                    {event.title}
                </Typography>
            </Tilt>
        </div>
    )
}

export const GalleryEventSelectionEntry = ({event, onChange, selected, onDateChange}) => {
    const expanded = selected && event.dates.length > 1;
    const size = useRef(event.coverImageSize ?? randomIntFromInterval(1, 2));
    const theme = useTheme();

    return (
        <div style={{
            position: "relative",
            gridColumn: `span ${size.current}`,
            gridRow: `span ${size.current}`,
        }}>
            <AnimatePresence>
                {
                    !expanded ? (
                        <motion.div layoutId={"expand-card" + event.id} style={{width: "100%", height: "100%"}}>
                            <GalleryEventSelectionEntryInner event={event} onChange={onChange} selected={selected} expanded={expanded} />
                        </motion.div>
                    ) : (
                        <motion.div
                            layoutId={"expand-card" + event.id}
                            style={{
                                width: "150%",
                                height: "150%",
                                position: "relative",
                                zIndex: 110
                            }}
                        >
                            <GalleryEventSelectionEntryInner event={event} onChange={() => onChange(null)} selected={selected} expanded={expanded} />
                            <motion.div
                                transition={{ delay: 0.3, duration: 0.5 }}
                                initial={{ opacity: 0, top: "-10%" }}
                                animate={{ opacity: 1, top: "0" }}
                                exit={{ opacity: 0, top: "-10%" }}
                                layoutId={"expand-card-dates" + event.id}
                                style={{
                                    position: "relative",
                                    backgroundColor: theme.palette.grey["200"],
                                    zIndex: 109,
                                    padding: "0 10px 10px 10px"
                                }}
                            >
                                {
                                    event.dates.map(date => {
                                        let title = date.title ?? event.title;
                                        if (date.date)
                                            title += ` (${new Date(date.date).toLocaleString()})`
                                        return (
                                            <EventSelectionEntry
                                                label={title}
                                                name={"event_selection"}
                                                index={date.id}
                                                onChange={onDateChange}
                                                key={date.id}
                                            />
                                        )
                                    })
                                }
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    )
}
