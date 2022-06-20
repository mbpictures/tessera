import { MainCard } from "../MainCard";
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { useTheme } from "@mui/material";

export const TotalOrdersCard = ({totalOrders, totalTickets}) => {
    const theme = useTheme();

    return (
        <MainCard
            title={`${totalOrders} / ${totalTickets}`}
            secondaryTitle={"Total Orders / Total Tickets"}
            icon={<BookOnlineIcon /> }
            color={theme.palette.secondary}
        />
    )
}
