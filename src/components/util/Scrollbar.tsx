import {alpha, Box} from "@mui/system";
import {styled} from "@mui/material";
import SimpleBarReact from 'simplebar-react';
import {useEffect, useState} from "react";

const RootStyle = styled('div')({
    flexGrow: 1,
    height: '100%',
    overflow: 'hidden'
});

const SimpleBarStyle = styled(SimpleBarReact)(({ theme }) => ({
    maxHeight: '100%',
    '& .simplebar-scrollbar': {
        '&:before': {
            backgroundColor: alpha(theme.palette.grey[600], 0.48)
        },
        '&.simplebar-visible:before': {
            opacity: 1
        }
    },
    '& .simplebar-track.simplebar-vertical': {
        width: 10
    },
    '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
        height: 6
    },
    '& .simplebar-mask': {
        zIndex: 'inherit'
    }
}));

export const Scrollbar = ({ children, sx, ...other }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (!navigator.userAgent) return;
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ))
    }, []);

    if (isMobile) {
        return (
            <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
                {children}
            </Box>
        );
    }

    return (
        <RootStyle>
            <SimpleBarStyle timeout={500} clickOnTrack={false} sx={sx} {...other}>
                {children}
            </SimpleBarStyle>
        </RootStyle>
    );
}
