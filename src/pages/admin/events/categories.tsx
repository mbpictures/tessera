import {useSession} from "next-auth/react";
import {AdminLayout} from "../../../components/admin/layout";
import {Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {getAdminServerSideProps} from "../../../constants/serverUtil";
import prisma from "../../../lib/prisma";
import EditIcon from '@mui/icons-material/Edit';
import {SEAT_COLORS} from "../../../constants/Constants";
import {useState} from "react";
import { EditCategoryDialog } from "../../../components/admin/dialogs/EditCategoryDialog";
import {useRouter} from "next/router";

const ColorPreview = ({color}: {color: string}) => {
    return <Box width={30} height={30} bgcolor={color} />
}

export default function events({categories}) {
    const {data: session} = useSession();
    const router = useRouter();
    const [category, setCategory] = useState(null);

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    return (
        <AdminLayout>
            <EditCategoryDialog category={category} onClose={() => setCategory(null)} onChange={refreshProps()} />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Categories</Typography>
            </Box>
            <Box>
                {
                    categories.length === 0 ? (
                        <Typography variant="body1">No categories</Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Color</TableCell>
                                    <TableCell>Color Active</TableCell>
                                    <TableCell>Color Occupied</TableCell>
                                    <TableCell>Edit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    categories.map((category, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{category.label}</TableCell>
                                                <TableCell>{category.price.toFixed(2)} &euro;</TableCell>
                                                <TableCell><ColorPreview color={category.color ?? SEAT_COLORS.normal} /></TableCell>
                                                <TableCell><ColorPreview color={category.activeColor ?? SEAT_COLORS.active} /></TableCell>
                                                <TableCell><ColorPreview color={category.occupiedColor ?? SEAT_COLORS.occupied} /></TableCell>
                                                <TableCell><IconButton onClick={() => setCategory(category)}><EditIcon /></IconButton></TableCell>
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
        const categories = await prisma.category.findMany();
        return {
            props: {
                categories
            }
        }
    });
}