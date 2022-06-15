import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import {
    Box, Button, Grid,
    IconButton,
    Table,
    TableBody,
    TableCell, TableFooter,
    TableHead, TablePagination,
    TableRow,
    Typography, useMediaQuery
} from "@mui/material";
import {
    getAdminServerSideProps
} from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import InfoIcon from "@mui/icons-material/Info";
import { useEffect, useRef, useState } from "react";
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
import axios from "axios";
import { OrderFilter } from "../../components/admin/OrderFilter";
import { useTheme } from "@mui/system";

const defaultFilter = {
    amount: "25",
    page: "0"
};

export default function Orders({ permissionDenied, count}) {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState(null);
    const [markAsPaidOpen, setMarkAsPaidOpen] = useState(false);
    const theme = useTheme();
    const filter = useRef<Record<string, string>>({
        amount: "25",
        page: "0"
    });
    const router = useRouter();

    if (!session) return null;

    useEffect(() => {
        loadOrders().catch(console.log);
    }, []);

    const loadOrders = async () => {
        const response = await axios.get("api/admin/order?" + new URLSearchParams(filter.current));
        setOrders(response.data);
    }

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

    const handleFilterChange = async (name: string, value: string | undefined) => {
        if (value)
            filter.current[name] = value;
        else
            delete filter.current[name];
        await loadOrders();
    };

    const handlePageChange = async (_, page) => {
        await handleFilterChange("page", page);
    }

    const handlePageRowChange = async (event) => {
        await handleFilterChange("amount", event.target.value);
    }

    const resetFilters = async () => {
        filter.current = defaultFilter;
        await loadOrders();
    }

    const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

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
            <Grid container>
                <Grid item xs={12} md={6}>
                    <Button fullWidth={isMdDown} onClick={() => setMarkAsPaidOpen(true)}>Mark orders as paid</Button>
                </Grid>
                <Grid item xs={12} md={6} display={"flex"} justifyContent={"flex-end"}>
                    <OrderFilter
                        filter={filter.current}
                        onFilterChange={handleFilterChange}
                        onResetFilters={resetFilters}
                    />
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
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={count}
                                    page={parseInt(filter.current.page)}
                                    rowsPerPage={parseInt(filter.current.amount)}
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={handlePageRowChange}
                                    rowsPerPageOptions={[1, 10, 25, 50, 100]}
                                />
                            </TableRow>
                        </TableFooter>
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
            const count = await prisma.order.count();
            return {
                props: {
                    count
                }
            };
        },
        {
            permission: PermissionSection.Orders,
            permissionType: PermissionType.Read
        }
    );
}
