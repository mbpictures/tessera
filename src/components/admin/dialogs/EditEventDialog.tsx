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

export const EditEventDialog = ({
    event,
    seatmaps,
    categories,
    onClose,
    onChange
}) => {
    const originalSelectedCategories = useMemo(
        () => event?.categories?.map((category) => category.category.id) ?? [],
        [event]
    );
    const [name, setName] = useState<string>("");
    const [seatType, setSeatType] = useState<string>("");
    const [seatMap, setSeatMap] = useState<number>(0);
    const [openPreview, setOpenPreview] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageUrl, setCoverImageUrl] = useState(null);
    const [coverImageSize, setCoverImageSize] = useState<number | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!event) return;
        setSelectedCategories(originalSelectedCategories);
        setName(event.title);
        setSeatType(event.seatType);
        setSeatMap(event.seatMapId);
        setCoverImageUrl(event.coverImage ?? null);
        setCoverImageSize(event.coverImageSize ?? null);
    }, [event, originalSelectedCategories]);

    const handleSave = async () => {
        try {
            await axios.put("/api/admin/events/" + event.id, {
                title: name,
                seatMapId: seatMap,
                seatType,
                ...(seatType === "free" && { categories: selectedCategories })
            });
            if (coverImage)
                await uploadCoverImage();
            else if (!coverImageUrl)
                await deleteCoverImage();

            await storeCoverImageSize();
            onChange();
            onClose();
        } catch (e) {
            enqueueSnackbar("Error: " + (e.response.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const deleteCoverImage = async () => {
        await axios.delete("/api/admin/events/coverimage?eventId=" + event.id);
    };

    const uploadCoverImage = async () => {
        const pictureData = new FormData();
        pictureData.append('coverImage', coverImage);
        await axios.post("/api/admin/events/coverimage?eventId=" + event.id, pictureData);
    };

    const storeCoverImageSize = async () => {
        if (coverImageSize === event.coverImageSize) return;
        await axios.put(`/api/admin/events/coverimage?eventId=${event.id}&coverImageSize=${coverImageSize}`);
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
        setCoverImageUrl(URL.createObjectURL(event.target.files[0]));
    };

    const handleRemoveCoverImage = () => {
        setCoverImage(null);
        setCoverImageUrl(null);
    };

    const handleSetCoverImageSizeRandom = (event: ChangeEvent<HTMLInputElement>) => {
        setCoverImageSize(event.target.checked ? null : 1);
    };

    const handleChangeCoverImageSize = (event, value) => {
        setCoverImageSize(value);
    }

    if (event === null) return null;

    const hasChanges =
        name !== event.title ||
        seatType !== event.seatType ||
        seatMap !== event.seatMapId ||
        !arrayEquals(originalSelectedCategories, selectedCategories) ||
        coverImage !== event.coverImage;

    console.log(coverImageSize);

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogContent>
                    <Stack pt={1} pb={1} spacing={1}>
                        <TextField
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            label={"Name"}
                        />
                        <FormControl variant={"filled"}>
                            <InputLabel id={"seatMapTypeLabel"}>
                                Seat Map Type
                            </InputLabel>
                            <Select
                                value={seatType}
                                onChange={(event) =>
                                    setSeatType(event.target.value)
                                }
                                labelId={"seatMapTypeLabel"}
                                id={"seatMapType"}
                            >
                                <MenuItem value={"free"}>Free</MenuItem>
                                <MenuItem value={"seatmap"}>Seat map</MenuItem>
                            </Select>
                        </FormControl>
                        {seatType === "seatmap" && (
                            <Grid container>
                                <Grid item lg={6} md={12} xs={12}>
                                    <FormControl variant={"filled"} fullWidth>
                                        <InputLabel id={"seatMapLabel"}>
                                            Seat Map
                                        </InputLabel>
                                        <Select
                                            value={seatMap}
                                            onChange={(event) =>
                                                setSeatMap(
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
                                        disabled={seatMap <= 0}
                                    >
                                        Preview
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                        {seatType === "free" && (
                            <SelectionList
                                options={categories.map((category) => {
                                    return {
                                        secondaryLabel: formatPrice(
                                            category.price,
                                            category.currency
                                        ),
                                        primaryLabel: `Category: ${category.label}`,
                                        value: category.id
                                    };
                                })}
                                selection={selectedCategories}
                                onChange={(newValue) =>
                                    setSelectedCategories(newValue)
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
                                        <Image src={coverImageUrl} layout={"fill"} />
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
                        <Stack direction={"row"}>
                            <Button
                                color={"success"}
                                disabled={!hasChanges}
                                fullWidth
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button
                                color={"error"}
                                fullWidth
                                onClick={() => setDeleteOpen(true)}
                            >
                                Delete Event
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <SeatMapDialog
                categories={categories}
                onChange={() => setOpenPreview(false)}
                onClose={() => setOpenPreview(false)}
                seatmap={
                    openPreview ? seatmaps.find((x) => x.id === seatMap) : null
                }
            />
            <ConfirmDialog
                open={deleteOpen}
                onConfirm={handleDelete}
                onClose={() => setDeleteOpen(false)}
                text={`Confirm delete of category <b>${event.title}</b>`}
            />
        </>
    );
};
