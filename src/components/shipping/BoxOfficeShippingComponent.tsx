import { Typography } from "@mui/material";
import useTranslation from "next-translate/useTranslation";
import information from "../../../locale/en/information.json";

export const BoxOfficeShippingComponent = () => {
    const { t } = useTranslation();

    return (
        <Typography variant="body2">
            {t("information:box-office-description", null, {fallback: information["box-office-description"]})}
        </Typography>
    );
};
