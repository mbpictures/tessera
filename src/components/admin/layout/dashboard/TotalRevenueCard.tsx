import { MainCard } from "../MainCard";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Tooltip, useTheme } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export const TotalRevenueCard = ({totalRevenue, earningPercentage}) => {
    const theme = useTheme();

    earningPercentage = earningPercentage.toFixed(3);
    const rotation = earningPercentage === 0 ? 0 : earningPercentage < 0 ? 25 : -25;
    const percentageChange = (Math.abs(earningPercentage) * 100).toFixed(1);
    const text = "The total revenue within the last 7 days " + (earningPercentage === 0 ? "did not change" : earningPercentage < 0 ? `decreased by ${percentageChange}%` : `increased by ${percentageChange}%`)

    return (
        <MainCard
            title={"$ " + totalRevenue.toFixed(2)}
            secondaryTitle={"Total Revenue"}
            icon={<LocalAtmIcon /> }
            color={theme.palette.primary}
            titleIcon={<Tooltip title={text}>
                <ArrowForwardIcon style={{transform: `rotate(${rotation}deg)`}} />
            </Tooltip>}
        />
    )
}
