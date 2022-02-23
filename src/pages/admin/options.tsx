import { AdminLayout } from "../../components/admin/layout";
import { getAdminServerSideProps } from "../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../constants/interfaces";
import { getAllOptions} from "../../lib/options";
import { Options as OptionsEnum } from "../../constants/Constants";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
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

export default function Options({options, permissionDenied}) {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [paymentProviders, setPaymentProviders] = useState([]);
    const [shippingProviders, setShippingProviders] = useState([]);
    const router = useRouter();

    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (permissionDenied) return;
        setTitle(options[OptionsEnum.ShopTitle]);
        setSubtitle(options[OptionsEnum.ShopSubtitle]);
        setPaymentProviders(options[OptionsEnum.PaymentProviders]);
        setShippingProviders(options[OptionsEnum.Delivery]);
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
            await refreshProps();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

    const handleSavePayment = async () => {
        try {
            await storeSetting(OptionsEnum.PaymentProviders, paymentProviders);
            await refreshProps();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

    const handleSaveShipping = async () => {
        try {
            await storeSetting(OptionsEnum.Delivery, shippingProviders);
            await refreshProps();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.reponse?.data ?? e.message), {
                variant: "error"
            })
        }
    };

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
                            <Button
                                onClick={handleSaveGeneral}
                                id={"general-save"}
                            >
                                Save
                            </Button>
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
                            <Button
                                onClick={handleSavePayment}
                                id={"payment-save"}
                            >
                                Save
                            </Button>
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
                            <Button
                                onClick={handleSaveShipping}
                                id={"delivery-save"}
                            >
                                Save
                            </Button>
                        </Stack>
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
