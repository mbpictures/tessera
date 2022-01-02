import {signOut, useSession} from "next-auth/react";
import {AdminLayout} from "../../../components/admin/layout";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Button,
    IconButton,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import {getAdminServerSideProps} from "../../../constants/serverUtil";
import prisma from "../../../lib/prisma";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {ChangePasswordDialog} from "../../../components/admin/dialogs/ChangePasswordDialog";
import DeleteIcon from '@mui/icons-material/Delete';
import {Box, useTheme} from "@mui/system";
import {AddApiKeyDialog} from "../../../components/admin/dialogs/AddApiKeyDialog";
import AddIcon from "@mui/icons-material/Add";
import {ConfirmDialog} from "../../../components/admin/dialogs/ConfirmDialog";

export default function users({user}) {
    const {data: session} = useSession();

    if (!session) return null;
    const router = useRouter();
    const theme = useTheme();
    const [username, setUsername] = useState(user?.userName);
    const [email, setEmail] = useState(user?.email);
    const [error, setError] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [addApiKeyOpen, setAddApiKeyOpen] = useState(false);
    const [deleteApiKeyIndex, setDeleteApiKeyIndex] = useState(null);

    useEffect(() => {
        if (user) return;
        signOut().catch(alert);
    }, [user]);

    const deleteApiKey = async () => {
        try {
            await axios.delete("/api/admin/user/apiKey/" + deleteApiKeyIndex.id);
            setDeleteApiKeyIndex(null);
            await refreshProps();
        } catch (e) {
            setDeleteApiKeyIndex(null);
            setError(true);
        }
    }

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    const onSave = async () => {
        try {
            await axios.put("/api/admin/user/" + user.id, {username: username, email: email});
            await refreshProps();
        } catch (e) {
            setError(true);
        }
    }

    const hasChange = username !== user?.userName || email !== user?.email;

    return (
        <AdminLayout>
            <ChangePasswordDialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} user={user} />
            <AddApiKeyDialog open={addApiKeyOpen} onClose={() => setAddApiKeyOpen(false)} onKeyGenerated={refreshProps} />
            <ConfirmDialog text={`Delete API <b>${deleteApiKeyIndex?.name}</b>`} open={deleteApiKeyIndex !== null} onConfirm={deleteApiKey} onClose={() => setDeleteApiKeyIndex(null)} />
            <Stack>
                <Typography variant={"h4"}>Account Settings</Typography>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant={"h6"}>Account</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            <TextField label={"Username"} value={username} onChange={event => setUsername(event.target.value)} />
                            <TextField label={"E-Mail"} value={email} onChange={event => setEmail(event.target.value)} />
                            <Button onClick={onSave} disabled={!hasChange}>Save</Button>
                            <Button color={"secondary"} onClick={() => setChangePasswordOpen(true)}>Change Password</Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant={"h6"}>Api-Keys</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack direction={useMediaQuery(theme.breakpoints.up("lg")) ? "row" : "column"} pb={2}>
                            <Box flexGrow={1}>
                                <Typography>
                                    Api Keys are used to access sensible data, e.g. using direct HTTP REST calls or the command line interface for the ticketshop.<br />
                                    Once you generated an API Key and closed the confirmation, you can't restore it.
                                </Typography>
                            </Box>
                            <Button onClick={() => setAddApiKeyOpen(true)} style={{minWidth: 50}}><AddIcon /> Add Api Key</Button>
                        </Stack>
                        {
                            user?.apiKeys.length === 0 ? (
                                <Typography>You don't have any API keys yet!</Typography>
                            ) : (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Delete</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            user?.apiKeys.map((apiKey, index) => {
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>{apiKey.name}</TableCell>
                                                        <TableCell>
                                                            <IconButton color={"error"} onClick={() => setDeleteApiKeyIndex(apiKey)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        }
                                    </TableBody>
                                </Table>
                            )
                        }
                    </AccordionDetails>
                </Accordion>
            </Stack>
            <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                <Alert severity="error">Error occurred!</Alert>
            </Snackbar>
        </AdminLayout>
    )
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(context, async (session) => {
        const user = await prisma.adminUser.findUnique({
            where: {
                email: session.user.email
            },
            include: {
                apiKeys: true
            }
        });
        return {
            props: {
                user
            }
        }
    });
}
