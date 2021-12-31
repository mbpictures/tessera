import {Alert, Box, Button, Container, Snackbar, Stack, styled, Typography} from "@mui/material";
import LoginForm from "../../components/admin/LoginForm";
import {getCsrfToken, getSession, signIn} from "next-auth/react";
import {useRouter} from "next/router";
import {useState} from "react";
import prisma from "../../lib/prisma";
import {AddUserDialog} from "../../components/admin/dialogs/AddUserDialog";

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex'
    }
}));

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(12, 0)
}));

export default function Login({noUser}) {
    const [error, setError] = useState<boolean>(false);
    const router = useRouter();
    const [addUserOpen, setAddUserOpen] = useState(false);

    const handleLogIn = async (email, password) => {
        try {
            const result = await signIn("login", {
                redirect: false,
                email: email,
                password: password
            });
            if (result.error)
                throw new Error("error while logging in");
            await router.push("/admin");
        } catch (e) {
            setError(true);
        }
    };

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    return (
        <RootStyle>
            {
                noUser && <AddUserDialog onAddUser={refreshProps} open={addUserOpen} onClose={() => setAddUserOpen(false)} />
            }
            <Container maxWidth="sm">
                <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
                    <Alert severity="error">Error while logging in!</Alert>
                </Snackbar>
                <ContentStyle>
                    <Stack sx={{ mb: 5 }}>
                        <Typography variant="h4" gutterBottom>
                            Sign in to your ticket shop dashboard
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
                    </Stack>
                    <LoginForm onSubmit={handleLogIn} />
                    {
                        noUser && (
                            <Box pt={1} pb={1}>
                                <Typography>There is no admin user registered yet! You can register your root user (this is only available one time).</Typography>
                                <Button color={"secondary"} fullWidth onClick={() => setAddUserOpen(true)}>Register</Button>
                            </Box>
                        )
                    }
                </ContentStyle>
            </Container>
        </RootStyle>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context)

    if (session !== null) {
        return {
            redirect: {
                destination: '/admin',
                permanent: false,
            },
        }
    }

    const noUser = (await prisma.adminUser.findMany()).length === 0;

    return {
        props: {
            csrfToken: await getCsrfToken(context),
            noUser: noUser
        }
    };
}
