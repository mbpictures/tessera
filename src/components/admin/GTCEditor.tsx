import React, { useEffect, useState } from "react";
import { AppBar, Button, Dialog, IconButton, Toolbar, Typography } from "@mui/material";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import axios from "axios";
import dynamic from "next/dynamic";
import CloseIcon from "@mui/icons-material/Close";
import { convertToHTML, convertFromHTML } from 'draft-convert';
import { EditorState } from "draft-js";
import SaveIcon from '@mui/icons-material/Save';
import { Options } from "../../constants/Constants";
import { Box } from "@mui/system";

const Editor = dynamic<any>(() =>
    import("react-draft-wysiwyg").then((mod) => mod.Editor),
    { ssr: false }
)

export const GTCEditor = () => {
    const [open, setOpen] = useState<string | null>(null);
    const [data, setData] = useState(EditorState.createEmpty());

    useEffect(() => {
        if (!open) return;
        const loadData = async () => {
            const response = await axios.get("/api/gtc?type=" + open, {
                responseType: "blob"
            });
            const text = await response.data.text();
            setData(EditorState.push(EditorState.createEmpty(), convertFromHTML(text)));
        };
        loadData().catch(console.log);
    }, [open]);

    const handleSave = async () => {
        await axios.post("/api/admin/options/data/" + (open === "privacy" ? Options.Privacy : Options.GTC), {
            data: convertToHTML(data?.getCurrentContent()),
            type: "text/html"
        });
        setOpen(null);
    };

    return (
        <>
            <Dialog open={open !== null} onClose={() => setOpen(null)} fullScreen>
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <Typography
                            sx={{ ml: 2, flex: 1 }}
                            variant="h6"
                            component="div"
                        >
                            Edit Terms and Conditions
                        </Typography>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setOpen(null)}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box p={2} height={"90%"}>
                    <Editor
                        editorState={data}
                        onEditorStateChange={setData}
                        toolbarCustomButtons={[
                            <Button onClick={handleSave} key="save-button">
                                <SaveIcon /> Save
                            </Button>
                        ]}
                        wrapperStyle={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column"
                        }}
                        editorStyle={{
                            flex: "1 1 auto",
                            border: "1px solid #F1F1F1"
                        }}
                    />
                </Box>
            </Dialog>
            <Button onClick={() => setOpen("gtc")} fullWidth>
                Open GTC
            </Button>
            <Button onClick={() => setOpen("privacy")} fullWidth>
                Open Privacy Policy
            </Button>
        </>
    )
};
