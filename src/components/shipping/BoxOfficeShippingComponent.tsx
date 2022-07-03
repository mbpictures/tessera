import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";

export const BoxOfficeShippingComponent = () => {
    const { t } = useTranslation();

    return (
        <Typography variant="body2">
            {t("information:box-office-description")}
        </Typography>
    );
};
