import { motion } from "framer-motion";
import React from "react";

export const Step = ({children, direction}: {children?: React.ReactNode, direction: number}) => {

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
        >
            {children}
        </motion.div>
    )
};
