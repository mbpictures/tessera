import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectOrder, setTicketFirstName, setTicketLastName, Ticket } from "../../store/reducers/orderReducer";
import { Divider, List, ListItem, ListItemIcon, ListItemText, Stack, TextField } from "@mui/material";
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import useTranslation from "next-translate/useTranslation";

export const TicketNames = ({categories}) => {
    const order = useAppSelector(selectOrder);

    return (
        <List>
            {
                order.tickets.map((ticket: Ticket, index) => <TicketNameItem index={index} categories={categories} key={index} />)
            }
        </List>
    );
};

const TicketNameItem = ({index, categories}) => {
    const { t } = useTranslation();
    const order = useAppSelector(selectOrder);
    const dispatch = useAppDispatch();
    const ticket = order.tickets[index];

    const handleChangeName = (setter, key) => (event) => {
        dispatch(setter({index, [key]: event.target.value}));
    };

    const resolveCategory = (id) => {
        return categories.find(category => category.id === id);
    }

    return (
        <>
            <ListItem>
                <ListItemIcon><BookOnlineIcon /></ListItemIcon>
                <Stack flexGrow={1} spacing={1}>
                    <ListItemText
                        sx={{mt: 0}}
                        primary={(index + 1) + ". " + resolveCategory(ticket.categoryId).label}
                        secondary={ticket.seatId && t("information:seat", {seat: ticket.seatId})}
                    />
                    <TextField fullWidth placeholder={t("information:firstname")} onChange={handleChangeName(setTicketFirstName, "firstName")} />
                    <TextField fullWidth placeholder={t("information:lastname")} onChange={handleChangeName(setTicketLastName, "lastName")} />
                </Stack>
            </ListItem>
            {index < order.tickets.length - 1 && (<Divider />)}
        </>
    )
}
