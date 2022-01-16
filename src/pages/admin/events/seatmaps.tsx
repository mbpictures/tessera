import { useSession } from "next-auth/react";
import { AdminLayout } from "../../../components/admin/layout";
import {
    Box,
    Button,
    IconButton,
    Stack,
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
import prisma from "../../../lib/prisma";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import { SeatMapDialog } from "../../../components/admin/dialogs/SeatMapDialog";
import { useSnackbar } from "notistack";
import axios from "axios";
import { PermissionSection, PermissionType } from "../../../constants/interfaces";

export default function events({ seatmaps, categories, permissionDenied }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [seatmap, setSeatmap] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    const handleAdd = async () => {
        try {
            await axios.post("/api/admin/seatmap");
            await refreshProps();
        } catch (e) {
            enqueueSnackbar("Error", { variant: "error" });
        }
    };

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <SeatMapDialog
                seatmap={seatmap}
                categories={categories}
                onClose={() => setSeatmap(null)}
                onChange={refreshProps}
            />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Seat Maps</Typography>
            </Box>
            <Stack>
                <Box display={"flex"}>
                    <Box flexGrow={1} />
                    <Button onClick={handleAdd}>
                        <AddIcon /> Add Seat Map
                    </Button>
                </Box>
                <Box>
                    {(seatmaps?.length ?? 0) === 0 ? (
                        <Typography variant="body1">No Seat Maps</Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Events using map</TableCell>
                                    <TableCell>Edit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {seatmaps.map((seatmap, index) => {
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {seatmap.events.map(
                                                    (event, index) => (
                                                        <Typography key={index}>
                                                            {event.title}
                                                        </Typography>
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() =>
                                                        setSeatmap(seatmap)
                                                    }
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
            </Stack>
        </AdminLayout>
    );
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(
        context,
        async () => {
            const seatmaps = await prisma.seatMap.findMany({
                select: {
                    events: true,
                    definition: true,
                    id: true
                }
            });
            const categories = await prisma.category.findMany();
            return {
                props: {
                    seatmaps,
                    categories
                }
            };
        },
        {
            permission: PermissionSection.EventSeatMaps,
            permissionType: PermissionType.Read
        }
    );
}
