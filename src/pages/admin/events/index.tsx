import { useSession } from "next-auth/react";
import { AdminLayout } from "../../../components/admin/layout";
import {
    Box,
    Button,
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
} from "../../../constants/serverUtil";
import EditIcon from "@mui/icons-material/Edit";
import prisma from "../../../lib/prisma";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useRouter } from "next/router";
import { ManageEventDialog } from "../../../components/admin/dialogs/ManageEventDialog";
import { PermissionSection, PermissionType } from "../../../constants/interfaces";

export default function Events({
    events,
    seatmaps,
    categories,
    permissionDenied
}) {
    const { data: session } = useSession();
    const [addEventOpen, setAddEventOpen] = useState(false);
    const [event, setEvent] = useState(null);
    const router = useRouter();

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <ManageEventDialog
                open={addEventOpen}
                event={event}
                onClose={() => {
                    setEvent(null)
                    setAddEventOpen(false)
                }}
                seatmaps={seatmaps}
                onChange={refreshProps}
                categories={categories}
            />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Events</Typography>
            </Box>
            <Box display={"flex"}>
                <Box flexGrow={1} />
                <Button onClick={() => setAddEventOpen(true)}>
                    <AddIcon /> Add Event
                </Button>
            </Box>
            <Box>
                {(events?.length ?? 0) === 0 ? (
                    <Typography variant="body1">
                        No events available yet
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Has Seat Reservation</TableCell>
                                <TableCell>Ticket Amount</TableCell>
                                <TableCell>Edit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((event, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>
                                            {event.seatType === "seatmap" ? (
                                                <CheckIcon color={"success"} />
                                            ) : (
                                                <CloseIcon color={"error"} />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {event.ticketsBought}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => setEvent(event)}
                                            >
                                                <EditIcon />
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
            const events = await prisma.event.findMany({
                include: {
                    dates: {
                        include: {
                            orders: {
                                select: {
                                    tickets: true
                                }
                            },
                        }
                    },
                    categories: {
                        include: {
                            category: true
                        }
                    }
                }
            });

            const serializableEvents = events.map((event) => {
                return {
                    ...event,
                    ticketsBought: event.dates.map(date => date.orders).flat().reduce(
                        (a, order) =>
                            a + order.tickets.length,
                        0
                    ),
                    orders: [],
                    dates: event.dates.map(({orders, ...date}) => ({
                        ...date,
                        date: date.date?.toISOString() ?? null,
                        ticketSaleStartDate: date.ticketSaleStartDate?.toISOString() ?? null,
                        ticketSaleEndDate: date.ticketSaleEndDate?.toISOString() ?? null
                    }))
                };
            });

            const seatmaps = await prisma.seatMap.findMany();
            const categories = await prisma.category.findMany();

            return {
                props: {
                    events: serializableEvents,
                    seatmaps,
                    categories
                }
            };
        },
        {
            permission: PermissionSection.EventManagement,
            permissionType: PermissionType.Read
        }
    );
}
