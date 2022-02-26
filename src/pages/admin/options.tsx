import { AdminLayout } from "../../components/admin/layout";
import { getAdminServerSideProps } from "../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../constants/interfaces";
import { getAllOptions} from "../../lib/options";
import { Options as OptionsEnum } from "../../constants/Constants";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box, Button, Link,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { SelectionList } from "../../components/admin/SelectionList";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import { useRouter } from "next/router";
import { ShippingType } from "../../store/factories/shipping/ShippingFactory";
import { SaveButton } from "../../components/admin/SaveButton";
import ContentPasteGoIcon from '@mui/icons-material/ContentPaste';
import dynamic from "next/dynamic";

const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

export default function Options({options, permissionDenied}) {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [paymentProviders, setPaymentProviders] = useState([]);
    const [shippingProviders, setShippingProviders] = useState([]);
    const [theme, setTheme] = useState({})
    const router = useRouter();

    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (permissionDenied) return;
        setTitle(options[OptionsEnum.ShopTitle]);
        setSubtitle(options[OptionsEnum.ShopSubtitle]);
        setPaymentProviders(options[OptionsEnum.PaymentProviders]);
        setShippingProviders(options[OptionsEnum.Delivery]);
        setTheme(options[OptionsEnum.Theme] ?? {});
    }, [options]);

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    const storeSetting = async (key: string, value: any) => {
        await axios.post("/api/admin/options", {
            key,
            value
        });
    }

    const handleSaveGeneral = async () => {
        try {
            await storeSetting(OptionsEnum.ShopTitle, title);
            await storeSetting(OptionsEnum.ShopSubtitle, subtitle);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

    const handleSavePayment = async () => {
        try {
            await storeSetting(OptionsEnum.PaymentProviders, paymentProviders);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

    const handleSaveShipping = async () => {
        try {
            await storeSetting(OptionsEnum.Delivery, shippingProviders);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

    const handleGetThemeFromClipboard = async () => {
        const clipboard = await navigator.clipboard.readText();
        console.log(clipboard);
        const validJson = clipboard
            .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ') // add
            .replaceAll("'", "\"")
            .replace(/\,(?!\s*?[\{\[\"\'\w])/g, '');
        setTheme(JSON.parse(validJson));
    };

    const handleSaveTheme = async () => {
        try {
            await storeSetting(OptionsEnum.Theme, theme);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            });
        }
    }

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Options</Typography>
                <Accordion>
                    <AccordionSummary id={"accordion-general"}>
                        General
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            <TextField
                                label={"Ticketshop Title"}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                id={"shop-title-input"}
                            />
                            <TextField
                                label={"Ticketshop Subtitle"}
                                value={subtitle}
                                onChange={(event) => setSubtitle(event.target.value)}
                                id={"shop-subtitle-input"}
                            />
                            <SaveButton
                                action={handleSaveGeneral}
                                id={"general-save"}
                                onComplete={refreshProps}
                            >
                                Save
                            </SaveButton>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary id={"accordion-payment"}>
                        Payment
                    </AccordionSummary>
                    <AccordionDetails id={"accordion-payment-details"}>
                        <Stack spacing={2}>
                            <SelectionList
                                options={Object.entries(PaymentType).map(option => {
                                    return {
                                        value: option[1],
                                        primaryLabel: option[0].replace(/([A-Z])/g, ' $1')
                                    };
                                })}
                                selection={paymentProviders}
                                onChange={(newValue) => setPaymentProviders(newValue)}
                                header={"Available Payment Providers"}
                                style={{
                                    flexGrow: 1,
                                    overflow: "visible",
                                    height: "fit-content"
                                }}
                            />
                            <SaveButton
                                action={handleSavePayment}
                                id={"payment-save"}
                                onComplete={refreshProps}
                            >
                                Save
                            </SaveButton>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary id={"accordion-delivery"}>
                        Delivery
                    </AccordionSummary>
                    <AccordionDetails id={"accordion-delivery-details"}>
                        <Stack spacing={2}>
                            <SelectionList
                                options={Object.entries(ShippingType).map(option => {
                                    return {
                                        value: option[1],
                                        primaryLabel: option[0].replace(/([A-Z])/g, ' $1')
                                    };
                                })}
                                selection={shippingProviders}
                                onChange={(newValue) => setShippingProviders(newValue)}
                                header={"Available Delivery Methods"}
                                style={{
                                    flexGrow: 1,
                                    overflow: "visible",
                                    height: "fit-content"
                                }}
                            />
                            <SaveButton
                                action={handleSaveShipping}
                                onComplete={refreshProps}
                                id={"delivery-save"}
                            >
                                Save
                            </SaveButton>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary id={"accordion-theme"}>
                        Theme
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Here you can edit the default theme of the shop page.
                            To do so, overwrite all desired values as described&nbsp;
                            <Link href="https://mui.com/customization/theming/#theme-configuration-variables" target="_blank">here.</Link>
                            Alternatively you can use a&nbsp;
                            <Link href="https://bareynol.github.io/mui-theme-creator" target="_blank">theme creator</Link>
                            and paste the configuration using the button below
                            (hint: only copy the JSON starting from equal sign until the semicolon in the last line).
                        </Typography>
                        <Button
                            onClick={handleGetThemeFromClipboard}
                            fullWidth
                            startIcon={<ContentPasteGoIcon />}
                            id={"get-theme-from-clipboard"}
                        >
                            Get From Clipboard
                        </Button>
                        <ReactJson
                            src={theme}
                            onEdit={(edit) => setTheme(edit.updated_src)}
                            onAdd={(edit) => setTheme(edit.updated_src)}
                            onDelete={(edit) => setTheme(edit.updated_src)}
                            name={false}
                        />
                        <SaveButton
                            action={handleSaveTheme}
                            onComplete={refreshProps}
                            fullWidth
                            id={"theme-save"}
                        >
                            Save
                        </SaveButton>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </AdminLayout>
    )
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(
        context,
        async () => {
            const options = await getAllOptions();
            return {
                props: {
                    options
                }
            };
        },
        {
            permission: PermissionSection.Options,
            permissionType: PermissionType.Read
        }
    );
}
