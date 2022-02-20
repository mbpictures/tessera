import Image from "next/image";
import { Typography } from "@mui/material";
import { useRef, useState } from "react";
import Tilt from 'react-parallax-tilt';
import style from "../../style/GalleryEventSelection.module.scss";
import { useAppSelector } from "../../store/hooks";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";
import {motion} from "framer-motion";

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const GalleryEventSelectionEntry = ({event, index, onChange}) => {
    const currentSelectedEvent = useAppSelector(selectEventSelected);
    const [isHovering, setIsHovering] = useState(false);
    const size = useRef(event.coverImageSize ?? randomIntFromInterval(1, 2));
    const [clickFeedback, setClickFeedback] = useState<boolean>(false);

    const handleClick = () => {
        setClickFeedback(true);
        setTimeout(() =>{
            setClickFeedback(false);
        }, 300);
        onChange(index);
    }

    const classNames = (isHovering || currentSelectedEvent === index ? style.active : "") + " " +
        (currentSelectedEvent === index ? style.selected : "");

    return (
        <div
            style={{
                gridColumn: `span ${size.current}`,
                gridRow: `span ${size.current}`,
                zIndex: isHovering ? 110 : 100
            }}
            className={classNames}
            onClick={handleClick}
        >
            <Tilt
                scale={1.1}
                tiltMaxAngleX={2.5}
                tiltMaxAngleY={2.5}
                onEnter={() => setIsHovering(true)}
                onLeave={() => setIsHovering(false)}
                glareEnable={true}
                glareMaxOpacity={0.2}
                glareColor="lightblue"
                glarePosition="bottom"
                perspective={500}
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
                <Image src={event.coverImage} layout={"fill"} />
                <Typography
                    variant={"h4"}
                >
                    {event.title}
                </Typography>
            </Tilt>
        </div>
    )
}
