import { AppBar, Checkbox, Dialog, FormControlLabel, IconButton, Link, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Trans from "next-translate/Trans";
import CloseIcon from "@mui/icons-material/Close";
import useTranslation from "next-translate/useTranslation";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectPayment, setGtcAccepted } from "../../store/reducers/paymentReducer";
import { useTheme } from "@mui/system";

export const AcceptGTC = () => {
    const theme = useTheme();
    const payment = useAppSelector(selectPayment);
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState<string | null>(null);
    const [data, setData] = useState({});
    const [type, setType] = useState(null);
    const {t} = useTranslation();

    useEffect(() => {
        if (open === null || data[open]) return;
        const loadData = async () => {
            const response = await axios.get("/api/gtc?type=" + open, {
                responseType: "blob"
            });
            setType(response.headers["content-type"]);
            setData((oldData) => ({...oldData, [open]: URL.createObjectURL(response.data)}));
        };
        loadData().catch(console.log);
    }, [open]);

    let objectElement;
    if (open !== null) {
        const css = document.createElement("style");
        css.append(document.createTextNode(`body { font-family: ${(theme.typography as any).fontFamily}; }`));
        objectElement = <object data={data[open]} type={type} style={{height: "100%", width: "100%"}} onLoad={(event) => event.currentTarget.contentDocument.head.appendChild(css)} />
    }

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
                            {open === "gtc" ? t("payment:gtc-header") : t("payment:privacy-header")}
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
                {objectElement}
            </Dialog>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={payment.gtcAccepted}
                        onChange={(event) => dispatch(setGtcAccepted(event.target.checked))}
                    />
                }
                label={
                    <Trans
                        i18nKey="payment:accept-gtc"
                        components={{
                            linkGTC: <Link
                                onClick={(event) => {
                                    event.preventDefault();
                                    setOpen("gtc")
                                }}
                                style={{cursor: "pointer"}}
                            />,
                            linkPrivacy: <Link
                                onClick={(event) => {
                                    event.preventDefault();
                                    setOpen("privacy")
                                }}
                                style={{cursor: "pointer"}}
                            />
                        }}
                    />
                }
            />
        </>
    )
};
