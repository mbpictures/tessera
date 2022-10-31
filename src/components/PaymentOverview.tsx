import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Typography
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import React from "react";
import { useAppSelector } from "../store/hooks";
import { selectOrder } from "../store/reducers/orderReducer";
import { calculateTotalPrice, formatPrice, summarizeTicketAmount } from "../constants/util";
import useTranslation from "next-translate/useTranslation";
import { selectPayment } from "../store/reducers/paymentReducer";
import { selectPersonalInformation } from "../store/reducers/personalInformationReducer";

export const PaymentOverview = ({
    categories,
    withEditButton,
    onEdit,
    hideEmptyCategories,
    displayColor,
    shippingFees,
    paymentFees,
    eventName
}: {
    categories: Array<{
        id: number;
        price: number;
        label: string;
        color?: string;
        currency: string;
    }>;
    withEditButton?: boolean;
    onEdit?: Function;
    hideEmptyCategories?: boolean;
    displayColor?: boolean;
    shippingFees?: Record<string, number>;
    paymentFees?: Record<string, number>;
    eventName?: string;
}) => {
    const order = useAppSelector(selectOrder);
    const payment = useAppSelector(selectPayment).payment?.type;
    const shipping = useAppSelector(selectPersonalInformation).shipping?.type;
    const { t } = useTranslation();

    const handleEdit = () => {
        if (!onEdit) return;
        onEdit();
    };

    const items = summarizeTicketAmount(order.tickets, categories, hideEmptyCategories);
    const shippingPrice = shippingFees ? shippingFees[shipping] ?? 0 : 0;
    const paymentPrice = paymentFees ? paymentFees[payment] ?? 0 : 0;
    const price = calculateTotalPrice(order.tickets, categories, shippingFees, paymentFees, shipping, payment);

    return (
        <List
            subheader={
                <ListSubheader>
                    <Typography variant="h5">{t("common:summary")}</Typography>
                    {
                        eventName && (
                            <Typography variant="h6">{eventName}</Typography>
                        )
                    }
                </ListSubheader>
            }
        >
            {items.map((item, index) => {
                const category = categories.find(
                    (cat) => cat.id === item.categoryId
                );
                if (!category) return null;
                return (
                    <ListItem
                        secondaryAction={
                            withEditButton ? (
                                <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    color={"primary"}
                                    onClick={handleEdit}
                                >
                                    <Edit />
                                </IconButton>
                            ) : null
                        }
                        key={index}
                    >
                        <ListItemText
                            secondary={
                                <span>
                                    {formatPrice(category.price, category.currency)}
                                </span>
                            }
                            primary={
                                <>
                                    <span id={"payment-overview-category-amount-" + category.label}>
                                        {item.amount}x: {category.label}
                                    </span>
                                    {displayColor && (
                                        <div
                                            style={{
                                                width: 20,
                                                height: 20,
                                                backgroundColor:
                                                    category.color ?? "#59bb59",
                                                float: "right"
                                            }}
                                        />
                                    )}
                                </>
                            }
                        />
                    </ListItem>
                );
            })}
            {
                shippingPrice !== 0 && (
                    <ListItem>
                        <ListItemText
                            primary={t("payment:shipping-fee")}
                            secondary={formatPrice(shippingPrice, categories[0].currency)}
                            className={"payment-overview-service-fee"}
                        />
                    </ListItem>
                )
            }
            {
                paymentPrice !== 0 && (
                    <ListItem>
                        <ListItemText
                            primary={t("payment:payment-fee")}
                            secondary={formatPrice(paymentPrice, categories[0].currency)}
                            className={"payment-overview-service-fee"}
                        />
                    </ListItem>
                )
            }
            <Divider />
            {
                categories.length > 0 && (
                    <ListItem>
                        <ListItemText
                            primary={<strong>{t("common:total-price")}:</strong>}
                            secondary={
                                <span id="payment-overview-total-price">
                            {formatPrice(
                                Math.max(price, 0),
                                categories[0].currency
                            )}
                        </span>
                            }
                        />
                    </ListItem>
                )
            }
        </List>
    );
};
