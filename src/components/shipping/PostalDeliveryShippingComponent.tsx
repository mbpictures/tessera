import { Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AddressComponent } from "../form/AddressComponent";
import { IAddress } from "../../constants/interfaces";
import { PostalDeliveryShipping } from "../../store/factories/shipping/PostalDeliveryShipping";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    selectPersonalInformation,
    setShipping
} from "../../store/reducers/personalInformationReducer";
import useTranslation from "next-translate/useTranslation";
import information from "../../../locale/en/information.json";

export const PostalDeliveryShippingComponent = () => {
    const { t } = useTranslation();
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const postalDelivery = new PostalDeliveryShipping(selector.shipping);

    const [useDifferentAddress, setUseDifferentAddress] = useState<boolean>(
        postalDelivery.postalData.differentAddress
    );
    const [address, setAddress] = useState<IAddress>(
        postalDelivery.postalData.address
    );

    useEffect(() => {
        const postalDelivery = new PostalDeliveryShipping(null);
        postalDelivery.data = {
            differentAddress: useDifferentAddress,
            address: address
        };
        dispatch(setShipping(postalDelivery.Shipping));
    }, [useDifferentAddress, address, dispatch]);

    return (
        <Stack spacing={1}>
            <Typography variant="body2">
                {t("information:postal-delivery-description", null, {fallback: information["postal-delivery-description"]})}
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        id="postal-delivery-extra-address"
                        checked={useDifferentAddress}
                        onChange={(event) =>
                            setUseDifferentAddress(event.target.checked)
                        }
                    />
                }
                label={t("information:differing-shipping-address", null, {fallback: information["differing-shipping-address"]})}
                id={"checkbox-differing-shipping-address"}
            />

            {useDifferentAddress && (
                <AddressComponent value={address} onChange={setAddress} />
            )}
        </Stack>
    );
};
