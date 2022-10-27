import { Typography } from "@mui/material";
import useTranslation from "next-translate/useTranslation";
import information from "../../../locale/en/information.json";

export const DownloadShippingComponent = () => {
    const { t } = useTranslation();
    return (
        <Typography variant="body2">
            {t("information:download-description", null, {fallback: information["download-description"]})}
        </Typography>
    );
};
