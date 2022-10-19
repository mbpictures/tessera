import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    AppBar,
    Button,
    Dialog,
    Grid,
    IconButton,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { SeatSelectionRowEditor } from "../SeatMapEditor/SeatSelectionRowEditor";
import { Seat } from "../../seatselection/seatmap/SeatMapSeat";
import { SeatMap } from "../../seatselection/seatmap/SeatSelectionMap";
import axios from "axios";
import { useSnackbar } from "notistack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/system";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const isJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

export const SeatMapDialog = ({ seatmap, onClose, categories, onChange }) => {
    const [seatmapDefinition, setSeatmapDefinition] = useState<SeatMap>([]);
    const [scale, setScale] = useState<number>(1);
    const container = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const { enqueueSnackbar } = useSnackbar();
    const uploadElement = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (seatmap == null) return;
        setSeatmapDefinition(isJson(seatmap.definition) ? JSON.parse(seatmap.definition) : [])
    }, [seatmap]);

    const rescale = () => {
        if (!content.current || !container.current) return;
        const maxWidth = container.current.clientWidth;
        const maxHeight = container.current.clientHeight;
        const width = content.current.clientWidth;
        const height = content.current.clientHeight;
        setScale(Math.min(width / maxWidth, height / maxHeight));
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

    const copySeatmapDefinition = (): SeatMap => {
        return seatmapDefinition.map((row) =>
            row.map((seat) => {
                return { ...seat };
            })
        );
    };

    const handleAddSeat = (rowIndex: number, seat: Seat, index: number) => {
        const newSeatmapDefinition = copySeatmapDefinition();
        newSeatmapDefinition[rowIndex].splice(index, 0, seat);
        setSeatmapDefinition(newSeatmapDefinition);
    };

    const handleDeleteSeat = (seat: Seat, indexInRow, isSelected: boolean, rowIndex) => {
        if (!isSelected) return;
        let newSeatmapDefinition = copySeatmapDefinition();
        newSeatmapDefinition[rowIndex].splice(indexInRow, 1);
        setSeatmapDefinition(newSeatmapDefinition);
    };

    const handleSave = async () => {
        try {
            await axios.put("/api/admin/seatmap/" + seatmap.id, {
                definition: seatmapDefinition
            });
            enqueueSnackbar("Successfully saved seat map", {
                variant: "success"
            });
            onChange();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete("/api/admin/seatmap/" + seatmap.id);
            onChange();
            onClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const exportJson = () => {
        const blob = new Blob([JSON.stringify(seatmapDefinition, null, 4)], {
            type: "text/plain"
        });
        const tempLink = document.createElement("a");
        tempLink.href = URL.createObjectURL(blob);
        tempLink.setAttribute("download", "Seatmap.json");
        tempLink.click();
    };

    const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
        const imported = await event.target.files[0].text();
        setSeatmapDefinition(JSON.parse(imported) as SeatMap);
        uploadElement.current.value = "";
        enqueueSnackbar("JSON imported successfully!", { variant: "success" });
    };

    const handleAddRow = () => {
        const newSeatmap = copySeatmapDefinition();
        newSeatmap.push([]);
        setSeatmapDefinition(newSeatmap);
    };

    if (!seatmap) return null;

    return (
        <Dialog open={true} fullScreen>
            <AppBar sx={{ position: "relative" }}>
                <Toolbar>
                    <Typography
                        sx={{ ml: 2, flex: 1 }}
                        variant="h6"
                        component="div"
                    >
                        Edit Seat Map
                    </Typography>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={onClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Grid container style={{ maxHeight: "100%" }} flexGrow={1}>
                <Grid
                    item
                    md={12}
                    lg={8}
                    ref={container}
                >
                    <TransformWrapper
                        centerOnInit
                        centerZoomedOut
                        minScale={scale}
                        limitToBounds
                    >
                        <TransformComponent
                            wrapperStyle={{ width: "100%", height: "100%" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                                ref={content}
                            >
                                {seatmapDefinition.map((row, index) => {
                                    return (
                                        <SeatSelectionRowEditor
                                            key={`row${index}`}
                                            row={row}
                                            categories={categories}
                                            onSelectSeat={(seat, indexInRow, isSelected) => handleDeleteSeat(seat, indexInRow, isSelected, index)}
                                            onAddSeat={(seat, seatIndex) =>
                                                handleAddSeat(
                                                    index,
                                                    seat,
                                                    seatIndex
                                                )
                                            }
                                        />
                                    );
                                })}
                                <Button onClick={handleAddRow}>Add Row</Button>
                            </div>
                        </TransformComponent>
                    </TransformWrapper>
                </Grid>
                <Grid item xs={12} md={12} lg={4}>
                    <Stack p={2}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Import/Export</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack>
                                    <Button onClick={exportJson}>
                                        <FileDownloadIcon /> Export to JSON
                                    </Button>
                                    <input
                                        accept="application/json"
                                        id="upload-json"
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={importJson}
                                        ref={uploadElement}
                                    />
                                    <label htmlFor="upload-json">
                                        <Button
                                            color="secondary"
                                            component="span"
                                            fullWidth
                                        >
                                            <FileUploadIcon /> Upload JSON
                                        </Button>
                                    </label>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Categories</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack>
                                    {categories.map((category) => {
                                        return (
                                            <Stack
                                                direction={"row"}
                                                key={category.id}
                                            >
                                                <Box
                                                    height={20}
                                                    width={20}
                                                    bgcolor={category.color}
                                                />
                                                <Typography>
                                                    {category.label}
                                                </Typography>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                        <Button fullWidth onClick={handleSave}>
                            Save Seat Map
                        </Button>
                        <Button
                            fullWidth
                            onClick={handleDelete}
                            color={"error"}
                        >
                            Delete Seat Map
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Dialog>
    );
};
