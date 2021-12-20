import {SeatRow, SeatSelectionRow} from "./SeatSelectionRow";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import {Card, Grid} from "@mui/material";

export type SeatMap = Array<SeatRow>;

export const SeatSelectionMap = ({seatSelectionDefinition, categories}: {seatSelectionDefinition: SeatMap, categories: Array<{id: number, label: string, price: number}>}) => {
    return (
        <Grid container>
            <Grid item md={12} lg={8} style={{width: "100%"}}>
                <TransformWrapper centerOnInit centerZoomedOut>
                    <TransformComponent wrapperStyle={{width: "100%"}}>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            {
                                seatSelectionDefinition.map((row, index) => <SeatSelectionRow key={`row${index}`} row={row} categories={categories} />)
                            }
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </Grid>
            <Grid item md={12} lg={4} display="flex" alignItems="center">
                <Card style={{flex: "1 1 auto", padding: "10px"}}>
                    Hallo
                </Card>
            </Grid>
        </Grid>
    );
};
