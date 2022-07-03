import { motion } from "framer-motion";
import { Step } from "../components/Step";
import { Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";
import { getOption } from "../lib/options";
import { Options } from "../constants/Constants";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Checkout({ direction }) {
    const theme = useTheme();

    return (
        <Step
            direction={direction}
            style={{ width: "100%", maxHeight: "100%" }}
        >
            <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
            >
                <svg
                    className="progress-icon"
                    viewBox="0 0 50 50"
                    style={{ maxWidth: 400, maxHeight: 400 }}
                >
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={theme.palette.success.main}
                        d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
                        style={{ translateX: 5, translateY: 5 }}
                        animate={{
                            pathLength: 1,
                            transition: {
                                delay: 0.1,
                                duration: 0.3
                            }
                        }}
                        initial={{
                            pathLength: 0
                        }}
                    />
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={theme.palette.success.main}
                        d="M14,26 L 22,33 L 35,16"
                        strokeDasharray="0 1"
                        animate={{
                            pathLength: 1,
                            transition: {
                                delay: 0.4,
                                duration: 0.3
                            }
                        }}
                        initial={{
                            pathLength: 0
                        }}
                    />
                </svg>
                <Typography variant="h3" align={"center"}>
                    Checkout complete
                </Typography>
            </Box>
        </Step>
    );
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            theme: await getOption(Options.Theme),
            ...(await serverSideTranslations(locale, ['common']))
        }
    }
}
