import {useSession} from "next-auth/react";
import {AdminLayout} from "../../../components/admin/layout";
import {Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {getAdminServerSideProps} from "../../../constants/serverUtil";
import EditIcon from "@mui/icons-material/Edit";
import prisma from "../../../lib/prisma";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {AddEventDialog} from "../../../components/admin/dialogs/AddEventDialog";
import {useState} from "react";
import {useRouter} from "next/router";

export default function events({events}) {
    const {data: session} = useSession();
    const [addEventOpen, setAddEventOpen] = useState(false);
    const router = useRouter();

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    return (
        <AdminLayout>
            <AddEventDialog open={addEventOpen} onClose={() => setAddEventOpen(false)} onChange={refreshProps} />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Events</Typography>
            </Box>
            <Box display={"flex"}>
                <Box flexGrow={1} />
                <Button onClick={() => setAddEventOpen(true)}><AddIcon /> Add Seat Map</Button>
            </Box>
            <Box>
                {
                    events.length === 0 ? (
                        <Typography variant="body1">No events available yet</Typography>
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
                                {
                                    events.map((event, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{event.title}</TableCell>
                                                <TableCell>{event.seatType === "seatmap" ? <CheckIcon color={"success"} /> : <CloseIcon color={"error"} />}</TableCell>
                                                <TableCell>{event.ticketsBought}</TableCell>
                                                <TableCell><IconButton><EditIcon /></IconButton></TableCell>
                                            </TableRow>
                                        );
                                    })
                                }
                            </TableBody>
                        </Table>
                    )
                }
            </Box>
        </AdminLayout>
    )
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(context, async () => {
        let events = await prisma.event.findMany({
            include: {
                orders: {
                    include: {
                        tickets: true
                    }
                }
            }
        });

        events = events.map(event => {
            return {
                ...event,
                ticketsBought: event.orders.reduce((a, order) => a + (JSON.parse(order.order)?.ticketAmount ?? 0), 0)
            }
        });

        return {
            props: {
                events
            }
        }
    });
}
