import { getAdminServerSideProps } from "../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../constants/interfaces";
import { i18n } from "../../../next-i18next.config";
import { AdminLayout } from "../../components/admin/layout";
import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Table, TableBody,
    TableCell,
    TableHead,
    TableRow, TextField,
    Typography
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import { useRouter } from "next/router";
import { SaveButton } from "../../components/admin/SaveButton";

const createObjectFromList = (list, value) => {
    return list.reduce((result, key) => ({...result, [key]: Object.assign({}, value)}), {});
}

export default function Localization({localization, locales, defaultLocale, permissionDenied}) {
    const [state, setState] = useState<Record<string, Record<string, Record<string, string>>>>(Object.entries(localization).reduce((result, namespace) => ({...result, [namespace[0]]: createObjectFromList(Object.keys(namespace[1]), {})}), {}));
    const {enqueueSnackbar} = useSnackbar();
    const router = useRouter();

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    const handleChange = (namespace: string, locale: string, key: string, value: string) => {
        setState(prev => {
            prev[namespace][locale][key] = value;
            return prev;
        });
    };

    const handleSave = async () => {
        try {
            for (let namespace of Object.entries(state)) {
                for (let locale of Object.entries(namespace[1])) {
                    for (let key of Object.entries(locale[1])) {
                        await axios.post(`/api/admin/translation/${namespace[0]}/${key[0]}`, {
                            [locale[0]]: key[1]
                        });
                    }
                }
            }
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Localization</Typography>
                <Typography>Default Locale: {defaultLocale}</Typography>
                <Typography>Supported Locales: {locales.join(", ")}</Typography>
                <Box p={1} />
                {
                    Object.keys(localization).map((namespace) => (
                        <Accordion key={namespace}>
                            <AccordionSummary id={"namespace-" + namespace}>
                                Translation for namespace &nbsp;<b>{namespace}</b>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Key</TableCell>
                                            {
                                                locales.map((locale) => <TableCell key={locale}>{locale}{locale === defaultLocale && " (Default)"}</TableCell>)
                                            }
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            Object.keys(localization[namespace][defaultLocale]).map((key) => (
                                                <TableRow key={key}>
                                                    <TableCell>{key}</TableCell>
                                                    {
                                                        locales.map((locale) => (
                                                            <TableCell key={locale}>
                                                                <TextField
                                                                    defaultValue={localization[namespace][locale][key]}
                                                                    style={{minWidth: 200}}
                                                                    onChange={(event) => handleChange(namespace, locale, key, event.target.value)}
                                                                    id={`translation-${namespace}-${locale}-${key}`}
                                                                />
                                                            </TableCell>
                                                        ))
                                                    }
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </AccordionDetails>
                        </Accordion>
                    ))
                }
                <SaveButton
                    action={handleSave}
                    onComplete={refreshProps}
                    fullWidth
                    id={"localization-save"}
                >
                    Save
                </SaveButton>
            </Box>
        </AdminLayout>
    )
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(
        context,
        async () => {
            const localization = i18n.namespaces.reduce((result, namespace) => ({...result, [namespace]: {}}), {});
            for (let namespace of i18n.namespaces) {
                for (let locale of i18n.locales) {
                    localization[namespace][locale] = await i18n.loadLocaleFrom(locale, namespace);
                }
            }
            return {
                props: {
                    localization,
                    defaultLocale: i18n.defaultLocale,
                    locales: i18n.locales
                }
            };
        },
        {
            permission: PermissionSection.Translation,
            permissionType: PermissionType.Read
        }
    );
}
