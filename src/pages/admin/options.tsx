import { AdminLayout } from "../../components/admin/layout";
import { getAdminServerSideProps } from "../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../constants/interfaces";
import { getAllOptions} from "../../lib/options";
import { OptionLabels, Options as OptionsEnum, STEP_URLS } from "../../constants/Constants";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box, Button, IconButton, InputAdornment, Link, List, ListItem, ListItemText,
    Stack,
    TextField, Tooltip,
    Typography
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { SelectionList } from "../../components/admin/SelectionList";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import { useRouter } from "next/router";
import { ShippingType } from "../../store/factories/shipping/ShippingFactory";
import { SaveButton } from "../../components/admin/SaveButton";
import ContentPasteGoIcon from '@mui/icons-material/ContentPaste';
import dynamic from "next/dynamic";
import { TextInputDialog } from "../../components/TextInputDialog";
import { TextfieldList } from "../../components/admin/TextfieldList";
import PercentIcon from '@mui/icons-material/Percent';
import PreviewIcon from '@mui/icons-material/Preview';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { TemplatePreview } from "../../components/admin/dialogs/TemplatePreview";

const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

export default function Options({options, permissionDenied}) {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [paymentProviders, setPaymentProviders] = useState([]);
    const [taxAmount, setTaxAmount] = useState(0);
    const [shippingProviders, setShippingProviders] = useState([]);
    const [bankInformation, setBankInformation] = useState([]);
    const [shippingFees, setShippingFees] = useState({});
    const [paymentFees, setPaymentFees] = useState({});
    const [theme, setTheme] = useState({})
    const [inputThemeOpen, setInputThemeOpen] = useState(false);
    const [templateFiles, setTemplateFiles] = useState<Partial<Record<OptionsEnum, Blob>>>({});
    const [templatePreview, setTemplatePreview] = useState(null);
    const [invoiceNumber, setInvoiceNumber] = useState(1);
    const router = useRouter();

    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (permissionDenied) return;
        setTitle(options[OptionsEnum.ShopTitle] ?? "");
        setSubtitle(options[OptionsEnum.ShopSubtitle] ?? "");
        setPaymentProviders(options[OptionsEnum.PaymentProviders] ?? []);
        setShippingProviders(options[OptionsEnum.Delivery] ?? []);
        setTheme(options[OptionsEnum.Theme] ?? {});
        setBankInformation(options[OptionsEnum.PaymentDetails] ?? []);
        setTaxAmount(options[OptionsEnum.TaxAmount] ?? 0);
        setShippingFees(options[OptionsEnum.PaymentFeesShipping] ?? {});
        setPaymentFees(options[OptionsEnum.PaymentFeesPayment] ?? {});
        setInvoiceNumber(options[OptionsEnum.InvoiceNumber] ?? 1);
    }, [options, permissionDenied]);

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
            await storeSetting(OptionsEnum.PaymentDetails, bankInformation);
            await storeSetting(OptionsEnum.TaxAmount, taxAmount);
            await storeSetting(OptionsEnum.PaymentFeesPayment, paymentFees);
            await storeSetting(OptionsEnum.InvoiceNumber, invoiceNumber);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

    const handleSaveShipping = async () => {
        try {
            await storeSetting(OptionsEnum.Delivery, shippingProviders);
            await storeSetting(OptionsEnum.PaymentFeesShipping, shippingFees);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

    const applyTheme = (theme: string) => {
        const validJson = theme
            .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ') // add
            .replaceAll("'", "\"")
            .replace(/\,(?!\s*?[\{\[\"\'\w])/g, '');
        try {
            const json = JSON.parse(validJson);
            setTheme(json);
        } catch (e) {
            enqueueSnackbar("JSON not parseable", {variant: "error"});
        }
    };

    const handleObjectChange = (object, key, value, setter) => {
        const newObject = Object.assign({}, object);
        newObject[key] = value;
        setter(newObject);
    }

    const handleGetThemeFromClipboard = async () => {
        const clipboard = await navigator.clipboard.readText();
        applyTheme(clipboard);
    };

    const handleSaveTheme = async () => {
        try {
            await storeSetting(OptionsEnum.Theme, theme);
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const handleForceRevalidate = async () => {
        try {
            await axios.post("api/admin/revalidate?events=true", STEP_URLS.filter(step => step !== "/seatselection/[id]"));
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            });
        }
    }

    const handleChangeTemplate = (key) => (event: ChangeEvent<HTMLInputElement>) => {
        setTemplateFiles({
            ...templateFiles,
            [key]: event.target.files[0]
        })
    }

    const handleSaveTemplates = async () => {
        for (let file of Object.entries(templateFiles)) {
            const fileData = new FormData();
            fileData.append('file', file[1]);
            await axios.post("/api/admin/options/data/" + file[0], fileData);
        }
        await refreshProps();
    };

    const downloadTemplate = (key) => {
        window.location.href = window.location.origin + "/api/admin/options/data/" + key;
    }

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <TextInputDialog
                open={inputThemeOpen}
                onTextInput={applyTheme}
                onClose={() => setInputThemeOpen(false)}
                title="Enter Theme in JSON format"
                placeholder="JSON Theme"
            />
            <TemplatePreview
                activeTemplatePreview={templatePreview}
                localFiles={templateFiles}
                onClose={() => setTemplatePreview(null)}
            />
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
                                        primaryLabel: option[0].replace(/([A-Z])/g, ' $1'),
                                        additionalNode: (
                                            <TextField
                                                onChange={(event) => handleObjectChange(paymentFees, option[1], parseFloat(event.target.value), setPaymentFees)}
                                                value={paymentFees[option[1]]}
                                                label={"Service Fees (negative mean savings)"}
                                                type={"number"}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )
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
                            {
                                paymentProviders.includes(PaymentType.Invoice) && (
                                    <TextfieldList
                                        values={bankInformation}
                                        onChange={setBankInformation}
                                        header={"Bank Information"}
                                    />
                                )
                            }
                            <TextField
                                type={"number"}
                                label="Tax Amount"
                                value={taxAmount}
                                onChange={(event) => setTaxAmount(parseFloat(event.target.value))}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <PercentIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                type={"number"}
                                label="Invoice Number"
                                value={invoiceNumber}
                                onChange={(event) => setInvoiceNumber(parseInt(event.target.value))}
                                helperText={
                                    <>
                                        This number represents the number of the last invoice sent (it increases automatically, everytime an invoice is generated). It can be edited manually to make it fit your invoice numbers generated from other sources. The next invoice will have the number <b>{invoiceNumber + 1}</b>. To start with one, please enter 0 in the text field.
                                    </>
                                }
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
                                        primaryLabel: option[0].replace(/([A-Z])/g, ' $1'),
                                        additionalNode: (
                                            <TextField
                                                onChange={(event) => handleObjectChange(shippingFees, option[1], parseFloat(event.target.value), setShippingFees)}
                                                value={shippingFees[option[1]]}
                                                label={"Service Fees (negative mean savings)"}
                                                type={"number"}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )
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
                        <Typography>
                            If your browser doesn&apos;t support clipboard usage, you can enter the JSON theme using this button.
                        </Typography>
                        <Button
                            onClick={() => setInputThemeOpen(true)}
                            id={"enter-theme-input-dialog"}
                            fullWidth
                        >
                            Open Theme Input
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
                <Accordion>
                    <AccordionSummary>
                        Templates
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            {
                                [OptionsEnum.TemplateConfirmEmail, OptionsEnum.TemplateInvoice, OptionsEnum.TemplateTicket].map(value => {
                                    const templateAvailable = Object.keys(options).filter(option => options[option]).includes(value);
                                    const templateToUpload = Object.keys(templateFiles).includes(value);
                                    return (
                                        <ListItem key={value}>
                                            <ListItemText
                                                primary={OptionLabels[value]}
                                                secondary={templateAvailable ? "Template uploaded" : (templateToUpload ? "Template not saved" : "Template not set yet")}
                                            />
                                            {
                                                (templateAvailable || templateToUpload) && (
                                                    <IconButton color={"primary"} onClick={() => setTemplatePreview(value)}>
                                                        <PreviewIcon />
                                                    </IconButton>
                                                )
                                            }
                                            <input
                                                id={`upload-${value}`}
                                                type="file"
                                                style={{ display: "none" }}
                                                onChange={handleChangeTemplate(value)}
                                            />
                                            <label htmlFor={`upload-${value}`}>
                                                <IconButton component="span">
                                                    <FileUploadIcon />
                                                </IconButton>
                                            </label>
                                            {
                                                templateAvailable && (
                                                    <IconButton onClick={() => downloadTemplate(value)}>
                                                        <DownloadIcon />
                                                    </IconButton>
                                                )
                                            }
                                        </ListItem>
                                    )
                                })
                            }
                        </List>
                        <SaveButton action={handleSaveTemplates} fullWidth>
                            Save
                        </SaveButton>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary id={"accordion-theme"}>
                        Advanced
                    </AccordionSummary>
                    <AccordionDetails>
                        <Tooltip title={"Usefully when using a fresh build of the ticketshop with an already used database or when changes made aren't visible in ticketshop."}>
                            <SaveButton action={handleForceRevalidate} fullWidth>
                                Revalidate all pages
                            </SaveButton>
                        </Tooltip>
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
