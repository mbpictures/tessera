import { useMediaQuery, useTheme } from "@mui/material";

export const MHidden = ({ width, children }) => {
    const breakpoint = width.substring(0, 2);

    const theme = useTheme();

    const hiddenUp = useMediaQuery(theme.breakpoints.up(breakpoint));
    const hiddenDown = useMediaQuery(theme.breakpoints.down(breakpoint));

    if (width.includes("Down")) {
        return hiddenDown ? null : children;
    }

    if (width.includes("Up")) {
        return hiddenUp ? null : children;
    }

    return null;
};
