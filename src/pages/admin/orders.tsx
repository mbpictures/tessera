import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import {
    Box, Button, Grid,
    IconButton, Menu,
    Table,
    TableBody,
    TableCell, TableFooter,
    TableHead, TablePagination,
    TableRow, TableSortLabel,
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
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { SelectionList } from "../../components/admin/SelectionList";

const COLUMNS = [
    "Event",
    "Order",
    "Payment",
    "Paid",
    "Details",
    "Customer",
    "Date",
];

const ConditionalCell = ({text, list, columnName}: {text: string | JSX.Element | Array<string>, list: string[], columnName: string}) => {
    if (!list.includes(columnName)) return null;
    if (Array.isArray(text))
        return (
            <TableCell>
                {text.map(text => (
                    <>{text}<br /></>
                ))}
            </TableCell>
        )
    return (
        <TableCell>{text}</TableCell>
    )
}

export default function Orders({ permissionDenied, count}) {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState(null);
    const [markAsPaidOpen, setMarkAsPaidOpen] = useState(false);
    const [amount, setAmount] = useState("25");
    const [page, setPage] = useState("0");
    const theme = useTheme();
    const router = useRouter();
    const filter = useRef({});
    const [visibleColumns, setVisibleColumns] = useState(["Event", "Order", "Payment", "Paid", "Details"]);
    const [columnsActiveAnchor, setColumnsActiveAnchor] = useState<null | HTMLElement>(null);
    const [sorting, setSorting] = useState({});

    if (!session) return null;

    useEffect(() => {
        loadOrders(filter.current).catch(console.log);
    }, []);

    useEffect(() => {
        loadOrders(filter.current).catch(console.log);
    }, [page, amount, sorting]);

    const loadOrders = async (newFilter) => {
        filter.current = {
            ...newFilter,
            ...({amount: amount, page: page}),
            ...({"sorting": Object.entries(sorting).filter(sort => sort[1] !== false).map(sort => sort[0] + ":" + sort[1]).join(",")})
        };
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

    const handlePageChange = async (_, page) => {
        setPage(`${page}`);
    }

    const handlePageRowChange = async (event) => {
        setAmount(`${event.target.value}`);
        if (parseInt(page) * event.target.value > count) {
            setPage(`${Math.floor(count / event.target.value)}`)
        }
    }

    const getSortingActive = (name): boolean => {
        if (!(name in sorting)) return false;
        return sorting[name] !== false;
    }

    const getSortingDirection = (name): undefined | "asc" | "desc" => {
        if (!(name in sorting) || sorting[name] === false) return undefined;
        return sorting[name];
    }

    const handleSortingChange = (name) => {
        const newSorting = Object.assign({}, sorting);
        if (!(name in newSorting) || newSorting[name] === false) {
            newSorting[name] = "asc";
        }
        else if (newSorting[name] === "asc") {
            newSorting[name] = "desc";
        }
        else if (newSorting[name] === "desc") {
            newSorting[name] = false;
        }
        setSorting(newSorting);
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
                    <Button
                        fullWidth={isMdDown}
                        onClick={() => setMarkAsPaidOpen(true)}
                        variant={"outlined"}
                    >
                        Mark orders as paid
                    </Button>
                </Grid>
                <Grid item xs={12} md={6} display={"flex"} justifyContent={"flex-end"}>
                    <OrderFilter
                        filterChanged={loadOrders}
                    />
                    <Button onClick={(event) => setColumnsActiveAnchor(event.currentTarget)}>
                        <ViewColumnIcon />
                    </Button>
                    <Menu
                        open={columnsActiveAnchor !== null}
                        onClose={() => setColumnsActiveAnchor(null)}
                        anchorEl={columnsActiveAnchor}
                        disableAutoFocusItem
                    >
                        <SelectionList
                            options={COLUMNS.map((column => ({primaryLabel: column, value: column})))}
                            selection={visibleColumns}
                            onChange={(newSelection) => setVisibleColumns(newSelection)}
                            header={""}
                        />
                    </Menu>
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
                                <ConditionalCell columnName="Event" text={
                                    <TableSortLabel
                                        active={getSortingActive("eventId")}
                                        onClick={() => handleSortingChange("eventId")}
                                        direction={getSortingDirection("eventId")}
                                    >
                                        Event
                                    </TableSortLabel>
                                } list={visibleColumns} />
                                <ConditionalCell columnName="Order" text="Order" list={visibleColumns} />
                                <ConditionalCell columnName="Payment" text={
                                    <TableSortLabel
                                        active={getSortingActive("paymentType")}
                                        onClick={() => handleSortingChange("paymentType")}
                                        direction={getSortingDirection("paymentType")}
                                    >
                                        Payment Method
                                    </TableSortLabel>
                                } list={visibleColumns} />
                                <ConditionalCell columnName="Paid" text="Payed" list={visibleColumns} />
                                <ConditionalCell columnName="Customer" text="Customer" list={visibleColumns} />
                                <ConditionalCell columnName="Date" text={
                                    <TableSortLabel
                                        active={getSortingActive("date")}
                                        onClick={() => handleSortingChange("date")}
                                        direction={getSortingDirection("date")}
                                    >
                                        Date
                                    </TableSortLabel>
                                } list={visibleColumns} />
                                <ConditionalCell columnName="Details" text="Details" list={visibleColumns} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order, index) => {
                                return (
                                    <TableRow key={index}>
                                        <ConditionalCell columnName="Event" text={order.event.title} list={visibleColumns} />
                                        <ConditionalCell columnName="Order" text={
                                            'Tickets booked: ' + JSON.parse(order.order).ticketAmount
                                        } list={visibleColumns} />
                                        <ConditionalCell columnName="Payment" text={Object.entries(PaymentType).find(type => type[1] === order.paymentType)[0]} list={visibleColumns} />
                                        <ConditionalCell columnName="Paid" text={hasPayedIcon(order)} list={visibleColumns} />
                                        <ConditionalCell columnName="Customer" text={[
                                            order.user.firstName + " " + order.user.lastName,
                                            order.user.address,
                                            order.user.zip + " " + order.user.city
                                        ]} list={visibleColumns} />
                                        <ConditionalCell columnName="Date" text={new Date(order.date).toLocaleString()} list={visibleColumns} />
                                        <ConditionalCell columnName="Details" text={
                                            <IconButton
                                                onClick={() => setOrder(order)}
                                            >
                                                <InfoIcon />
                                            </IconButton>
                                        } list={visibleColumns} />
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={count}
                                    page={parseInt(page)}
                                    rowsPerPage={parseInt(amount)}
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
