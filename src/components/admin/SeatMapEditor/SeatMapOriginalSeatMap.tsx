import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { SaveButton } from "../SaveButton";

export const SeatMapOriginalSeatMap = ({seatmap}) => {
    const [seatMapFile, setSeatMapFile] = useState(null);
    const [deleted, setDeleted] = useState(false);

    const handleFileChange = (event) => {
        setSeatMapFile(event.target.files[0]);
        setDeleted(false);
    }

    const handleDelete = async () => {
        await axios.delete("/api/admin/seatmap/preview/" + seatmap.id);
        setSeatMapFile(null);
        setDeleted(true);
    };

    const handleSave = async () => {
        if (!seatMapFile) return;
        const fileData = new FormData();
        fileData.append('file', seatMapFile);
        await axios.post("/api/admin/seatmap/preview/" + seatmap.id, fileData);
        setSeatMapFile(null);
    }

    const seatMapDataUrl = seatMapFile && URL.createObjectURL(seatMapFile);

    return (
        <Stack>
            {
                (seatmap.containsPreview || seatMapDataUrl) && !deleted ? (
                    seatMapDataUrl ? (
                        <object data={seatMapDataUrl} width={"100%"} />
                    ) : (
                        <object data={`/api/seatmap_preview/${seatmap.id}`} width={"100%"} />
                    )
                ) : (
                    <Typography>
                        No original seat map uploaded yet
                    </Typography>
                )
            }
            <input
                type="file"
                style={{display: "none"}}
                onChange={handleFileChange}
                id={"seat-map-original-file"}
            />
            <label htmlFor="seat-map-original-file">
                <Button component="span" fullWidth color={"secondary"}>
                    Upload
                </Button>
            </label>
            <SaveButton action={handleSave} disabled={seatMapFile === null}>
                Save
            </SaveButton>
            <Button onClick={handleDelete} color={"error"}>
                Delete
            </Button>
        </Stack>
    )
};
