import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Divider, Step,
    StepLabel,
    Stepper,
    Typography
} from "@mui/material";
import { OrderDeliveryInformationDetails, OrderPaymentInformationDetails } from "../OrderInformationDetails";
import { useEffect, useState } from "react";
import { getTaskType } from "../../../constants/orderValidation";
import axios from "axios";

const STEP_ORDER = ["Payment", "Shipping", null];

export const ManageTaskDialog = ({task, onClose}) => {
    const [taskType, setTaskType] = useState<null | "shipping" | "payment">(null);

    const updateState = async () => {
        const response = await axios.get("/api/admin/task/" + task.id);
        setTaskType(getTaskType(response.data));
    }

    useEffect(() => {
        if (!task) return;
        setTaskType(getTaskType(task));
    }, [task]);

    if (task === null) return null;

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogTitle>Manage Task</DialogTitle>
            <DialogContent>
                <Stepper activeStep={STEP_ORDER.findIndex((val) => val?.toLowerCase() === taskType)}>
                    {
                        STEP_ORDER.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label ?? "Finished"}</StepLabel>
                            </Step>
                        ))
                    }
                </Stepper>
                <Divider sx={{mt: 2, mb: 2}} />
                {
                    taskType === "payment" && (
                        <>
                            <Typography>This task has not been marked as paid!</Typography>
                            <OrderPaymentInformationDetails
                                order={task.order}
                                onMarkAsPayed={updateState}
                            />
                        </>
                    )
                }
                {
                    taskType === "shipping" && (
                        <>
                            <Typography>The tickets for this task need to be shipped!</Typography>
                            <OrderDeliveryInformationDetails
                                order={task.order}
                                onMarkAsShipped={updateState}
                            />
                        </>
                    )
                }
                {
                    !taskType && (
                        <>
                            <Typography>This task has been completed!</Typography>
                        </>
                    )
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color={"secondary"}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
