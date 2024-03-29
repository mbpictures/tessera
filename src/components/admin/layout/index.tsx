import { useEffect, useState } from "react";
import { styled } from "@mui/material";
import { Navbar } from "./Navbar";
import { Sidebar, sidebarConfig } from "./Sidebar";
import Head from "next/head";
import { useRouter } from "next/router";

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

export const RootStyle = styled("div")({
    display: "flex",
    minHeight: "100%",
    overflow: "hidden",
    maxHeight: "100%"
});

const MainStyle = styled("div")(({ theme }) => ({
    flexGrow: 1,
    overflow: "auto",
    minHeight: "100%",
    paddingTop: APP_BAR_MOBILE + 24,
    paddingBottom: theme.spacing(10),
    [theme.breakpoints.up("lg")]: {
        paddingTop: APP_BAR_DESKTOP + 24
    },
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
}));

const additionalPages = [
    {
        title: "Settings",
        path: "/admin/user/settings"
    }
];

export const AdminLayout = ({
    permissionDenied,
    children
}: {
    permissionDenied?: boolean;
    children: JSX.Element | JSX.Element[];
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [pageName, setPageName] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const urls = sidebarConfig
            .map((sidebar) => [
                { title: sidebar.title, path: sidebar.path },
                sidebar.children
            ])
            .concat(additionalPages)
            .flat(2)
            .filter((x) => x !== undefined);
        const title = urls.find((url) => url.path === router.pathname)?.title;
        setPageName(title);
    }, [router.pathname]);

    return (
        <RootStyle>
            <Head>
                <title>Ticketshop Admin - {pageName}</title>
            </Head>
            <Navbar onOpen={() => setOpen(true)} />
            <Sidebar isOpen={open} onClose={() => setOpen(false)} />
            <MainStyle>
                {!permissionDenied ? (
                    children
                ) : (
                    <h4>You don&apos;t have permission to access this area!</h4>
                )}
            </MainStyle>
        </RootStyle>
    );
};
