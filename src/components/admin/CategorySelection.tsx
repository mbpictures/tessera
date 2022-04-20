import { Checkbox, FormControlLabel, Grid, useMediaQuery } from "@mui/material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import { SelectionList } from "./SelectionList";
import { Notifications } from "../../lib/notifications/NotificationTypes";

export const CategorySelection = ({currentValues, selectionValues, onChange}) => {
    const [currentTab, setCurrentTab] = useState(Object.keys(selectionValues)[0]);

    const handleChange = (newList) => {
        const copy = Object.assign({}, currentValues);
        copy[currentTab] = newList;
        onChange(copy);
    };

    const handleCheckAll = (event) => {
        if (event.target.checked) {
            onChange(Object.assign({}, selectionValues));
            return;
        }
        onChange(Object.keys(Notifications).reduce((obj, val) => {
            if (val in obj) return obj;
            obj[val] = [];
            return obj;
        }, {}))
    };

    const isMdUp = useMediaQuery((theme: any) =>
        theme.breakpoints.up("md")
    );

    const allItemsSelected = Object.keys(selectionValues).every(sel => selectionValues[sel].every(key => currentValues[sel].includes(key)));

    return (
        <Grid container>
            <Grid item xs={12} md={4} alignItems={"center"} justifyContent={"center"} display={"flex"} p={2} flexDirection={"column"}>
                <ToggleButtonGroup
                    orientation={isMdUp ? "vertical" : "horizontal"}
                    value={currentTab}
                    onChange={(_, next) => {
                        if (!next) return;
                        setCurrentTab(next)
                    }}
                    exclusive
                >
                    {
                        Object.keys(selectionValues).map((value, index) => {
                            return (
                                <ToggleButton value={value} key={index}>{value.replace("_", " ")}</ToggleButton>
                            )
                        })
                    }
                </ToggleButtonGroup>
                <FormControlLabel
                    label={"Check all"}
                    control={
                        <Checkbox
                            checked={allItemsSelected}
                            indeterminate={!allItemsSelected && Object.values(currentValues).some((val: Array<string>) => val.length > 0)}
                            onChange={handleCheckAll}
                        />
                    }
                />
            </Grid>
            <Grid item xs={12} md={8} alignItems={"center"} display={"flex"}>
                <SelectionList
                    options={selectionValues[currentTab]?.map((val) => ({value: val, primaryLabel: val}))}
                    selection={currentValues[currentTab]}
                    onChange={handleChange}
                    header={""}
                    style={{flexGrow: 1}}
                />
            </Grid>
        </Grid>
    )
};
