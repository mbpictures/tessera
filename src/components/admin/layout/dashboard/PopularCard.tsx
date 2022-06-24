import { MainCard } from "../MainCard";
import { Divider, Grid, Typography } from "@mui/material";
import { formatPrice } from "../../../../constants/util";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export const PopularCard = ({dataByEvent, currency}) => {
    const totalRevenue = Object.values(dataByEvent).reduce((total: number, data: {revenue: number}) => total + data.revenue, 0);

    return (
        <MainCard
            title={"Popular Events"}
            color={{
                main: "#EEEEEE",
                dark: "#FFFFFF",
                light: "#CCCCCC",
                contrastText: "#222222"
            }}
            icon={<EventAvailableIcon />}
        >
            <Grid item xs={12}>
                {
                    Object.entries(dataByEvent).map((data, index) => <PopularListItem key={index} eventName={data[0]} data={data[1]} index={index} currency={currency} totalRevenue={totalRevenue} />)
                }
            </Grid>
        </MainCard>
    )
}

const PopularListItem = ({eventName, data, index, currency, totalRevenue}) => {
    return (
        <>
            {
                index > 0 && <Divider sx={{ my: 1.5 }} />
            }
            <Grid container direction="column">
                <Grid item>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="subtitle1" color="inherit">
                                {eventName}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: 'success.dark' }}>
                                {(data.revenue / totalRevenue * 100).toFixed(2)}% of total revenue
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item>
                                    <Typography variant="subtitle1" color="inherit">
                                        Revenue: <strong>{formatPrice(data.revenue, currency)}</strong>
                                    </Typography>
                                    <Typography variant="subtitle1" color="inherit">
                                        Tickets: <strong>{data.ticketAmount}</strong>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}
