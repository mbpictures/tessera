import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import { Box, Grid, Typography } from "@mui/material";
import { getAdminServerSideProps } from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import { TotalRevenueCard } from "../../components/admin/layout/dashboard/TotalRevenueCard";

export default function Dashboard({totalEarning, earningPercentage}) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <AdminLayout>
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Hi, Welcome back</Typography>
                <Grid container spacing={2}>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalRevenueCard totalRevenue={totalEarning} earningPercentage={earningPercentage} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>

                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>

                    </Grid>
                </Grid>
            </Box>
        </AdminLayout>
    );
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(context, async () => {
        const orders = await prisma.order.findMany();
        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() - 7);

        const totalEarning = orders.map(order => JSON.parse(order.order).totalPrice).reduce((a,b) => a + b, 0);
        const earningsByDate = orders.reduce((groups, order) => {
            const time = new Date(order.date);
            const identifier = time.getSeconds() < sevenDays.getSeconds() ? "before" : "current";
            groups[identifier] += JSON.parse(order.order).totalPrice;
            return groups;
        }, {"before": 0, "current": 0})

        return {
            props: {
                totalEarning,
                earningPercentage: 1 - earningsByDate.current / earningsByDate.before
            }
        }
    });
}
