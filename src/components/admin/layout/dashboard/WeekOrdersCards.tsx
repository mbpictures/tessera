import { styled } from "@mui/material/styles";
import {
    Avatar,
    Card,
    ListItem,
    List,
    Stack,
    ListItemAvatar,
    ListItemText,
    Typography, Box, useTheme
} from "@mui/material";
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import { formatPrice } from "../../../../constants/util";

const CardWrapper = styled(Card)<{color: string}>(({color}: {color: string}) => ({
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(210.04deg, ${color} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
        borderRadius: '50%',
        top: -30,
        right: -180
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(140.9deg, ${color} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
        borderRadius: '50%',
        top: -160,
        right: -130
    }
}));

export const WeekOrdersCards = ({weekRevenue, defaultCurrency, unresolvedTickets}) => {
    const theme = useTheme();
    return (
        <Stack spacing={2}>
            <CardWrapper color={theme.palette.warning.light} style={{backgroundColor: "#fdfaec"}}>
                <Box sx={{ p: 2 }}>
                    <List sx={{ py: 0 }}>
                        <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                            <ListItemAvatar>
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        backgroundColor: theme.palette.warning.light,
                                        color: theme.palette.warning.dark
                                    }}
                                >
                                    <StorefrontTwoToneIcon fontSize="inherit" />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                sx={{
                                    py: 0,
                                    mt: 0.45,
                                    mb: 0.45
                                }}
                                primary={<Typography variant="h4">{formatPrice(weekRevenue, defaultCurrency)}</Typography>}
                                secondary={
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: theme.palette.grey[500],
                                            mt: 0.5
                                        }}
                                    >
                                        Last Week Revenue
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </CardWrapper>
            <CardWrapper color={theme.palette.error.light} style={{backgroundColor: "#fdefed"}}>
                <Box sx={{ p: 2 }}>
                    <List sx={{ py: 0 }}>
                        <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                            <ListItemAvatar>
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        backgroundColor: theme.palette.error.light,
                                        color: theme.palette.error.dark
                                    }}
                                >
                                    <MarkAsUnreadIcon fontSize="inherit" />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                sx={{
                                    py: 0,
                                    mt: 0.45,
                                    mb: 0.45
                                }}
                                primary={<Typography variant="h4">{unresolvedTickets}</Typography>}
                                secondary={
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: theme.palette.grey[500],
                                            mt: 0.5
                                        }}
                                    >
                                        Unprocessed tickets
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </CardWrapper>
        </Stack>
    )
};
