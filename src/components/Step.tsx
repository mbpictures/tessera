import { motion, MotionStyle } from "framer-motion";
import React, { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
    selectEventSelected,
    setEvent
} from "../store/reducers/eventSelectionReducer";
import { useRouter } from "next/router";
import { STEP_URLS } from "../constants/Constants";
import {
    disableNextStep,
    enableNextStep
} from "../store/reducers/nextStepAvailableReducer";
import { getStoreWithOrderId } from "../constants/util";
import { setOrder } from "../store/reducers/orderReducer";
import {
    setAddress,
    setEmail,
    setShipping,
    setUserId
} from "../store/reducers/personalInformationReducer";
import { NextAvailableFactory } from "../store/factories/nextAvailable/NextAvailableFactory";

export const Step = ({
    children,
    direction,
    style
}: {
    children?: React.ReactNode;
    direction: number;
    style?: MotionStyle;
}) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentSelectedEvent = useAppSelector(selectEventSelected);
    const state = useAppSelector((state) => state);

    const updateNextAvailable = useCallback(
        () => {
            if (
                NextAvailableFactory.getInstance(
                    router.pathname,
                    state
                )?.isNextAvailable() ??
                false
            ) {
                dispatch(enableNextStep());
            } else {
                dispatch(disableNextStep());
            }
        },
        [dispatch, router, state]
    );

    useEffect(() => {
        updateNextAvailable();
    }, [
        state.order,
        state.payment,
        state.personalInformation,
        state.selectedEvent,
        updateNextAvailable
    ]);

    useEffect(() => {
        if (!router.isReady) return;
        const { orderId, event } = router.query;

        updateNextAvailable();

        if (orderId && orderId !== "") {
            getStoreWithOrderId(orderId)
                .then(({ personalInformation, order, eventId }) => {
                    console.log(personalInformation);
                    dispatch(setOrder(order));
                    dispatch(setEvent(eventId));
                    dispatch(setUserId(personalInformation.userId));
                    dispatch(setEmail(personalInformation.email));
                    dispatch(setShipping(personalInformation.shipping));
                    dispatch(setAddress(personalInformation.address));
                })
                .catch(() => {
                    router.push(STEP_URLS[0]).catch(console.log);
                });
            return;
        }
        if (event && event !== "") {
            dispatch(setEvent(parseInt(event as string)));
            return;
        }
        if (currentSelectedEvent >= 0) return;
        if (router.pathname === STEP_URLS[0]) return;
        router.push(STEP_URLS[0]).catch(console.log);
    }, [router.isReady, currentSelectedEvent, dispatch, router, updateNextAvailable]);

    const variants = {
        visible: { x: 0 },
        exit: (direction) => {
            return { x: direction < 0 ? "100vw" : "-100vw" };
        },
        initial: (direction) => {
            return { x: direction < 0 ? "-100vw" : "100vw" };
        }
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
    );
};
