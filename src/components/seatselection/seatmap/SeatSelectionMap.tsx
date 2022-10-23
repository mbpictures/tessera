import { SeatRow, SeatSelectionRow } from "./SeatSelectionRow";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Card, Grid, IconButton, useMediaQuery } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    OrderState,
    selectOrder, setTickets
} from "../../../store/reducers/orderReducer";
import { useEffect, useRef, useState } from "react";
import { Seat } from "./SeatMapSeat";
import { PaymentOverview } from "../../PaymentOverview";
import { useTheme } from "@mui/system";
import PreviewIcon from '@mui/icons-material/Preview';
import { SeatMapPreview } from "./SeatMapPreview";

export type SeatMap = Array<SeatRow>;

const getDimensions = (element: HTMLDivElement) => {
    const computedStyle = getComputedStyle(element);
    let elementHeight = element.clientHeight;
    let elementWidth = element.clientWidth;

    elementHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    elementWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

    return {width: elementWidth, height: elementHeight};
};

export const SeatSelectionMap = ({
    seatSelectionDefinition,
    categories,
    hideSummary,
    seatMapId,
    containsPreview
}: {
    seatSelectionDefinition: SeatMap;
    categories: Array<{
        id: number;
        label: string;
        price: number;
        currency: string;
    }>;
    hideSummary?: boolean;
    seatMapId?: number;
    containsPreview?: boolean;
}) => {
    const order = useAppSelector(selectOrder) as OrderState;
    const dispatch = useAppDispatch();
    const container = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number>(1);
    const [previewOpen, setPreviewOpen] = useState(false);
    const theme = useTheme();
    const isLgDown = useMediaQuery(theme.breakpoints.down("lg"));

    const rescale = () => {
        if (!content.current || !container.current) return;
        const {width: maxWidth, height: maxHeight} = getDimensions(container.current);
        const {width, height} = getDimensions(content.current);
        setScale(Math.min(maxWidth / width, maxHeight / height));
    };

    useEffect(() => {
        rescale();
    }, [container, content]);

    useEffect(() => {
        document.addEventListener("resize", rescale);
        return () => {
            document.removeEventListener("resize", rescale);
        };
    }, []);

    const createNewOrder = (): OrderState => {
        return {
            orderId: order.orderId,
            tickets: order.tickets.map((a) => a),
            ticketPersonalizationRequired: order.ticketPersonalizationRequired
        };
    };

    const addSeat = (seat: Seat) => {
        const newOrder: OrderState = createNewOrder();
        newOrder.tickets.push({
            categoryId: seat.category,
            amount: seat.amount ?? 1,
            seatId: seat.id
        });
        dispatch(setTickets(newOrder.tickets));
    };

    const removeSeat = (seat: Seat) => {
        const newOrder: OrderState = createNewOrder();
        newOrder.tickets.splice(
            newOrder.tickets.findIndex((s) => s.seatId === seat.id),
            1
        );
        dispatch(setTickets(newOrder.tickets));
    };

    const handleSelectSeat = (seat: Seat, indexInRow, isSelected: boolean) => {
        if (isSelected) {
            addSeat(seat);
            return;
        }
        removeSeat(seat);
    };

    return (
        <>
            <SeatMapPreview open={previewOpen} onClose={() => setPreviewOpen(false)} id={seatMapId} />
            <Grid container style={{ maxHeight: "100%", height: "100%" }}>
                <Grid
                    item
                    md={12}
                    lg={8}
                    style={{
                        maxWidth: isLgDown ? "100%": "66.66666%",
                        position: "relative",
                        width: "100%",
                        padding: isLgDown ? "10px 0" : "10px"
                    }}
                    ref={container}
                >
                    <TransformWrapper centerOnInit centerZoomedOut minScale={scale} limitToBounds>
                        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                            <div
                                style={{ display: "flex", flexDirection: "column" }}
                                ref={content}
                            >
                                {seatSelectionDefinition.map((row, index) => (
                                    <SeatSelectionRow
                                        key={`row${index}`}
                                        row={row}
                                        categories={categories}
                                        onSelectSeat={handleSelectSeat}
                                    />
                                ))}
                            </div>
                        </TransformComponent>
                    </TransformWrapper>
                    {
                        (containsPreview && !isLgDown) && (
                            <IconButton
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    transform: "translateY(-100%)",
                                    right: 0
                                }}
                                color={"primary"}
                                onClick={() => setPreviewOpen(true)}
                            >
                                <PreviewIcon fontSize={"large"} />
                            </IconButton>
                        )
                    }
                </Grid>
                {
                    !hideSummary && (
                        <Grid
                            item
                            xs={12}
                            md={12}
                            lg={4}
                            display="flex"
                            alignItems="center"
                            position={"relative"}
                        >
                            <Card style={{ flex: "1 1 auto", padding: "10px" }}>
                                <PaymentOverview categories={categories} displayColor />
                            </Card>
                            {
                                (containsPreview && isLgDown) && (
                                    <IconButton
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            zIndex: 100
                                        }}
                                        color={"primary"}
                                        onClick={() => setPreviewOpen(true)}
                                    >
                                        <PreviewIcon fontSize={"large"} />
                                    </IconButton>
                                )
                            }
                        </Grid>
                    )
                }
            </Grid>
        </>
    );
};
