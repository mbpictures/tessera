import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
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
} from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import { useState } from "react";
import { UserDetailsDialog } from "../../components/admin/dialogs/UserDetailsDialog";
import AddIcon from "@mui/icons-material/Add";
import { AddUserDialog } from "../../components/admin/dialogs/AddUserDialog";
import { useRouter } from "next/router";
import EditIcon from "@mui/icons-material/Edit";
import { PermissionSection, PermissionType } from "../../constants/interfaces";

export default function users({ users, permissionDenied }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState(null);
    const [addUserOpen, setAddUserOpen] = useState<boolean>(false);

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <UserDetailsDialog
                user={user}
                onClose={() => setUser(null)}
                onDelete={refreshProps}
                onChange={refreshProps}
            />
            <AddUserDialog
                open={addUserOpen}
                onClose={() => setAddUserOpen(false)}
                onAddUser={refreshProps}
            />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Users</Typography>
            </Box>
            <Stack>
                <Box display={"flex"}>
                    <Box flexGrow={1} />
                    <Button onClick={() => setAddUserOpen(true)}>
                        <AddIcon /> Add User
                    </Button>
                </Box>
                {(users?.length ?? 0) === 0 ? (
                    <Typography variant="body1">
                        No users available yet
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>E-Mail</TableCell>
                                <TableCell>Edit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{user.userName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => setUser(user)}
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
            </Stack>
        </AdminLayout>
    );
}

export async function getServerSideProps(context) {
    return await getAdminServerSideProps(
        context,
        async () => {
            const users = await prisma.adminUser.findMany();
            return {
                props: {
                    users
                }
            };
        },
        {
            permission: PermissionSection.UserManagement,
            permissionType: PermissionType.Read
        }
    );
}
