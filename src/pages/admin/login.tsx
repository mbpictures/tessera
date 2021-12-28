import {Alert, Container, Snackbar, Stack, styled, Typography} from "@mui/material";
import LoginForm from "../../components/admin/LoginForm";
import {getCsrfToken, getSession, signIn} from "next-auth/react";
import {useRouter} from "next/router";
import {useState} from "react";

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

export default function Login() {
    const [error, setError] = useState<boolean>(false);
    const router = useRouter();

    const handleLogIn = async (email, password) => {
        try {
            await signIn("credentials", {
                redirect: false,
                email: email,
                password: password
            });
            await router.push("/admin");
        } catch (e) {
            setError(true);
        }
    };

    return (
        <RootStyle>
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

    return {
        props: {
            csrfToken: await getCsrfToken(context),
        }
    };
}
