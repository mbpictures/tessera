import {useSession} from "next-auth/react";
import {AdminLayout} from "../../components/admin/layout";
import {
    Box, Button,
    Dialog, DialogContent, DialogContentText,
    DialogTitle, Divider,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {getAdminServerSideProps} from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import InfoIcon from '@mui/icons-material/Info';
import {useState} from "react";
import {PaymentFactory, PaymentType} from "../../store/factories/payment/PaymentFactory";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function orders({orders}) {
    const {data: session} = useSession();
    const [order, setOrder] = useState(null);

    if (!session) return null;

    const hasPayed = (order) => {
        return PaymentFactory.getPaymentInstance({data: null, type: order.paymentType as PaymentType})?.paymentResultValid(order.paymentResult) ?? false;
    }

    const hasPayedIcon = (order) => {
        return hasPayed(order) ? <CheckIcon color={"success"} /> : <CloseIcon color={"error"} />;
    }

    const handleMarkAsPayed = () => {
        // TODO
    }

    return (
        <AdminLayout>
            {
                order !== null && (
                    <Dialog open={true} onClose={() => setOrder(null)}>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Event: {order.event.title}<br />
                                OrderID: {order.id}<br />
                                User: <br />
                                {order.user.firstName} {order.user.lastName}<br />
                                {order.user.email}<br />
                                {order.user.address}<br />
                                {order.user.zip} {order.user.city}<br />
                                {order.user.countryCode} {order.user.regionCode}
                                <Divider />
                                Payment Type: {order.paymentType}<br />
                                Payed: {hasPayedIcon(order)}<br />
                                {
                                    (order.paymentType === "invoice" && !hasPayed(order)) && (
                                        <Button onClick={handleMarkAsPayed}>Mark as payed</Button>
                                    )
                                }
                            </DialogContentText>
                        </DialogContent>
                    </Dialog>
                )
            }
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Orders</Typography>
            </Box>
            <Box>
                {
                    orders.length === 0 ? (
                        <Typography variant="body1">No orders available yet</Typography>
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
                                {
                                    orders.map((order, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{order.event.title}</TableCell>
                                                <TableCell>Tickets booked: {JSON.parse(order.order).ticketAmount}</TableCell>
                                                <TableCell>{order.paymentType}</TableCell>
                                                <TableCell>
                                                    {
                                                        hasPayedIcon(order)
                                                    }
                                                </TableCell>
                                                <TableCell><IconButton onClick={() => setOrder(order)}><InfoIcon /></IconButton></TableCell>
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
        }
    });
}
