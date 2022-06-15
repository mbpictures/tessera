import { ChangeEvent, useEffect, useState } from "react";
import { TextField } from "@mui/material";

export const WaitingTextField = (props) => {
    const {time, ...additionalProps} = props;
    const [waitEvent, setWaitEvent] = useState<ChangeEvent<HTMLInputElement>>(null);
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        let timer = null;
        if (waitEvent) {
            timer = setTimeout(() => additionalProps.onChange(waitEvent), time ?? 1000)
        }
        return () => clearTimeout(timer)
    }, [waitEvent]);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.persist();
        setWaitEvent(event);
        setValue(event.target.value);
    };

    return <TextField {...additionalProps} onChange={onChange} value={value} />;
}
