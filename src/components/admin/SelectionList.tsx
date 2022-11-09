import { Checkbox, List, ListItem, ListItemIcon, ListItemText, ListSubheader, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

export interface SelectionListOption {
    primaryLabel: string;
    secondaryLabel?: string;
    value: any;
    additionalNode?: ReactNode;
}

export const SelectionList = ({
    options,
    selection,
    onChange,
    style,
    header
}: {
    options: SelectionListOption[];
    selection: any[];
    onChange: (newSelection: any[]) => unknown;
    header: string;
    style?: SxProps<Theme>
}) => {
    const handleClick = (value: any) => {
        let newCategories = selection.map((a) => a);
        if (newCategories.includes(value)) {
            newCategories = newCategories.filter((a) => a !== value);
        } else {
            newCategories.push(value);
        }
        onChange(newCategories);
    };

    return (
        <List
            sx={{
                bgcolor: "rgba(0, 0, 0, 0.06)",
                borderRadius: 1,
                overflow: "auto",
                ...style
            }}
            component={"div"}
            role={"list"}
        >
            <ListSubheader style={{ backgroundColor: "transparent" }} disableSticky>
                {header}
            </ListSubheader>
            {options.map((option, index) => {
                return (
                    <ListItem
                        key={index}
                        button
                        onClick={() => handleClick(option.value)}
                    >
                        <ListItemIcon>
                            <Checkbox
                                checked={selection.indexOf(option.value) !== -1}
                                id={"selection-list-" + index}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={option.primaryLabel}
                            secondary={option.secondaryLabel}
                        />
                        {option.additionalNode}
                    </ListItem>
                );
            })}
        </List>
    );
};
