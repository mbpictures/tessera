import {Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField} from "@mui/material";
import * as Yup from "yup";
import {Form, FormikProvider, useFormik} from "formik";
import {LoadingButton} from "@mui/lab";
import axios from "axios";
import CloseIcon from '@mui/icons-material/Close';
import {useSnackbar} from "notistack";

export const AddUserDialog = ({open, onClose, onAddUser}) => {
    const { enqueueSnackbar } = useSnackbar();

    const schema = Yup.object().shape({
        username: Yup.string().required("Username is required"),
        email: Yup.string().email('Email must be a valid email address').required('Email is required'),
        password: Yup.string().required('Password is required'),
        confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must be equal").required("Please confirm the password")
    });

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            try {
                await axios.post("/api/admin/user", {username: values.username, email: values.email, password: values.password});
                onClose();
                onAddUser();
            } catch (e) {
                enqueueSnackbar("Error occured", {variant: "error"})
            }
        }
    });

    const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>
                    Create new user
                    <IconButton onClick={onClose} style={{position: "absolute", top: 8, right: 8}}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <FormikProvider value={formik}>
                        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                            <Stack spacing={2} pt={1} pb={1}>
                                <TextField
                                    label={"Username"}
                                    {...getFieldProps('username')}
                                    error={Boolean(touched.username && errors.username)}
                                    helperText={touched.username && errors.username}
                                />
                                <TextField
                                    label={"E-Mail"}
                                    {...getFieldProps('email')}
                                    error={Boolean(touched.email && errors.email)}
                                    helperText={touched.email && errors.email}
                                />
                                <TextField
                                    label={"Password"}
                                    type={"password"}
                                    {...getFieldProps('password')}
                                    error={Boolean(touched.password && errors.password)}
                                    helperText={touched.password && errors.password}
                                />
                                <TextField
                                    label={"Confirm Password"}
                                    type={"password"}
                                    {...getFieldProps('confirmPassword')}
                                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                                    helperText={touched.confirmPassword && errors.confirmPassword}
                                />
                                <LoadingButton
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={!formik.isValid}
                                >
                                    Add User
                                </LoadingButton>
                            </Stack>
                        </Form>
                    </FormikProvider>
                </DialogContent>
            </Dialog>
        </>
    )
};
