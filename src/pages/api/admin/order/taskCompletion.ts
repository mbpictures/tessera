import prisma from "../../../../lib/prisma";
import { getTaskType } from "../../../../constants/util";

export const completeTask = async (orderId) => {
    const task = await prisma.task.findUnique({
        where: {
            orderId: orderId
        },
        include: {
            assignedUser: true,
            order: {
                include: {
                    user: true
                }
            }
        }
    });
    if (!task) return;
    if (getTaskType(task) !== null) return; // we still have something to do with this order!
    await prisma.task.delete({
        where: {
            id: task.id
        }
    })
}
