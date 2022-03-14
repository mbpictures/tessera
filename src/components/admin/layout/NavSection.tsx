import React, { useState } from "react";
import {
    Box,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    useTheme
} from "@mui/material";
import { alpha } from "@mui/system";
import Link from "next/link";
import { useRouter } from "next/router";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const ListItemElement = React.forwardRef<HTMLDivElement, { onClick?: any }>((props, ref) => (
    <ListItemButton ref={ref} disableGutters {...props} />
));
ListItemElement.displayName = "ListItemElement";

const ListItemStyle = styled(
    ListItemElement
)(({ theme }) => ({
    ...theme.typography.body2,
    height: 48,
    position: "relative",
    textTransform: "capitalize",
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(2.5),
    color: theme.palette.text.secondary,
    "&:before": {
        top: 0,
        right: 0,
        width: 3,
        bottom: 0,
        content: "''",
        display: "none",
        position: "absolute",
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        backgroundColor: theme.palette.primary.main
    }
}));

ListItemStyle.displayName = "ListItem";

const ListItemIconStyle = styled(ListItemIcon)({
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
});

function NavItem({ item, active }) {
    const theme = useTheme();
    const isActiveRoot = active(item.path);
    const { title, path, icon, info, children } = item;

    const hasActiveSub = children?.some((child) => active(child.path)) ?? false;

    const [open, setOpen] = useState(isActiveRoot || hasActiveSub);

    const handleOpen = () => {
        setOpen((prev) => !prev);
    };

    const activeRootStyle = {
        color: "primary.main",
        fontWeight: "fontWeightMedium",
        bgcolor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity
        ),
        "&:before": { display: "block" }
    };

    const activeSubStyle = {
        color: "text.primary",
        fontWeight: "fontWeightMedium"
    };

    if (children) {
        return (
            <>
                <ListItemStyle
                    onClick={handleOpen}
                    sx={{
                        ...((isActiveRoot || hasActiveSub) && activeRootStyle)
                    }}
                >
                    <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
                    <ListItemText disableTypography primary={title} />
                    {info && info}
                    <Box sx={{ width: 16, height: 16, ml: 1 }}>
                        <ChevronRightIcon
                            style={{
                                transform: `rotate(${open ? 90 : 0}deg)`,
                                transition: ".3s ease"
                            }}
                        />
                    </Box>
                </ListItemStyle>

                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {children.map((item) => {
                            const { title, path } = item;
                            const isActiveSub = active(path);

                            return (
                                <ListItemStyle
                                    key={title}
                                    sx={{
                                        ...(isActiveSub && activeSubStyle),
                                        padding: 0
                                    }}
                                >
                                    <Link href={path} passHref>
                                        <ListItemStyle
                                            sx={{
                                                ...(isActiveSub && {
                                                    color: "primary.main",
                                                    fontWeight:
                                                        "fontWeightMedium",
                                                    bgcolor: alpha(
                                                        theme.palette.primary
                                                            .main,
                                                        theme.palette.action
                                                            .selectedOpacity
                                                    )
                                                })
                                            }}
                                        >
                                            <ListItemText
                                                disableTypography
                                                primary={title}
                                                sx={{
                                                    paddingLeft:
                                                        theme.spacing(10)
                                                }}
                                            />
                                        </ListItemStyle>
                                    </Link>
                                </ListItemStyle>
                            );
                        })}
                    </List>
                </Collapse>
            </>
        );
    }

    return (
        <Link href={path} passHref>
            <ListItemStyle
                sx={{
                    ...(isActiveRoot && activeRootStyle)
                }}
            >
                <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
                <ListItemText disableTypography primary={title} />
                {info && info}
            </ListItemStyle>
        </Link>
    );
}

export default function NavSection({ navConfig, ...other }) {
    const { pathname } = useRouter();
    const match = (path) => (path ? pathname === path : false);

    return (
        <Box {...other}>
            <List disablePadding>
                {navConfig.map((item) => (
                    <NavItem key={item.title} item={item} active={match} />
                ))}
            </List>
        </Box>
    );
}
