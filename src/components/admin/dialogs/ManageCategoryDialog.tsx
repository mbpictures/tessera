import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import * as Yup from "yup";
import { Form, FormikProvider, useFormik } from "formik";
import { LoadingButton } from "@mui/lab";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import currencyToSymbolMap from "currency-symbol-map/map";
import { SEAT_COLORS } from "../../../constants/Constants";
// @ts-ignore
import { Color, ColorPicker } from "mui-color";
import { useSnackbar } from "notistack";
import { ConfirmDialog } from "./ConfirmDialog";
import { useEffect, useState } from "react";

interface props {
    open: boolean;
    onClose: () => unknown;
    onChange?: Function;
    category?: any;
    currency: string;
}

export const ManageCategoryDialog = ({ open, onClose, onChange, category, currency }: props) => {
    const { enqueueSnackbar } = useSnackbar();
    const [deleteOpen, setDeleteOpen] = useState(false);

    const schema = Yup.object().shape({
        label: Yup.string().required("Name is required"),
        price: Yup.number().required("Price is required"),
        color: Yup.string(),
        activeColor: Yup.string(),
        occupiedColor: Yup.string(),
        maxTickets: Yup.number().nullable()
    });


    const formik = useFormik({
        initialValues: {
            label: category?.label ?? "",
            price: category?.price ?? 0,
            color: category?.color ?? SEAT_COLORS.normal,
            activeColor: category?.activeColor ?? SEAT_COLORS.active,
            occupiedColor: category?.occupiedColor ?? SEAT_COLORS.occupied,
            maxTickets: category?.maxTickets ?? null
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            try {
                if (category) {
                    await axios.put("/api/admin/category/" + category.id, {
                        ...values,
                        price: parseFloat(values.price)
                    });
                }
                else {
                    await axios.post("/api/admin/category", values);
                }
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
        if (!category) {
            formik.resetForm();
            return;
        }
        formik.setFieldValue("label", category.label);
        formik.setFieldValue("price", category.price);
        formik.setFieldValue("color", category.color);
        formik.setFieldValue("activeColor", category.activeColor);
        formik.setFieldValue("occupiedColor", category.occupiedColor);
        formik.setFieldValue("maxTickets", category.maxTickets);
    }, [category]);

    const handleDeleteCategory = async () => {
        try {
            await axios.delete("/api/admin/category/" + category.id);
            onClose();
            onChange();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const {
        errors,
        touched,
        values,
        isSubmitting,
        handleSubmit,
        getFieldProps,
        setFieldValue
    } = formik;

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>
                    {
                        category === null ? "Create new category" : "Edit category"
                    }
                    <IconButton
                        onClick={onClose}
                        style={{ position: "absolute", top: 8, right: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <FormikProvider value={formik}>
                        <Form
                            autoComplete="off"
                            noValidate
                            onSubmit={handleSubmit}
                        >
                            <Stack spacing={2} p={2}>
                                <TextField
                                    label={"Name"}
                                    {...getFieldProps("label")}
                                    error={Boolean(
                                        touched.label && errors.label
                                    )}
                                    helperText={touched.label && errors.label}
                                />
                                <Stack
                                    direction={
                                        useMediaQuery((theme: any) =>
                                            theme.breakpoints.up("lg")
                                        )
                                            ? "row"
                                            : "column"
                                    }
                                    spacing={2}
                                >
                                    <TextField
                                        label={"Price"}
                                        sx={{ flexGrow: 1 }}
                                        {...getFieldProps("price")}
                                        error={Boolean(
                                            touched.price && errors.price
                                        )}
                                        helperText={
                                            touched.price && errors.price
                                        }
                                        InputProps={{
                                            endAdornment: currencyToSymbolMap[currency]
                                        }}
                                    />
                                </Stack>
                                <Stack direction={"row"}>
                                    <Typography
                                        flexGrow={1}
                                        display={"flex"}
                                        alignItems={"center"}
                                    >
                                        Color:
                                    </Typography>
                                    <ColorPicker
                                        value={values.color}
                                        onChange={(value) =>
                                            setFieldValue(
                                                "color",
                                                (value as Color).css.backgroundColor
                                            )
                                        }
                                        disableAlpha
                                        hideTextfield
                                    />
                                </Stack>
                                <Stack direction={"row"}>
                                    <Typography
                                        flexGrow={1}
                                        display={"flex"}
                                        alignItems={"center"}
                                    >
                                        Active Color:
                                    </Typography>
                                    <ColorPicker
                                        value={values.activeColor}
                                        onChange={(value) =>
                                            setFieldValue(
                                                "activeColor",
                                                (value as Color).css.backgroundColor
                                            )
                                        }
                                        disableAlpha
                                        hideTextfield
                                    />
                                </Stack>
                                <Stack direction={"row"}>
                                    <Typography
                                        flexGrow={1}
                                        display={"flex"}
                                        alignItems={"center"}
                                    >
                                        Occupied Color:
                                    </Typography>
                                    <ColorPicker
                                        value={values.occupiedColor}
                                        onChange={(value) =>
                                            setFieldValue(
                                                "occupiedColor",
                                                (value as Color).css.backgroundColor
                                            )
                                        }
                                        disableAlpha
                                        hideTextfield
                                    />
                                </Stack>
                                <Stack
                                    direction={"column"}
                                    spacing={2}
                                >
                                    <TextField
                                        label={"Maximum Tickets"}
                                        sx={{ flexGrow: 1 }}
                                        {...getFieldProps("maxTickets")}
                                    />
                                    <Typography variant="caption">
                                        Leave empty for unlimited tickets per order
                                    </Typography>
                                </Stack>
                                <Stack direction={"row"}>
                                    <LoadingButton
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        loading={isSubmitting}
                                        disabled={!formik.isValid}
                                    >
                                        {
                                            category === null ? "Add Category" : "Save"
                                        }
                                    </LoadingButton>
                                    {
                                        category && (
                                            <Button
                                                color={"error"}
                                                fullWidth
                                                onClick={() => setDeleteOpen(true)}
                                            >
                                                Delete Category
                                            </Button>
                                        )
                                    }
                                </Stack>
                            </Stack>
                        </Form>
                    </FormikProvider>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                text={`Confirm delete of category <b>${category?.label}</b>`}
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteCategory}
            />
        </>
    );
};
