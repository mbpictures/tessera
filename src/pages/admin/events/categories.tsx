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
    getAdminServerSideProps,
    PermissionSection,
    PermissionType
} from "../../../constants/serverUtil";
import prisma from "../../../lib/prisma";
import EditIcon from "@mui/icons-material/Edit";
import { SEAT_COLORS } from "../../../constants/Constants";
import { useState } from "react";
import { EditCategoryDialog } from "../../../components/admin/dialogs/EditCategoryDialog";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import { AddCategoryDialog } from "../../../components/admin/dialogs/AddCategoryDialog";
import { formatPrice } from "../../../constants/util";

const ColorPreview = ({ color }: { color: string }) => {
    return <Box width={30} height={30} bgcolor={color} />;
};

export default function events({ categories, permissionDenied }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [category, setCategory] = useState(null);
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <EditCategoryDialog
                category={category}
                onClose={() => setCategory(null)}
                onChange={refreshProps}
            />
            <AddCategoryDialog
                open={addCategoryOpen}
                onClose={() => setAddCategoryOpen(null)}
                onAddCategory={refreshProps}
            />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Categories</Typography>
            </Box>
            <Stack>
                <Box display={"flex"}>
                    <Box flexGrow={1} />
                    <Button onClick={() => setAddCategoryOpen(true)}>
                        <AddIcon /> Add Category
                    </Button>
                </Box>
                <Box>
                    {(categories?.length ?? 0) === 0 ? (
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
                                {categories.map((category, index) => {
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {category.label}
                                            </TableCell>
                                            <TableCell>
                                                {formatPrice(
                                                    category.price,
                                                    category.currency
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ColorPreview
                                                    color={
                                                        category.color ??
                                                        SEAT_COLORS.normal
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <ColorPreview
                                                    color={
                                                        category.activeColor ??
                                                        SEAT_COLORS.active
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <ColorPreview
                                                    color={
                                                        category.occupiedColor ??
                                                        SEAT_COLORS.occupied
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() =>
                                                        setCategory(category)
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
            const categories = await prisma.category.findMany();
            return {
                props: {
                    categories
                }
            };
        },
        {
            permission: PermissionSection.EventCategories,
            permissionType: PermissionType.Read
        }
    );
}
