import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import {
    Box,
    Button,
    Grid,
    IconButton,
    Menu,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Tooltip,
    Typography,
    useMediaQuery
} from "@mui/material";
import { getAdminServerSideProps, getCategoryTicketAmount, getSeatMap } from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import InfoIcon from "@mui/icons-material/Info";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { OrderDetailsDialog } from "../../components/admin/dialogs/OrderDetailsDialog";
import { PermissionSection, PermissionType } from "../../constants/interfaces";
import { useRouter } from "next/router";
import { NextPageContext } from "next";
import { MarkOrdersAsPayedDialog } from "../../components/admin/dialogs/MarkOrdersAsPayedDialog";
import axios from "axios";
import { OrderFilter } from "../../components/admin/OrderFilter";
import { useTheme } from "@mui/system";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { SelectionList } from "../../components/admin/SelectionList";
import { FullSizeLoading } from "../../components/FullSizeLoading";
import { AddOrder } from "../../components/admin/dialogs/AddOrder";
import DownloadIcon from "@mui/icons-material/Download";
import omitBy from "lodash/omitBy";
import isEmpty from "lodash/isEmpty";
import { hasPayedIcon } from "../../components/admin/OrderInformationDetails";
import { getEventTitle } from "../../constants/util";
import { getOption } from "../../lib/options";
import { Options } from "../../constants/Constants";
import { SaveButton } from "../../components/admin/SaveButton";

const COLUMNS = [
    "Event",
    "Order",
    "Payment",
    "Paid",
    "Details",
    "Customer",
    "Date",
    "Invoice Sent",
    "Ticket Amount Sent"
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

export default function Orders({ permissionDenied, count, categories, eventDates, events, paymentFees, currency, shippingFees}) {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState(null);
    const [markAsPaidOpen, setMarkAsPaidOpen] = useState(false);
    const [addOrderOpen, setAddOrderOpen] = useState(false);
    const [amount, setAmount] = useState("25");
    const [page, setPage] = useState("0");
    const theme = useTheme();
    const router = useRouter();
    const filter = useRef({});
    const [visibleColumns, setVisibleColumns] = useState(["Event", "Order", "Payment", "Paid", "Details"]);
    const [loading, setLoading] = useState(false);
    const [columnsActiveAnchor, setColumnsActiveAnchor] = useState<null | HTMLElement>(null);
    const [sorting, setSorting] = useState({});

    const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        if (!session) return;
        loadOrders(filter.current).catch(console.log);
    }, []);

    useEffect(() => {
        if (!session) return;
        loadOrders(filter.current).catch(console.log);
    }, [page, amount, sorting]);

    if (!session) return null;

    const getOrderUrl = (additionalParams = {}): string => {
        return "api/admin/order?" + new URLSearchParams({...omitBy(filter.current, isEmpty), ...omitBy(additionalParams, isEmpty)});
    }

    const loadOrders = async (newFilter) => {
        setLoading(true);
        filter.current = {
            ...newFilter,
            ...({amount: amount, page: page}),
            ...({"sorting": Object.entries(sorting).filter(sort => sort[1] !== false).map(sort => sort[0] + ":" + sort[1]).join(",")})
        };
        const response = await axios.get(getOrderUrl());
        setOrders(response.data);
        setLoading(false);
    }

    const refreshProps = async () => {
        await router.replace(router.asPath);
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

    const exportCsv = () => {
        window.location.href = window.location.origin + "/" + getOrderUrl({amount: "", page: "", exportFile: "csv"});
    }

    const downloadInvoices = async () => {
        const response = await axios.get("/api/admin/order/invoice?" + new URLSearchParams(omitBy(filter.current, isEmpty)));
        const blob = await (await fetch(response.data)).blob()
        window.open(URL.createObjectURL(blob));
    }

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <OrderDetailsDialog
                order={order}
                onClose={handleCloseDetails}
                onMarkAsPayed={() => loadOrders(filter.current)}
                onMarkAsShipped={() => loadOrders(filter.current)}
                onDelete={() => loadOrders(filter.current)}
                categories={categories[order?.eventDateId]}
            />
            <MarkOrdersAsPayedDialog
                open={markAsPaidOpen}
                onClose={async () => {
                    await refreshProps();
                    setMarkAsPaidOpen(false);
                }}
                categories={categories}
                currency={currency}
                shippingFees={shippingFees}
                paymentFees={paymentFees}
            />
            <AddOrder
                open={addOrderOpen}
                categories={categories}
                eventDates={eventDates}
                events={events}
                onClose={() => setAddOrderOpen(false)}
                onAdd={async () => {
                    await refreshProps();
                    setAddOrderOpen(false);
                }}
                paymentFees={paymentFees}
                currency={currency}
            />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Orders</Typography>
            </Box>
            <Grid container>
                <Grid item xs={12} md={6}>
                    <Stack direction={"row"} spacing={1}>
                        <Button
                            fullWidth={isMdDown}
                            onClick={() => setMarkAsPaidOpen(true)}
                            variant={"outlined"}
                        >
                            Mark orders as paid
                        </Button>
                        <Button
                            fullWidth={isMdDown}
                            onClick={() => setAddOrderOpen(true)}
                            variant={"outlined"}
                            color="secondary"
                        >
                            Add Order
                        </Button>
                        <SaveButton
                            fullWidth={isMdDown}
                            action={downloadInvoices}
                            variant={"outlined"}
                            color="warning"
                        >
                            Download Invoices
                        </SaveButton>
                    </Stack>
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
                    <Tooltip title={"Download all orders matching current filters as csv file"}>
                        <Button onClick={exportCsv}>
                            <DownloadIcon />
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
            <Box position={"relative"}>
                {(orders?.length ?? 0) === 0 && !loading ? (
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
                                <ConditionalCell columnName="Invoice Sent" text={
                                    <TableSortLabel
                                        active={getSortingActive("invoiceSent")}
                                        onClick={() => handleSortingChange("invoiceSent")}
                                        direction={getSortingDirection("invoiceSent")}
                                    >
                                        Invoice Sent
                                    </TableSortLabel>
                                } list={visibleColumns} />
                                <ConditionalCell columnName="Ticket Amount Sent" text={
                                    <TableSortLabel
                                        active={getSortingActive("tickets._count")}
                                        onClick={() => handleSortingChange("tickets._count")}
                                        direction={getSortingDirection("tickets._count")}
                                    >
                                        Ticket Amount Sent
                                    </TableSortLabel>
                                } list={visibleColumns} />
                                <ConditionalCell columnName="Details" text="Details" list={visibleColumns} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order, index) => {
                                return (
                                    <TableRow key={index}>
                                        <ConditionalCell columnName="Event" text={getEventTitle(order.eventDate)} list={visibleColumns} />
                                        <ConditionalCell columnName="Order" text={
                                            'Tickets booked: ' + order.tickets.length
                                        } list={visibleColumns} />
                                        <ConditionalCell columnName="Payment" text={Object.entries(PaymentType).find(type => type[1] === order.paymentType)[0]} list={visibleColumns} />
                                        <ConditionalCell columnName="Paid" text={hasPayedIcon(order)} list={visibleColumns} />
                                        <ConditionalCell columnName="Customer" text={[
                                            order.user.firstName + " " + order.user.lastName,
                                            order.user.address,
                                            order.user.zip + " " + order.user.city
                                        ]} list={visibleColumns} />
                                        <ConditionalCell columnName="Date" text={new Date(order.date).toLocaleString()} list={visibleColumns} />
                                        <ConditionalCell columnName="Invoice Sent" text={
                                            order.invoiceSent ? (
                                                <CheckIcon color={"success"} />
                                            ) : (<CloseIcon color={"error"} />)
                                        } list={visibleColumns} />
                                        <ConditionalCell columnName="Ticket Amount Sent" text={order.tickets.length} list={visibleColumns} />
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
                <FullSizeLoading isLoading={loading} />
            </Box>
        </AdminLayout>
    );
}

export async function getServerSideProps(context: NextPageContext) {
    return await getAdminServerSideProps(
        context,
        async () => {
            const count = await prisma.order.count();
            let eventDates = await prisma.eventDate.findMany({
                select: {
                    id: true,
                    event: {
                        select: {
                            id: true,
                            seatType: true,
                            seatMap: {
                                select: {
                                    definition: true
                                }
                            },
                            categories: {
                                include: {
                                    category: true
                                }
                            }
                        }
                    }
                }
            });

            const eventDateMaps = await Promise.all(eventDates.map(async (event) => {
                event["seatType"] = event.event.seatType;
                if (event.event.seatMap?.definition) {
                    event["seatMap"] = {definition: await getSeatMap(event.id, true)};
                }

                return event;
            }));

            const events = await prisma.event.findMany({
                include: {
                    dates: true
                }
            });
            const currentAmounts = {};
            for (let eventDate of eventDates) {
                currentAmounts[eventDate.id] = await getCategoryTicketAmount(eventDate.id);
            }

            return {
                props: {
                    count,
                    categories: eventDates.reduce((group, eventDate) => {
                        group[eventDate.id] = eventDate.event.categories.map(category => ({
                                ...category.category,
                                ticketsLeft: isNaN(category.maxAmount) || !category.maxAmount || category.maxAmount === 0 ? null : Math.max(category.maxAmount - currentAmounts[eventDate.id][category.categoryId], 0)
                            }))
                        return group;
                    }, {}),
                    eventDates: JSON.parse(JSON.stringify(eventDateMaps)),
                    events: JSON.parse(JSON.stringify(events)),
                    paymentFees: await getOption(Options.PaymentFeesPayment),
                    shippingFees: await getOption(Options.PaymentFeesShipping),
                    currency: await getOption(Options.Currency)
                }
            };
        },
        {
            permission: PermissionSection.Orders,
            permissionType: PermissionType.Read
        }
    );
}
