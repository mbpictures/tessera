import { Typography } from "@mui/material";
import useTranslation from "next-translate/useTranslation";

export const BoxOfficeShippingComponent = () => {
    const { t } = useTranslation();

    return (
        <Typography variant="body2">
            {t("information:box-office-description")}
        </Typography>
    );
};
