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
import { AddEventDialog } from "../../../components/admin/dialogs/AddEventDialog";
import { useState } from "react";
import { useRouter } from "next/router";
import { EditEventDialog } from "../../../components/admin/dialogs/EditEventDialog";
import { PermissionSection, PermissionType } from "../../../constants/interfaces";

export default function events({
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
            <AddEventDialog
                open={addEventOpen}
                onClose={() => setAddEventOpen(false)}
                onChange={refreshProps}
            />
            <EditEventDialog
                event={event}
                onClose={() => setEvent(null)}
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
            let events = await prisma.event.findMany({
                include: {
                    orders: {
                        include: {
                            tickets: true
                        }
                    },
                    categories: {
                        include: {
                            category: true
                        }
                    }
                }
            });

            events = events.map((event) => {
                return {
                    ...event,
                    ticketsBought: event.orders.reduce(
                        (a, order) =>
                            a + (JSON.parse(order.order)?.ticketAmount ?? 0),
                        0
                    )
                };
            });

            const seatmaps = await prisma.seatMap.findMany();
            const categories = await prisma.category.findMany();

            return {
                props: {
                    events,
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
