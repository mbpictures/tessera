import { MainCard } from "../MainCard";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Tooltip, useTheme } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export const TotalRevenueCard = ({totalRevenue, earningPercentage}) => {
    const theme = useTheme();

    const earningPercentageRounded = earningPercentage?.toFixed(3) ?? 0;
    const rotation = earningPercentageRounded === 0 ? 0 : earningPercentageRounded < 0 ? 25 : -25;
    const percentageChange = (Math.abs(earningPercentageRounded) * 100).toFixed(1);
    const text = "The total revenue within the last 7 days " + (earningPercentageRounded === 0 ? "did not change" : earningPercentageRounded < 0 ? `decreased by ${percentageChange}%` : `increased by ${percentageChange}%`)

    return (
        <MainCard
            title={"$ " + totalRevenue.toFixed(2)}
            secondaryTitle={"Total Revenue"}
            icon={<LocalAtmIcon /> }
            color={theme.palette.primary}
            titleIcon={earningPercentage && (<Tooltip title={text}>
                <ArrowForwardIcon style={{transform: `rotate(${rotation}deg)`}} />
            </Tooltip>)}
        />
    )
}
