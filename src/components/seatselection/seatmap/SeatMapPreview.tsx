import { AppBar, Dialog, IconButton, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@mui/system";
import CloseIcon from '@mui/icons-material/Close';
import useTranslation from "next-translate/useTranslation";

export const SeatMapPreview = ({open, onClose, id}) => {
    const [data, setData] = useState(null);
    const [type, setType] = useState<string | null>(null);
    const {t} = useTranslation();

    useEffect(() => {
        if (data || !id) return;
        const loadData = async () => {
            const response = await axios.get("/api/seatmap_preview/" + id, {
                responseType: "blob"
            });
            setType(response.headers["content-type"]);
            setData(URL.createObjectURL(response.data));
        };
        loadData().catch(console.log);
    }, [id]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"lg"}>
            <AppBar sx={{ position: "relative" }}>
                <Toolbar>
                    <Typography
                        sx={{ ml: 2, flex: 1 }}
                        variant="h6"
                        component="div"
                    >
                        {t("seatselection:seat-map-preview")}
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
            <Box style={{width: "100%", maxHeight: "100%", alignSelf: "stretch", justifySelf: "stretch"}}>
                {
                    type?.startsWith("image/") ? (
                        <img
                            src={data}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                            alt={"Seat Map Preview"}
                        />
                    ) : (
                        <object
                            data={data}
                            type={type}
                            width={"100%"}
                            style={{
                                objectFit: "cover",
                                maxHeight: "80vh",
                                minHeight: "600px"
                            }}
                        />
                    )
                }
            </Box>
        </Dialog>
    )
}
