import {useRef, useState} from "react";
import {Avatar, Box, Button, Divider, IconButton, Typography} from "@mui/material";
import {alpha} from "@mui/system";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {MenuPopover} from "../../util/MenuPopover";
import {signOut, useSession} from "next-auth/react";
import Link from "next/link";

export const AccountPopover = () => {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const {data: session} = useSession();

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <IconButton
                ref={anchorRef}
                onClick={handleOpen}
                sx={{
                    padding: 0,
                    width: 44,
                    height: 44,
                    ...(open && {
                        '&:before': {
                            zIndex: 1,
                            content: "''",
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            position: 'absolute',
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.1)
                        }
                    })
                }}
            >
                <Avatar alt="photoURL"><AccountCircleIcon /></Avatar>
            </IconButton>

            <MenuPopover
                open={open}
                onClose={handleClose}
                anchorEl={anchorRef.current}
                sx={{ width: 220 }}
            >
                <Box sx={{ my: 1.5, px: 2.5 }}>
                    <Typography variant="subtitle1" noWrap>
                        {session.user.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {session.user.email}
                    </Typography>
                    <Link href={"/admin/user/settings"} passHref>
                        <Button fullWidth variant="outlined">
                            Settings
                        </Button>
                    </Link>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ p: 2, pt: 1.5 }}>
                    <Button fullWidth color="inherit" variant="outlined" onClick={() => signOut()}>
                        Logout
                    </Button>
                </Box>
            </MenuPopover>
        </>
    );
}
