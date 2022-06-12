import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import {
    Box, Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead, TablePagination,
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
import { useRouter } from "next/router";
import { NextPageContext } from "next";
import * as React from "react";
import { MarkOrdersAsPayedDialog } from "../../components/admin/dialogs/MarkOrdersAsPayedDialog";

export default function Orders({ orders, permissionDenied, count, page, amount}) {
    const { data: session } = useSession();
    const [order, setOrder] = useState(null);
    const [markAsPaidOpen, setMarkAsPaidOpen] = useState(false);
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

    const handlePageChange = async (_, page) => {
        await router.replace(`${router.basePath}?page=${page}&amount=${amount}`);
    }

    const handlePageRowChange = async (event) => {
        await router.replace(`${router.basePath}?page=${page}&amount=${event.target.value}`);
    }

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <OrderDetailsDialog
                order={order}
                onClose={handleCloseDetails}
                hasPayed={hasPayed}
                hasPayedIcon={hasPayedIcon}
                onMarkAsPayed={refreshProps}
            />
            <MarkOrdersAsPayedDialog
                open={markAsPaidOpen}
                onClose={async () => {
                    await refreshProps();
                    setMarkAsPaidOpen(false);
                }}
                hasPaid={hasPayed}
                hasPaidIcon={hasPayedIcon}
            />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Orders</Typography>
            </Box>
            <Button onClick={() => setMarkAsPaidOpen(true)}>Mark orders as paid</Button>
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
                        <TablePagination
                            count={count}
                            page={page}
                            rowsPerPage={amount}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handlePageRowChange}
                            rowsPerPageOptions={[1, 10, 25, 50, 100]}
                        />
                    </Table>
                )}
            </Box>
        </AdminLayout>
    );
}

export async function getServerSideProps(context: NextPageContext) {
    return await getAdminServerSideProps(
        context,
        async () => {
            let {page, amount}: any = context.query;
            if (!page || !amount) {
                return {
                    redirect: {
                        destination: "/admin/orders?amount=25&page=0",
                        permanent: false
                    }
                };
            }
            page = parseInt(page as string);
            amount = parseInt(amount as string);
            const orders = await prisma.order.findMany({
                include: {
                    event: true,
                    user: true
                },
                take: amount,
                skip: page * amount
            });
            const count = await prisma.order.count();
            return {
                props: {
                    orders,
                    count,
                    page,
                    amount
                }
            };
        },
        {
            permission: PermissionSection.Orders,
            permissionType: PermissionType.Read
        }
    );
}
