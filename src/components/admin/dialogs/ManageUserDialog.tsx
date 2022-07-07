import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { ConfirmDialog } from "./ConfirmDialog";
import { useSnackbar } from "notistack";
import { SelectionList } from "../SelectionList";
import { PermissionSection } from "../../../constants/interfaces";
import { arrayEquals } from "../../../constants/util";
import * as Yup from "yup";
import { useFormik } from "formik";
import { LoadingButton } from "@mui/lab";

interface props {
    open: boolean;
    user?: any;
    onClose?: () => unknown;
    onDelete?: () => unknown;
    onChange?: () => unknown;
    editRights?: boolean;
}

export const ManageUserDialog = ({ open, user, onClose, onDelete, onChange, editRights }: props) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const schema = Yup.object().shape({
        username: Yup.string().required("Username is required"),
        email: Yup.string()
            .email("Email must be a valid email address")
            .required("Email is required"),
        ...(!user && ({
            password: Yup.string().required("Password is required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords must be equal")
                .required("Please confirm the password"),
        })),
        ...(editRights && ({
            readRights: Yup.array().of(Yup.string()),
            writeRights: Yup.array().of(Yup.string())
        }))
    });

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            readRights: [],
            writeRights: []
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            try {
                const data = Object.assign({}, values);
                if (!editRights) {
                    delete data.readRights;
                    delete data.writeRights;
                }
                if (user) {
                    delete data.password;
                    delete data.confirmPassword;
                }
                if (user)
                    await axios.put("/api/admin/user/" + user.id, data);
                else
                    await axios.post("/api/admin/user", data)
                onClose();
                onChange();
            } catch (e) {
                enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                    variant: "error"
                });
            }
        }
    });

    useEffect(() => {
        if (!user) {
            formik.resetForm();
            setDeleteOpen(false);
            return;
        }
        formik.setFieldValue("email", user.email);
        formik.setFieldValue("username", user.userName);
        formik.setFieldValue("readRights", user.readRights);
        formik.setFieldValue("writeRights", user.writeRights);
    }, [user]);

    const handleCloseDeleteUser = () => {
        setDeleteOpen(false);
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete("/api/admin/user/" + user.id);
            handleCloseDeleteUser();
            onClose();
            onDelete();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.reponse.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const { errors, touched, isSubmitting, handleSubmit, getFieldProps, values, setFieldValue } =
        formik;

    console.log(errors);

    const hasChanges =
        values.email !== user?.email ||
        values.username !== user?.userName ||
        !arrayEquals(user?.writeRights, values.writeRights) ||
        !arrayEquals(user?.readRights, values.readRights);

    return (
        <>
            <Dialog open={open || user} onClose={onClose} fullWidth>
                <DialogTitle>
                    {
                        user ? "Edit user" : "Add user"
                    }
                    <IconButton
                        style={{ position: "absolute", top: 8, right: 8 }}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} p={2}>
                        <TextField
                            label={"Username"}
                            {...getFieldProps("username")}
                            error={Boolean(
                                touched.username && errors.username
                            )}
                            helperText={
                                touched.username && errors.username
                            }
                        />
                        <TextField
                            {...getFieldProps("email")}
                            label={"E-Mail"}
                            error={Boolean(
                                touched.email && errors.email
                            )}
                            helperText={touched.email && errors.email}
                        />
                        {
                            !user && (
                                <>
                                    <TextField
                                        label={"Password"}
                                        type={"password"}
                                        {...getFieldProps("password")}
                                        error={Boolean(
                                            touched.password && errors.password
                                        )}
                                        helperText={
                                            touched.password && errors.password
                                        }
                                    />
                                    <TextField
                                        label={"Confirm Password"}
                                        type={"password"}
                                        {...getFieldProps("confirmPassword")}
                                        error={Boolean(
                                            touched.confirmPassword &&
                                            errors.confirmPassword
                                        )}
                                        helperText={
                                            touched.confirmPassword &&
                                            errors.confirmPassword
                                        }
                                    />
                                </>
                            )
                        }
                        {
                            editRights && (
                                <Stack direction={"row"} spacing={1} maxHeight={300} overflow={"auto"}>
                                    <SelectionList
                                        options={Object.values(PermissionSection).filter(x => x !== "none").map(permission => {
                                            return {
                                                value: permission,
                                                primaryLabel: permission.replace(/([A-Z])/g, ' $1')
                                            };
                                        })}
                                        selection={values.readRights}
                                        onChange={(newValue) => setFieldValue("readRights", newValue)}
                                        header={"Read Rights"}
                                        style={{
                                            flexGrow: 1,
                                            overflow: "visible",
                                            height: "fit-content"
                                        }}
                                    />
                                    <SelectionList
                                        options={Object.values(PermissionSection).filter(x => x !== "none").map(permission => {
                                            return {
                                                value: permission,
                                                primaryLabel: permission.replace(/([A-Z])/g, ' $1')
                                            };
                                        })}
                                        selection={values.writeRights}
                                        onChange={(newValue) => setFieldValue("writeRights", newValue)}
                                        header={"Write Rights"}
                                        style={{
                                            flexGrow: 1,
                                            overflow: "visible",
                                            height: "fit-content"
                                        }}
                                    />
                                </Stack>
                            )
                        }
                        <Stack direction={"row"}>
                            <LoadingButton
                                color={"success"}
                                disabled={user ? !hasChanges || !formik.isValid : !formik.isValid}
                                fullWidth
                                onClick={() => handleSubmit()}
                                id={"edit-user-save"}
                                loading={isSubmitting}
                            >
                                Save Changes
                            </LoadingButton>
                            {
                                user && (
                                    <Button
                                        color={"error"}
                                        fullWidth
                                        onClick={() => setDeleteOpen(true)}
                                        id={"edit-user-delete"}
                                    >
                                        Delete User
                                    </Button>
                                )
                            }
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                text={`Confirm delete of user <b>${user?.userName}</b>`}
                open={deleteOpen}
                onClose={handleCloseDeleteUser}
                onConfirm={handleDeleteUser}
            />
        </>
    );
};
