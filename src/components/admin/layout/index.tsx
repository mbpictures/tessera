import {useState} from "react";
import {styled} from "@mui/material";
import {Navbar} from "./Navbar";
import {Sidebar} from "./Sidebar";

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
    display: 'flex',
    minHeight: '100%',
    overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
    flexGrow: 1,
    overflow: 'auto',
    minHeight: '100%',
    paddingTop: APP_BAR_MOBILE + 24,
    paddingBottom: theme.spacing(10),
    [theme.breakpoints.up('lg')]: {
        paddingTop: APP_BAR_DESKTOP + 24,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    }
}));

export const AdminLayout = ({children}) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <RootStyle>
            <Navbar onOpen={() => setOpen(true)} />
            <Sidebar isOpen={open} onClose={() => setOpen(false)} />
            <MainStyle>
                {children}
            </MainStyle>
        </RootStyle>
    );
}
