import {
    Button,
    Card, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack, Tooltip, tooltipClasses, TooltipProps,
    Typography, useMediaQuery
} from "@mui/material";
import { SelectionList } from "../components/admin/SelectionList";
import { useEffect, useState } from "react";
import style from "../style/Refund.module.scss";
import { Box, useTheme } from "@mui/system";
import { getOption } from "../lib/options";
import { Options } from "../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";
import { formatPrice } from "../constants/util";
import useTranslation from "next-translate/useTranslation";
import { LanguageSelection } from "../components/LanguageSelection";
import { useRouter } from "next/router";
import axios from "axios";
import { SuccessAnimated } from "../components/SuccessAnimated";
import InfoIcon from '@mui/icons-material/Info';
import { SaveButton } from "../components/admin/SaveButton";
import { styled } from '@mui/material/styles';

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        fontSize: theme.typography.pxToRem(15)
    },
}));

export default function Payment({currency}) {
    const router = useRouter();
    const {t} = useTranslation("refund");
    const [ticketList, setTicketList] = useState([]);
    const [selection, setSelection] = useState<any[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const theme = useTheme();

    const getURL = () => {
        const query = new URLSearchParams({
            ...(router.query.orderId && ({orderId: router.query.orderId as string})),
            ...(router.query.secret && ({secret: router.query.secret as string}))
        });
        return `/api/cancellation?${query}`;
    }

    useEffect(() => {
        if (!router.isReady) return;
        const loadData = async () => {
            try {
                const response = await axios.get(getURL());
                const tickets = response.data.map(ticket => ({
                    primaryLabel: ticket.category.label,
                    secondaryLabel: ticket.seatId && t("common:seat", {seat: ticket.seatId}),
                    value: ticket.id,
                    additionalNode: formatPrice(ticket.category.price, currency),
                    price: ticket.category.price
                }));
                setTicketList(tickets);
            } catch (e) {
                if (e.response.status === 404) {
                    setError({
                        title: "not-found-title",
                        content: "not-found-content"
                    })
                }
                else if (e.response.status === 401) {
                    setError({
                        title: "unauthorized-title",
                        content: "unauthorized-content"
                    })
                }
                else if (e.response.status === 400) {
                    setError({
                        title: "parameter-missing-title",
                        content: "parameter-missing-content"
                    })
                }
            } finally {
                setLoading(false);
            }
        };

        loadData().catch(console.log);
    }, [router.isReady, router.query]);

    const handleSend = async () => {
        await axios.post(getURL(), {
            tickets: selection
        });
        setConfirmOpen(false);
        setSubmitted(true);
    }

    const totalRefundAmount = ticketList
        .filter(t => selection.includes(t.value))
        .reduce((agg, val) => agg + val.price, 0);

    const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

    return (
        <>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>
                    {t("confirm-title")}
                    <CustomTooltip title={t("confirm-info")} sx={{fontSize: 12}}>
                        <InfoIcon
                            color={"primary"}
                            style={{ position: "absolute", top: 8, right: 8 }}
                        />
                    </CustomTooltip>
                </DialogTitle>
                <DialogContent dangerouslySetInnerHTML={{__html: t("confirm-description")}} />
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>{t("confirm-cancel")}</Button>
                    <SaveButton color={"error"} action={handleSend}>{t("confirm-accept")}</SaveButton>
                </DialogActions>
            </Dialog>
            <Grid
                container
                justifyContent={"center"}
                alignItems={"center"}
                height={"100%"}
                className={style.background}
                style={{
                    backgroundImage: `linear-gradient(138deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }}
            >
                <Grid item lg={6} md={12} xs={12} p={2}>
                    <Card sx={{borderRadius: 5}}>
                        <Stack spacing={2} p={2} maxHeight={"calc(90vh - 70px)"}>
                            {
                                submitted ? (
                                    <>
                                        <SuccessAnimated style={{alignSelf: "center"}} />
                                        <Typography textAlign={"center"} variant={"h5"}>
                                            {t("canceled-successfully")}
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        {
                                            loading && (
                                                <>
                                                    <Box display={"flex"} justifyContent={"center"}>
                                                        <CircularProgress />
                                                    </Box>
                                                    <Typography textAlign={"center"}>
                                                        {t("loading-order")}
                                                    </Typography>
                                                </>
                                            )
                                        }
                                        {
                                            !error && ticketList && !loading && (
                                                <>
                                                    <Typography variant={"h2"} textAlign={"center"}>
                                                        {t("title")}
                                                    </Typography>
                                                    <Typography textAlign={"center"} variant={"h5"}>
                                                        {t("subtitle")}
                                                    </Typography>
                                                    <SelectionList
                                                        options={ticketList}
                                                        selection={selection}
                                                        onChange={newSelection => setSelection(newSelection)}
                                                        header={null}
                                                    />
                                                    <Typography textAlign={"center"} dangerouslySetInnerHTML={{__html: t("amount-of-refund", {amount: formatPrice(totalRefundAmount, currency)})}} />
                                                    {
                                                        selection.length === ticketList.length && (
                                                            <Typography textAlign={"center"}>
                                                                {t("cancel-whole-order")}
                                                            </Typography>
                                                        )
                                                    }
                                                    <Button color={"error"} variant={"outlined"} disabled={totalRefundAmount <= 0} onClick={() => setConfirmOpen(true)}>
                                                        {t("submit")}
                                                    </Button>
                                                </>
                                            )
                                        }
                                        {
                                            error && !loading && (
                                                <>
                                                    <Typography variant={"h2"} textAlign={"center"}>
                                                        {t(error.title)}
                                                    </Typography>
                                                    <Typography textAlign={"center"} variant={"h5"}>
                                                        {t(error.content)}
                                                    </Typography>
                                                </>
                                            )
                                        }
                                    </>
                                )
                            }
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
            <Card
                sx={{
                    position: "absolute",
                    bottom: 0,
                    right: isLgUp ? 0 : "50%",
                    p: 1,
                    height: 60,
                    display: "flex",
                    ...(!isLgUp && ({transform: "translateX(50%)"}))
                }}
            >
                <LanguageSelection />
            </Card>
        </>
    );
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            currency: await getOption(Options.Currency),
            ...(await loadNamespaces({ locale, pathname: '/refund' }))
        }
    };
}