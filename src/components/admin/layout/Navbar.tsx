import { alpha } from "@mui/material/styles";
import { AppBar, IconButton, Stack, styled, Toolbar } from "@mui/material";
import { MHidden } from "../../util/MHidden";
import { Box } from "@mui/system";
import MenuIcon from "@mui/icons-material/Menu";
import { Searchbar } from "./Searchbar";
import { NotificationsPopover } from "./NotificationPopover";
import { AccountPopover } from "./AccountPopover";

const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
    backgroundColor: alpha(theme.palette.background.default, 0.72),
    [theme.breakpoints.up("lg")]: {
        width: `calc(100% - ${DRAWER_WIDTH + 1}px)`
    }
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    minHeight: APPBAR_MOBILE,
    [theme.breakpoints.up("lg")]: {
        minHeight: APPBAR_DESKTOP,
        padding: theme.spacing(0, 5)
    }
}));

export const Navbar = ({ onOpen }) => {
    return (
        <RootStyle>
            <ToolbarStyle>
                <MHidden width="lgUp">
                    <IconButton
                        onClick={onOpen}
                        sx={{ mr: 1, color: "text.primary" }}
                    >
                        <MenuIcon />
                    </IconButton>
                </MHidden>

                <Searchbar />
                <Box sx={{ flexGrow: 1 }} />

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={{ xs: 0.5, sm: 1.5 }}
                >
                    <NotificationsPopover />
                    <AccountPopover />
                </Stack>
            </ToolbarStyle>
        </RootStyle>
    );
};
