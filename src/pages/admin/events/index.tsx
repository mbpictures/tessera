import {useSession} from "next-auth/react";
import {AdminLayout} from "../../../components/admin/layout";
import {Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {getAdminServerSideProps} from "../../../constants/serverUtil";
import InfoIcon from "@mui/icons-material/Info";
import prisma from "../../../lib/prisma";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export default function events({events}) {
    const {data: session} = useSession();

    if (!session) return null;

    return (
        <AdminLayout>
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Events</Typography>
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
                                    <TableCell>Details</TableCell>
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
                                                <TableCell><IconButton><InfoIcon /></IconButton></TableCell>
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
