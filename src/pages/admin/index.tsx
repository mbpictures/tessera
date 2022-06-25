import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import { Grid, Stack, Typography } from "@mui/material";
import { getAdminServerSideProps } from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import { TotalRevenueCard } from "../../components/admin/layout/dashboard/TotalRevenueCard";
import { TotalOrdersCard } from "../../components/admin/layout/dashboard/TotalOrdersCard";
import { RevenueGraphCard } from "../../components/admin/layout/dashboard/RevenueGraphCard";
import { WeekOrdersCards } from "../../components/admin/layout/dashboard/WeekOrdersCards";
import { PopularCard } from "../../components/admin/layout/dashboard/PopularCard";

export default function Dashboard({totalEarning, earningPercentage, totalTickets, totalOrders, defaultCurrency, oneYearOrdersGroup, weekRevenue, unresolvedTickets, dataByEvent}) {
    const { data: session } = useSession();

    if (!session) return null;

    defaultCurrency = defaultCurrency ?? "USD";

    return (
        <AdminLayout>
            <Stack sx={{ pb: 5 }} spacing={1}>
                <Typography variant="h4" pl={2}>Hi, Welcome back <b>{session.user.name}</b></Typography>
                <Grid container spacing={2} maxWidth={"100%"}>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalRevenueCard totalRevenue={totalEarning} earningPercentage={earningPercentage} defaultCurrency={defaultCurrency} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalOrdersCard totalOrders={totalOrders} totalTickets={totalTickets} />
                    </Grid>
                    <Grid item lg={4} md={12} sm={12} xs={12}>
                        <WeekOrdersCards weekRevenue={weekRevenue} defaultCurrency={defaultCurrency} unresolvedTickets={unresolvedTickets} />
                    </Grid>
                </Grid>
                <Grid container spacing={2} maxWidth={"100%"}>
                    <Grid item xs={12} sm={12} md={8}>
                        <RevenueGraphCard oneYearOrdersGroup={oneYearOrdersGroup} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <PopularCard dataByEvent={dataByEvent} currency={defaultCurrency} />
                    </Grid>
                </Grid>
            </Stack>
        </AdminLayout>
    );
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(context, async () => {
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())
        const oneYearOrders = await prisma.order.findMany({
            where: {
                date: {
                    lte: currentDate,
                    gte: endDate
                }
            },
            include: {
                event: true
            }
        });

        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() - 7);
        const fortyDays = new Date();
        fortyDays.setDate(fortyDays.getDate() - 14);

        const totalEarning = oneYearOrders.map(order => JSON.parse(order.order).totalPrice).reduce((a,b) => a + b, 0);
        const earningsByDate = oneYearOrders.reduce((groups, order) => {
            const time = new Date(order.date);
            if (time.getTime() < fortyDays.getTime()) return groups;
            const identifier = time.getTime() < sevenDays.getTime() ? "before" : "current";
            groups[identifier] += JSON.parse(order.order).totalPrice;
            return groups;
        }, {"before": 0, "current": 0});

        const totalTickets = oneYearOrders.map(order => JSON.parse(order.order).ticketAmount).reduce((a, b) => a + b, 0);

        const firstCategory = await prisma.category.findFirst();

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

        const weekRevenue = (await prisma.order.findMany({
            where: {
                date: {
                    lte: currentDate,
                    gte: sevenDays
                }
            }
        })).reduce((total, order) => total + JSON.parse(order.order).totalPrice, 0);

        let unresolvedTickets = (await prisma.order.findMany({
            include: {
                tickets: true
            },
            where: {
                shipping: {
                    contains: "post"
                }
            }
        }))
            .filter((order) => order.tickets.length < JSON.parse(order.order).ticketAmount)
            .reduce((amount, order) => amount + JSON.parse(order.order).ticketAmount, 0);

        let dataByEvent = oneYearOrders.reduce((group, order) => {
            const orderDefinition = JSON.parse(order.order)
            if (order.event.title in group) {
                group[order.event.title].ticketAmount += orderDefinition.ticketAmount;
                group[order.event.title].revenue += orderDefinition.totalPrice;
                return group;
            }
            group[order.event.title] = {
                ticketAmount: orderDefinition.ticketAmount,
                revenue: orderDefinition.totalPrice
            }
            return group;
        }, {});

        return {
            props: {
                totalEarning,
                earningPercentage: earningsByDate.current / earningsByDate.before - 1,
                totalTickets,
                totalOrders: oneYearOrders.length,
                defaultCurrency: firstCategory?.currency ?? null,
                oneYearOrdersGroup,
                weekRevenue,
                unresolvedTickets,
                dataByEvent
            }
        }
    });
}
