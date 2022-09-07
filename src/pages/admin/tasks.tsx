import { useSession } from "next-auth/react";
import { AdminLayout } from "../../components/admin/layout";
import {
    Box,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, Tooltip,
    Typography
} from "@mui/material";
import {
    getAdminServerSideProps
} from "../../constants/serverUtil";
import prisma from "../../lib/prisma";
import { useState } from "react";
import { useRouter } from "next/router";
import { PermissionSection, PermissionType } from "../../constants/interfaces";
import { AdminUser, Order, User, Task as TaskBase} from "@prisma/client";
import LaunchIcon from '@mui/icons-material/Launch';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import axios from "axios";
import { useSnackbar } from "notistack";
import { ManageTaskDialog } from "../../components/admin/dialogs/ManageTaskDialog";
import { getTaskType } from "../../constants/orderValidation";

interface Task extends TaskBase {
    assignedUser: AdminUser;
    order: Order & {user: User};
}

export default function Tasks({ tasks, permissionDenied }: {tasks: Array<Task>, permissionDenied: boolean}) {
    const router = useRouter();
    const { data: session } = useSession();
    const [task, setTask] = useState<Task | null>(null);
    const {enqueueSnackbar} = useSnackbar();

    if (!session) return null;

    const refreshProps = async () => {
        await router.replace(router.asPath);
    };

    const checkTask = async (task: Task) => {
        try {
            if (getTaskType(task) === "payment") {
                await axios.put("/api/admin/order/paid?orderId=" + task.order.id);
            }
            else if (getTaskType(task) === "shipping") {
                await axios.put("/api/admin/order/shipped?orderId=" + task.order.id);
            }
            await refreshProps();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response?.message ?? e.message), {
                variant: "error"
            });
        }
    }

    return (
        <AdminLayout permissionDenied={permissionDenied}>
            <ManageTaskDialog task={task} onClose={() => setTask(null)} />
            <Box sx={{ pb: 5 }}>
                <Typography variant="h4">Tasks</Typography>
            </Box>
            <Stack>
                {(tasks?.length ?? 0) === 0 ? (
                    <Typography variant="body1">
                        No tasks available yet
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>E-Mail</TableCell>
                                <TableCell>Task Type</TableCell>
                                <TableCell>Check Task</TableCell>
                                <TableCell>Open</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.map((task, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{task.order.user.firstName} {task.order.user.lastName}</TableCell>
                                        <TableCell>{task.order.user.email}</TableCell>
                                        <TableCell>{getTaskType(task) === "shipping" ? "Ship tickets" : "Check payment receipt"}</TableCell>
                                        <TableCell>
                                            <Tooltip title={"Mark current step of this task as completed"}>
                                                <IconButton
                                                    onClick={() => checkTask(task)}
                                                    className={"task-check"}
                                                    color={"success"}
                                                >
                                                    <TaskAltIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => setTask(task)}
                                                className={"task-open"}
                                            >
                                                <LaunchIcon />
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
            let tasks = await prisma.task.findMany({
                include: {
                    assignedUser: true,
                    order: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            const tasksSerializable = tasks.map(task => {
                return {
                    ...task,
                    ...{
                        order: {
                            ...task.order,
                            date: task.order.date.toISOString()
                        }
                    }
                }
            });
            return {
                props: {
                    tasks: tasksSerializable
                }
            };
        },
        {
            permission: PermissionSection.Orders,
            permissionType: PermissionType.Read
        }
    );
}
