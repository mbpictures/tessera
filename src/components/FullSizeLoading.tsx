import { Box } from "@mui/system";
import { CircularProgress } from "@mui/material";

export const FullSizeLoading = ({isLoading}) => {
    if (!isLoading) return null;

    return (
        <Box
            width={"100%"}
            height={"100%"}
            position={"absolute"}
            top={0}
            left={0}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            bgcolor={`rgba(0, 0, 0, 0.3)`}
        >
            <CircularProgress />
        </Box>
    )
}
