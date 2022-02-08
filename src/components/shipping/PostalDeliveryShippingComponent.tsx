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

export const PostalDeliveryShippingComponent = () => {
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
                The ticket will be sent to your home.
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
                label="Differing shipping address"
                id={"checkbox-differing-shipping-address"}
            />

            {useDifferentAddress && (
                <AddressComponent value={address} onChange={setAddress} />
            )}
        </Stack>
    );
};
