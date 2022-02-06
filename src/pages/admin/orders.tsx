import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import {
    Box, Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {
    getAdminServerSideProps
} from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";
import {
    PaymentFactory,
    PaymentType
} from "../../store/factories/payment/PaymentFactory";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { OrderDetailsDialog } from "../../components/admin/dialogs/OrderDetailsDialog";
import { PermissionSection, PermissionType } from "../../constants/interfaces";
import { MarkOrderPayed } from "../../components/admin/MarkOrderPayed";
import { useRouter } from "next/router";

export default function Orders({ orders, permissionDenied }) {
    const { data: session } = useSession();
    const [order, setOrder] = useState(null);
    const router = useRouter();

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    const hasPayed = (order) => {
        return (
            PaymentFactory.getPaymentInstance({
                data: null,
                type: order.paymentType as PaymentType
            })?.paymentResultValid(order.paymentResult) ?? false
        );
    };

    const hasPayedIcon = (order) => {
        return hasPayed(order) ? (
            <CheckIcon color={"success"} />
        ) : (
            <CloseIcon color={"error"} />
        );
    };

    const handleCloseDetails = () => {
        setOrder(null);
    };

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <OrderDetailsDialog
                order={order}
                onClose={handleCloseDetails}
                hasPayed={hasPayed}
                hasPayedIcon={hasPayedIcon}
                onMarkAsPayed={refreshProps}
            />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Orders</Typography>
            </Box>
            <Grid container>
                <Grid item md={6} xs={12} display={"flex"} alignItems={"center"}>
                    <Typography variant={"body1"}>
                        Mark orders as payed by invoice purpose of your received bank transactions
                    </Typography>
                </Grid>
                <Grid item md={6} xs={12}>
                    <MarkOrderPayed onMarkAsPayed={refreshProps} />
                </Grid>
            </Grid>
            <Box>
                {(orders?.length ?? 0) === 0 ? (
                    <Typography variant="body1">
                        No orders available yet
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Order</TableCell>
                                <TableCell>Payment Method</TableCell>
                                <TableCell>Payed</TableCell>
                                <TableCell>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {order.event.title}
                                        </TableCell>
                                        <TableCell>
                                            Tickets booked:{" "}
                                            {
                                                JSON.parse(order.order)
                                                    .ticketAmount
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {order.paymentType}
                                        </TableCell>
                                        <TableCell>
                                            {hasPayedIcon(order)}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => setOrder(order)}
                                            >
                                                <InfoIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Box>
        </AdminLayout>
    );
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(
        context,
        async () => {
            const orders = await prisma.order.findMany({
                include: {
                    event: true,
                    user: true
                }
            });
            return {
                props: {
                    orders
                }
            };
        },
        {
            permission: PermissionSection.Orders,
            permissionType: PermissionType.Read
        }
    );
}
