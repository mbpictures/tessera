import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import { Grid, Stack, Typography } from "@mui/material";
import { getAdminServerSideProps } from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import { TotalRevenueCard } from "../../components/admin/layout/dashboard/TotalRevenueCard";
import { TotalOrdersCard } from "../../components/admin/layout/dashboard/TotalOrdersCard";
import { RevenueGraphCard } from "../../components/admin/layout/dashboard/RevenueGraphCard";

export default function Dashboard({totalEarning, earningPercentage, totalTickets, totalOrders, firstCategory, oneYearOrdersGroup}) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <AdminLayout>
            <Stack sx={{ pb: 5 }} spacing={2}>
                <Typography variant="h4" pl={2}>Hi, Welcome back <b>{session.user.name}</b></Typography>
                <Grid container spacing={2} maxWidth={"100%"}>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalRevenueCard totalRevenue={totalEarning} earningPercentage={earningPercentage} firstCategory={firstCategory} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalOrdersCard totalOrders={totalOrders} totalTickets={totalTickets} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>

                    </Grid>
                </Grid>
                <Grid container spacing={2} maxWidth={"100%"}>
                    <Grid item xs={12}>
                        <RevenueGraphCard oneYearOrdersGroup={oneYearOrdersGroup} />
                    </Grid>
                </Grid>
            </Stack>
        </AdminLayout>
    );
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(context, async () => {
        const orders = await prisma.order.findMany();
        const currentDate = new Date();
        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() - 7);

        const totalEarning = orders.map(order => JSON.parse(order.order).totalPrice).reduce((a,b) => a + b, 0);
        const earningsByDate = orders.reduce((groups, order) => {
            const time = new Date(order.date);
            const identifier = time.getSeconds() < sevenDays.getSeconds() ? "before" : "current";
            groups[identifier] += JSON.parse(order.order).totalPrice;
            return groups;
        }, {"before": 0, "current": 0})

        const totalTickets = orders.map(order => JSON.parse(order.order).ticketAmount).reduce((a, b) => a + b, 0);

        const firstCategory = await prisma.category.findFirst();

        const endDate = new Date();
        endDate.setFullYear(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())
        const oneYearOrders = await prisma.order.findMany({
            where: {
                date: {
                    lte: currentDate,
                    gte: endDate
                }
            }
        });
        const oneYearOrdersGroup = oneYearOrders.reduce((group, order) => {
            const date = order.date.toISOString().split("T")[0];
            const price = JSON.parse(order.order).totalPrice;
            const ticketAmount = JSON.parse(order.order).ticketAmount;
            if (date in group) {
                group[date].revenue += price;
                group[date].ticketAmount += ticketAmount;
            }
            else{
                group[date] = {
                    revenue: price,
                    ticketAmount: ticketAmount
                };
            }
            return group;
        }, {});

        return {
            props: {
                totalEarning,
                earningPercentage: 1 - earningsByDate.current / earningsByDate.before,
                totalTickets,
                totalOrders: orders.length,
                firstCategory,
                oneYearOrdersGroup
            }
        }
    });
}
