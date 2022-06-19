import { MainCard } from "../MainCard";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { useTheme } from "@mui/material";

export const TotalRevenueCard = ({totalRevenue}) => {
    const theme = useTheme();

    return (
        <MainCard
            title={"$ " + totalRevenue.toFixed(2)}
            secondaryTitle={"Total Revenue"}
            icon={<LocalAtmIcon /> }
            color={theme.palette.primary}
        />
    )
}
