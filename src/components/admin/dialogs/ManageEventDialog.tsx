import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import {
    Button, Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl, FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select, Slider,
    Stack,
    TextField, Typography
} from "@mui/material";
import axios from "axios";
import { SeatMapDialog } from "./SeatMapDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { arrayEquals, formatPrice } from "../../../constants/util";
import { SelectionList } from "../SelectionList";
import ImageIcon from '@mui/icons-material/Image';
import Image from "next/image";
import containImageStyle from "../../../style/ContainImage.module.scss";
import { useFormik } from "formik";
import { LoadingButton } from "@mui/lab";
import isEqual from "lodash/isEqual";
import { EventDateDialog } from "./EventDateDialog";
import { EventCustomFieldsDialog } from "./EventCustomFieldsDialog";

const extractCategoryMaxAmounts = (event) => {
    return event?.categories?.reduce((dict, el) => {
        dict[el.category.id] = el.maxAmount;
        return dict;
    }, {}) ?? {};
}

export const ManageEventDialog = ({
    open,
    event,
    seatmaps,
    categories,
    onClose,
    onChange,
    currency
}) => {
    const originalSelectedCategories = useMemo(
        () => event?.categories?.map((category) => category.category.id) ?? [],
        [event]
    );
    const [openPreview, setOpenPreview] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageSize, setCoverImageSize] = useState<number | null>(null);
    const [removeCoverImage, setRemoveCoverImage] = useState(false);
    const [eventDatesOpen, setEventDatesOpen] = useState(false);
    const [customFieldsOpen, setCustomFieldsOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const formik = useFormik({
        initialValues: {
            title: event?.title ?? "",
            seatType: event?.seatType ?? "",
            seatMap: event?.seatMapId ?? 0,
            selectedCategories: originalSelectedCategories,
            personalTicket: event?.personalTicket ?? false,
            categoryMaxAmount: extractCategoryMaxAmounts(event),
            eventDates: event?.dates ?? [],
            customFields: event?.customFields ?? []
        },
        onSubmit: async (values) => {
            try {
                const data = {
                    title: values.title,
                    seatMapId: values.seatMap,
                    seatType: values.seatType,
                    personalTicket: values.personalTicket,
                    ...(values.seatType === "free" && { categories: values.selectedCategories, maxAmounts: values.categoryMaxAmount }),
                    dates: values.eventDates,
                    customFields: values.customFields
                };
                let eventId = event?.id;
                if (!event) {
                    // first create event, then add all information
                    const response = await axios.post("/api/admin/events", data);
                    eventId = response.data;
                }
                await axios.put("/api/admin/events/" + eventId, data);

                if (coverImage)
                    await uploadCoverImage(eventId);
                else if (removeCoverImage)
                    await deleteCoverImage(eventId);
                await storeCoverImageSize(eventId);
                onClose();
                onChange();
            } catch (e) {
                enqueueSnackbar("Error: " + (e.response?.data ?? e.message), {
                    variant: "error"
                });
            }
        }
    });

    useEffect(() => {
        if (!event) {
            formik.resetForm();
            setCoverImageSize(null);
            return;
        }
        formik.setFieldValue("title", event.title);
        formik.setFieldValue("seatMap", event.seatMapId);
        setCoverImageSize(event.coverImageSize);
        formik.setFieldValue("seatType", event.seatType);
        formik.setFieldValue("selectedCategories", originalSelectedCategories);
        formik.setFieldValue("personalTicket", event.personalTicket);
        formik.setFieldValue("categoryMaxAmount", extractCategoryMaxAmounts(event));
        formik.setFieldValue("eventDates", event.dates);
        formik.setFieldValue("customFields", event.customFields);
    }, [event, originalSelectedCategories]);

    const deleteCoverImage = async (eventId) => {
        await axios.delete("/api/admin/events/coverimage?eventId=" + eventId);
    };

    const uploadCoverImage = async (eventId) => {
        const pictureData = new FormData();
        pictureData.append('coverImage', coverImage);
        await axios.post("/api/admin/events/coverimage?eventId=" + eventId, pictureData);
    };

    const storeCoverImageSize = async (eventId) => {
        if (coverImageSize === event?.coverImageSize || coverImageSize === null) return;
        console.log(coverImageSize)
        await axios.put(`/api/admin/events/coverimage?eventId=${eventId}&coverImageSize=${coverImageSize}`);
    }

    const handleDelete = async () => {
        try {
            await axios.delete("/api/admin/events/" + event.id);
            onChange();
            onClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const handleUploadImageChange = (event) => {
        setCoverImage(event.target.files[0]);
        setRemoveCoverImage(false);
    };

    const handleRemoveCoverImage = () => {
        setCoverImage(null);
        setRemoveCoverImage(true);
    };

    const handleSetCoverImageSizeRandom = (event: ChangeEvent<HTMLInputElement>) => {
        setCoverImageSize(event.target.checked ? null : 1);
    };

    const handleChangeCoverImageSize = (event, value) => {
        setCoverImageSize(value);
    }

    const {
        values,
        isSubmitting,
        handleSubmit,
        getFieldProps,
        setFieldValue
    } = formik;

    const hasChanges =
        values.title !== event?.title ||
        values.seatType !== event?.seatType ||
        values.seatMap !== event?.seatMapId ||
        values.personalTicket !== event?.personalTicket ||
        !isEqual(values.categoryMaxAmount, extractCategoryMaxAmounts(event)) ||
        !arrayEquals(originalSelectedCategories, values.selectedCategories) ||
        coverImage !== null ||
        removeCoverImage ||
        !isEqual(values.eventDates, event?.dates) ||
        !isEqual(values.customFields, event?.customFields);

    const isValid =
        values.title !== "" &&
        values.seatType !== "" &&
        (values.seatType === "free" ? values.selectedCategories.length > 0 : true) &&
        (values.seatType === "map" ? values.seatMap > 0 : true);

    const coverImageUrl = !removeCoverImage && (coverImage ? URL.createObjectURL(coverImage) : event?.coverImage);

    return (
        <>
            <Dialog open={open || event !== null} onClose={onClose} fullWidth>
                <DialogTitle>
                    {
                        event ? "Edit Event" : "Add Event"
                    }
                </DialogTitle>
                <DialogContent>
                    <Stack pt={1} pb={1} spacing={1}>
                        <TextField
                            {...getFieldProps("title")}
                            label={"Title"}
                        />
                        <FormControl variant={"filled"}>
                            <InputLabel id={"seatMapTypeLabel"}>
                                Seat Map Type
                            </InputLabel>
                            <Select
                                value={values.seatType}
                                onChange={(event) =>
                                    setFieldValue("seatType", event.target.value)
                                }
                                labelId={"seatMapTypeLabel"}
                                id={"seatMapType"}
                            >
                                <MenuItem value={"free"}>Free</MenuItem>
                                <MenuItem value={"seatmap"}>Seat map</MenuItem>
                            </Select>
                        </FormControl>
                        {values.seatType === "seatmap" && (
                            <Grid container>
                                <Grid item lg={6} md={12} xs={12}>
                                    <FormControl variant={"filled"} fullWidth>
                                        <InputLabel id={"seatMapLabel"}>
                                            Seat Map
                                        </InputLabel>
                                        <Select
                                            value={values.seatMap}
                                            onChange={(event) =>
                                                setFieldValue(
                                                    "seatMap",
                                                    typeof event.target
                                                        .value === "string"
                                                        ? parseInt(
                                                              event.target.value
                                                          )
                                                        : event.target.value
                                                )
                                            }
                                            labelId={"seatMapLabel"}
                                            id={"seatMap"}
                                        >
                                            {seatmaps.map((seatMap) => (
                                                <MenuItem
                                                    value={seatMap.id}
                                                    key={seatMap.id}
                                                >
                                                    {seatMap.id}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid
                                    item
                                    lg={6}
                                    md={12}
                                    xs={12}
                                    display={"flex"}
                                    justifyContent={"center"}
                                >
                                    <Button
                                        fullWidth
                                        onClick={() => setOpenPreview(true)}
                                        disabled={values.seatMap <= 0}
                                    >
                                        Preview
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                        {values.seatType === "free" && (
                            <SelectionList
                                options={categories.map((category) => {
                                    return {
                                        secondaryLabel: formatPrice(
                                            category.price,
                                            currency
                                        ),
                                        primaryLabel: `Category: ${category.label}`,
                                        value: category.id,
                                        additionalNode: (
                                            <TextField
                                                onChange={event => {
                                                    const newObject = Object.assign({}, values.categoryMaxAmount);
                                                    newObject[category.id] = parseInt(event.target.value);
                                                    setFieldValue("categoryMaxAmount", newObject);
                                                }}
                                                type={"number"}
                                                label={"Maximum Tickets (0 = unlimited)"}
                                                onClick={(e) => e.stopPropagation()}
                                                value={isNaN(values.categoryMaxAmount[category.id]) || !values.categoryMaxAmount[category.id] ? "" : values.categoryMaxAmount[category.id]}
                                            />
                                        )
                                    };
                                })}
                                selection={values.selectedCategories}
                                onChange={(newValue) =>
                                    setFieldValue("selectedCategories", newValue)
                                }
                                style={{
                                    width: "100%",
                                    maxHeight: 230
                                }}
                                header={"Select Categories"}
                            />
                        )}
                        <Grid container>
                            {
                               coverImageUrl && (
                                    <Grid item lg={6} md={12} xs={12} className={containImageStyle.containImage} height={120}>
                                        <Image src={coverImageUrl} layout={"fill"} alt="Event Preview" />
                                    </Grid>
                                )
                            }
                            <Grid item lg={coverImageUrl ? 6 : 12} md={12} xs={12}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="upload-file"
                                    type="file"
                                    onChange={handleUploadImageChange}
                                />
                                <Stack height={"100%"} justifyContent={"center"}>
                                    <label htmlFor="upload-file">
                                        <Button component="span" fullWidth>
                                            <ImageIcon /> Upload Cover Image
                                        </Button>
                                    </label>
                                    {
                                        coverImageUrl && (
                                            <Button
                                                fullWidth
                                                onClick={handleRemoveCoverImage}
                                                color={"error"}
                                            >
                                                Remove Cover Image
                                            </Button>
                                        )
                                    }
                                </Stack>
                            </Grid>
                            {
                                coverImageUrl && (
                                    <Grid item md={12}>
                                        <Stack pt={2} pb={2}>
                                            <Typography>Customize Size</Typography>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={coverImageSize === null}
                                                        onChange={handleSetCoverImageSizeRandom}
                                                    />
                                                }
                                                label={"Randomize Gallery Size"}
                                            />
                                            {
                                                coverImageSize !== null && (
                                                    <Stack>
                                                        <Typography>
                                                            Fixed Size
                                                        </Typography>
                                                        <Slider
                                                            min={1}
                                                            max={5}
                                                            step={1}
                                                            value={coverImageSize}
                                                            onChange={handleChangeCoverImageSize}
                                                            marks
                                                            getAriaValueText={(value) => value.toString()}
                                                            valueLabelDisplay="auto"
                                                        />
                                                        {
                                                            coverImageSize > 2 && (
                                                                <Typography color={"error"}>
                                                                    Images with size larger than 2 will be cut-off on mobile devices
                                                                </Typography>
                                                            )
                                                        }
                                                    </Stack>
                                                )
                                            }
                                        </Stack>
                                    </Grid>
                                )
                            }
                        </Grid>
                        <FormControlLabel
                            control={<Checkbox
                                checked={values.personalTicket}
                                onChange={(event, checked) => setFieldValue("personalTicket", checked)}
                            />}
                            label="Personal Tickets"
                            title="Enforces uses to provide the name for each ticket"
                        />
                        <Button onClick={() => setEventDatesOpen(true)}>
                            Configure Event Dates
                        </Button>
                        <Button onClick={() => setCustomFieldsOpen(true)}>
                            Configure Custom Fields
                        </Button>
                        <Stack direction={"row"}>
                            <LoadingButton
                                color={"success"}
                                disabled={event ? !hasChanges || !isValid : !isValid}
                                fullWidth
                                onClick={() => handleSubmit()}
                                loading={isSubmitting}
                            >
                                Save
                            </LoadingButton>
                            {
                                event && (
                                    <Button
                                        color={"error"}
                                        fullWidth
                                        onClick={() => setDeleteOpen(true)}
                                    >
                                        Delete Event
                                    </Button>
                                )
                            }
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <SeatMapDialog
                categories={categories}
                onChange={() => setOpenPreview(false)}
                onClose={() => setOpenPreview(false)}
                seatmap={
                    openPreview ? seatmaps.find((x) => x.id === values.seatMap) : null
                }
                currency={currency}
            />
            <ConfirmDialog
                open={deleteOpen}
                onConfirm={handleDelete}
                onClose={() => setDeleteOpen(false)}
                text={`Confirm delete of event <b>${event?.title}</b>`}
            />
            <EventDateDialog
                dates={values.eventDates}
                open={eventDatesOpen}
                onClose={() => setEventDatesOpen(false)}
                onChange={(newDates) => setFieldValue("eventDates", newDates)}
            />
            <EventCustomFieldsDialog
                customFields={values.customFields}
                open={customFieldsOpen}
                onClose={() => setCustomFieldsOpen(false)}
                onChange={(newFields) => setFieldValue("customFields", newFields)}
            />
        </>
    );
};
