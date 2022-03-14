import { Typography } from "@mui/material";
import useTranslation from "next-translate/useTranslation";

export const DownloadShippingComponent = () => {
    const { t } = useTranslation();
    return (
        <Typography variant="body2">
            {t("information:download-description")}
        </Typography>
    );
};
