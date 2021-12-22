import {Divider, IconButton, List, ListItem, ListItemText, ListSubheader, Typography} from "@mui/material";
import {Edit} from "@mui/icons-material";
import React from "react";
import {useAppSelector} from "../store/hooks";
import {FreeSeatOrder, SeatOrder, selectOrder} from "../store/reducers/orderReducer";

export const PaymentOverview = ({categories, withEditButton, onEdit, hideEmptyCategories, displayColor}: {categories: Array<{id: number, price: number, label: string, color?: string}>, withEditButton?: boolean, onEdit?: Function, hideEmptyCategories?: boolean, displayColor?: boolean}) => {
    const order = useAppSelector(selectOrder);

    const handleEdit = () => {
        if (!onEdit) return;
        onEdit();
    }

    let items: Array<{categoryId: number, amount: number}> = [];
    if ("seats" in order) {
        const seats = (order as SeatOrder).seats;
        items = categories.map(category => {
            return {
                categoryId: category.id,
                amount: seats.filter(seat => seat.category === category.id).reduce((a, seat) => a + seat.amount, 0)
            }
        });
    }
    if ("orders" in order) {
        items = (order as FreeSeatOrder).orders.map(order => {
            return {categoryId: order.categoryId, amount: order.amount};
        });
    }

    if (hideEmptyCategories)
        items = items.filter(val => val.amount > 0);

    return (
        <List subheader={<ListSubheader><Typography variant="h5">Summary</Typography></ListSubheader>}>
            {
                items.map((item, index) => {
                    const category = categories.find(cat => cat.id === item.categoryId);
                    return (
                        <ListItem
                            secondaryAction={
                                withEditButton ? (
                                        <IconButton edge="end" aria-label="edit" color={"primary"} onClick={handleEdit}>
                                            <Edit />
                                        </IconButton>
                                    ) : null
                            }
                            key={index}
                        >
                            <ListItemText
                                secondary={<span>{category.price} &#8364;</span>}
                                primary={
                                    <>
                                        {item.amount}x: {category.label}
                                        {(displayColor) && <div style={{width: 20, height: 20, backgroundColor: category.color ?? "#59bb59", float: "right"}} />}
                                    </>
                                }
                            />
                        </ListItem>
                    )
                })
            }
            <Divider />
            <ListItem>
                <ListItemText primary={<strong>Total:</strong>} secondary={<span>{order.totalPrice.toFixed(2)} &euro;</span>} />
            </ListItem>
        </List>
    );
};
