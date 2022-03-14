import { alpha, Box } from "@mui/system";
import { useState } from "react";
import {
    Button,
    ClickAwayListener,
    IconButton,
    Input,
    InputAdornment,
    Slide,
    styled
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const SearchbarStyle = styled("div")(({ theme }) => ({
    top: 0,
    left: 0,
    zIndex: 99,
    width: "100%",
    display: "flex",
    position: "absolute",
    alignItems: "center",
    height: APPBAR_MOBILE,
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
    padding: theme.spacing(0, 3),
    boxShadow: theme.shadows[2],
    backgroundColor: `${alpha(theme.palette.background.default, 0.72)}`,
    [theme.breakpoints.up("md")]: {
        height: APPBAR_DESKTOP,
        padding: theme.spacing(0, 5)
    }
}));

// ----------------------------------------------------------------------

export const Searchbar = () => {
    const [isOpen, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSearch = () => {
        // TODO
        handleClose();
    };

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <div>
                {!isOpen && (
                    <IconButton onClick={handleOpen}>
                        <SearchIcon />
                    </IconButton>
                )}

                <Slide direction="down" in={isOpen} mountOnEnter unmountOnExit>
                    <SearchbarStyle>
                        <Input
                            autoFocus
                            fullWidth
                            disableUnderline
                            placeholder="Search…"
                            startAdornment={
                                <InputAdornment position="start">
                                    <Box
                                        sx={{
                                            color: "text.disabled",
                                            width: 20,
                                            height: 20
                                        }}
                                    >
                                        <SearchIcon />
                                    </Box>
                                </InputAdornment>
                            }
                            sx={{ mr: 1, fontWeight: "fontWeightBold" }}
                        />
                        <Button variant="contained" onClick={handleSearch}>
                            Search
                        </Button>
                    </SearchbarStyle>
                </Slide>
            </div>
        </ClickAwayListener>
    );
};
