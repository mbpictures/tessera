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
import { getEventTitle } from "../../constants/util";
import { getOption } from "../../lib/options";
import { Options } from "../../constants/Constants";

export default function Dashboard({totalEarning, earningPercentage, totalTickets, totalOrders, currency, oneYearOrdersGroup, weekRevenue, unresolvedTickets, dataByEvent}) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <AdminLayout>
            <Stack sx={{ pb: 5 }} spacing={1}>
                <Typography variant="h4" pl={2}>Hi, Welcome back <b>{session.user.name}</b></Typography>
                <Grid container spacing={2} maxWidth={"100%"}>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalRevenueCard totalRevenue={totalEarning} earningPercentage={earningPercentage} defaultCurrency={currency} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <TotalOrdersCard totalOrders={totalOrders} totalTickets={totalTickets} />
                    </Grid>
                    <Grid item lg={4} md={12} sm={12} xs={12}>
                        <WeekOrdersCards weekRevenue={weekRevenue} defaultCurrency={currency} unresolvedTickets={unresolvedTickets} />
                    </Grid>
                </Grid>
                <Grid container spacing={2} maxWidth={"100%"}>
                    <Grid item xs={12} sm={12} md={8}>
                        <RevenueGraphCard oneYearOrdersGroup={oneYearOrdersGroup} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <PopularCard dataByEvent={dataByEvent} currency={currency} />
                    </Grid>
                </Grid>
            </Stack>
        </AdminLayout>
    );
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(context, async () => {
        const categories = await prisma.category.findMany();

        const getTotalPriceOfOrder = (order) => {
            return order.tickets?.reduce((a, ticket) => a + ticket.amount * categories.find(category => category.id === ticket.categoryId).price, 0) ?? 0;
        }

        const currentDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())
        let oneYearOrders = (await prisma.order.findMany({
            where: {
                date: {
                    lte: currentDate,
                    gte: endDate
                }
            },
            include: {
                eventDate: {
                    include: {
                        event: true
                    }
                },
                tickets: true
            }
        })).map(order => ({...order, totalPrice: getTotalPriceOfOrder(order)}));

        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() - 7);
        const fortyDays = new Date();
        fortyDays.setDate(fortyDays.getDate() - 14);



        const totalEarning = oneYearOrders.map(order => order.totalPrice).reduce((a,b) => a + b, 0);
        const earningsByDate = oneYearOrders.reduce((groups, order) => {
            const time = new Date(order.date);
            if (time.getTime() < fortyDays.getTime()) return groups;
            const identifier = time.getTime() < sevenDays.getTime() ? "before" : "current";
            groups[identifier] += order.totalPrice;
            return groups;
        }, {"before": 0, "current": 0});

        const totalTickets = oneYearOrders.map(order => order.tickets.length).reduce((a, b) => a + b, 0);

        const oneYearOrdersGroup = oneYearOrders.reduce((group, order) => {
            const date = order.date.toISOString().split("T")[0];
            const price = order.totalPrice;
            const ticketAmount = order.tickets.length;
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
        })).reduce((total, order) => total + getTotalPriceOfOrder(order), 0);

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
            .map((order) => order.tickets.filter(ticket => ticket.secret === "" || ticket.secret === null || ticket.secret === undefined).length)
            .reduce((a, b) => a + b, 0);

        let dataByEvent = oneYearOrders.reduce((group, order) => {
            if (getEventTitle(order.eventDate) in group) {
                group[getEventTitle(order.eventDate)].ticketAmount += order.tickets.length;
                group[getEventTitle(order.eventDate)].revenue += order.totalPrice;
                return group;
            }
            group[getEventTitle(order.eventDate)] = {
                ticketAmount: order.tickets.length,
                revenue: order.totalPrice
            }
            return group;
        }, {});
        const currency = await getOption(Options.Currency);

        return {
            props: {
                totalEarning,
                earningPercentage: earningsByDate.current / earningsByDate.before - 1,
                totalTickets,
                totalOrders: oneYearOrders.length,
                currency,
                oneYearOrdersGroup,
                weekRevenue,
                unresolvedTickets,
                dataByEvent
            }
        }
    });
}
