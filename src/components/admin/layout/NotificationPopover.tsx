import {
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Tooltip,
    Typography
} from "@mui/material";
import { useRef, useState } from "react";
import { alpha } from "@mui/system";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { Scrollbar } from "../../util/Scrollbar";
import { MenuPopover } from "../../util/MenuPopover";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MessageIcon from "@mui/icons-material/Message";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import PaymentIcon from "@mui/icons-material/Payment";
import { formatDistanceToNow } from "date-fns";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Image from "next/image";

function renderContent(notification) {
    const title = (
        <Typography variant="subtitle2">
            {notification.title}
            <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.secondary" }}
            >
                &nbsp; {notification.description}
            </Typography>
        </Typography>
    );

    if (notification.type === "order_placed") {
        return {
            avatar: <BookOnlineIcon />,
            title
        };
    }
    if (notification.type === "order_shipped") {
        return {
            avatar: <PaymentIcon />,
            title
        };
    }
    if (notification.type === "mail") {
        return {
            avatar: <MessageIcon />,
            title
        };
    }
    return {
        avatar: <Image alt={notification.title} src={notification.avatar} />,
        title
    };
}

function NotificationItem({ notification }) {
    const { avatar, title } = renderContent(notification);

    return (
        <ListItemButton
            disableGutters
            sx={{
                py: 1.5,
                px: 2.5,
                mt: "1px",
                ...(notification.isUnRead && {
                    bgcolor: "action.selected"
                })
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: "background.neutral" }}>{avatar}</Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={title}
                secondary={
                    <Typography
                        variant="caption"
                        sx={{
                            mt: 0.5,
                            display: "flex",
                            alignItems: "center",
                            color: "text.disabled"
                        }}
                    >
                        <Box sx={{ mr: 0.5, width: 16, height: 16 }}>
                            <AccessTimeIcon />
                        </Box>
                        {formatDistanceToNow(new Date(notification.createdAt))}
                    </Typography>
                }
            />
        </ListItemButton>
    );
}

export const NotificationsPopover = () => {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const totalUnRead = notifications.filter(
        (item) => item.isUnRead === true
    ).length;

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMarkAllAsRead = () => {
        setNotifications(
            notifications.map((notification) => ({
                ...notification,
                isUnRead: false
            }))
        );
    };

    return (
        <>
            <IconButton
                ref={anchorRef}
                size="large"
                color={open ? "primary" : "default"}
                onClick={handleOpen}
                sx={{
                    ...(open && {
                        bgcolor: (theme) =>
                            alpha(
                                theme.palette.primary.main,
                                theme.palette.action.focusOpacity
                            )
                    })
                }}
            >
                <Badge badgeContent={totalUnRead} color="error">
                    {notifications.length > 0 ? (
                        <NotificationsActiveIcon />
                    ) : (
                        <NotificationsIcon />
                    )}
                </Badge>
            </IconButton>

            <MenuPopover
                open={open}
                onClose={handleClose}
                anchorEl={anchorRef.current}
                sx={{ width: 360 }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        py: 2,
                        px: 2.5
                    }}
                >
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">
                            Notifications
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                        >
                            You have {totalUnRead} unread messages
                        </Typography>
                    </Box>

                    {totalUnRead > 0 && (
                        <Tooltip title=" Mark all as read">
                            <IconButton
                                color="primary"
                                onClick={handleMarkAllAsRead}
                            >
                                <DoneAllIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                <Divider />

                <Scrollbar sx={{ height: { xs: 340, sm: "auto" } }}>
                    <List
                        disablePadding
                        subheader={
                            <ListSubheader
                                disableSticky
                                sx={{ py: 1, px: 2.5, typography: "overline" }}
                            >
                                New
                            </ListSubheader>
                        }
                    >
                        {notifications.slice(0, 2).map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))}
                    </List>

                    <List
                        disablePadding
                        subheader={
                            <ListSubheader
                                disableSticky
                                sx={{ py: 1, px: 2.5, typography: "overline" }}
                            >
                                Before that
                            </ListSubheader>
                        }
                    >
                        {notifications.slice(2, 5).map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))}
                    </List>
                </Scrollbar>

                <Divider />

                <Box sx={{ p: 1 }}>
                    <Button fullWidth disableRipple>
                        View All
                    </Button>
                </Box>
            </MenuPopover>
        </>
    );
};
