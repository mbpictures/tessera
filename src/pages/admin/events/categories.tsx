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
import { Options, SEAT_COLORS } from "../../../constants/Constants";
import { useState } from "react";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import { ManageCategoryDialog } from "../../../components/admin/dialogs/ManageCategoryDialog";
import { formatPrice } from "../../../constants/util";
import { PermissionSection, PermissionType } from "../../../constants/interfaces";
import { getOption } from "../../../lib/options";

const ColorPreview = ({ color }: { color: string }) => {
    return <Box width={30} height={30} bgcolor={color} />;
};

export default function Categories({ categories, permissionDenied, currency }) {
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
            <ManageCategoryDialog
                open={addCategoryOpen || category !== null}
                onClose={() => {
                    setAddCategoryOpen(false);
                    setCategory(null);
                }}
                onChange={refreshProps}
                category={category}
                currency={currency}
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
                                                    currency
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
            const currency = await getOption(Options.Currency);
            return {
                props: {
                    currency,
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
