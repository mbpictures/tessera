import {motion, MotionStyle} from "framer-motion";
import React, {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {selectEventSelected} from "../store/reducers/eventSelectionReducer";
import {useRouter} from "next/router";
import {STEP_URLS} from "../constants/Constants";
import {disableNextStep} from "../store/reducers/nextStepAvailableReducer";

export const Step = ({children, direction, style}: {children?: React.ReactNode, direction: number, style?: MotionStyle}) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentSelectedEvent = useAppSelector(selectEventSelected);

    useEffect(() => {
        dispatch(disableNextStep());
        if (currentSelectedEvent >= 0) return;
        router.push(STEP_URLS[0]).catch(console.log);
    }, []);

    const variants = {
        visible: {x: 0},
        exit: (direction) => {
            return {x: direction < 0 ? "100vw" : "-100vw"}
        },
        initial: (direction) => {
            return {x: direction < 0 ? "-100vw" : "100vw"}
        },
    };

    return (
        <motion.div
            className="container"
            variants={variants}
            exit={"exit"}
            initial={"initial"}
            animate={"visible"}
            custom={direction}
            transition={{
                type: "spring",
                duration: 0.6
            }}
            style={style}
        >
            {children}
        </motion.div>
    )
};
