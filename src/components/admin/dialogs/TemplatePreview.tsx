import { AppBar, CircularProgress, Dialog, IconButton, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { OptionLabels } from "../../../constants/Constants";
import { Box } from "@mui/system";

function getLang() {
    if (navigator.languages != undefined)
        return navigator.languages[0];
    return navigator.language;
}

export const TemplatePreview = ({activeTemplatePreview, localFiles, onClose}) => {
    const [data, setData] = useState(null);
    const [type, setType] = useState(null);
    const [withDemoData, setWithDemoData] = useState(false);

    useEffect(() => {
        if (activeTemplatePreview === null) return;

        const loadData = async () => {
            if (Object.keys(localFiles).includes(activeTemplatePreview)) {
                setWithDemoData(false);
                setData(URL.createObjectURL(localFiles[activeTemplatePreview]));
                return;
            }

            const response = await axios.get("/api/admin/options/data/" + activeTemplatePreview + "?demo=true&locale=" + getLang(), {
                responseType: "blob"
            });
            setWithDemoData(true);
            setType(response.headers["content-type"]);
            setData(URL.createObjectURL(response.data));
        };

        loadData().catch(console.log);
    }, [localFiles, activeTemplatePreview]);

    return (
        <Dialog open={activeTemplatePreview !== null} fullScreen>
            <AppBar sx={{ position: "relative" }}>
                <Toolbar>
                    <Typography
                        sx={{ ml: 2, flex: 1 }}
                        variant="h6"
                        component="div"
                    >
                        Template preview ({activeTemplatePreview && OptionLabels[activeTemplatePreview]})
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
            {
                (activeTemplatePreview !== null && data !== null) && (
                    <>
                        <Typography textAlign={"center"} mt={2} mb={2}>
                            {
                                withDemoData ? (
                                    "Template filled with test data:"
                                ) : (
                                    "Template not filled with test data. No preview with test data, please save template before viewing preview."
                                )
                            }
                        </Typography>
                        <object type={type} data={data} style={{width: "100%", height: "100%"}} />
                    </>
                )
            }
            {
                (activeTemplatePreview !== null && data === null) && (
                    <Box width={"100%"} height={"100%"} justifyContent={"center"} alignItems={"center"} display={"flex"}>
                        <CircularProgress />
                    </Box>
                )
            }
        </Dialog>
    )
}
