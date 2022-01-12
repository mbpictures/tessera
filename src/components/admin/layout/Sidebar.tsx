import {useEffect} from "react";
import {useRouter} from "next/router";
import {Scrollbar} from "../../util/Scrollbar";
import {Box} from "@mui/system";
import HomeIcon from '@mui/icons-material/Home';
import {MHidden} from "../../util/MHidden";
import {Drawer, styled} from "@mui/material";
import NavSection from "./NavSection";
import GroupIcon from '@mui/icons-material/Group';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import EventIcon from '@mui/icons-material/Event';

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
        flexShrink: 0,
        width: DRAWER_WIDTH
    }
}));

const DRAWER_WIDTH = 280;

export const sidebarConfig = [
    {
        title: 'Dashboard',
        path: '/admin',
        icon: <HomeIcon />
    },
    {
        title: 'User',
        path: '/admin/users',
        icon: <GroupIcon />
    },
    {
        title: 'Orders',
        path: '/admin/orders',
        icon: <BookOnlineIcon />
    },
    {
        title: "Event Management",
        icon: <EventIcon />,
        children: [
            {
                title: "Events",
                path: "/admin/events"
            },
            {
                title: "Categories",
                path: "/admin/events/categories"
            },
            {
                title: "Seat Maps",
                path: "/admin/events/seatmaps"
            }
        ]
    }
];

export const Sidebar = ({ isOpen, onClose }) => {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.pathname]);

    const renderContent = (
        <Scrollbar
            sx={{
                height: '100%',
                '& .simplebar-content': { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: "center" }
            }}
        >
            <Box sx={{ flexGrow: 1 }} />
            <NavSection navConfig={sidebarConfig} />
        </Scrollbar>
    );

    return (
        <RootStyle>
            <MHidden width="lgUp">
                <Drawer
                    open={isOpen}
                    onClose={onClose}
                    PaperProps={{
                        sx: { width: DRAWER_WIDTH }
                    }}
                >
                    {renderContent}
                </Drawer>
            </MHidden>

            <MHidden width="lgDown">
                <Drawer
                    open
                    variant="persistent"
                    PaperProps={{
                        sx: {
                            width: DRAWER_WIDTH,
                            bgcolor: 'background.default'
                        }
                    }}
                >
                    {renderContent}
                </Drawer>
            </MHidden>
        </RootStyle>
    );
}
