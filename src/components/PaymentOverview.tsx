import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Typography
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import React from "react";
import { useAppSelector } from "../store/hooks";
import { selectOrder } from "../store/reducers/orderReducer";
import { formatPrice } from "../constants/util";
import useTranslation from "next-translate/useTranslation";
import { OrderFactory } from "../store/factories/order/OrderFactory";

export const PaymentOverview = ({
    categories,
    withEditButton,
    onEdit,
    hideEmptyCategories,
    displayColor
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
}) => {
    const order = useAppSelector(selectOrder);
    const { t } = useTranslation();

    const handleEdit = () => {
        if (!onEdit) return;
        onEdit();
    };

    let items: Array<{ categoryId: number; amount: number }> = OrderFactory.getInstance(order, categories)?.summary ?? [];

    if (hideEmptyCategories) items = items.filter((val) => val.amount > 0);

    return (
        <List
            subheader={
                <ListSubheader>
                    <Typography variant="h5">{t("common:summary")}</Typography>
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
            <Divider />
            {
                categories.length > 0 && (
                    <ListItem>
                        <ListItemText
                            primary={<strong>{t("common:total-price")}:</strong>}
                            secondary={
                                <span id="payment-overview-total-price">
                            {formatPrice(
                                Math.max(order.totalPrice, 0),
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
