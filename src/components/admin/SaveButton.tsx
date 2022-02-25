import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { LoadingButtonProps } from "@mui/lab/LoadingButton/LoadingButton";

type Props = {
    action: () => Promise<void>;
    onComplete?: Function;
    children?: JSX.Element | string;
} & LoadingButtonProps;

export const SaveButton = ({ action, onComplete, children, ...props }: Props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClick = async () => {
        setIsLoading(true);
        await action();
        setIsLoading(false);
        if (onComplete) onComplete();
    }

    return (
        <LoadingButton
            loading={isLoading}
            onClick={handleClick}
            size="large"
            {...props}
        >
            {children ?? "Save"}
        </LoadingButton>
    )
};
